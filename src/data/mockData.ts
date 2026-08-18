import { 
  TableDefinition, 
  TableRowData, 
  AuthUser, 
  AuthProviderConfig, 
  StorageBucket, 
  StorageObject, 
  EdgeFunction, 
  ProjectSettings, 
  DatabaseMetrics,
  SqlQueryTab 
} from '../types';

export const INITIAL_PROJECT_SETTINGS: ProjectSettings = {
  id: 'chocobase-db-v942',
  name: 'prod-api-cluster',
  organization: 'Personal Workspace (vinaygk)',
  region: 'ap-southeast-1 (Singapore)',
  status: 'ACTIVE_HEALTHY',
  tier: 'Pro',
  pgVersion: 'PostgreSQL 16.4 (Ubuntu 16.4-1.pgdg22.04+1)',
  databaseHost: 'aws-0-ap-southeast-1.pooler.supabase.com',
  databasePort: 5432,
  poolerPort: 6543,
  databaseUser: 'postgres.chocobase-db-v942',
  databaseName: 'postgres',
  apiUrl: 'https://chocobase-db-v942.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNob2NvYmFzZS1kYi12OTQyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwODAwMDAsImV4cCI6MjAyMzY1NjAwMH0.uK93j92Ksm92-anon-public-key-chocobase-live',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNob2NvYmFzZS1kYi12OTQyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwODA4MDAwMCwiZXhwIjoyMDIzNjU2MDAwfQ.P9342_secret-service-role-key-never-share',
  jwtSecret: 'super-secret-jwt-token-signing-key-32-chars-min',
  corsOrigins: ['https://localhost:3000', 'https://myapp.vercel.app', 'https://admin.myapp.com'],
  pitrEnabled: true,
  dailyBackupTime: '02:00 UTC',
};

