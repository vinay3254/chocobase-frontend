import React, { useState } from 'react';
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
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  GitBranch,
  Github,
  Play,
  Maximize2,
  Folder,
  X,
  Code2,
  Sparkles,
  ChevronDown,
  Globe,
  Database
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
    addSqlTab,
    setIsConnectModalOpen,
    setNotification
  } = useSupabase();

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSqlDrawerOpen, setIsSqlDrawerOpen] = useState(false);
  const [sqlDraft, setSqlDraft] = useState('SELECT * FROM public.profiles LIMIT 10;');
  const [activeConnectTab, setActiveConnectTab] = useState<'framework' | 'server' | 'direct' | 'orm' | 'mcp' | 'api_keys'>('framework');

  const totalRows = tables.reduce((acc, t) => acc + (t.rowsCount || 0), 0);
  const totalStorageMb = +(storageBuckets.reduce((acc, b) => acc + b.sizeBytes, 0) / (1024 * 1024)).toFixed(2);
  const activeFunctions = edgeFunctions.filter(f => f.status === 'active').length;

  const projectUrl = `https://djyephboyfoglucmcopn.chocobase.co`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopiedUrl(true);
    setNotification({
      type: 'success',
      message: 'Project REST endpoint URL copied to clipboard'
    });
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRunDrawerSql = () => {
    addSqlTab('Quick Query', sqlDraft);
    setActiveView('sql_editor');
    setNotification({
      type: 'info',
      message: 'Executing SQL query in Editor...'
    });
  };

  return (
    <div id="overview-view-container" className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150 relative">
      
      {/* Top Project Identification & Branch Banner (Screenshots 7 & 8) */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 bg-[#FFFDF9] border border-[#E8DDD2] p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono tracking-tight text-[#2B1D20]">{projectSettings.name}</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F4EFEA] border border-[#E8DDD2] text-xs font-mono text-[#685559]">
              <GitBranch className="w-3.5 h-3.5 text-[#8B1E3F]" />
              <span className="font-semibold">main</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-[#EFF7F3] text-[#286E4F] font-bold">PRODUCTION</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-mono text-[#685559] truncate max-w-md">{projectUrl}</span>
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#2B1D20] transition-colors"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-[#286E4F]" /> : <Copy className="w-3 h-3 text-[#8B1E3F]" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-overview-sql-drawer"
            onClick={() => setIsSqlDrawerOpen(prev => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isSqlDrawerOpen 
                ? 'bg-[#8B1E3F] text-white border-[#8B1E3F]' 
                : 'bg-[#FAF7F2] hover:bg-[#F4EFEA] border-[#E8DDD2] text-[#2B1D20]'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{isSqlDrawerOpen ? 'Close SQL Panel' : 'SQL Split Panel'}</span>
          </button>

          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#286E4F] hover:bg-[#20583F] text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Zap className="w-4 h-4" />
            <span>Connect</span>
          </button>
        </div>
      </div>

      {/* 6-Grid Infrastructure Telemetry (Screenshot 7 & 8) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Status */}
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#9B888C] uppercase tracking-wider block">STATUS</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#286E4F] animate-pulse" />
            <span className="text-xs font-semibold text-[#2B1D20]">Healthy</span>
          </div>
        </div>

        {/* Compute */}
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#9B888C] uppercase tracking-wider block">COMPUTE</span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-[#F4EFEA] text-[10px] font-mono font-bold text-[#685559]">NANO</span>
          </div>
        </div>

        {/* GitHub */}
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#9B888C] uppercase tracking-wider block">GITHUB</span>
          <span className="text-xs text-[#9B888C] truncate block">No repo connected</span>
        </div>

        {/* Recent Branch */}
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#9B888C] uppercase tracking-wider block">RECENT BRANCH</span>
          <span className="text-xs text-[#9B888C] truncate block">No branches</span>
        </div>

        {/* Last Migration */}
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#9B888C] uppercase tracking-wider block">LAST MIGRATION</span>
          <span className="text-xs text-[#9B888C] truncate block">No migrations</span>
        </div>

        {/* Last Backup */}
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#9B888C] uppercase tracking-wider block">LAST BACKUP</span>
          <span className="text-xs text-[#9B888C] truncate block">No backups</span>
        </div>
      </div>

      {/* Main Split Area: Interactive Topology Canvas on Left + Split SQL Drawer on Right (Screenshots 7 & 8) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left: Interactive Canvas Grid with Database Node */}
        <div className={`flex-1 w-full bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl overflow-hidden shadow-xs relative transition-all ${isSqlDrawerOpen ? 'lg:w-7/12' : 'w-full'}`}>
          {/* Subtle Canvas Dot Grid Background */}
          <div className="relative h-80 sm:h-96 w-full bg-[#FAF7F2] overflow-hidden flex items-center justify-center p-6 bg-[radial-gradient(#E8DDD2_1px,transparent_1px)] [background-size:16px_16px]">
            
            {/* Primary Database Interactive Node (Screenshot 7 & 8) */}
            <div className="p-5 rounded-2xl bg-[#FFFDF9]/95 backdrop-blur-md border border-[#E8DDD2] shadow-lg hover:shadow-xl hover:border-[#8B1E3F]/40 transition-all max-w-sm w-full space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF7F3] border border-[#C4E6D5] text-[#286E4F] flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#2B1D20]">Primary Database</h3>
                    <p className="text-[10px] text-[#685559]">Southeast Asia (Singapore)</p>
                    <p className="text-[9px] font-mono text-[#9B888C]">ap-southeast-1 • t4g.nano</p>
                  </div>
                </div>

                {/* Country Flag Badge (Singapore Flag Representation) */}
                <div className="px-2 py-0.5 rounded bg-white border border-[#E8DDD2] text-[10px] font-bold text-[#685559] flex items-center gap-1 shadow-2xs">
                  <span className="w-3.5 h-2.5 bg-[#EF3340] rounded-xs inline-block relative overflow-hidden">
                    <span className="absolute bottom-0 inset-x-0 h-1/2 bg-white" />
                  </span>
                  <span>SG</span>
                </div>
              </div>

              {/* Node Metric Pill Indicators */}
              <div className="pt-2 border-t border-[#F4EFEA] grid grid-cols-4 gap-1.5 text-center">
                <div className="p-1 rounded-md bg-[#FAF7F2]">
                  <span className="text-[9px] text-[#9B888C] block uppercase">CPU</span>
                  <span className="text-[11px] font-mono font-bold text-[#2B1D20]">2%</span>
                </div>
                <div className="p-1 rounded-md bg-[#FAF7F2]">
                  <span className="text-[9px] text-[#9B888C] block uppercase">Disk</span>
                  <span className="text-[11px] font-mono font-bold text-[#2B1D20]">15%</span>
                </div>
                <div className="p-1 rounded-md bg-[#FAF7F2]">
                  <span className="text-[9px] text-[#9B888C] block uppercase">RAM</span>
                  <span className="text-[11px] font-mono font-bold text-[#2B1D20]">48%</span>
                </div>
                <div className="p-1 rounded-md bg-[#FAF7F2]">
                  <span className="text-[9px] text-[#9B888C] block uppercase">Conns</span>
                  <span className="text-[11px] font-mono font-bold text-[#286E4F]">6/60</span>
                </div>
              </div>
            </div>

            {/* Canvas Legend overlay */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/80 backdrop-blur-xs border border-[#E8DDD2] text-[10px] text-[#685559] font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#286E4F]" />
              <span>Multi-AZ Replication Sync</span>
            </div>
          </div>
        </div>

        {/* Right: Slide-over / Split SQL Editor Panel (Screenshot 8) */}
        {isSqlDrawerOpen && (
          <div className="w-full lg:w-5/12 bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl overflow-hidden shadow-xl flex flex-col animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Header of Drawer */}
            <div className="p-3.5 bg-[#FAF7F2] border-b border-[#E8DDD2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#8B1E3F]" />
                <span className="font-bold text-xs text-[#2B1D20]">SQL Editor</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleRunDrawerSql}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8B1E3F] hover:bg-[#72142E] text-white text-[11px] font-semibold transition-colors shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run</span>
                </button>
                <button
                  onClick={() => setIsSqlDrawerOpen(false)}
                  className="p-1 rounded-lg text-[#9B888C] hover:text-[#2B1D20] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code Line Area */}
            <div className="p-4 bg-[#FFFDF9] font-mono text-xs text-[#2B1D20] min-h-[160px] flex gap-3">
              <div className="text-[#C2B3B5] select-none text-right pr-2 border-r border-[#F4EFEA] space-y-1">
                <div>1</div>
                <div>2</div>
                <div>3</div>
              </div>
              <textarea
                value={sqlDraft}
                onChange={(e) => setSqlDraft(e.target.value)}
                className="w-full bg-transparent resize-none focus:outline-hidden text-xs font-mono text-[#2B1D20] leading-relaxed"
                rows={5}
              />
            </div>

            {/* Bottom Keyboard Hint Bar */}
            <div className="px-4 py-2 bg-[#FAF7F2] border-t border-[#E8DDD2] flex items-center justify-between text-[10px] text-[#9B888C] font-mono">
              <span>Hit <kbd className="text-[#2B1D20] bg-white px-1 py-0.5 rounded border border-[#E8DDD2]">Ctrl</kbd> <kbd className="text-[#2B1D20] bg-white px-1 py-0.5 rounded border border-[#E8DDD2]">⇧</kbd> <kbd className="text-[#2B1D20] bg-white px-1 py-0.5 rounded border border-[#E8DDD2]">K</kbd> to edit</span>
              <button
                onClick={() => {
                  addSqlTab('Drawer Query', sqlDraft);
                  setActiveView('sql_editor');
                }}
                className="text-[#8B1E3F] hover:underline font-bold"
              >
                Expand in Full Editor →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: "Get connected" Drawer Tabs (Screenshots 7 & 8) */}
      <div className="bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#2B1D20]">Get connected</h3>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#E8DDD2] pb-3">
          {[
            { id: 'framework', label: 'Framework' },
            { id: 'server', label: 'Server' },
            { id: 'direct', label: 'Direct' },
            { id: 'orm', label: 'ORM' },
            { id: 'mcp', label: 'MCP' },
            { id: 'api_keys', label: 'API Keys' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveConnectTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeConnectTab === tab.id
                  ? 'bg-[#8B1E3F] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#685559] hover:bg-[#F4EFEA] hover:text-[#2B1D20]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono">
          {activeConnectTab === 'framework' && (
            <div className="space-y-2">
              <span className="text-[#9B888C] block font-sans font-semibold">Install Chocobase Client:</span>
              <div className="p-3 bg-white rounded-lg border border-[#E8DDD2] text-[#2B1D20] select-all">
                npm install @chocobase/chocobase-js
              </div>
            </div>
          )}

          {activeConnectTab === 'server' && (
            <div className="space-y-2">
              <span className="text-[#9B888C] block font-sans font-semibold">Server-Side Connection String:</span>
              <div className="p-3 bg-white rounded-lg border border-[#E8DDD2] text-[#2B1D20] select-all">
                postgresql://postgres:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.chocobase.co:6543/postgres
              </div>
            </div>
          )}

          {activeConnectTab === 'direct' && (
            <div className="space-y-2">
              <span className="text-[#9B888C] block font-sans font-semibold">Direct Postgres TCP Port:</span>
              <div className="p-3 bg-white rounded-lg border border-[#E8DDD2] text-[#2B1D20] select-all">
                psql "sslmode=require host=db.djyephboyfoglucmcopn.chocobase.co port=5432 dbname=postgres user=postgres"
              </div>
            </div>
          )}

          {activeConnectTab === 'orm' && (
            <div className="space-y-2">
              <span className="text-[#9B888C] block font-sans font-semibold">Prisma / Drizzle Database URL:</span>
              <div className="p-3 bg-white rounded-lg border border-[#E8DDD2] text-[#2B1D20] select-all">
                DATABASE_URL="postgresql://postgres:[PASSWORD]@db.djyephboyfoglucmcopn.chocobase.co:5432/postgres?pgbouncer=true"
              </div>
            </div>
          )}

          {activeConnectTab === 'mcp' && (
            <div className="space-y-2">
              <span className="text-[#9B888C] block font-sans font-semibold">Model Context Protocol (Claude / Cursor / Gemini MCP Server):</span>
              <div className="p-3 bg-white rounded-lg border border-[#E8DDD2] text-[#2B1D20] select-all">
                npx -y @chocobase/mcp-server --project-ref djyephboyfoglucmcopn --token $CHOCOBASE_ACCESS_TOKEN
              </div>
            </div>
          )}

          {activeConnectTab === 'api_keys' && (
            <div className="space-y-2">
              <span className="text-[#9B888C] block font-sans font-semibold">Public Anon Key:</span>
              <div className="p-3 bg-white rounded-lg border border-[#E8DDD2] text-[#2B1D20] truncate select-all">
                {projectSettings.anonKey}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
