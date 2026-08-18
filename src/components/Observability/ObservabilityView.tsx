import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Play, 
  Pause, 
  Trash2, 
  Cpu, 
  HardDrive,
  Radio,
  FileCode,
  X
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';

interface TelemetryLog {
  id: string;
  timestamp: string;
  service: 'database' | 'auth' | 'storage' | 'functions' | 'realtime';
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

export const ObservabilityView: React.FC = () => {
  const { metrics, realtimeMessages, edgeFunctions, showNotification } = useSupabase();
  const [selectedService, setSelectedService] = useState<'all' | 'database' | 'auth' | 'storage' | 'functions' | 'realtime'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [selectedLogDetail, setSelectedLogDetail] = useState<TelemetryLog | null>(null);

  // Synthesize logs from real-time events, edge function logs, and simulated postgres WAL telemetry
  const baseLogs: TelemetryLog[] = [
    {
      id: 'log-seed-1',
      timestamp: new Date(Date.now() - 12000).toISOString(),
      service: 'database',
      level: 'info',
      message: 'checkpoint complete: wrote 42 buffers (0.1%); 0 WAL file(s) added, 0 removed, 1 recycled',
      metadata: { duration_ms: 12, buffers: 42, lsn: '0/16B2D40' }
    },
    {
      id: 'log-seed-2',
      timestamp: new Date(Date.now() - 25000).toISOString(),
      service: 'auth',
      level: 'info',
      message: 'GoTrue: token issued for subject d3b07384-d113-4a1a-9f5b-568b248a8001 via grant_type=password',
      metadata: { user_id: 'd3b07384-d113-4a1a-9f5b-568b248a8001', role: 'authenticated' }
    },
    {
      id: 'log-seed-3',
      timestamp: new Date(Date.now() - 45000).toISOString(),
      service: 'storage',
      level: 'info',
      message: 'Storage API: S3 multipart upload completed for bucket "avatars" (142.8 KB)',
      metadata: { bucket: 'avatars', object_key: 'uploads/developer_avatar.png' }
    },
    ...edgeFunctions.flatMap(f => f.recentLogs.map(l => ({
      id: l.id,
      timestamp: l.timestamp,
      service: 'functions' as const,
      level: (l.level === 'debug' ? 'info' : l.level) as 'info' | 'warn' | 'error',
      message: `[${f.slug}] ${l.message}`,
      metadata: { function_id: f.id, executionTimeMs: l.executionTimeMs, status: l.statusCode }
    }))),
    ...realtimeMessages.map(m => ({
      id: `log-rt-${m.id}`,
      timestamp: m.timestamp,
      service: 'realtime' as const,
      level: 'info' as const,
      message: `CDC event [${m.event}] on topic ${m.topic}`,
      metadata: m.payload
    }))
  ];

  const filteredLogs = baseLogs.filter(log => {
    if (selectedService !== 'all' && log.service !== selectedService) return false;
    if (selectedLevel !== 'all' && log.level !== selectedLevel) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getLevelBadge = (level: TelemetryLog['level']) => {
    switch (level) {
      case 'error':
        return <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono">ERROR</span>;
      case 'warn':
        return <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">WARN</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">INFO</span>;
    }
  };

  const getServiceBadge = (service: TelemetryLog['service']) => {
    const colors: Record<string, string> = {
      database: 'text-[#15803d] border-[#bbf7d0] bg-[#f0fdf4]',
      auth: 'text-[#2563eb] border-[#bfdbfe] bg-[#eff6ff]',
      storage: 'text-[#d97706] border-[#fde68a] bg-[#fffbeb]',
      functions: 'text-[#9333ea] border-[#e9d5ff] bg-[#faf5ff]',
      realtime: 'text-[#0284c7] border-[#bae6fd] bg-[#f0f9ff]',
    };
    return (
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase border ${colors[service] || 'text-[#666]'}`}>
        {service}
      </span>
    );
  };

  return (
    <div id="observability-view" className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#ececec] shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-[#15803d]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#1a1a1a]">Observability & Logs Explorer</h1>
            <p className="text-xs text-[#666]">Unified telemetry streams for PostgreSQL engine, GoTrue Auth, Storage, and Edge Workers</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsLiveStreaming(!isLiveStreaming);
              showNotification(isLiveStreaming ? 'Log streaming paused' : 'Log streaming resumed');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors shadow-2xs ${
              isLiveStreaming 
                ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0] hover:bg-[#dcfce7]' 
                : 'bg-[#fafafa] text-[#666] border-[#ececec] hover:bg-white'
            }`}
          >
            {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveStreaming ? 'Live Streaming' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#ececec] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#666] mb-1">
            <span>Database CPU</span>
            <Cpu className="w-3.5 h-3.5 text-[#3ecf8e]" />
          </div>
          <div className="text-lg font-bold text-[#1a1a1a] font-mono">{metrics.cpuUsagePercent}%</div>
          <div className="text-[11px] text-[#999] mt-1">2 vCPU (Dedicated AMD EPYC)</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#ececec] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#666] mb-1">
            <span>Active Connections</span>
            <HardDrive className="w-3.5 h-3.5 text-[#2563eb]" />
          </div>
          <div className="text-lg font-bold text-[#1a1a1a] font-mono">
            {metrics.activeConnections} / {metrics.maxConnections}
          </div>
          <div className="text-[11px] text-[#999] mt-1">PgBouncer pool: {metrics.poolerConnections} conns</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#ececec] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#666] mb-1">
            <span>Cache Hit Ratio</span>
            <CheckCircle className="w-3.5 h-3.5 text-[#3ecf8e]" />
          </div>
          <div className="text-lg font-bold text-[#15803d] font-mono">{metrics.cacheHitRatio}%</div>
          <div className="text-[11px] text-[#999] mt-1">Shared buffer cache hit rate</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#ececec] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#666] mb-1">
            <span>Transactions / Sec</span>
            <Clock className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-[#1a1a1a] font-mono">{metrics.tps} TPS</div>
          <div className="text-[11px] text-[#999] mt-1">Disk IOPS: {metrics.diskIops}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#ececec] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Service filter */}
          <div className="flex items-center bg-[#f4f4f5] p-1 rounded-lg border border-[#ececec] text-xs">
            {(['all', 'database', 'auth', 'storage', 'functions', 'realtime'] as const).map((srv) => (
              <button
                key={srv}
                onClick={() => setSelectedService(srv)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  selectedService === srv ? 'bg-white text-[#1a1a1a] shadow-2xs' : 'text-[#666] hover:text-[#1a1a1a]'
                }`}
              >
                {srv}
              </button>
            ))}
          </div>

          {/* Level filter */}
          <div className="flex items-center bg-[#f4f4f5] p-1 rounded-lg border border-[#ececec] text-xs">
            {(['all', 'info', 'warn', 'error'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  selectedLevel === lvl ? 'bg-white text-[#1a1a1a] shadow-2xs' : 'text-[#666] hover:text-[#1a1a1a]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#999]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search log messages..."
            className="w-full pl-8 pr-2.5 py-1.5 rounded-md bg-[#fafafa] border border-[#ececec] text-xs text-[#1a1a1a] placeholder-[#999] focus:outline-hidden focus:border-[#3ecf8e] font-mono"
          />
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="rounded-xl border border-[#ececec] bg-white overflow-hidden shadow-2xs">
        <div className="p-3 border-b border-[#ececec] bg-[#fafafa] flex items-center justify-between text-xs font-semibold text-[#333]">
          <span>Log Records ({filteredLogs.length})</span>
          <span className="text-[11px] font-mono text-[#999]">Live UTC Stream</span>
        </div>

        <div className="divide-y divide-[#f0f0f0] max-h-[500px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-[#999] text-xs font-mono">
              No log events matching active filters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.id}
                onClick={() => setSelectedLogDetail(log)}
                className="p-3 hover:bg-[#fafafa] transition-colors cursor-pointer flex items-start gap-3 text-xs font-mono group"
              >
                <span className="text-[#999] text-[11px] flex-shrink-0">
                  {new Date(log.timestamp).toISOString().substring(11, 23)}
                </span>
                <span className="flex-shrink-0">{getLevelBadge(log.level)}</span>
                <span className="flex-shrink-0">{getServiceBadge(log.service)}</span>
                <span className="text-[#1a1a1a] flex-1 truncate group-hover:text-[#3ecf8e] transition-colors">
                  {log.message}
                </span>
                {log.metadata?.executionTimeMs && (
                  <span className="text-[#999] text-[11px] flex-shrink-0">
                    {log.metadata.executionTimeMs}ms
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#ececec] rounded-xl shadow-2xl overflow-hidden text-[#1a1a1a]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ececec] bg-[#fafafa]">
              <div className="flex items-center gap-2">
                {getLevelBadge(selectedLogDetail.level)}
                <h3 className="text-sm font-semibold text-[#1a1a1a] font-mono">Log Details</h3>
              </div>
              <button onClick={() => setSelectedLogDetail(null)} className="text-[#999] hover:text-[#333]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs">
              <div>
                <div className="text-[#999] text-[11px] mb-1">Timestamp</div>
                <div className="text-[#1a1a1a]">{selectedLogDetail.timestamp}</div>
              </div>

              <div>
                <div className="text-[#999] text-[11px] mb-1">Service</div>
                <div className="flex items-center gap-2">
                  {getServiceBadge(selectedLogDetail.service)}
                </div>
              </div>

              <div>
                <div className="text-[#999] text-[11px] mb-1">Message</div>
                <div className="p-2.5 rounded-md bg-[#fafafa] text-[#15803d] border border-[#ececec] whitespace-pre-wrap">
                  {selectedLogDetail.message}
                </div>
              </div>

              {selectedLogDetail.metadata && (
                <div>
                  <div className="text-[#999] text-[11px] mb-1">Structured Metadata (JSON)</div>
                  <pre className="p-3 rounded-md bg-[#fafafa] text-[#2563eb] border border-[#ececec] overflow-auto max-h-48 text-[11px]">
                    {JSON.stringify(selectedLogDetail.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