export const INITIAL_TABLES: TableDefinition[] = [
  {
    id: 'tbl-profiles',
    schema: 'public',
    name: 'profiles',
    comment: 'Public user profiles linked to auth.users',
    rlsEnabled: true,
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true, isNullable: false, comment: 'References auth.users(id)' },
      { name: 'username', type: 'varchar', isUnique: true, isNullable: false },
      { name: 'full_name', type: 'text', isNullable: true },
      { name: 'avatar_url', type: 'text', isNullable: true },
      { name: 'website', type: 'text', isNullable: true },
      { name: 'role', type: 'varchar', defaultValue: "'member'", isNullable: false },
      { name: 'created_at', type: 'timestamptz', defaultValue: 'NOW()', isNullable: false },
      { name: 'updated_at', type: 'timestamptz', defaultValue: 'NOW()', isNullable: false },
    ],
    indexes: [
      { name: 'profiles_pkey', columns: ['id'], isUnique: true, type: 'btree' },
      { name: 'profiles_username_key', columns: ['username'], isUnique: true, type: 'btree' },
    ],
    policies: [
      {
        id: 'pol-prof-1',
        name: 'Public profiles are viewable by everyone',
        command: 'SELECT',
        roles: ['public', 'authenticated', 'anon'],
        usingExpression: 'true',
        action: 'PERMISSIVE',
      },
      {
        id: 'pol-prof-2',
        name: 'Users can insert their own profile',
        command: 'INSERT',
        roles: ['authenticated'],
        usingExpression: 'auth.uid() = id',
        checkExpression: 'auth.uid() = id',
        action: 'PERMISSIVE',
      },
      {
        id: 'pol-prof-3',
        name: 'Users can update their own profile',
        command: 'UPDATE',
        roles: ['authenticated'],
        usingExpression: 'auth.uid() = id',
        checkExpression: 'auth.uid() = id',
        action: 'PERMISSIVE',
      }
    ],
    rowsCount: 6,
    sizeBytes: 32768,
  },
  {
    id: 'tbl-posts',
    schema: 'public',
    name: 'posts',
    comment: 'Articles and blog publications with JSON metadata',
    rlsEnabled: true,
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false },
      { name: 'author_id', type: 'uuid', isNullable: false, foreignKey: { table: 'profiles', column: 'id', onDelete: 'CASCADE' } },
      { name: 'title', type: 'text', isNullable: false },
      { name: 'slug', type: 'varchar', isUnique: true, isNullable: false },
      { name: 'content', type: 'text', isNullable: true },
      { name: 'published', type: 'boolean', defaultValue: 'false', isNullable: false },
      { name: 'view_count', type: 'integer', defaultValue: '0', isNullable: false },
      { name: 'tags', type: 'jsonb', defaultValue: "'[]'::jsonb", isNullable: true },
      { name: 'created_at', type: 'timestamptz', defaultValue: 'NOW()', isNullable: false },
    ],
    indexes: [
      { name: 'posts_pkey', columns: ['id'], isUnique: true, type: 'btree' },
      { name: 'posts_author_id_idx', columns: ['author_id'], isUnique: false, type: 'btree' },
      { name: 'posts_slug_idx', columns: ['slug'], isUnique: true, type: 'btree' },
      { name: 'posts_tags_gin_idx', columns: ['tags'], isUnique: false, type: 'gin' },
    ],
    policies: [
      {
        id: 'pol-post-1',
        name: 'Anyone can view published posts',
        command: 'SELECT',
        roles: ['public', 'anon', 'authenticated'],
        usingExpression: "published = true OR auth.uid() = author_id",
        action: 'PERMISSIVE',
      },
      {
        id: 'pol-post-2',
        name: 'Authors can create and manage posts',
        command: 'ALL',
        roles: ['authenticated'],
        usingExpression: 'auth.uid() = author_id',
        checkExpression: 'auth.uid() = author_id',
        action: 'PERMISSIVE',
      }
    ],
    rowsCount: 8,
    sizeBytes: 65536,
  },
  {
    id: 'tbl-comments',
    schema: 'public',
    name: 'comments',
    comment: 'Discussion comments on posts',
    rlsEnabled: true,
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false },
      { name: 'post_id', type: 'uuid', isNullable: false, foreignKey: { table: 'posts', column: 'id', onDelete: 'CASCADE' } },
      { name: 'user_id', type: 'uuid', isNullable: false, foreignKey: { table: 'profiles', column: 'id', onDelete: 'CASCADE' } },
      { name: 'body', type: 'text', isNullable: false },
      { name: 'upvotes', type: 'integer', defaultValue: '0', isNullable: false },
      { name: 'created_at', type: 'timestamptz', defaultValue: 'NOW()', isNullable: false },
    ],
    indexes: [
      { name: 'comments_pkey', columns: ['id'], isUnique: true, type: 'btree' },
      { name: 'comments_post_id_idx', columns: ['post_id'], isUnique: false, type: 'btree' },
    ],
    policies: [
      {
        id: 'pol-comm-1',
        name: 'Comments are readable by all users',
        command: 'SELECT',
        roles: ['public', 'anon', 'authenticated'],
        usingExpression: 'true',
        action: 'PERMISSIVE',
      },
      {
        id: 'pol-comm-2',
        name: 'Authenticated users can comment',
        command: 'INSERT',
        roles: ['authenticated'],
        usingExpression: 'auth.uid() = user_id',
        action: 'PERMISSIVE',
      }
    ],
    rowsCount: 5,
    sizeBytes: 16384,
  },
  {
    id: 'tbl-orders',
    schema: 'public',
    name: 'orders',
    comment: 'E-commerce transactional records',
    rlsEnabled: true,
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()', isNullable: false },
      { name: 'customer_email', type: 'varchar', isNullable: false },
      { name: 'total_amount', type: 'numeric', isNullable: false },
      { name: 'currency', type: 'varchar', defaultValue: "'USD'", isNullable: false },
      { name: 'status', type: 'varchar', defaultValue: "'pending'", isNullable: false },
      { name: 'items', type: 'jsonb', isNullable: false },
      { name: 'stripe_payment_intent_id', type: 'varchar', isNullable: true },
      { name: 'created_at', type: 'timestamptz', defaultValue: 'NOW()', isNullable: false },
    ],
    indexes: [
      { name: 'orders_pkey', columns: ['id'], isUnique: true, type: 'btree' },
      { name: 'orders_status_idx', columns: ['status'], isUnique: false, type: 'btree' },
    ],
    policies: [
      {
        id: 'pol-ord-1',
        name: 'Service role has full order management access',
        command: 'ALL',
        roles: ['service_role'],
        usingExpression: 'true',
        action: 'PERMISSIVE',
      }
    ],
    rowsCount: 4,
    sizeBytes: 24576,
  },
  {
    id: 'tbl-vector-embeddings',
    schema: 'public',
    name: 'document_embeddings',
    comment: 'Vector storage for semantic AI search with pgvector (1536 dim)',
    rlsEnabled: false,
    columns: [
      { name: 'id', type: 'bigint', isPrimary: true, defaultValue: 'nextval()', isNullable: false },
      { name: 'document_name', type: 'text', isNullable: false },
      { name: 'chunk_text', type: 'text', isNullable: false },
      { name: 'embedding', type: 'vector', isNullable: false, comment: 'vector(1536)' },
      { name: 'token_count', type: 'integer', isNullable: false },
      { name: 'created_at', type: 'timestamptz', defaultValue: 'NOW()', isNullable: false },
    ],
    indexes: [
      { name: 'doc_embeddings_pkey', columns: ['id'], isUnique: true, type: 'btree' },
      { name: 'doc_embeddings_hnsw_idx', columns: ['embedding'], isUnique: false, type: 'hnsw' },
    ],
    policies: [],
    rowsCount: 3,
    sizeBytes: 131072,
  }
];

