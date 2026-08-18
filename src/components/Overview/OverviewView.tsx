import React from 'react';
import { 
  Table, 
  Terminal, 
  Users, 
  FolderArchive, 
  Zap, 
  Radio, 
  Activity, 
  ArrowUpRight, 
  ShieldCheck, 
  HardDrive, 
  Cpu, 
  Clock, 
  Server,
  Layers,
  Key,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { ActiveView } from '../../types';

export const OverviewView: React.FC = () => {
  const { 
    projectSettings, 
    tables, 
    authUsers, 
    storageBuckets, 
    edgeFunctions, 
    metrics, 
    setActiveView, 
    setSelectedTableId,
    realtimeMessages,
    addSqlTab
  } = useSupabase();

  const totalRows = tables.reduce((acc, t) => acc + (t.rowsCount || 0), 0);
  const totalStorageMb = +(storageBuckets.reduce((acc, b) => acc + b.sizeBytes, 0) / (1024 * 1024)).toFixed(2);
  const activeFunctions = edgeFunctions.filter(f => f.status === 'active').length;

  return (
    <div id="overview-view-container" className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2B1D20]">Database Overview</h1>
          <p className="text-[#685559] text-sm mt-1">Resource usage and connection health for your personal instance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-[#9B888C] block uppercase font-bold tracking-wider">Engine Status</span>
            <span className="text-sm font-medium text-[#2B1D20] flex items-center gap-1.5 sm:justify-end">
              <span className="w-2 h-2 rounded-full bg-[#8B1E3F]"></span>
              {projectSettings.pgVersion}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-[#E8DDD2] hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <button
              id="btn-quick-view-tables"
              onClick={() => setActiveView('table_editor')}
              className="px-3 py-1.5 rounded-lg border border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#F4EFEA] text-[13px] font-medium text-[#2B1D20] flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Table className="w-3.5 h-3.5 text-[#8B1E3F]" />
              <span>Table Editor</span>
            </button>
            <button
              id="btn-quick-run-sql"
              onClick={() => {
                addSqlTab('Analytics Overview', 'SELECT tablename, count(*) FROM pg_tables WHERE schemaname = \'public\' GROUP BY tablename;');
                setActiveView('sql_editor');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#72142E] text-[13px] font-medium text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SQL Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* DB Size / Tables */}
        <div 
          onClick={() => setActiveView('table_editor')}
          className="bg-[#FFFDF9] border border-[#E8DDD2] p-6 rounded-xl hover:border-[#D6C7BC] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold text-[#9B888C] uppercase tracking-widest">Database Tables</span>
            <span className="text-[#8B1E3F] text-[10px] bg-[#FDF0F3] border border-[#F5CBD3] px-1.5 py-0.5 rounded font-semibold">
              RLS Active
            </span>
          </div>
          <div className="text-3xl font-light font-mono text-[#2B1D20]">{tables.length} <span className="text-lg text-[#9B888C]">tables</span></div>
          <div className="mt-4 h-1.5 bg-[#F4EFEA] rounded-full overflow-hidden">
            <div className="h-full bg-[#8B1E3F] w-[65%] rounded-full"></div>
          </div>
          <div className="mt-2.5 text-[12px] text-[#685559] flex justify-between">
            <span>{totalRows} records stored</span>
            <span className="text-[#8B1E3F] font-semibold">Schema: public</span>
          </div>
        </div>

        {/* Auth Users */}
        <div 
          onClick={() => setActiveView('auth')}
          className="bg-[#FFFDF9] border border-[#E8DDD2] p-6 rounded-xl hover:border-[#D6C7BC] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold text-[#9B888C] uppercase tracking-widest">Auth Users</span>
            <span className="text-[#8B1E3F] text-[10px] bg-[#FDF0F3] border border-[#F5CBD3] px-1.5 py-0.5 rounded font-semibold">
              Total
            </span>
          </div>
          <div className="text-3xl font-light font-mono text-[#2B1D20]">{authUsers.length}</div>
          <div className="mt-4 h-1.5 bg-[#F4EFEA] rounded-full overflow-hidden">
            <div className="h-full bg-[#8B1E3F] w-[45%] rounded-full"></div>
          </div>
          <div className="mt-2.5 text-[12px] text-[#685559] flex justify-between">
            <span className="text-[#286E4F] font-semibold">+12% from last week</span>
            <span>JWT / MFA ready</span>
          </div>
        </div>

        {/* Storage */}
        <div 
          onClick={() => setActiveView('storage')}
          className="bg-[#FFFDF9] border border-[#E8DDD2] p-6 rounded-xl hover:border-[#D6C7BC] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold text-[#9B888C] uppercase tracking-widest">Storage Size</span>
            <span className="text-[#8B1E3F] text-[10px] bg-[#FDF0F3] border border-[#F5CBD3] px-1.5 py-0.5 rounded font-semibold">
              S3 Ready
            </span>
          </div>
          <div className="text-3xl font-light font-mono text-[#2B1D20]">{totalStorageMb} <span className="text-lg text-[#9B888C]">MB</span></div>
          <div className="mt-4 h-1.5 bg-[#F4EFEA] rounded-full overflow-hidden">
            <div className="h-full bg-[#8B1E3F] w-[28%] rounded-full"></div>
          </div>
          <div className="mt-2.5 text-[12px] text-[#685559] flex justify-between">
            <span>{storageBuckets.length} buckets</span>
            <span>Media & Assets</span>
          </div>
        </div>

        {/* Requests & Telemetry */}
        <div 
          onClick={() => setActiveView('observability')}
          className="bg-[#FFFDF9] border border-[#E8DDD2] p-6 rounded-xl hover:border-[#D6C7BC] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold text-[#9B888C] uppercase tracking-widest">Throughput (TPS)</span>
            <span className="text-[#8B1E3F] text-[10px] bg-[#FDF0F3] border border-[#F5CBD3] px-1.5 py-0.5 rounded font-semibold">
              Live
            </span>
          </div>
          <div className="text-3xl font-light font-mono text-[#2B1D20]">{metrics.tps} <span className="text-lg text-[#9B888C]">TPS</span></div>
          <div className="mt-4 flex gap-1 h-3 items-end">
            <div className="flex-1 bg-[#8B1E3F] opacity-30 h-1.5 rounded-2xs"></div>
            <div className="flex-1 bg-[#8B1E3F] opacity-50 h-2.5 rounded-2xs"></div>
            <div className="flex-1 bg-[#8B1E3F] opacity-70 h-3 rounded-2xs"></div>
            <div className="flex-1 bg-[#8B1E3F] h-2 rounded-2xs"></div>
            <div className="flex-1 bg-[#8B1E3F] opacity-60 h-2.5 rounded-2xs"></div>
            <div className="flex-1 bg-[#8B1E3F] opacity-90 h-3 rounded-2xs"></div>
            <div className="flex-1 bg-[#8B1E3F] opacity-40 h-1.5 rounded-2xs"></div>
          </div>
          <div className="mt-2.5 text-[12px] text-[#685559] flex justify-between">
            <span>{metrics.cacheHitRatio}% cache hit ratio</span>
            <span>CPU {metrics.cpuUsagePercent}%</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Database Tables summary + Live CDC Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Public Schema Tables */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#E8DDD2] bg-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#2B1D20]">Public Schema Tables</span>
                <span className="text-[11px] text-[#9B888C]">({tables.length} tables)</span>
              </div>
              <button
                onClick={() => setActiveView('table_editor')}
                className="text-xs text-[#8B1E3F] hover:text-[#72142E] flex items-center gap-1 font-semibold"
              >
                Open Table Editor <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#E8DDD2] bg-[#FFFDF9]">
              {tables.map((table) => (
                <div 
                  key={table.id}
                  onClick={() => {
                    setSelectedTableId(table.id);
                    setActiveView('table_editor');
                  }}
                  className="py-3.5 px-6 hover:bg-[#FAF7F2] transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center text-[#685559] group-hover:text-[#8B1E3F] group-hover:border-[#F5CBD3] transition-colors">
                      <Table className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors font-mono">{table.name}</span>
                        {table.rlsEnabled ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFF7F3] text-[#286E4F] border border-[#C4E6D5] font-mono font-medium">
                            RLS ON ({table.policies.length})
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF5E6] text-[#9E5D00] border border-[#FFE0B2] font-mono font-medium">
                            RLS OFF
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#685559] mt-0.5">{table.comment || `${table.columns.length} columns defined`}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-[12px] font-mono text-[#685559]">
                    <span>{table.rowsCount || 0} rows</span>
                    <span className="hidden sm:inline text-[#9B888C]">{(table.sizeBytes ? table.sizeBytes / 1024 : 16).toFixed(0)} KB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Database Connection Info */}
          <div className="bg-[#FFFDF9] border border-[#E8DDD2] p-6 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#8B1E3F]" />
                <h3 className="text-sm font-semibold text-[#2B1D20]">API & Pooler Connection Endpoints</h3>
              </div>
              <button
                onClick={() => setActiveView('settings')}
                className="text-xs text-[#8B1E3F] hover:text-[#72142E] font-semibold"
              >
                View all credentials →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2]">
                <div className="text-[11px] text-[#9B888C] uppercase font-bold tracking-wider">REST API URL</div>
                <div className="text-xs font-mono text-[#2B1D20] mt-1.5 truncate select-all">{projectSettings.apiUrl}</div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2]">
                <div className="text-[11px] text-[#9B888C] uppercase font-bold tracking-wider">Transaction Pooler (Port 6543)</div>
                <div className="text-xs font-mono text-[#2B1D20] mt-1.5 truncate select-all">{projectSettings.databaseHost}:6543</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Telemetry & Realtime Change Feed */}
        <div className="space-y-6">
          {/* Live Telemetry Card */}
          <div className="bg-[#FFFDF9] border border-[#E8DDD2] p-6 rounded-xl space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#8B1E3F]" />
                <h3 className="text-sm font-semibold text-[#2B1D20]">Resource Health</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FDF0F3] text-[#8B1E3F] border border-[#F5CBD3] font-semibold">
                p95 12ms
              </span>
            </div>

            <div className="space-y-4">
              {/* CPU */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#685559]">Database CPU</span>
                  <span className="font-mono text-[#2B1D20] font-semibold">{metrics.cpuUsagePercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4EFEA] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#8B1E3F] rounded-full transition-all duration-500"
                    style={{ width: `${metrics.cpuUsagePercent}%` }}
                  />
                </div>
              </div>

              {/* Memory */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#685559]">RAM Allocation</span>
                  <span className="font-mono text-[#2B1D20] font-semibold">{metrics.ramUsagePercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4EFEA] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#8B1E3F] rounded-full transition-all duration-500"
                    style={{ width: `${metrics.ramUsagePercent}%` }}
                  />
                </div>
              </div>

              {/* Active Connections */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#685559]">Connections (PgBouncer)</span>
                  <span className="font-mono text-[#2B1D20] font-semibold">{metrics.activeConnections} / {metrics.maxConnections}</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4EFEA] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#8B1E3F] rounded-full transition-all duration-500"
                    style={{ width: `${(metrics.activeConnections / metrics.maxConnections) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Realtime WAL Stream Preview */}
          <div className="bg-[#FFFDF9] border border-[#E8DDD2] p-6 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#8B1E3F] animate-pulse" />
                <h3 className="text-sm font-semibold text-[#2B1D20]">Realtime CDC Stream</h3>
              </div>
              <button
                onClick={() => setActiveView('realtime')}
                className="text-xs text-[#8B1E3F] hover:text-[#72142E] font-semibold"
              >
                Inspect →
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {realtimeMessages.slice(0, 4).map((msg) => (
                <div key={msg.id} className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-[#8B1E3F] font-bold">[{msg.event}]</span>
                    <span className="text-[#9B888C]">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="font-mono text-[#2B1D20] text-[11px] truncate">{msg.topic}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
