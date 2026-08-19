import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Table, 
  Terminal, 
  Users, 
  FolderArchive, 
  Zap, 
  Settings, 
  Activity, 
  Radio, 
  FileCode, 
  ArrowRight, 
  Database, 
  Key, 
  Lock, 
  Server, 
  Play, 
  Plus, 
  ShieldCheck, 
  Code2, 
  Clock, 
  Layers, 
  Sliders, 
  Copy, 
  Check, 
  Cpu, 
  Globe, 
  Building2, 
  HardDrive,
  X,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { ActiveView } from '../types';

export type CommandCategory = 'all' | 'tables' | 'procedures' | 'settings' | 'navigation' | 'actions';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Tables' | 'Procedures' | 'Settings' | 'Navigation' | 'Actions' | 'Storage' | 'Functions';
  categoryId: CommandCategory;
  description: string;
  keywords: string[];
  icon: React.ElementType;
  shortcut?: string;
  meta?: string;
  action: () => void;
}

// Stored procedures and PostgreSQL functions definitions
export interface StoredProcedure {
  name: string;
  schema: string;
  returnType: string;
  args: string;
  security: 'DEFINER' | 'INVOKER';
  description: string;
  sqlSnippet: string;
}

const STORED_PROCEDURES: StoredProcedure[] = [
  {
    name: 'handle_new_user',
    schema: 'public',
    returnType: 'trigger',
    args: '()',
    security: 'DEFINER',
    description: 'Trigger function that automatically initializes user profile records in public.profiles upon auth.users signup',
    sqlSnippet: `CREATE OR REPLACE FUNCTION public.handle_new_user()\nRETURNS trigger\nLANGUAGE plpgsql\nSECURITY DEFINER SET search_path = public\nAS $$\nBEGIN\n  INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)\n  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', now());\n  RETURN new;\nEND;\n$$;`
  },
  {
    name: 'match_documents',
    schema: 'public',
    returnType: 'TABLE (id uuid, content text, similarity float)',
    args: '(query_embedding vector(1536), match_threshold float, match_count int)',
    security: 'INVOKER',
    description: 'pgvector cosine similarity search RPC function for vector embeddings with HNSW indexing',
    sqlSnippet: `CREATE OR REPLACE FUNCTION public.match_documents(\n  query_embedding vector(1536),\n  match_threshold float,\n  match_count int\n)\nRETURNS TABLE (id uuid, content text, similarity float)\nLANGUAGE plpgsql\nAS $$\nBEGIN\n  RETURN QUERY\n  SELECT\n    documents.id,\n    documents.content,\n    1 - (documents.embedding <=> query_embedding) AS similarity\n  FROM documents\n  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold\n  ORDER BY similarity DESC\n  LIMIT match_count;\nEND;\n$$;`
  },
  {
    name: 'calculate_patient_risk_score',
    schema: 'public',
    returnType: 'numeric',
    args: '(patient_uuid uuid)',
    security: 'DEFINER',
    description: 'Stored procedure calculating clinical triage risk index from latest vitals, diagnosis severity, and encounter history',
    sqlSnippet: `CREATE OR REPLACE FUNCTION public.calculate_patient_risk_score(patient_uuid uuid)\nRETURNS numeric\nLANGUAGE plpgsql\nAS $$\nDECLARE\n  risk_val numeric := 0.0;\nBEGIN\n  -- Compute weighted composite score\n  SELECT COALESCE(AVG(systolic_bp) * 0.4 + AVG(heart_rate) * 0.3, 10.0)\n  INTO risk_val\n  FROM public.medical_records\n  WHERE patient_id = patient_uuid;\n  RETURN ROUND(risk_val, 2);\nEND;\n$$;`
  },
  {
    name: 'generate_appointment_invoice',
    schema: 'public',
    returnType: 'uuid',
    args: '(appointment_id uuid, copay_amount numeric)',
    security: 'DEFINER',
    description: 'Transactional stored procedure creating billing invoices and ledger line items for patient visits',
    sqlSnippet: `CREATE OR REPLACE FUNCTION public.generate_appointment_invoice(appointment_id uuid, copay_amount numeric)\nRETURNS uuid\nLANGUAGE plpgsql\nAS $$\nDECLARE\n  new_inv_id uuid := gen_random_uuid();\nBEGIN\n  INSERT INTO public.prescriptions (id, dosage, frequency, created_at)\n  VALUES (new_inv_id, 'Standard Consultation', 'Once', now());\n  RETURN new_inv_id;\nEND;\n$$;`
  },
  {
    name: 'cleanup_expired_sessions',
    schema: 'public',
    returnType: 'void',
    args: '()',
    security: 'DEFINER',
    description: 'Maintenance procedure executed periodically via pg_cron to purge stale sessions and temporary tokens',
    sqlSnippet: `CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()\nRETURNS void\nLANGUAGE sql\nAS $$\n  DELETE FROM auth.refresh_tokens WHERE revoked = true OR updated_at < NOW() - INTERVAL '30 days';\n$$;`
  },
  {
    name: 'sync_search_vector',
    schema: 'public',
    returnType: 'trigger',
    args: '()',
    security: 'INVOKER',
    description: 'Full-text search tsvector updater trigger function keeping text search columns indexed in real time',
    sqlSnippet: `CREATE OR REPLACE FUNCTION public.sync_search_vector()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nBEGIN\n  new.search_vector := to_tsvector('english', coalesce(new.diagnosis, '') || ' ' || coalesce(new.notes, ''));\n  RETURN new;\nEND;\n$$;`
  },
  {
    name: 'audit_record_changes',
    schema: 'public',
    returnType: 'trigger',
    args: '()',
    security: 'DEFINER',
    description: 'CDC Audit logging procedure tracking row-level mutations for HIPAA / SOC2 security compliance',
    sqlSnippet: `CREATE OR REPLACE FUNCTION public.audit_record_changes()\nRETURNS trigger\nLANGUAGE plpgsql\nSECURITY DEFINER\nAS $$\nBEGIN\n  -- Insert audit entry with user context\n  INSERT INTO public.audit_logs (table_name, operation, record_id, changed_by, created_at)\n  VALUES (TG_TABLE_NAME, TG_OP, coalesce(new.id, old.id), auth.uid(), now());\n  RETURN coalesce(new, old);\nEND;\n$$;`
  }
];