export const INITIAL_TABLE_DATA: Record<string, TableRowData[]> = {
  'tbl-profiles': [
    {
      id: 'd3b07384-d113-4a1a-9f5b-568b248a8001',
      username: 'vinaygk',
      full_name: 'Vinay Kumar',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      website: 'https://vinaygk.dev',
      role: 'admin',
      created_at: '2025-01-15T09:30:00Z',
      updated_at: '2025-02-18T11:20:00Z',
    },
    {
      id: 'e4c18495-e224-4b2b-8a6c-679c359b9002',
      username: 'sarah_engineer',
      full_name: 'Sarah Connor',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      website: 'https://sarah.tech',
      role: 'lead_developer',
      created_at: '2025-01-16T14:15:00Z',
      updated_at: '2025-02-10T08:00:00Z',
    },
    {
      id: 'f5d29506-f335-4c3c-9b7d-780d460c0003',
      username: 'alex_alexander',
      full_name: 'Alex Rivera',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      website: null,
      role: 'member',
      created_at: '2025-01-20T17:45:00Z',
      updated_at: '2025-01-20T17:45:00Z',
    },
    {
      id: 'a1e30617-a446-4d4d-8c8e-891e571d1004',
      username: 'elena_designer',
      full_name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      website: 'https://dribbble.com/elena',
      role: 'designer',
      created_at: '2025-01-25T10:10:00Z',
      updated_at: '2025-02-01T15:30:00Z',
    },
    {
      id: 'b2f41728-b557-4e5e-9d9f-902f682e2005',
      username: 'marcus_db',
      full_name: 'Marcus Brody',
      avatar_url: null,
      website: 'https://postgres.guide',
      role: 'dba',
      created_at: '2025-02-02T12:00:00Z',
      updated_at: '2025-02-02T12:00:00Z',
    },
    {
      id: 'c3a52839-c668-4f6f-8e0a-013a793f3006',
      username: 'clara_dev',
      full_name: 'Clara Oswald',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      website: null,
      role: 'member',
      created_at: '2025-02-14T16:20:00Z',
      updated_at: '2025-02-14T16:20:00Z',
    }
  ],
  'tbl-posts': [
    {
      id: '11111111-2222-3333-4444-555555555501',
      author_id: 'd3b07384-d113-4a1a-9f5b-568b248a8001',
      title: 'Building High Performance Realtime Apps with Postgres WAL and WebSockets',
      slug: 'high-performance-realtime-postgres',
      content: 'PostgreSQL write-ahead logs provide an immutable commit stream that can be broadcasted via low-latency WebSockets directly to clients...',
      published: true,
      view_count: 3420,
      tags: ['postgresql', 'realtime', 'architecture', 'rust'],
      created_at: '2025-01-20T12:00:00Z',
    },
    {
      id: '11111111-2222-3333-4444-555555555502',
      author_id: 'd3b07384-d113-4a1a-9f5b-568b248a8001',
      title: 'Row Level Security: Best Practices and Multi-Tenant Isolation',
      slug: 'row-level-security-best-practices',
      content: 'Never rely solely on application middleware for data security. Centralizing RLS directly in SQL guarantees bulletproof data integrity...',
      published: true,
      view_count: 5120,
      tags: ['security', 'rls', 'postgres', 'auth'],
      created_at: '2025-01-22T08:30:00Z',
    },
    {
      id: '11111111-2222-3333-4444-555555555503',
      author_id: 'e4c18495-e224-4b2b-8a6c-679c359b9002',
      title: 'Optimizing Query Execution Plans with pg_stat_statements & Index Tuning',
      slug: 'optimizing-query-execution-plans',
      content: 'Understanding EXPLAIN ANALYZE node types (Bitmap Heap Scan vs Index Scan) and cost estimations is the key to sub-millisecond queries...',
      published: true,
      view_count: 1890,
      tags: ['performance', 'indexing', 'database'],
      created_at: '2025-01-28T14:40:00Z',
    },
    {
      id: '11111111-2222-3333-4444-555555555504',
      author_id: 'a1e30617-a446-4d4d-8c8e-891e571d1004',
      title: 'Design Systems for Developer Tooling: The Anatomy of a Modern Studio',
      slug: 'design-systems-developer-tooling',
      content: 'Developer tools require dense, information-rich layouts that prioritize keyboard navigation and mathematical optical harmony...',
      published: true,
      view_count: 2430,
      tags: ['design', 'ui-ux', 'developer-experience'],
      created_at: '2025-02-05T09:15:00Z',
    },
    {
      id: '11111111-2222-3333-4444-555555555505',
      author_id: 'f5d29506-f335-4c3c-9b7d-780d460c0003',
      title: 'Draft: Edge Functions with Deno & Sub-50ms Cold Starts',
      slug: 'edge-functions-deno-cold-starts',
      content: 'Exploring how V8 isolates minimize cold starts compared to traditional containers...',
      published: false,
      view_count: 12,
      tags: ['serverless', 'edge-functions', 'typescript'],
      created_at: '2025-02-12T17:00:00Z',
    }
  ],
  'tbl-comments': [
    {
      id: '22222222-3333-4444-5555-666666666601',
      post_id: '11111111-2222-3333-4444-555555555501',
      user_id: 'e4c18495-e224-4b2b-8a6c-679c359b9002',
      body: 'Great writeup on WAL streaming! We saw a 10x throughput improvement once we avoided query polling.',
      upvotes: 24,
      created_at: '2025-01-21T09:00:00Z',
    },
    {
      id: '22222222-3333-4444-5555-666666666602',
      post_id: '11111111-2222-3333-4444-555555555502',
      user_id: 'b2f41728-b557-4e5e-9d9f-902f682e2005',
      body: 'Remember to always index columns used in your RLS `using` expressions to avoid sequential table scans!',
      upvotes: 42,
      created_at: '2025-01-23T11:30:00Z',
    }
  ],
  'tbl-orders': [
    {
      id: '33333333-4444-5555-6666-777777777701',
      customer_email: 'clara.oswald@example.com',
      total_amount: 149.00,
      currency: 'USD',
      status: 'completed',
      items: [{ sku: 'PRO-PLAN-ANNUAL', qty: 1, price: 149.00 }],
      stripe_payment_intent_id: 'pi_3MtwBwLkdIwHu7ix28a3tPqZ',
      created_at: '2025-02-15T10:14:00Z',
    },
    {
      id: '33333333-4444-5555-6666-777777777702',
      customer_email: 'tech_lead@acmecorp.io',
      total_amount: 899.00,
      currency: 'USD',
      status: 'completed',
      items: [{ sku: 'ENTERPRISE-COMPUTE-ADDON', qty: 1, price: 899.00 }],
      stripe_payment_intent_id: 'pi_3MtwCwLkdIwHu7ix99b4zAxK',
      created_at: '2025-02-16T18:22:00Z',
    },
    {
      id: '33333333-4444-5555-6666-777777777703',
      customer_email: 'alex.rivera@devmail.org',
      total_amount: 29.00,
      currency: 'USD',
      status: 'pending',
      items: [{ sku: 'STORAGE-EXPANSION-100GB', qty: 1, price: 29.00 }],
      stripe_payment_intent_id: 'pi_3MtwDwLkdIwHu7ix11c5vQwE',
      created_at: '2025-02-18T06:45:00Z',
    }
  ],
  'tbl-vector-embeddings': [
    {
      id: 1,
      document_name: 'supabase_architecture_whitepaper.pdf',
      chunk_text: 'Supabase combines PostgreSQL with auto-generated REST, GraphQL, Realtime websockets, and S3-compatible storage.',
      embedding: '[0.0142, -0.0521, 0.0894, 0.0019, -0.0381, ... 1536 dims]',
      token_count: 48,
      created_at: '2025-02-10T14:20:00Z',
    },
    {
      id: 2,
      document_name: 'chocobase_engine_spec.md',
      chunk_text: 'The database kernel utilizes multi-version concurrency control (MVCC) with checksummed write-ahead logging (WAL).',
      embedding: '[0.0311, -0.0189, 0.0452, 0.0784, -0.0022, ... 1536 dims]',
      token_count: 56,
      created_at: '2025-02-12T09:10:00Z',
    }
  ]
};

