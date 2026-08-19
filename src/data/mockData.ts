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
  id: 'chocobase-project-main',
  name: 'chocobase-production',
  organization: 'Personal Workspace',
  region: 'local (Localhost:8080)',
  status: 'ACTIVE_HEALTHY',
  tier: 'Community',
  pgVersion: 'ChocoBase v0.1.0 (PostgreSQL v3 Wire Compatible)',
  databaseHost: '127.0.0.1',
  databasePort: 5433,
  poolerPort: 5433,
  databaseUser: 'postgres',
  databaseName: 'chocobase',
  apiUrl: 'http://localhost:8080',
  anonKey: 'anon_key_dev',
  serviceRoleKey: 'service_role_key_admin',
  jwtSecret: 'chocobase-super-secret-jwt-signing-key',
  corsOrigins: ['*'],
  pitrEnabled: true,
  dailyBackupTime: '00:00 UTC',
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
    rowsCount: 0,
    sizeBytes: 8192,
  },
  {
    id: 'tbl-posts',
    schema: 'public',
    name: 'posts',
    comment: 'Articles and publications table',
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
        name: 'Authors can manage their own posts',
        command: 'ALL',
        roles: ['authenticated'],
        usingExpression: 'auth.uid() = author_id',
        checkExpression: 'auth.uid() = author_id',
        action: 'PERMISSIVE',
      }
    ],
    rowsCount: 0,
    sizeBytes: 8192,
  }
];

export const INITIAL_TABLE_DATA: Record<string, TableRowData[]> = {
  'tbl-profiles': [],
  'tbl-posts': [],
};

export const INITIAL_AUTH_USERS: AuthUser[] = [];

export const INITIAL_AUTH_PROVIDERS: AuthProviderConfig[] = [
  { id: 'prov-email', name: 'Email / Password & Magic Link', enabled: true, iconName: 'Mail' },
  { id: 'prov-github', name: 'GitHub OAuth', enabled: false, iconName: 'Github' },
  { id: 'prov-google', name: 'Google OAuth', enabled: false, iconName: 'Chrome' },
  { id: 'prov-anonymous', name: 'Anonymous Sign-ins', enabled: true, iconName: 'UserX' },
];

export const INITIAL_STORAGE_BUCKETS: StorageBucket[] = [
  {
    id: 'public',
    name: 'public',
    isPublic: true,
    createdAt: new Date().toISOString(),
    fileSizeLimitMb: 50,
    allowedMimeTypes: ['image/*', 'application/pdf'],
    objectsCount: 0,
    sizeBytes: 0,
  }
];

export const INITIAL_STORAGE_OBJECTS: StorageObject[] = [];

export const INITIAL_EDGE_FUNCTIONS: EdgeFunction[] = [
  {
    id: 'fn-hello-world',
    name: 'hello-world',
    slug: 'hello-world',
    status: 'active',
    version: 'v1.0.0',
    runtime: 'deno-2.x',
    regions: ['local'],
    memoryMb: 128,
    timeoutSec: 15,
    verifyJwt: false,
    deployedAt: new Date().toISOString(),
    invocationsCount: 0,
    errorRatePercent: 0,
    avgLatencyMs: 0,
    codeSnippet: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  return new Response(JSON.stringify({ message: "Hello from ChocoBase Edge Function!", received: body }), {
    headers: { "Content-Type": "application/json" }
  });
});`,
    secrets: {},
    recentLogs: []
  }
];

export const INITIAL_SQL_TABS: SqlQueryTab[] = [
  {
    id: 'tab-1',
    title: 'Query Public Tables',
    sql: `-- Query tables across public schema
SELECT * FROM public.profiles LIMIT 10;`,
    isSaved: true
  },
  {
    id: 'tab-2',
    title: 'Check RLS Policies',
    sql: `-- Inspect Row-Level Security policies active across public schema
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;`,
    isSaved: true
  }
];

export const INITIAL_DATABASE_METRICS: DatabaseMetrics = {
  cpuUsagePercent: 0.0,
  ramUsagePercent: 0.0,
  diskUsedGb: 0.1,
  diskTotalGb: 64.0,
  diskIops: 0,
  activeConnections: 1,
  maxConnections: 100,
  poolerConnections: 0,
  cacheHitRatio: 100.0,
  walArchiveLagSeconds: 0.0,
  tps: 0.0,
};
