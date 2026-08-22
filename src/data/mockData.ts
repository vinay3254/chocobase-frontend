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
  tier: 'Free',
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

export const INITIAL_TABLES: TableDefinition[] = [];

export const INITIAL_TABLE_DATA: Record<string, TableRowData[]> = {};

export const INITIAL_AUTH_USERS: AuthUser[] = [];

export const INITIAL_AUTH_PROVIDERS: AuthProviderConfig[] = [
  { id: 'prov-email', name: 'Email / Password & Magic Link', enabled: true, iconName: 'Mail' },
  { id: 'prov-github', name: 'GitHub OAuth', enabled: false, iconName: 'Github' },
  { id: 'prov-google', name: 'Google OAuth', enabled: false, iconName: 'Chrome' },
  { id: 'prov-anonymous', name: 'Anonymous Sign-ins', enabled: true, iconName: 'UserX' },
];

export const INITIAL_STORAGE_BUCKETS: StorageBucket[] = [];

export const INITIAL_STORAGE_OBJECTS: StorageObject[] = [];

export const INITIAL_EDGE_FUNCTIONS: EdgeFunction[] = [];

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