export const INITIAL_AUTH_USERS: AuthUser[] = [
  {
    id: 'd3b07384-d113-4a1a-9f5b-568b248a8001',
    email: 'vinaygk219@gmail.com',
    role: 'admin',
    provider: 'github',
    createdAt: '2025-01-15T09:30:00Z',
    lastSignInAt: '2025-02-18T08:20:10Z',
    confirmedAt: '2025-01-15T09:31:00Z',
    bannedUntil: null,
    userMetadata: { full_name: 'Vinay Kumar', username: 'vinaygk' },
    appMetadata: { provider: 'github', providers: ['github'] },
  },
  {
    id: 'e4c18495-e224-4b2b-8a6c-679c359b9002',
    email: 'sarah.connor@cyberdyne.org',
    role: 'authenticated',
    provider: 'google',
    createdAt: '2025-01-16T14:15:00Z',
    lastSignInAt: '2025-02-17T20:11:45Z',
    confirmedAt: '2025-01-16T14:15:20Z',
    bannedUntil: null,
    userMetadata: { full_name: 'Sarah Connor' },
    appMetadata: { provider: 'google', providers: ['google'] },
  },
  {
    id: 'f5d29506-f335-4c3c-9b7d-780d460c0003',
    email: 'alex.rivera@devmail.org',
    role: 'authenticated',
    provider: 'email',
    createdAt: '2025-01-20T17:45:00Z',
    lastSignInAt: '2025-02-14T11:05:00Z',
    confirmedAt: '2025-01-20T17:50:12Z',
    bannedUntil: null,
    userMetadata: { full_name: 'Alex Rivera' },
    appMetadata: { provider: 'email', providers: ['email'] },
  },
  {
    id: 'a1e30617-a446-4d4d-8c8e-891e571d1004',
    email: 'elena.rostova@designcraft.studio',
    role: 'authenticated',
    provider: 'email',
    createdAt: '2025-01-25T10:10:00Z',
    lastSignInAt: '2025-02-01T15:30:00Z',
    confirmedAt: '2025-01-25T10:11:00Z',
    bannedUntil: null,
    userMetadata: { full_name: 'Elena Rostova' },
    appMetadata: { provider: 'email', providers: ['email'] },
  },
  {
    id: 'b2f41728-b557-4e5e-9d9f-902f682e2005',
    email: 'marcus.brody@museum.edu',
    role: 'authenticated',
    provider: 'email',
    createdAt: '2025-02-02T12:00:00Z',
    lastSignInAt: '2025-02-02T12:00:00Z',
    confirmedAt: '2025-02-02T12:01:00Z',
    bannedUntil: null,
    userMetadata: { full_name: 'Marcus Brody' },
    appMetadata: { provider: 'email', providers: ['email'] },
  },
  {
    id: 'c3a52839-c668-4f6f-8e0a-013a793f3006',
    email: 'spammer_bot_99@tempmail.ninja',
    role: 'authenticated',
    provider: 'email',
    createdAt: '2025-02-14T16:20:00Z',
    lastSignInAt: '2025-02-14T16:20:00Z',
    confirmedAt: '2025-02-14T16:20:00Z',
    bannedUntil: '2099-01-01T00:00:00Z',
    userMetadata: { full_name: 'Unknown Bot' },
    appMetadata: { provider: 'email', providers: ['email'] },
  }
];

