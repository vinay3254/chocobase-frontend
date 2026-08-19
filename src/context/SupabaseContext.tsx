import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ActiveView, 
  DatabaseSchemaName, 
  TableDefinition, 
  TableRowData, 
  AuthUser, 
  AuthProviderConfig, 
  StorageBucket, 
  StorageObject, 
  EdgeFunction, 
  ProjectSettings, 
  DatabaseMetrics, 
  SqlQueryTab, 
  RealtimeMessage, 
  RealtimeChannel,
  RlsPolicy,
  ColumnDefinition,
  CurrentUser,
  ThemeMode
} from '../types';
import { 
  INITIAL_PROJECT_SETTINGS, 
  INITIAL_TABLES, 
  INITIAL_TABLE_DATA, 
  INITIAL_AUTH_USERS, 
  INITIAL_AUTH_PROVIDERS, 
  INITIAL_STORAGE_BUCKETS, 
  INITIAL_STORAGE_OBJECTS, 
  INITIAL_EDGE_FUNCTIONS, 
  INITIAL_SQL_TABS, 
  INITIAL_DATABASE_METRICS 
} from '../data/mockData';

interface SupabaseContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedSchema: DatabaseSchemaName;
  setSelectedSchema: (schema: DatabaseSchemaName) => void;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  tables: TableDefinition[];
  tableData: Record<string, TableRowData[]>;
  updateTableRow: (tableId: string, rowId: string, updatedFields: Record<string, any>) => void;
  insertTableRow: (tableId: string, newRow: Record<string, any>) => void;
  deleteTableRow: (tableId: string, rowId: string) => void;
  addNewTable: (newTable: TableDefinition) => void;
  addColumnToTable: (tableId: string, column: ColumnDefinition) => void;
  toggleRls: (tableId: string) => void;
  addRlsPolicy: (tableId: string, policy: RlsPolicy) => void;
  deleteRlsPolicy: (tableId: string, policyId: string) => void;
  
  // SQL Tabs
  sqlTabs: SqlQueryTab[];
  activeSqlTabId: string;
  setActiveSqlTabId: (id: string) => void;
  updateSqlTab: (tabId: string, updates: Partial<SqlQueryTab>) => void;
  addSqlTab: (title?: string, initialSql?: string) => void;
  closeSqlTab: (tabId: string) => void;
  
  // Auth
  authUsers: AuthUser[];
  authProviders: AuthProviderConfig[];
  createAuthUser: (email: string, role: AuthUser['role'], provider?: AuthUser['provider']) => void;
  toggleBanUser: (userId: string) => void;
  deleteAuthUser: (userId: string) => void;
  toggleAuthProvider: (providerId: string) => void;
  
  // User Session & Login/Signup
  currentUser: CurrentUser | null;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup' | 'magic_link';
  openAuthModal: (mode?: 'signin' | 'signup' | 'magic_link') => void;
  closeAuthModal: () => void;
  signIn: (email: string, password?: string, provider?: string) => Promise<boolean>;
  signUp: (email: string, password?: string, provider?: string) => Promise<boolean>;
  signOut: () => void;
  
  // Storage
  storageBuckets: StorageBucket[];
  storageObjects: StorageObject[];
  selectedBucketId: string;
  setSelectedBucketId: (id: string) => void;
  createStorageBucket: (name: string, isPublic: boolean, sizeLimitMb?: number) => void;
  deleteStorageBucket: (bucketId: string) => void;
  uploadStorageObject: (bucketId: string, name: string, sizeBytes: number, mimeType: string, previewUrl?: string) => void;
  deleteStorageObject: (objectId: string) => void;
  
  // Edge Functions
  edgeFunctions: EdgeFunction[];
  selectedFunctionId: string | null;
  setSelectedFunctionId: (id: string | null) => void;
  invokeEdgeFunction: (functionId: string, payload: any) => Promise<{ status: number; data: any; latencyMs: number }>;
  updateFunctionSecret: (functionId: string, key: string, value: string) => void;
  createEdgeFunction: (name: string, snippet?: string) => void;
  
  // Realtime
  realtimeMessages: RealtimeMessage[];
  realtimeChannels: RealtimeChannel[];
  sendRealtimeBroadcast: (channelName: string, event: string, payload: any) => void;
  clearRealtimeLogs: () => void;
  
  // Observability & Settings
  metrics: DatabaseMetrics;
  projectSettings: ProjectSettings;
  updateProjectSettings: (updates: Partial<ProjectSettings>) => void;
  
  // Global search & command palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isConnectModalOpen: boolean;
  setIsConnectModalOpen: (open: boolean) => void;
  connectionMode: 'sandbox' | 'remote';
  setConnectionMode: (mode: 'sandbox' | 'remote') => void;
  remoteUrl: string;
  setRemoteUrl: (url: string) => void;
  remoteAnonKey: string;
  setRemoteAnonKey: (key: string) => void;
  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [selectedSchema, setSelectedSchema] = useState<DatabaseSchemaName>('public');
  const [selectedTableId, setSelectedTableId] = useState<string | null>('tbl-posts');

  // Theme State (Warm Ivory vs. Midnight Dark)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('chocobase_theme');
    if (saved === 'midnight' || saved === 'warm-ivory') {
      return saved as ThemeMode;
    }
    return 'warm-ivory';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('chocobase_theme', newTheme);
    document.documentElement.classList.toggle('theme-midnight', newTheme === 'midnight');
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'warm-ivory' ? 'midnight' : 'warm-ivory';
    setTheme(nextTheme);
    showNotification(`Switched to ${nextTheme === 'midnight' ? 'Midnight Dark' : 'Warm Ivory'} theme`, 'info');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('theme-midnight', theme === 'midnight');
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // User session & auth modal
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem('chocobase_current_user');
    return saved ? JSON.parse(saved) : {
      id: 'usr-admin-1',
      email: 'vinaygk219@gmail.com',
      role: 'admin',
      provider: 'email',
      createdAt: new Date().toISOString()
    };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'magic_link'>('signin');
  
  const [tables, setTables] = useState<TableDefinition[]>(() => {
    const saved = localStorage.getItem('chocobase_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [tableData, setTableData] = useState<Record<string, TableRowData[]>>(() => {
    const saved = localStorage.getItem('chocobase_table_data');
    return saved ? JSON.parse(saved) : INITIAL_TABLE_DATA;
  });

  const [sqlTabs, setSqlTabs] = useState<SqlQueryTab[]>(() => {
    const saved = localStorage.getItem('chocobase_sql_tabs');
    return saved ? JSON.parse(saved) : INITIAL_SQL_TABS;
  });
  const [activeSqlTabId, setActiveSqlTabId] = useState<string>(sqlTabs[0]?.id || 'tab-1');

  const [authUsers, setAuthUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('chocobase_auth_users');
    return saved ? JSON.parse(saved) : INITIAL_AUTH_USERS;
  });
  const [authProviders, setAuthProviders] = useState<AuthProviderConfig[]>(INITIAL_AUTH_PROVIDERS);

  const [storageBuckets, setStorageBuckets] = useState<StorageBucket[]>(() => {
    const saved = localStorage.getItem('chocobase_storage_buckets');
    return saved ? JSON.parse(saved) : INITIAL_STORAGE_BUCKETS;
  });
  const [storageObjects, setStorageObjects] = useState<StorageObject[]>(() => {
    const saved = localStorage.getItem('chocobase_storage_objects');
    return saved ? JSON.parse(saved) : INITIAL_STORAGE_OBJECTS;
  });
  const [selectedBucketId, setSelectedBucketId] = useState<string>(storageBuckets[0]?.id || 'avatars');

  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunction[]>(() => {
    const saved = localStorage.getItem('chocobase_edge_functions');
    return saved ? JSON.parse(saved) : INITIAL_EDGE_FUNCTIONS;
  });
  const [selectedFunctionId, setSelectedFunctionId] = useState<string | null>(edgeFunctions[0]?.id || null);

  const [realtimeMessages, setRealtimeMessages] = useState<RealtimeMessage[]>([
    {
      id: 'rt-msg-1',
      timestamp: new Date(Date.now() - 40000).toISOString(),
      topic: 'realtime:public:posts',
      event: 'INSERT',
      payload: { id: '11111111-2222-3333-4444-555555555504', title: 'Design Systems for Developer Tooling' },
      sender: 'server-postgres-wal'
    },
    {
      id: 'rt-msg-2',
      timestamp: new Date(Date.now() - 20000).toISOString(),
      topic: 'realtime:public:comments',
      event: 'INSERT',
      payload: { post_id: '11111111-2222-3333-4444-555555555502', body: 'Remember to always index columns...' },
      sender: 'server-postgres-wal'
    }
  ]);

  const [realtimeChannels] = useState<RealtimeChannel[]>([
    { name: 'realtime:public:posts', subscribersCount: 14, mode: 'postgres_changes', filter: 'published=eq.true', createdAt: '2025-02-18T00:00:00Z' },
    { name: 'room:collaborative-editor', subscribersCount: 5, mode: 'presence', createdAt: '2025-02-18T02:30:00Z' },
    { name: 'chat:general-broadcast', subscribersCount: 22, mode: 'broadcast', createdAt: '2025-02-18T04:15:00Z' }
  ]);

  const [metrics, setMetrics] = useState<DatabaseMetrics>(INITIAL_DATABASE_METRICS);
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>(INITIAL_PROJECT_SETTINGS);
  
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'sandbox' | 'remote'>('sandbox');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [remoteAnonKey, setRemoteAnonKey] = useState('');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => curr?.message === message ? null : curr);
    }, 3500);
  };

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('chocobase_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('chocobase_table_data', JSON.stringify(tableData));
  }, [tableData]);

  useEffect(() => {
    localStorage.setItem('chocobase_auth_users', JSON.stringify(authUsers));
  }, [authUsers]);

  useEffect(() => {
    localStorage.setItem('chocobase_storage_buckets', JSON.stringify(storageBuckets));
    localStorage.setItem('chocobase_storage_objects', JSON.stringify(storageObjects));
  }, [storageBuckets, storageObjects]);

  useEffect(() => {
    localStorage.setItem('chocobase_edge_functions', JSON.stringify(edgeFunctions));
  }, [edgeFunctions]);

  // Simulate subtle real-time metrics fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpuUsagePercent: Math.max(8, Math.min(85, +(prev.cpuUsagePercent + (Math.random() * 4 - 2)).toFixed(1))),
        activeConnections: Math.max(10, Math.min(60, Math.round(prev.activeConnections + (Math.random() * 2 - 1)))),
        tps: +(prev.tps + (Math.random() * 8 - 4)).toFixed(1),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Table Data Handlers
  const updateTableRow = (tableId: string, rowId: string, updatedFields: Record<string, any>) => {
    setTableData((prev) => {
      const rows = prev[tableId] || [];
      const updatedRows = rows.map((r) => r.id === rowId ? { ...r, ...updatedFields, updated_at: new Date().toISOString() } : r);
      return { ...prev, [tableId]: updatedRows };
    });

    const targetTable = tables.find(t => t.id === tableId);
    // Emit realtime message
    const msg: RealtimeMessage = {
      id: `rt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      topic: `realtime:public:${targetTable?.name || 'table'}`,
      event: 'UPDATE',
      payload: { id: rowId, ...updatedFields },
      sender: 'postgres-wal-cdc'
    };
    setRealtimeMessages((prev) => [msg, ...prev.slice(0, 49)]);
    showNotification(`Row in "${targetTable?.name || 'table'}" updated successfully`);
  };

  const insertTableRow = (tableId: string, newRow: Record<string, any>) => {
    const targetTable = tables.find(t => t.id === tableId);
    const rowWithMeta: TableRowData = {
      id: newRow.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...newRow,
    };

    setTableData((prev) => ({
      ...prev,
      [tableId]: [rowWithMeta, ...(prev[tableId] || [])]
    }));

    setTables((prev) => prev.map(t => t.id === tableId ? { ...t, rowsCount: (t.rowsCount || 0) + 1 } : t));

    // Emit realtime event
    const msg: RealtimeMessage = {
      id: `rt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      topic: `realtime:public:${targetTable?.name || 'table'}`,
      event: 'INSERT',
      payload: rowWithMeta,
      sender: 'postgres-wal-cdc'
    };
    setRealtimeMessages((prev) => [msg, ...prev.slice(0, 49)]);
    showNotification(`New record inserted into "${targetTable?.name || 'table'}"`);
  };

  const deleteTableRow = (tableId: string, rowId: string) => {
    const targetTable = tables.find(t => t.id === tableId);
    setTableData((prev) => ({
      ...prev,
      [tableId]: (prev[tableId] || []).filter(r => r.id !== rowId)
    }));

    setTables((prev) => prev.map(t => t.id === tableId ? { ...t, rowsCount: Math.max(0, (t.rowsCount || 1) - 1) } : t));

    const msg: RealtimeMessage = {
      id: `rt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      topic: `realtime:public:${targetTable?.name || 'table'}`,
      event: 'DELETE',
      payload: { id: rowId },
      sender: 'postgres-wal-cdc'
    };
    setRealtimeMessages((prev) => [msg, ...prev.slice(0, 49)]);
    showNotification(`Row deleted from "${targetTable?.name || 'table'}"`);
  };

  const addNewTable = (newTable: TableDefinition) => {
    setTables((prev) => [...prev, newTable]);
    setTableData((prev) => ({ ...prev, [newTable.id]: [] }));
    setSelectedTableId(newTable.id);
    showNotification(`Table "${newTable.name}" created with RLS enabled`);
  };

  const addColumnToTable = (tableId: string, column: ColumnDefinition) => {
    setTables((prev) => prev.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          columns: [...t.columns, column]
        };
      }
      return t;
    }));
    showNotification(`Column "${column.name}" (${column.type}) added`);
  };

  const toggleRls = (tableId: string) => {
    setTables((prev) => prev.map(t => {
      if (t.id === tableId) {
        const nextState = !t.rlsEnabled;
        showNotification(`RLS ${nextState ? 'enabled' : 'disabled'} for ${t.name}`, nextState ? 'success' : 'info');
        return { ...t, rlsEnabled: nextState };
      }
      return t;
    }));
  };

  const addRlsPolicy = (tableId: string, policy: RlsPolicy) => {
    setTables((prev) => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, policies: [...t.policies, policy] };
      }
      return t;
    }));
    showNotification(`RLS Policy "${policy.name}" created`);
  };

  const deleteRlsPolicy = (tableId: string, policyId: string) => {
    setTables((prev) => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, policies: t.policies.filter(p => p.id !== policyId) };
      }
      return t;
    }));
    showNotification(`RLS Policy removed`);
  };

  // SQL Tabs
  const updateSqlTab = (tabId: string, updates: Partial<SqlQueryTab>) => {
    setSqlTabs((prev) => prev.map(t => t.id === tabId ? { ...t, ...updates } : t));
  };

  const addSqlTab = (title: string = 'New Query', initialSql: string = 'SELECT * FROM public.posts LIMIT 10;') => {
    const newTab: SqlQueryTab = {
      id: `tab-${Date.now()}`,
      title,
      sql: initialSql,
      isSaved: false,
    };
    setSqlTabs((prev) => [...prev, newTab]);
    setActiveSqlTabId(newTab.id);
  };

  const closeSqlTab = (tabId: string) => {
    if (sqlTabs.length <= 1) return;
    setSqlTabs((prev) => prev.filter(t => t.id !== tabId));
    if (activeSqlTabId === tabId) {
      const remaining = sqlTabs.filter(t => t.id !== tabId);
      setActiveSqlTabId(remaining[remaining.length - 1]?.id || 'tab-1');
    }
  };

  // Auth operations
  const createAuthUser = (email: string, role: AuthUser['role'] = 'authenticated', provider: AuthUser['provider'] = 'email') => {
    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      email,
      role,
      provider,
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      bannedUntil: null,
      userMetadata: { full_name: email.split('@')[0] },
      appMetadata: { provider, providers: [provider] }
    };
    setAuthUsers((prev) => [newUser, ...prev]);
    showNotification(`User "${email}" invited & created`);
  };

  const toggleBanUser = (userId: string) => {
    setAuthUsers((prev) => prev.map(u => {
      if (u.id === userId) {
        const isBanned = !!u.bannedUntil;
        const newBanned = isBanned ? null : '2099-01-01T00:00:00Z';
        showNotification(`User ${isBanned ? 'unbanned' : 'banned'}`, isBanned ? 'success' : 'info');
        return { ...u, bannedUntil: newBanned };
      }
      return u;
    }));
  };

  const deleteAuthUser = (userId: string) => {
    setAuthUsers((prev) => prev.filter(u => u.id !== userId));
    showNotification('User deleted from auth.users');
  };

  const toggleAuthProvider = (providerId: string) => {
    setAuthProviders((prev) => prev.map(p => p.id === providerId ? { ...p, enabled: !p.enabled } : p));
    showNotification('Provider configuration updated');
  };

  // Storage operations
  const createStorageBucket = (name: string, isPublic: boolean, sizeLimitMb: number = 50) => {
    const newBucket: StorageBucket = {
      id: name.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      name,
      isPublic,
      createdAt: new Date().toISOString(),
      fileSizeLimitMb: sizeLimitMb,
      objectsCount: 0,
      sizeBytes: 0,
    };
    setStorageBuckets((prev) => [...prev, newBucket]);
    setSelectedBucketId(newBucket.id);
    showNotification(`Bucket "${name}" (${isPublic ? 'Public' : 'Private'}) created`);
  };

  const deleteStorageBucket = (bucketId: string) => {
    setStorageBuckets((prev) => prev.filter(b => b.id !== bucketId));
    setStorageObjects((prev) => prev.filter(o => o.bucketId !== bucketId));
    if (selectedBucketId === bucketId) {
      setSelectedBucketId(storageBuckets.find(b => b.id !== bucketId)?.id || 'avatars');
    }
    showNotification('Bucket and objects deleted');
  };

  const uploadStorageObject = (bucketId: string, name: string, sizeBytes: number, mimeType: string, previewUrl?: string) => {
    const newObj: StorageObject = {
      id: `obj-${Date.now()}`,
      bucketId,
      name,
      path: `uploads/${name}`,
      sizeBytes,
      mimeType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { uploadedBy: 'vinaygk' },
      previewUrl
    };
    setStorageObjects((prev) => [newObj, ...prev]);
    setStorageBuckets((prev) => prev.map(b => b.id === bucketId ? {
      ...b,
      objectsCount: b.objectsCount + 1,
      sizeBytes: b.sizeBytes + sizeBytes
    } : b));
    showNotification(`Uploaded "${name}" to bucket "${bucketId}"`);
  };

  const deleteStorageObject = (objectId: string) => {
    const obj = storageObjects.find(o => o.id === objectId);
    if (!obj) return;
    setStorageObjects((prev) => prev.filter(o => o.id !== objectId));
    setStorageBuckets((prev) => prev.map(b => b.id === obj.bucketId ? {
      ...b,
      objectsCount: Math.max(0, b.objectsCount - 1),
      sizeBytes: Math.max(0, b.sizeBytes - obj.sizeBytes)
    } : b));
    showNotification(`Deleted "${obj.name}"`);
  };

  // Edge Functions
  const invokeEdgeFunction = async (functionId: string, payload: any): Promise<{ status: number; data: any; latencyMs: number }> => {
    const target = edgeFunctions.find(f => f.id === functionId);
    const startTime = performance.now();

    try {
      const slug = target?.slug || target?.name || functionId;
      const token = localStorage.getItem('chocobase_token') || 'anon_key_dev';
      const res = await fetch(`/v1/functions/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
        const logEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'info' as const,
          message: `Live edge invocation completed with HTTP ${res.status} OK (${latencyMs}ms)`,
          executionTimeMs: latencyMs,
          statusCode: res.status,
          ip: '127.0.0.1'
        };

        setEdgeFunctions((prev) => prev.map(f => f.id === functionId ? {
          ...f,
          invocationsCount: f.invocationsCount + 1,
          recentLogs: [logEntry, ...f.recentLogs.slice(0, 19)]
        } : f));

        return { status: res.status, data, latencyMs };
      }
    } catch {
      // Fallback to local sandbox runner
    }

    await new Promise(r => setTimeout(r, Math.random() * 40 + 20));
    const latencyMs = Math.round(performance.now() - startTime);

    let responseData: any = { message: `Executed function ${target?.name || functionId}`, timestamp: new Date().toISOString() };
    if (target?.slug === 'generate-embeddings') {
      responseData = {
        embedding: [0.0412, -0.0125, 0.0894, 0.0031, -0.0421, 0.0194, -0.0631, 0.0118],
        dimension: 1536,
        tokens_processed: Math.ceil(JSON.stringify(payload).length / 4),
        model: 'text-embedding-3-small'
      };
    } else if (target?.slug === 'stripe-webhook-handler') {
      responseData = { received: true, event_id: 'evt_3MtwBwLkdIwHu7ix', processed: true };
    } else if (target?.slug === 'send-welcome-email') {
      responseData = { status: 'delivered', email_id: 'msg_9381928391', recipient: payload?.record?.email || 'vinaygk219@gmail.com' };
    }

    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info' as const,
      message: `Manual test invocation completed with HTTP 200 OK (${latencyMs}ms)`,
      executionTimeMs: latencyMs,
      statusCode: 200,
      ip: '127.0.0.1'
    };

    setEdgeFunctions((prev) => prev.map(f => f.id === functionId ? {
      ...f,
      invocationsCount: f.invocationsCount + 1,
      recentLogs: [logEntry, ...f.recentLogs.slice(0, 19)]
    } : f));

    return { status: 200, data: responseData, latencyMs };
  };

  const updateFunctionSecret = (functionId: string, key: string, value: string) => {
    setEdgeFunctions((prev) => prev.map(f => f.id === functionId ? {
      ...f,
      secrets: { ...f.secrets, [key]: value }
    } : f));
    showNotification(`Secret "${key}" updated for function`);
  };

  const createEdgeFunction = (name: string, snippet?: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const newFn: EdgeFunction = {
      id: `fn-${slug}-${Date.now()}`,
      name,
      slug,
      status: 'active',
      version: 'v1.0.0',
      runtime: 'deno-2.x',
      regions: ['ap-southeast-1'],
      memoryMb: 128,
      timeoutSec: 15,
      verifyJwt: true,
      deployedAt: new Date().toISOString(),
      invocationsCount: 0,
      errorRatePercent: 0,
      avgLatencyMs: 35,
      codeSnippet: snippet || `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  return new Response(JSON.stringify({ message: "Hello from ${name}!", received: body }), {
    headers: { "Content-Type": "application/json" }
  });
});`,
      secrets: {},
      recentLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Function ${name} deployed successfully (Deno 2.x isolate initialized)`,
          statusCode: 200
        }
      ]
    };
    setEdgeFunctions((prev) => [...prev, newFn]);
    setSelectedFunctionId(newFn.id);
    showNotification(`Edge Function "${name}" deployed`);
  };

  // Realtime Broadcast
  const sendRealtimeBroadcast = (channelName: string, event: string, payload: any) => {
    const msg: RealtimeMessage = {
      id: `rt-broadcast-${Date.now()}`,
      timestamp: new Date().toISOString(),
      topic: channelName,
      event,
      payload,
      sender: 'client-studio-admin'
    };
    setRealtimeMessages((prev) => [msg, ...prev.slice(0, 49)]);
    showNotification(`Broadcasted "${event}" to "${channelName}"`);
  };

  const clearRealtimeLogs = () => {
    setRealtimeMessages([]);
    showNotification('Realtime log stream cleared');
  };

  const openAuthModal = (mode: 'signin' | 'signup' | 'magic_link' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signIn = async (email: string, password = 'password123', provider = 'email'): Promise<boolean> => {
    try {
      const res = await fetch('/v1/auth/token?grant_type=password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('chocobase_token', data.access_token);
        }
      }
    } catch {
      // Standalone mode fallback
    }

    const existing = authUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    const userObj: CurrentUser = {
      id: existing ? existing.id : `usr-${Date.now()}`,
      email: email.trim(),
      role: existing ? existing.role : 'authenticated',
      provider,
      avatarUrl: provider === 'github' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' : undefined,
      createdAt: existing ? existing.createdAt : new Date().toISOString()
    };
    setCurrentUser(userObj);
    localStorage.setItem('chocobase_current_user', JSON.stringify(userObj));
    setIsAuthModalOpen(false);
    showNotification(`Welcome back, ${email}! Signed in.`);
    return true;
  };

  const signUp = async (email: string, password = 'password123', provider = 'email'): Promise<boolean> => {
    try {
      const res = await fetch('/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, role: 'authenticated' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('chocobase_token', data.access_token);
        }
      }
    } catch {
      // Standalone mode fallback
    }

    const newId = `usr-${Date.now()}`;
    const newUser: AuthUser = {
      id: newId,
      email: email.trim(),
      role: 'authenticated',
      provider: (provider === 'github' ? 'github' : provider === 'google' ? 'google' : 'email') as any,
      lastSignInAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      bannedUntil: null,
      userMetadata: {},
      appMetadata: {
        provider,
        providers: [provider]
      }
    };

    setAuthUsers(prev => [newUser, ...prev]);
    const userObj: CurrentUser = {
      id: newId,
      email: email.trim(),
      role: 'authenticated',
      provider,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(userObj);
    localStorage.setItem('chocobase_current_user', JSON.stringify(userObj));
    setIsAuthModalOpen(false);
    showNotification(`Account created! Welcome to ChocoBase, ${email}.`);
    return true;
  };

  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('chocobase_current_user');
    localStorage.removeItem('chocobase_token');
    showNotification('Signed out successfully', 'info');
    setActiveView('landing');
  };

  const updateProjectSettings = (updates: Partial<ProjectSettings>) => {
    setProjectSettings((prev) => ({ ...prev, ...updates }));
    showNotification('Project configuration saved');
  };

  return (
    <SupabaseContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedSchema,
        setSelectedSchema,
        selectedTableId,
        setSelectedTableId,
        tables,
        tableData,
        updateTableRow,
        insertTableRow,
        deleteTableRow,
        addNewTable,
        addColumnToTable,
        toggleRls,
        addRlsPolicy,
        deleteRlsPolicy,
        sqlTabs,
        activeSqlTabId,
        setActiveSqlTabId,
        updateSqlTab,
        addSqlTab,
        closeSqlTab,
        authUsers,
        authProviders,
        createAuthUser,
        toggleBanUser,
        deleteAuthUser,
        toggleAuthProvider,
        currentUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        storageBuckets,
        storageObjects,
        selectedBucketId,
        setSelectedBucketId,
        createStorageBucket,
        deleteStorageBucket,
        uploadStorageObject,
        deleteStorageObject,
        edgeFunctions,
        selectedFunctionId,
        setSelectedFunctionId,
        invokeEdgeFunction,
        updateFunctionSecret,
        createEdgeFunction,
        realtimeMessages,
        realtimeChannels,
        sendRealtimeBroadcast,
        clearRealtimeLogs,
        metrics,
        projectSettings,
        updateProjectSettings,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isConnectModalOpen,
        setIsConnectModalOpen,
        connectionMode,
        setConnectionMode,
        remoteUrl,
        setRemoteUrl,
        remoteAnonKey,
        setRemoteAnonKey,
        notification,
        showNotification,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
