import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Building2, 
  Database, 
  Table, 
  Terminal, 
  Users, 
  FolderArchive, 
  Zap, 
  Radio, 
  Activity, 
  FileCode, 
  Settings, 
  GitBranch, 
  Copy, 
  Check, 
  Plus, 
  Layers, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Folder
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { ActiveView } from '../../types';

interface BreadcrumbDropdownItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: React.ElementType;
  badge?: string;
  onClick: () => void;
  active?: boolean;
}

export const Breadcrumbs: React.FC = () => {
  const {
    activeView,
    setActiveView,
    projectSettings,
    updateProjectSettings,
    tables,
    selectedTableId,
    setSelectedTableId,
    sqlTabs,
    activeSqlTabId,
    setActiveSqlTabId,
    addSqlTab,
    storageBuckets,
    selectedBucketId,
    setSelectedBucketId,
    edgeFunctions,
    selectedFunctionId,
    setSelectedFunctionId,
    setNotification
  } = useSupabase();

  const [activeDropdown, setActiveDropdown] = useState<'org' | 'project' | 'view' | 'subitem' | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const viewConfigs: Record<ActiveView, { label: string; shortLabel: string; icon: React.ElementType; category: string }> = {
    landing: { label: 'Home & Showcase', shortLabel: 'Home', icon: Sparkles, category: 'Overview' },
    organizations: { label: 'All Projects', shortLabel: 'Projects', icon: Building2, category: 'Workspace' },
    overview: { label: 'Project Overview', shortLabel: 'Overview', icon: Layers, category: 'Project' },
    table_editor: { label: 'Table Editor', shortLabel: 'Tables', icon: Table, category: 'Database' },
    sql_editor: { label: 'SQL Editor', shortLabel: 'SQL', icon: Terminal, category: 'Database' },
    database_schema: { label: 'Database & Schemas', shortLabel: 'Database', icon: Database, category: 'Database' },
    auth: { label: 'Authentication & Users', shortLabel: 'Auth', icon: Users, category: 'Security' },
    storage: { label: 'Storage Buckets', shortLabel: 'Storage', icon: FolderArchive, category: 'Storage' },
    edge_functions: { label: 'Edge Functions', shortLabel: 'Functions', icon: Zap, category: 'Compute' },
    realtime: { label: 'Realtime Inspector', shortLabel: 'Realtime', icon: Radio, category: 'Realtime' },
    api_docs: { label: 'API & GraphQL Docs', shortLabel: 'API Docs', icon: FileCode, category: 'Docs' },
    observability: { label: 'Logs & Observability', shortLabel: 'Observability', icon: Activity, category: 'Monitoring' },
    settings: { label: 'Project Settings', shortLabel: 'Settings', icon: Settings, category: 'Configuration' },
  };

  const availableProjects = [
    { id: 'medicluster', name: 'medicluster', region: 'ap-southeast-1', tier: 'Pro Plan', status: 'active' },
    { id: 'pragna-chatbot', name: 'pragna-chatbot', region: 'ap-south-1', tier: 'Free Tier', status: 'paused' },
    { id: 'pragna-chatbot-uswest', name: 'pragna-chatbot-uswest', region: 'us-west-1', tier: 'Pro Plan', status: 'active' },
    { id: 'whatsapp-messenger', name: 'whatsapp-messenger', region: 'eu-central-1', tier: 'Free Tier', status: 'active' },
  ];

  const organizations = [
    { id: 'vinay3254', name: "vinay3254's Org", plan: 'Team Plan', projectsCount: 4 },
    { id: 'enterprise-core', name: 'MedGlobal Health', plan: 'Enterprise', projectsCount: 12 },
    { id: 'personal-sandbox', name: 'Personal Dev', plan: 'Free', projectsCount: 1 },
  ];

  // Resolve Sub-item Crumb
  let subItemName: string | null = null;
  let subItemIcon: React.ElementType | null = null;
  let subItemDropdownList: BreadcrumbDropdownItem[] = [];

  if (activeView === 'table_editor') {
    const selectedTable = tables.find(t => t.id === selectedTableId) || tables[0];
    if (selectedTable) {
      subItemName = `${selectedTable.schema}.${selectedTable.name}`;
      subItemIcon = Table;
      subItemDropdownList = tables.map(t => ({
        id: t.id,
        label: `${t.schema}.${t.name}`,
        sublabel: `${t.columns.length} columns • ${t.rlsEnabled ? 'RLS ON' : 'RLS OFF'}`,
        icon: Table,
        active: t.id === selectedTable.id,
        onClick: () => {
          setSelectedTableId(t.id);
          setActiveDropdown(null);
        }
      }));
    }
  } else if (activeView === 'sql_editor') {
    const activeTab = sqlTabs.find(t => t.id === activeSqlTabId) || sqlTabs[0];
    if (activeTab) {
      subItemName = activeTab.title;
      subItemIcon = Terminal;
      subItemDropdownList = [
        ...sqlTabs.map(tab => ({
          id: tab.id,
          label: tab.title,
          sublabel: tab.isDirty ? 'Unsaved edits' : 'Saved snippet',
          icon: Terminal,
          active: tab.id === activeTab.id,
          onClick: () => {
            setActiveSqlTabId(tab.id);
            setActiveDropdown(null);
          }
        })),
        {
          id: 'new-query-action',
          label: '+ Create New Query Tab',
          sublabel: 'Open blank SQL workspace',
          icon: Plus,
          onClick: () => {
            addSqlTab();
            setActiveDropdown(null);
          }
        }
      ];
    }
  } else if (activeView === 'storage') {
    const activeBucket = storageBuckets.find(b => b.id === selectedBucketId) || storageBuckets[0];
    if (activeBucket) {
      subItemName = activeBucket.name;
      subItemIcon = FolderArchive;
      subItemDropdownList = storageBuckets.map(b => ({
        id: b.id,
        label: b.name,
        sublabel: `${b.isPublic ? 'Public bucket' : 'Private bucket'} • ${b.sizeLimitMb || 50} MB limit`,
        icon: FolderArchive,
        active: b.id === activeBucket.id,
        onClick: () => {
          setSelectedBucketId(b.id);
          setActiveDropdown(null);
        }
      }));
    }
  } else if (activeView === 'edge_functions') {
    const activeFunc = edgeFunctions.find(f => f.id === selectedFunctionId);
    if (activeFunc) {
      subItemName = activeFunc.name;
      subItemIcon = Zap;
      subItemDropdownList = edgeFunctions.map(f => ({
        id: f.id,
        label: f.name,
        sublabel: `${f.region} • ${f.status}`,
        icon: Zap,
        active: f.id === activeFunc.id,
        onClick: () => {
          setSelectedFunctionId(f.id);
          setActiveDropdown(null);
        }
      }));
    }
  }

  // Construct readable path for clipboard copying
  const fullPathSegments = [
    "vinay3254's Org",
    projectSettings.name,
    viewConfigs[activeView]?.label || activeView,
    ...(subItemName ? [subItemName] : [])
  ];

  const handleCopyPath = () => {
    const pathString = fullPathSegments.join(' / ');
    navigator.clipboard.writeText(pathString);
    setCopiedPath(true);
    setNotification({
      type: 'success',
      message: `Copied path: "${pathString}"`
    });
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const currentViewConfig = viewConfigs[activeView] || viewConfigs.overview;
  const CurrentViewIcon = currentViewConfig.icon;

  return (
    <nav 
      ref={navRef}
      id="dashboard-dynamic-breadcrumbs"
      aria-label="Breadcrumb Navigation"
      className="flex items-center gap-1 sm:gap-1.5 text-xs select-none max-w-full overflow-x-auto scrollbar-none py-1"
    >
      {/* 1. Organization Crumb */}
      <div className="relative flex items-center">
        <button
          id="breadcrumb-org-btn"
          onClick={() => setActiveDropdown(activeDropdown === 'org' ? null : 'org')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
            activeDropdown === 'org'
              ? 'bg-[#FAF7F2] text-[#8B1E3F] ring-1 ring-[#8B1E3F]/30 shadow-2xs'
              : 'text-[#685559] hover:text-[#2B1D20] hover:bg-[#FAF7F2]'
          }`}
          title="Switch Organization"
        >
          <Building2 className="w-3.5 h-3.5 text-[#8B1E3F] flex-shrink-0" />
          <span className="truncate max-w-[110px] sm:max-w-[130px] font-semibold text-[#2B1D20]">
            vinay3254's Org
          </span>
          <ChevronDown className={`w-3 h-3 text-[#9C888C] transition-transform duration-150 ${activeDropdown === 'org' ? 'rotate-180' : ''}`} />
        </button>

        {/* Org Dropdown */}
        {activeDropdown === 'org' && (
          <div className="absolute left-0 top-full mt-1.5 w-60 bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 border-b border-[#E8DDD2]/60 text-[10px] font-bold uppercase tracking-wider text-[#9C888C]">
              Organizations
            </div>
            {organizations.map(org => (
              <button
                key={org.id}
                onClick={() => {
                  setActiveDropdown(null);
                  setActiveView('organizations');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                  org.id === 'vinay3254' ? 'bg-[#FAF7F2] text-[#8B1E3F] font-semibold' : 'text-[#2B1D20] hover:bg-[#FAF7F2]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[#8B1E3F]" />
                  <span>{org.name}</span>
                </div>
                <span className="text-[10px] text-[#9C888C]">{org.projectsCount} apps</span>
              </button>
            ))}
            <div className="border-t border-[#E8DDD2]/60 mt-1 pt-1 px-1">
              <button
                onClick={() => {
                  setActiveDropdown(null);
                  setActiveView('organizations');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#8B1E3F] hover:bg-[#FAF7F2] rounded-md font-medium"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Manage Organizations</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-[#C2B3B5] flex-shrink-0" />

      {/* 2. Project Crumb */}
      <div className="relative flex items-center">
        <button
          id="breadcrumb-project-btn"
          onClick={() => setActiveDropdown(activeDropdown === 'project' ? null : 'project')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
            activeDropdown === 'project'
              ? 'bg-[#FAF7F2] text-[#8B1E3F] ring-1 ring-[#8B1E3F]/30 shadow-2xs'
              : 'text-[#2B1D20] hover:bg-[#FAF7F2]'
          }`}
          title="Current project instance (click to switch)"
        >
          <div className="w-2 h-2 rounded-full bg-[#286E4F] animate-pulse flex-shrink-0" title="Database Healthy" />
          <span className="truncate max-w-[110px] sm:max-w-[140px]">
            {projectSettings.name}
          </span>
          <ChevronDown className={`w-3 h-3 text-[#9C888C] transition-transform duration-150 ${activeDropdown === 'project' ? 'rotate-180' : ''}`} />
        </button>

        {/* Project Switcher Dropdown */}
        {activeDropdown === 'project' && (
          <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 border-b border-[#E8DDD2]/60 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#9C888C]">
              <span>Switch Project</span>
              <span className="font-normal lowercase text-[#9C888C]">{availableProjects.length} instances</span>
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {availableProjects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => {
                    updateProjectSettings({ name: proj.name, region: `${proj.region} (AWS)` });
                    setActiveDropdown(null);
                    setNotification({
                      type: 'success',
                      message: `Switched active database instance to "${proj.name}"`
                    });
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                    proj.name === projectSettings.name ? 'bg-[#FAF7F2] text-[#8B1E3F] font-semibold' : 'text-[#2B1D20] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${proj.status === 'active' ? 'bg-[#286E4F]' : 'bg-[#D97706]'}`} />
                    <div className="truncate">
                      <div className="font-medium text-xs truncate">{proj.name}</div>
                      <div className="text-[10px] text-[#9C888C]">{proj.region} • {proj.tier}</div>
                    </div>
                  </div>
                  {proj.name === projectSettings.name && (
                    <Check className="w-3.5 h-3.5 text-[#8B1E3F] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-[#E8DDD2]/60 mt-1 pt-1 px-1 flex flex-col gap-0.5">
              <button
                onClick={() => {
                  setActiveDropdown(null);
                  setActiveView('overview');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#2B1D20] hover:bg-[#FAF7F2] rounded-md font-medium"
              >
                <Layers className="w-3.5 h-3.5 text-[#8B1E3F]" />
                <span>Go to Project Overview</span>
              </button>
              <button
                onClick={() => {
                  setActiveDropdown(null);
                  setActiveView('organizations');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#8B1E3F] hover:bg-[#FAF7F2] rounded-md font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Project</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Production branch badge */}
      <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DDD2] text-[10px] text-[#685559] font-mono">
        <GitBranch className="w-2.5 h-2.5 text-[#8B1E3F]" />
        <span>main</span>
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-[#C2B3B5] flex-shrink-0" />

      {/* 3. Section / View Crumb */}
      <div className="relative flex items-center">
        <button
          id="breadcrumb-view-btn"
          onClick={() => setActiveDropdown(activeDropdown === 'view' ? null : 'view')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
            activeDropdown === 'view'
              ? 'bg-[#FAF7F2] text-[#8B1E3F] ring-1 ring-[#8B1E3F]/30 shadow-2xs'
              : 'text-[#685559] hover:text-[#2B1D20] hover:bg-[#FAF7F2]'
          }`}
          title="Current Dashboard Section (click to navigate)"
        >
          <CurrentViewIcon className="w-3.5 h-3.5 text-[#8B1E3F] flex-shrink-0" />
          <span className="truncate max-w-[120px] sm:max-w-[160px] text-[#2B1D20]">
            {currentViewConfig.label}
          </span>
          <ChevronDown className={`w-3 h-3 text-[#9C888C] transition-transform duration-150 ${activeDropdown === 'view' ? 'rotate-180' : ''}`} />
        </button>

        {/* View Switcher Dropdown */}
        {activeDropdown === 'view' && (
          <div className="absolute left-0 top-full mt-1.5 w-60 bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 border-b border-[#E8DDD2]/60 text-[10px] font-bold uppercase tracking-wider text-[#9C888C]">
              Jump to Section
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {(Object.keys(viewConfigs) as ActiveView[])
                .filter(v => v !== 'landing' && v !== 'organizations')
                .map(v => {
                  const itemConfig = viewConfigs[v];
                  const Icon = itemConfig.icon;
                  const isActive = activeView === v;
                  return (
                    <button
                      key={v}
                      onClick={() => {
                        setActiveView(v);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                        isActive ? 'bg-[#FAF7F2] text-[#8B1E3F] font-semibold' : 'text-[#2B1D20] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8B1E3F]' : 'text-[#685559]'}`} />
                        <span>{itemConfig.label}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-[#8B1E3F]" />}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Sub-item Crumb (If active in Table Editor, SQL Editor, Storage, Edge Functions) */}
      {subItemName && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-[#C2B3B5] flex-shrink-0" />
          <div className="relative flex items-center">
            <button
              id="breadcrumb-subitem-btn"
              onClick={() => {
                if (subItemDropdownList.length > 0) {
                  setActiveDropdown(activeDropdown === 'subitem' ? null : 'subitem');
                }
              }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                activeDropdown === 'subitem'
                  ? 'bg-[#8B1E3F]/10 text-[#8B1E3F] ring-1 ring-[#8B1E3F]/30 shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#8B1E3F] border border-[#E8DDD2]/80 hover:border-[#8B1E3F]/40'
              }`}
              title={`Active item: ${subItemName}`}
            >
              {subItemIcon && React.createElement(subItemIcon, { className: 'w-3 h-3 text-[#8B1E3F] flex-shrink-0' })}
              <span className="truncate max-w-[120px] sm:max-w-[180px] font-semibold">
                {subItemName}
              </span>
              {subItemDropdownList.length > 0 && (
                <ChevronDown className={`w-3 h-3 text-[#8B1E3F] transition-transform duration-150 ${activeDropdown === 'subitem' ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Sub-item Dropdown */}
            {activeDropdown === 'subitem' && subItemDropdownList.length > 0 && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-[#E8DDD2]/60 text-[10px] font-bold uppercase tracking-wider text-[#9C888C]">
                  {activeView === 'table_editor' ? 'Switch Table' : activeView === 'sql_editor' ? 'Switch Query Tab' : activeView === 'storage' ? 'Switch Bucket' : 'Switch Function'}
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {subItemDropdownList.map(item => {
                    const ItemIcon = item.icon || Folder;
                    return (
                      <button
                        key={item.id}
                        onClick={item.onClick}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                          item.active ? 'bg-[#FAF7F2] text-[#8B1E3F] font-semibold' : 'text-[#2B1D20] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ItemIcon className="w-3.5 h-3.5 text-[#8B1E3F] flex-shrink-0" />
                          <div className="truncate">
                            <div className="truncate">{item.label}</div>
                            {item.sublabel && (
                              <div className="text-[10px] text-[#9C888C] truncate font-sans">{item.sublabel}</div>
                            )}
                          </div>
                        </div>
                        {item.active && <Check className="w-3.5 h-3.5 text-[#8B1E3F] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 5. Copy Path Button */}
      <button
        id="btn-copy-breadcrumb-path"
        onClick={handleCopyPath}
        className="ml-1 p-1 text-[#9C888C] hover:text-[#8B1E3F] hover:bg-[#FAF7F2] rounded-md transition-colors flex-shrink-0"
        title="Copy full navigation path to clipboard"
      >
        {copiedPath ? (
          <Check className="w-3.5 h-3.5 text-[#286E4F]" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </nav>
  );
};
