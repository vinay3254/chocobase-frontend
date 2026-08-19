export type ActiveView = 
  | 'landing'
  | 'organizations'
  | 'overview'
  | 'table_editor'
  | 'sql_editor'
  | 'database_schema'
  | 'auth'
  | 'storage'
  | 'edge_functions'
  | 'realtime'
  | 'api_docs'
  | 'observability'
  | 'settings';

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  provider: string;
  avatarUrl?: string;
  createdAt: string;
}

export type DatabaseSchemaName = 'public' | 'auth' | 'storage' | 'vault';

export type ColumnType = 
  | 'uuid'
  | 'text'
  | 'varchar'
  | 'integer'
  | 'bigint'
  | 'numeric'
  | 'boolean'
  | 'timestamp'
  | 'timestamptz'
  | 'jsonb'
  | 'json'
  | 'bytea'
  | 'vector';

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  isPrimary?: boolean;
  isNullable?: boolean;
  defaultValue?: string | null;
  isUnique?: boolean;
  foreignKey?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  };
  comment?: string;
}

export interface RlsPolicy {
  id: string;
  name: string;
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  roles: string[];
  usingExpression: string;
  checkExpression?: string;
  action: 'PERMISSIVE' | 'RESTRICTIVE';
}

export interface TableIndex {
  name: string;
  columns: string[];
  isUnique: boolean;
  type: 'btree' | 'gin' | 'gist' | 'hnsw';
}

export interface TableDefinition {
  id: string;
  schema: DatabaseSchemaName;
  name: string;
  comment?: string;
  rlsEnabled: boolean;
  columns: ColumnDefinition[];
  indexes: TableIndex[];
  policies: RlsPolicy[];
  rowsCount?: number;
  sizeBytes?: number;
}

export type TableRowData = Record<string, any>;

export interface SqlQueryTab {
  id: string;
  title: string;
  sql: string;
  lastExecutedAt?: string;
  executionTimeMs?: number;
  result?: SqlQueryResult;
  isSaved?: boolean;
}

export interface SqlQueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
  affectedRows?: number;
  explainPlan?: ExplainPlanNode;
}

export interface ExplainPlanNode {
  nodeType: string;
  relationName?: string;
  alias?: string;
  startupCost: number;
  totalCost: number;
  planRows: number;
  planWidth: number;
  actualStartupTime?: number;
  actualTotalTime?: number;
  actualRows?: number;
  actualLoops?: number;
  filter?: string;
  indexName?: string;
  plans?: ExplainPlanNode[];
}

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  role: 'authenticated' | 'anon' | 'service_role' | 'admin';
  provider: 'email' | 'github' | 'google' | 'apple' | 'discord';
  createdAt: string;
  lastSignInAt?: string;
  confirmedAt?: string;
  bannedUntil?: string | null;
  userMetadata: Record<string, any>;
  appMetadata: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
}

export interface AuthProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
  iconName: string;
}

export interface StorageBucket {
  id: string;
  name: string;
  isPublic: boolean;
  createdAt: string;
  fileSizeLimitMb: number;
  allowedMimeTypes?: string[];
  objectsCount: number;
  sizeBytes: number;
}

export interface StorageObject {
  id: string;
  bucketId: string;
  name: string;
  path: string;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
  previewUrl?: string;
}

export interface EdgeFunction {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'deploying' | 'failed' | 'paused';
  version: string;
  runtime: 'deno-2.x' | 'deno-1.40';
  regions: string[];
  memoryMb: number;
  timeoutSec: number;
  verifyJwt: boolean;
  deployedAt: string;
  invocationsCount: number;
  errorRatePercent: number;
  avgLatencyMs: number;
  codeSnippet: string;
  secrets: Record<string, string>;
  recentLogs: FunctionLogEntry[];
}

export interface FunctionLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  executionTimeMs?: number;
  statusCode?: number;
  ip?: string;
}

export interface RealtimeMessage {
  id: string;
  timestamp: string;
  topic: string;
  event: string;
  payload: any;
  sender?: string;
}

export interface RealtimeChannel {
  name: string;
  subscribersCount: number;
  mode: 'broadcast' | 'presence' | 'postgres_changes';
  filter?: string;
  createdAt: string;
}

export interface ProjectSettings {
  id: string;
  name: string;
  organization: string;
  region: string;
  status: 'ACTIVE_HEALTHY' | 'PAUSED' | 'RESTARTING';
  tier: 'Free' | 'Pro' | 'Enterprise';
  pgVersion: string;
  databaseHost: string;
  databasePort: number;
  poolerPort: number;
  databaseUser: string;
  databaseName: string;
  apiUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  jwtSecret: string;
  corsOrigins: string[];
  pitrEnabled: boolean;
  dailyBackupTime: string;
}

export interface DatabaseMetrics {
  cpuUsagePercent: number;
  ramUsagePercent: number;
  diskUsedGb: number;
  diskTotalGb: number;
  diskIops: number;
  activeConnections: number;
  maxConnections: number;
  poolerConnections: number;
  cacheHitRatio: number;
  walArchiveLagSeconds: number;
  tps: number;
}