export const INITIAL_AUTH_PROVIDERS: AuthProviderConfig[] = [
  { id: 'prov-email', name: 'Email / Password & Magic Link', enabled: true, iconName: 'Mail' },
  { id: 'prov-github', name: 'GitHub OAuth', enabled: true, clientId: 'gh_client_83921839', iconName: 'Github' },
  { id: 'prov-google', name: 'Google OAuth', enabled: true, clientId: '823828250325-apps.googleusercontent.com', iconName: 'Chrome' },
  { id: 'prov-apple', name: 'Apple Sign In', enabled: false, iconName: 'Apple' },
  { id: 'prov-discord', name: 'Discord OAuth', enabled: true, clientId: '10928391829381', iconName: 'MessageSquare' },
  { id: 'prov-anonymous', name: 'Anonymous Sign-ins', enabled: true, iconName: 'UserX' },
];

export const INITIAL_STORAGE_BUCKETS: StorageBucket[] = [
  {
    id: 'avatars',
    name: 'avatars',
    isPublic: true,
    createdAt: '2025-01-15T09:35:00Z',
    fileSizeLimitMb: 5,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    objectsCount: 4,
    sizeBytes: 1845200,
  },
  {
    id: 'project-assets',
    name: 'project-assets',
    isPublic: true,
    createdAt: '2025-01-18T11:20:00Z',
    fileSizeLimitMb: 50,
    allowedMimeTypes: ['image/*', 'video/*', 'application/pdf'],
    objectsCount: 8,
    sizeBytes: 14250000,
  },
  {
    id: 'private-documents',
    name: 'private-documents',
    isPublic: false,
    createdAt: '2025-01-20T14:10:00Z',
    fileSizeLimitMb: 25,
    allowedMimeTypes: ['application/pdf', 'application/json', 'text/csv'],
    objectsCount: 3,
    sizeBytes: 3820000,
  }
];

