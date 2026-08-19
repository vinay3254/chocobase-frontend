import React from 'react';
import { 
  Table, 
  Terminal, 
  Database, 
  Users, 
  FolderArchive, 
  Zap, 
  Radio, 
  FileCode, 
  Activity, 
  Settings, 
  LayoutDashboard,
  Layers,
  ChevronRight,
  ShieldCheck,
  Server,
  CloudLightning,
  Compass,
  Building2
} from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { ActiveView } from '../types';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, projectSettings, connectionMode, setIsConnectModalOpen, tables } = useSupabase();

  const navItems: NavItem[] = [
    { id: 'landing', label: 'Home & Intro', icon: Compass },
    { id: 'organizations', label: 'All Projects', icon: Building2 },
    { id: 'overview', label: 'Project Overview', icon: LayoutDashboard },
    { id: 'table_editor', label: 'Table Editor', icon: Table, badge: `${tables.length}` },
    { id: 'sql_editor', label: 'SQL Editor', icon: Terminal },
    { id: 'database_schema', label: 'Database & Schemas', icon: Database },
    { id: 'auth', label: 'Authentication', icon: Users },
    { id: 'storage', label: 'Storage Buckets', icon: FolderArchive },
    { id: 'edge_functions', label: 'Edge Functions', icon: Zap },
    { id: 'realtime', label: 'Realtime Inspector', icon: Radio },
    { id: 'api_docs', label: 'API & GraphQL Docs', icon: FileCode },
    { id: 'observability', label: 'Logs & Observability', icon: Activity },
    { id: 'settings', label: 'Project Settings', icon: Settings },
  ];

  return (
    <aside 
      id="supabase-sidebar"
      className="w-64 bg-[#FFFDF9] border-r border-[#E8DDD2] flex flex-col h-screen select-none flex-shrink-0 text-[#2B1D20]"
    >
      {/* Brand & Project Selector */}
      <div 
        onClick={() => setActiveView('organizations')}
        className="p-4 border-b border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#FAF7F2] cursor-pointer transition-colors"
        title="Switch organization or projects"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#8B1E3F] rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
            C
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#2B1D20] truncate">{projectSettings.name}</span>
              <span className="px-2 py-0.5 bg-[#EFF7F3] text-[#286E4F] text-[10px] font-semibold rounded-full border border-[#C4E6D5] uppercase tracking-wider">
                Active
              </span>
            </div>
            <div className="text-[11px] text-[#9B888C] truncate flex items-center gap-1.5 mt-0.5">
              <span>{projectSettings.region.split(' ')[0]} • {projectSettings.tier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin bg-[#FFFDF9]">
        <section>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#9B888C]">
            Navigation
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    isActive 
                      ? 'bg-[#FDF0F3] text-[#8B1E3F] font-semibold border-l-2 border-[#8B1E3F]' 
                      : 'text-[#685559] hover:bg-[#F4EFEA] hover:text-[#2B1D20]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#8B1E3F]' : 'text-[#9B888C]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#FDF0F3] text-[#8B1E3F] border border-[#F5CBD3]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </section>

        <section>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#9B888C]">
            Product Surfaces
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.slice(4, 9).map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    isActive 
                      ? 'bg-[#FDF0F3] text-[#8B1E3F] font-semibold border-l-2 border-[#8B1E3F]' 
                      : 'text-[#685559] hover:bg-[#F4EFEA] hover:text-[#2B1D20]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#8B1E3F]' : 'text-[#9B888C]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </section>

        <section>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#9B888C]">
            Infrastructure
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.slice(9).map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    isActive 
                      ? 'bg-[#FDF0F3] text-[#8B1E3F] font-semibold border-l-2 border-[#8B1E3F]' 
                      : 'text-[#685559] hover:bg-[#F4EFEA] hover:text-[#2B1D20]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#8B1E3F]' : 'text-[#9B888C]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </section>
      </div>

      {/* Connection Mode Footer Card */}
      <div className="p-3.5 border-t border-[#E8DDD2] bg-[#FAF7F2]">
        <button
          id="btn-connection-status"
          onClick={() => setIsConnectModalOpen(true)}
          className="w-full text-left p-2.5 rounded-lg bg-[#FFFDF9] hover:bg-[#F4EFEA] border border-[#E8DDD2] transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#2B1D20] uppercase tracking-wider">
                {connectionMode === 'remote' ? 'Live Supabase' : 'Sandbox Engine'}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#9B888C] group-hover:text-[#2B1D20] transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="text-[11px] text-[#685559] flex items-center justify-between">
            <span className="font-mono text-[#685559]">PG 16.4 • RLS Active</span>
            <span className="text-[10px] text-[#8B1E3F] bg-[#FDF0F3] border border-[#F5CBD3] px-1.5 py-0.2 rounded font-medium">Configure</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