// Fuzzy scoring algorithm with keyword and subsequence weighting
function fuzzyScore(query: string, text: string, keywords: string[] = []): { score: number; matches: boolean } {
  if (!query.trim()) return { score: 100, matches: true };

  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  
  // Exact match
  if (t === q) return { score: 1000, matches: true };

  // Starts with
  if (t.startsWith(q)) return { score: 800 + (100 - t.length), matches: true };

  // Substring match
  const substrIndex = t.indexOf(q);
  if (substrIndex !== -1) {
    const isWordStart = substrIndex === 0 || /[\s._\-/:]/.test(t[substrIndex - 1]);
    return { score: (isWordStart ? 600 : 400) + (100 - substrIndex), matches: true };
  }

  // Check keywords
  for (const kw of keywords) {
    const kwLower = kw.toLowerCase();
    if (kwLower === q) return { score: 500, matches: true };
    if (kwLower.startsWith(q)) return { score: 450, matches: true };
    if (kwLower.includes(q)) return { score: 350, matches: true };
  }

  // Acronym match (e.g. 'jwt' matching 'JSON Web Token' or 'pitr' matching 'Point In Time Recovery')
  const words = t.split(/[\s._\-]+/);
  const acronym = words.map(w => w[0]).join('');
  if (acronym.includes(q)) return { score: 300, matches: true };

  // Subsequence match
  let qIdx = 0;
  let tIdx = 0;
  let score = 0;
  let consecutiveMatches = 0;

  while (qIdx < q.length && tIdx < t.length) {
    if (q[qIdx] === t[tIdx]) {
      qIdx++;
      consecutiveMatches++;
      const isWordStart = tIdx === 0 || /[\s._\-/:]/.test(t[tIdx - 1]);
      score += (isWordStart ? 25 : 10) + (consecutiveMatches * 5);
    } else {
      consecutiveMatches = 0;
    }
    tIdx++;
  }

  if (qIdx === q.length) {
    return { score: Math.max(50, score), matches: true };
  }

  return { score: 0, matches: false };
}

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setActiveView, 
    tables, 
    setSelectedTableId, 
    edgeFunctions, 
    setSelectedFunctionId,
    storageBuckets,
    setSelectedBucketId,
    sqlTabs,
    setActiveSqlTabId,
    addSqlTab,
    projectSettings,
    updateProjectSettings,
    setNotification,
    theme,
    setTheme,
    toggleTheme
  } = useSupabase();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommandCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedCategory('all');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Construct comprehensive command items registry
  const allItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // 1. DATABASE TABLES
    tables.forEach(t => {
      const columnNames = t.columns.map(c => c.name).join(' ');
      items.push({
        id: `table-${t.id}`,
        title: `${t.schema}.${t.name}`,
        category: 'Tables',
        categoryId: 'tables',
        description: `PostgreSQL Table with ${t.columns.length} columns (${columnNames.slice(0, 60)}...) • ${t.rowsCount || 0} rows • ${t.rlsEnabled ? 'RLS Enabled' : 'RLS Disabled'}`,
        keywords: [t.name, t.schema, 'table', 'columns', 'postgres', 'rls', ...t.columns.map(c => c.name)],
        icon: Table,
        meta: `${t.columns.length} cols`,
        action: () => {
          setSelectedTableId(t.id);
          setActiveView('table_editor');
          setIsCommandPaletteOpen(false);
        }
      });
    });

    // 2. STORED PROCEDURES & DATABASE FUNCTIONS
    STORED_PROCEDURES.forEach(proc => {
      items.push({
        id: `proc-${proc.name}`,
        title: `${proc.schema}.${proc.name}${proc.args}`,
        category: 'Procedures',
        categoryId: 'procedures',
        description: `${proc.description} [Returns: ${proc.returnType}, Security: ${proc.security}]`,
        keywords: [proc.name, proc.schema, 'procedure', 'function', 'rpc', 'plpgsql', 'trigger', proc.returnType, proc.security],
        icon: Code2,
        meta: 'RPC / Function',
        action: () => {
          addSqlTab(`${proc.name}() Definition`, proc.sqlSnippet);
          setActiveView('sql_editor');
          setIsCommandPaletteOpen(false);
          setNotification({
            type: 'info',
            message: `Loaded stored procedure "${proc.name}()" in SQL Editor`
          });
        }
      });
    });

    // 3. PROJECT SETTINGS & CONFIGURATION
    const settingsItems: Array<{
      id: string;
      title: string;
      description: string;
      keywords: string[];
      icon: React.ElementType;
      meta?: string;
      action: () => void;
    }> = [
      {
        id: 'set-project-url',
        title: 'Project API Gateway URL',
        description: `${projectSettings.apiUrl} (HTTPS REST & GraphQL Gateway endpoint)`,
        keywords: ['api', 'url', 'endpoint', 'gateway', 'host', 'rest', 'graphql', 'http'],
        icon: Globe,
        meta: 'API Config',
        action: () => {
          navigator.clipboard.writeText(projectSettings.apiUrl);
          setNotification({ type: 'success', message: 'Copied Project API URL to clipboard' });
          setActiveView('settings');
          setIsCommandPaletteOpen(false);
        }
      },
      {
        id: 'set-anon-key',
        title: 'API Anon / Public Key',
        description: `sb_anon_${projectSettings.anonKey.slice(0, 16)}... (Safe for public client-side applications with RLS)`,
        keywords: ['anon', 'public', 'key', 'apikey', 'client', 'jwt', 'token', 'credentials'],
        icon: Key,
        meta: 'Public Key',
        action: () => {
          navigator.clipboard.writeText(projectSettings.anonKey);
          setNotification({ type: 'success', message: 'Copied Anon Public API Key to clipboard' });
          setActiveView('settings');
          setIsCommandPaletteOpen(false);
        }
      },
      {
        id: 'set-service-role-key',
        title: 'API Service Role Secret Key',
        description: `sb_secret_${projectSettings.serviceRoleKey.slice(0, 16)}... (Super-admin bypasses RLS, server-only secret)`,
        keywords: ['service_role', 'secret', 'admin', 'bypass', 'key', 'token', 'jwt', 'security'],
        icon: Lock,
        meta: 'Secret Key',
        action: () => {
          navigator.clipboard.writeText(projectSettings.serviceRoleKey);
          setNotification({ type: 'success', message: 'Copied Service Role Key to clipboard' });
          setActiveView('settings');
          setIsCommandPaletteOpen(false);
        }
      },
      {
        id: 'set-jwt-secret',
        title: 'JWT Secret & Auth Token Configuration',
        description: `HMAC-SHA256 signature secret: ${projectSettings.jwtSecret.slice(0, 14)}... (Token expiration: 3600s)`,
        keywords: ['jwt', 'secret', 'token', 'hmac', 'sha256', 'auth', 'expiration', 'session'],
        icon: ShieldCheck,
        meta: 'Auth JWT',
        action: () => {
          setActiveView('settings');
          setIsCommandPaletteOpen(false);
        }
      },
      {
        id: 'set-postgres-uri',
        title: 'Direct PostgreSQL Connection URI',
        description: `postgresql://${projectSettings.databaseUser}:[YOUR-PASSWORD]@${projectSettings.databaseHost}:${projectSettings.databasePort}/${projectSettings.databaseName}?sslmode=require`,
        keywords: ['postgres', 'connection', 'uri', 'string', 'database', 'host', 'port', '5432', 'sslmode', 'driver'],
        icon: Database,
        meta: 'Port 5432',
        action: () => {
          const uri = `postgresql://${projectSettings.databaseUser}:[YOUR-PASSWORD]@${projectSettings.databaseHost}:${projectSettings.databasePort}/${projectSettings.databaseName}?sslmode=require`;
          navigator.clipboard.writeText(uri);
          setNotification({ type: 'success', message: 'Copied PostgreSQL Connection URI to clipboard' });
          setActiveView('settings');
          setIsCommandPaletteOpen(false);
        }
      },
      {
        id: 'set-pooler-supavisor',
        title: 'Connection Pooling (Supavisor / PgBouncer)',
        description: `Transaction & Session pooler: ${projectSettings.databaseHost}:6543 (IPv4 / IPv6 high-concurrency pool)`,
        keywords: ['pooler', 'supavisor', 'pgbouncer', 'pooling', '6543', 'concurrency', 'transactions'],
        icon: Layers,
        meta: 'Port 6543',
        action: () => {
          setActiveView('settings');
          setIsCommandPaletteOpen(false);
        }
      },
      {
        id: 'set-compute-tier',
        title: 'Compute Size & Hardware Add-ons',
        description: `Active Compute: ${projectSettings.tier} (${projectSettings.region}) • 0.5 vCPU • 1GB RAM • Auto-scaling enabled`,
        keywords: ['compute', 'hardware', 'cpu', 'ram', 'tier', 'plan', 'nano', 'scaling', 'upgrade'],
        icon: Cpu,
        meta: 'Hardware',
        action: () => {
          setActiveView('settings');
          setIsCommandPaletteOpen(false);
        }
      },
      {
        id: 'set-pitr-backups',
        title: 'Point-in-Time Recovery (PITR) & Backups',
        description: 'Automated continuous WAL archiving and daily snapshot management with 7-day retention',
        keywords: ['pitr', 'backup', 'wal', 'restore', 'recovery', 'snapshots', 'retention'],
        icon: Clock,
        meta: 'Backups',
        action: () => {
          setActiveView('settings');
          setIsCommandPaletteOpen(false);
        }
      },
      {
        id: 'set-danger-zone',
        title: 'Danger Zone: Password Reset & Pause Instance',
        description: 'Rotate master database credentials or pause database cluster computing resources',
        keywords: ['danger', 'password', 'reset', 'pause', 'restart', 'delete', 'rotate'],
        icon: Settings,
        meta: 'Security',
        action: () => {
          setActiveView('settings');
          setIsCommandPaletteOpen(false);
        }
      }
    ];

    settingsItems.forEach(s => {
      items.push({
        id: s.id,
        title: s.title,
        category: 'Settings',
        categoryId: 'settings',
        description: s.description,
        keywords: s.keywords,
        icon: s.icon,
        meta: s.meta,
        action: s.action
      });
    });

    // 4. NAVIGATION & VIEWS
    const navViews: Array<{ id: ActiveView; title: string; desc: string; icon: React.ElementType; kw: string[] }> = [
      { id: 'overview', title: 'Go to Project Overview', desc: 'Infrastructure telemetry, topology canvas, and branch details', icon: Activity, kw: ['home', 'dashboard', 'overview', 'telemetry', 'status'] },
      { id: 'table_editor', title: 'Go to Table Editor', desc: 'Browse, edit, insert, and filter rows with full RLS controls', icon: Table, kw: ['tables', 'rows', 'data', 'editor', 'grid', 'csv'] },
      { id: 'sql_editor', title: 'Go to SQL Editor & Query Runner', desc: 'Run PostgreSQL queries, explain plans, and save scripts', icon: Terminal, kw: ['sql', 'query', 'editor', 'postgres', 'terminal', 'script'] },
      { id: 'database_schema', title: 'Go to Database & Schemas', desc: 'Schema architecture, indexes, extensions (pgvector), and maintenance', icon: Database, kw: ['schema', 'extensions', 'pgvector', 'indexes', 'vacuum'] },
      { id: 'auth', title: 'Go to Authentication & Users', desc: 'User accounts, RLS policies, MFA, and OAuth providers', icon: Users, kw: ['auth', 'users', 'login', 'signup', 'rls', 'policies', 'oauth'] },
      { id: 'storage', title: 'Go to Storage Buckets', desc: 'Manage media buckets, upload files, and configure CDN policies', icon: FolderArchive, kw: ['storage', 'buckets', 'files', 'upload', 'images', 's3'] },
      { id: 'edge_functions', title: 'Go to Edge Functions', desc: 'Serverless Deno/TypeScript functions deployed globally', icon: Zap, kw: ['functions', 'edge', 'deno', 'typescript', 'serverless', 'webhooks'] },
      { id: 'realtime', title: 'Go to Realtime Inspector', desc: 'Inspect live PostgreSQL CDC replication, broadcast, and presence channels', icon: Radio, kw: ['realtime', 'websocket', 'broadcast', 'presence', 'cdc'] },
      { id: 'api_docs', title: 'Go to API & GraphQL Docs', desc: 'Interactive REST & GraphQL guides, quickstarts, and AI tools', icon: FileCode, kw: ['docs', 'api', 'graphql', 'quickstart', 'nextjs', 'react'] },
      { id: 'observability', title: 'Go to Logs & Observability', desc: 'Query performance metrics, error logs, and connection telemetry', icon: Activity, kw: ['logs', 'metrics', 'observability', 'errors', 'performance'] },
      { id: 'organizations', title: 'Go to All Projects & Organizations', desc: 'Multi-project workspace management and usage quotas', icon: Building2, kw: ['organizations', 'projects', 'workspace', 'instances', 'teams'] },
      { id: 'settings', title: 'Go to Project Settings & Secrets', desc: 'API keys, database connections, and compute scaling options', icon: Settings, kw: ['settings', 'config', 'keys', 'passwords', 'database'] },
    ];

    navViews.forEach(v => {
      items.push({
        id: `nav-${v.id}`,
        title: v.title,
        category: 'Navigation',
        categoryId: 'navigation',
        description: v.desc,
        keywords: ['navigate', 'view', 'goto', ...v.kw],
        icon: v.icon,
        action: () => {
          setActiveView(v.id);
          setIsCommandPaletteOpen(false);
        }
      });
    });

    // 5. QUICK ACTIONS
    items.push({
      id: 'action-new-sql',
      title: 'New Blank SQL Query Tab',
      category: 'Actions',
      categoryId: 'actions',
      description: 'Open a blank SQL query workspace to write custom scripts',
      keywords: ['sql', 'query', 'new', 'create', 'blank', 'tab'],
      icon: Terminal,
      shortcut: 'Ctrl+Shift+K',
      action: () => {
        addSqlTab('New Query', 'SELECT * FROM public.profiles LIMIT 10;');
        setActiveView('sql_editor');
        setIsCommandPaletteOpen(false);
      }
    });

    items.push({
      id: 'action-vacuum-analyze',
      title: 'Run PostgreSQL VACUUM & ANALYZE',
      category: 'Actions',
      categoryId: 'actions',
      description: 'Reclaim dead space and update query planner table statistics',
      keywords: ['vacuum', 'analyze', 'maintenance', 'optimize', 'bloat', 'statistics'],
      icon: Play,
      action: () => {
        setActiveView('database_schema');
        setIsCommandPaletteOpen(false);
        setNotification({
          type: 'success',
          message: 'Initiated VACUUM ANALYZE on public schema'
        });
      }
    });

    items.push({
      id: 'action-toggle-theme',
      title: `Toggle Theme (Currently: ${theme === 'warm-ivory' ? 'Warm Ivory' : 'Midnight Dark'})`,
      category: 'Actions',
      categoryId: 'actions',
      description: 'Switch between the default Warm Ivory aesthetic and the Midnight Dark theme',
      keywords: ['theme', 'dark', 'light', 'mode', 'midnight', 'ivory', 'appearance', 'color'],
      icon: theme === 'warm-ivory' ? Moon : Sun,
      action: () => {
        toggleTheme();
        setIsCommandPaletteOpen(false);
      }
    });

    items.push({
      id: 'action-theme-warm-ivory',
      title: 'Set Theme: Warm Ivory (Day Aesthetic)',
      category: 'Settings',
      categoryId: 'settings',
      description: 'Switch workspace interface to classic Warm Ivory theme',
      keywords: ['theme', 'light', 'warm', 'ivory', 'day', 'white', 'cream'],
      icon: Sun,
      action: () => {
        setTheme('warm-ivory');
        setIsCommandPaletteOpen(false);
      }
    });

    items.push({
      id: 'action-theme-midnight',
      title: 'Set Theme: Midnight Dark (Night Aesthetic)',
      category: 'Settings',
      categoryId: 'settings',
      description: 'Switch workspace interface to deep luxury Midnight Obsidian theme',
      keywords: ['theme', 'dark', 'night', 'midnight', 'black', 'darkmode'],
      icon: Moon,
      action: () => {
        setTheme('midnight');
        setIsCommandPaletteOpen(false);
      }
    });

    // 6. STORAGE BUCKETS & EDGE FUNCTIONS
    storageBuckets.forEach(b => {
      items.push({
        id: `bucket-${b.id}`,
        title: `Bucket: ${b.name}`,
        category: 'Storage',
        categoryId: 'tables',
        description: `Storage Bucket (${b.isPublic ? 'Public CDN' : 'Private Access'}) • ${b.sizeLimitMb || 50} MB Limit`,
        keywords: [b.name, 'bucket', 'storage', 'files', 'media', 's3'],
        icon: FolderArchive,
        action: () => {
          setSelectedBucketId(b.id);
          setActiveView('storage');
          setIsCommandPaletteOpen(false);
        }
      });
    });

    edgeFunctions.forEach(f => {
      items.push({
        id: `fn-${f.id}`,
        title: `Function: ${f.name}`,
        category: 'Functions',
        categoryId: 'actions',
        description: `Edge Function in ${f.region} (${f.status}) • URL: /functions/v1/${f.name}`,
        keywords: [f.name, 'function', 'edge', 'deno', 'api', 'serverless'],
        icon: Zap,
        action: () => {
          setSelectedFunctionId(f.id);
          setActiveView('edge_functions');
          setIsCommandPaletteOpen(false);
        }
      });
    });

    return items;
  }, [tables, edgeFunctions, storageBuckets, projectSettings, setActiveView, setSelectedTableId, setSelectedFunctionId, setSelectedBucketId, addSqlTab, setIsCommandPaletteOpen, setNotification, theme, setTheme, toggleTheme]);

  // Apply Fuzzy Search Filtering and Category Tabs
  const filteredItems = useMemo(() => {
    let pool = allItems;
    if (selectedCategory !== 'all') {
      pool = pool.filter(item => item.categoryId === selectedCategory);
    }

    if (!query.trim()) {
      return pool;
    }

    const scored = pool
      .map(item => {
        const titleScore = fuzzyScore(query, item.title, item.keywords);
        const descScore = fuzzyScore(query, item.description, item.keywords);
        const bestScore = Math.max(titleScore.score * 1.2, descScore.score);
        return {
          item,
          score: bestScore,
          matches: titleScore.matches || descScore.matches
        };
      })
      .filter(entry => entry.matches && entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item);

    return scored;
  }, [allItems, selectedCategory, query]);

  // Keep selection in bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K'))) {
      e.preventDefault();
      setIsCommandPaletteOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      scrollItemIntoView((selectedIndex + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
      scrollItemIntoView((selectedIndex - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const categories: CommandCategory[] = ['all', 'tables', 'procedures', 'settings', 'navigation', 'actions'];
      const currentIdx = categories.indexOf(selectedCategory);
      const nextCategory = e.shiftKey
        ? categories[(currentIdx - 1 + categories.length) % categories.length]
        : categories[(currentIdx + 1) % categories.length];
      setSelectedCategory(nextCategory);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  const scrollItemIntoView = (index: number) => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('[data-command-item]');
      if (items[index]) {
        items[index].scrollIntoView({ block: 'nearest' });
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  const categoriesConfig: Array<{ id: CommandCategory; label: string; count: number }> = [
    { id: 'all', label: 'All', count: allItems.length },
    { id: 'tables', label: 'Tables', count: allItems.filter(i => i.categoryId === 'tables').length },
    { id: 'procedures', label: 'Procedures', count: allItems.filter(i => i.categoryId === 'procedures').length },
    { id: 'settings', label: 'Settings', count: allItems.filter(i => i.categoryId === 'settings').length },
    { id: 'navigation', label: 'Navigation', count: allItems.filter(i => i.categoryId === 'navigation').length },
    { id: 'actions', label: 'Actions', count: allItems.filter(i => i.categoryId === 'actions').length },
  ];

  return (
    <div 
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-20 px-4"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div 
        id="command-palette-modal"
        className="w-full max-w-2xl bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl shadow-2xl overflow-hidden text-[#2B1D20] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E8DDD2] bg-[#FAF7F2]">
          <Search className="w-4 h-4 text-[#8B1E3F] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Fuzzy search tables, stored procedures, settings, queries..."
            className="w-full bg-transparent text-sm text-[#2B1D20] placeholder-[#9B888C] focus:outline-hidden font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-[#9B888C] hover:text-[#2B1D20] rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-[#FFFDF9] text-[#685559] px-1.5 py-0.5 rounded border border-[#E8DDD2] shadow-2xs">
            ESC to close
          </kbd>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-[#E8DDD2] bg-[#FFFDF9] overflow-x-auto scrollbar-none text-xs">
          {categoriesConfig.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#8B1E3F] text-white shadow-2xs'
                  : 'text-[#685559] hover:text-[#2B1D20] hover:bg-[#FAF7F2]'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1 rounded-full ${
                selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] text-[#9B888C]'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-[#E8DDD2]/30 max-h-[50vh] scrollbar-thin"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-[#C2B3B5] mx-auto opacity-60" />
              <p className="text-sm font-semibold text-[#2B1D20]">No matching items found</p>
              <p className="text-xs text-[#685559] max-w-sm mx-auto">
                Try typing table names (e.g. <code className="font-mono bg-[#FAF7F2] px-1 py-0.5 rounded text-[#8B1E3F]">patients</code>), procedure names (e.g. <code className="font-mono bg-[#FAF7F2] px-1 py-0.5 rounded text-[#8B1E3F]">handle_new_user</code>), or settings (e.g. <code className="font-mono bg-[#FAF7F2] px-1 py-0.5 rounded text-[#8B1E3F]">anon key</code>).
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  data-command-item
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#FAF7F2] ring-1 ring-[#8B1E3F]/30 shadow-2xs' 
                      : 'hover:bg-[#FAF7F2]/60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      isSelected 
                        ? 'bg-[#8B1E3F] text-white shadow-2xs' 
                        : 'bg-[#FAF7F2] text-[#8B1E3F] border border-[#E8DDD2]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#2B1D20] truncate font-mono">
                          {item.title}
                        </span>
                        <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded-full border ${
                          item.category === 'Tables'
                            ? 'bg-[#EFF7F3] text-[#286E4F] border-[#C4E6D5]'
                            : item.category === 'Procedures'
                            ? 'bg-[#FDF0F3] text-[#8B1E3F] border-[#F5CBD3]'
                            : item.category === 'Settings'
                            ? 'bg-[#F0F4F8] text-[#3B5B88] border-[#D0DFEF]'
                            : 'bg-[#FAF7F2] text-[#685559] border-[#E8DDD2]'
                        }`}>
                          {item.category}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#685559] mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-center">
                    {item.meta && (
                      <span className="text-[10px] font-mono text-[#9B888C] hidden sm:inline">
                        {item.meta}
                      </span>
                    )}
                    {item.shortcut && (
                      <kbd className="text-[10px] font-mono bg-[#FFFDF9] text-[#685559] px-1.5 py-0.5 rounded border border-[#E8DDD2]">
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-[#8B1E3F]' : 'text-transparent'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#FAF7F2] border-t border-[#E8DDD2] flex items-center justify-between text-[11px] text-[#685559]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-[#FFFDF9] text-[#2B1D20] px-1 rounded border border-[#E8DDD2]">↑</kbd>
              <kbd className="font-mono bg-[#FFFDF9] text-[#2B1D20] px-1 rounded border border-[#E8DDD2]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-[#FFFDF9] text-[#2B1D20] px-1.5 rounded border border-[#E8DDD2]">↵</kbd>
              <span>to select</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="font-mono bg-[#FFFDF9] text-[#2B1D20] px-1.5 rounded border border-[#E8DDD2]">Tab</kbd>
              <span>to switch category</span>
            </span>
          </div>

          <div className="font-medium text-[#8B1E3F]">
            {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
          </div>
        </div>
      </div>
    </div>
  );
};