export const INITIAL_STORAGE_OBJECTS: StorageObject[] = [
  {
    id: 'obj-1',
    bucketId: 'avatars',
    name: 'vinaygk-profile-banner.png',
    path: 'users/vinaygk/banner.png',
    sizeBytes: 420800,
    mimeType: 'image/png',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    metadata: { width: 1200, height: 400 },
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'obj-2',
    bucketId: 'avatars',
    name: 'sarah-avatar.jpg',
    path: 'users/sarah/avatar.jpg',
    sizeBytes: 154300,
    mimeType: 'image/jpeg',
    createdAt: '2025-01-16T14:20:00Z',
    updatedAt: '2025-01-16T14:20:00Z',
    metadata: { width: 400, height: 400 },
    previewUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'obj-3',
    bucketId: 'project-assets',
    name: 'architecture-diagram-2025.png',
    path: 'diagrams/architecture-2025.png',
    sizeBytes: 890000,
    mimeType: 'image/png',
    createdAt: '2025-01-22T16:00:00Z',
    updatedAt: '2025-01-22T16:00:00Z',
    metadata: { width: 1920, height: 1080 },
    previewUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'obj-4',
    bucketId: 'private-documents',
    name: 'annual_financial_audit_q4.pdf',
    path: 'confidential/audit_q4.pdf',
    sizeBytes: 2450000,
    mimeType: 'application/pdf',
    createdAt: '2025-02-01T09:30:00Z',
    updatedAt: '2025-02-01T09:30:00Z',
    metadata: { pages: 32 },
  }
];

export const INITIAL_EDGE_FUNCTIONS: EdgeFunction[] = [
  {
    id: 'fn-welcome-email',
    name: 'send-welcome-email',
    slug: 'send-welcome-email',
    status: 'active',
    version: 'v1.4.2',
    runtime: 'deno-2.x',
    regions: ['ap-southeast-1', 'us-east-1'],
    memoryMb: 128,
    timeoutSec: 15,
    verifyJwt: true,
    deployedAt: '2025-02-10T14:30:00Z',
    invocationsCount: 1420,
    errorRatePercent: 0.14,
    avgLatencyMs: 42,
    codeSnippet: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { record } = await req.json();
  console.log(\`Sending welcome email to \${record.email}...\`);

  // Resend or SendGrid integration
  const response = {
    status: "delivered",
    recipient: record.email,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" }
  });
});`,
    secrets: {
      RESEND_API_KEY: 're_8392183_secret_token',
      FROM_EMAIL: 'support@chocobase.io'
    },
    recentLogs: [
      { id: 'log-1', timestamp: '2025-02-18T08:30:12Z', level: 'info', message: 'Function invoked via database webhook for user vinaygk219@gmail.com', executionTimeMs: 38, statusCode: 200, ip: '13.250.4.11' },
      { id: 'log-2', timestamp: '2025-02-18T07:15:00Z', level: 'info', message: 'Email delivered via Resend SMTP API in 24ms', executionTimeMs: 44, statusCode: 200, ip: '13.250.4.11' },
    ]
  },
  {
    id: 'fn-stripe-webhook',
    name: 'stripe-webhook-handler',
    slug: 'stripe-webhook-handler',
    status: 'active',
    version: 'v2.1.0',
    runtime: 'deno-2.x',
    regions: ['ap-southeast-1'],
    memoryMb: 256,
    timeoutSec: 30,
    verifyJwt: false,
    deployedAt: '2025-02-15T09:00:00Z',
    invocationsCount: 840,
    errorRatePercent: 0.0,
    avgLatencyMs: 65,
    codeSnippet: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { httpClient: Stripe.createFetchHttpClient() });

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")!;
  const body = await req.text();
  const event = stripe.webhooks.constructEvent(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log(\`Payment succeeded: \${paymentIntent.id} for \${paymentIntent.amount}\`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});`,
    secrets: {
      STRIPE_SECRET_KEY: 'sk_live_51Mtw...hidden',
      STRIPE_WEBHOOK_SECRET: 'whsec_93810...hidden'
    },
    recentLogs: [
      { id: 'log-3', timestamp: '2025-02-18T06:45:11Z', level: 'info', message: 'Received payment_intent.succeeded for $149.00', executionTimeMs: 68, statusCode: 200, ip: '54.187.205.235' }
    ]
  },
  {
    id: 'fn-ai-embeddings',
    name: 'generate-embeddings',
    slug: 'generate-embeddings',
    status: 'active',
    version: 'v1.0.0',
    runtime: 'deno-2.x',
    regions: ['ap-southeast-1', 'eu-west-1'],
    memoryMb: 512,
    timeoutSec: 60,
    verifyJwt: true,
    deployedAt: '2025-02-12T11:15:00Z',
    invocationsCount: 520,
    errorRatePercent: 0.38,
    avgLatencyMs: 185,
    codeSnippet: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { input } = await req.json();
  if (!input) {
    return new Response(JSON.stringify({ error: "Missing 'input' field" }), { status: 400 });
  }

  // Generate 1536-dimensional vector embedding
  console.log(\`Generating embedding for text: "\${input.slice(0, 30)}..."\`);
  
  return new Response(JSON.stringify({
    embedding: Array.from({ length: 1536 }, () => (Math.random() * 2 - 1).toFixed(4)),
    tokens: Math.ceil(input.length / 4)
  }), { headers: { "Content-Type": "application/json" } });
});`,
    secrets: {
      OPENAI_API_KEY: 'sk-proj-9382103810...hidden'
    },
    recentLogs: [
      { id: 'log-4', timestamp: '2025-02-18T05:10:00Z', level: 'info', message: 'Generated embedding for query: "database replication setup"', executionTimeMs: 142, statusCode: 200, ip: '13.250.4.11' }
    ]
  }
];

export const INITIAL_SQL_TABS: SqlQueryTab[] = [
  {
    id: 'tab-1',
    title: 'Top Posts & Authors Analytics',
    sql: `-- Query top published posts with author info and total comment counts
SELECT 
  p.id,
  p.title,
  p.slug,
  p.view_count,
  prof.username AS author,
  prof.full_name,
  COUNT(c.id) AS total_comments,
  p.created_at
FROM public.posts p
LEFT JOIN public.profiles prof ON p.author_id = prof.id
LEFT JOIN public.comments c ON p.id = c.post_id
WHERE p.published = true
GROUP BY p.id, prof.username, prof.full_name
ORDER BY p.view_count DESC
LIMIT 10;`,
    isSaved: true
  },
  {
    id: 'tab-2',
    title: 'Check RLS Policies on Tables',
    sql: `-- Inspect Row-Level Security policies active across public schema
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;`,
    isSaved: true
  },
  {
    id: 'tab-3',
    title: 'Database Cache Hit Ratio & Index Health',
    sql: `-- Check buffer cache hit ratio (should be > 99%)
SELECT 
  'index hit rate' AS name, 
  ROUND((sum(idx_blks_hit) - sum(idx_blks_read)) * 100.0 / NULLIF(sum(idx_blks_hit), 0), 2) AS ratio
FROM pg_statio_user_indexes
UNION ALL
SELECT 
  'table hit rate' AS name, 
  ROUND((sum(heap_blks_hit) - sum(heap_blks_read)) * 100.0 / NULLIF(sum(heap_blks_hit), 0), 2) AS ratio
FROM pg_statio_user_tables;`,
    isSaved: true
  }
];

export const INITIAL_DATABASE_METRICS: DatabaseMetrics = {
  cpuUsagePercent: 14.8,
  ramUsagePercent: 42.1,
  diskUsedGb: 8.4,
  diskTotalGb: 64.0,
  diskIops: 245,
  activeConnections: 18,
  maxConnections: 100,
  poolerConnections: 42,
  cacheHitRatio: 99.4,
  walArchiveLagSeconds: 0.8,
  tps: 64.2,
};
