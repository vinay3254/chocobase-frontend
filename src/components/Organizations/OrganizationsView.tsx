import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Grid, 
  List, 
  MoreVertical, 
  Play, 
  Pause, 
  Server, 
  Database, 
  Layers, 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  X,
  Lock,
  Globe,
  HardDrive,
  Users,
  Activity
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';

interface ProjectCardData {
  id: string;
  name: string;
  provider: string;
  region: string;
  compute: string;
  status: 'active' | 'paused';
  createdAt: string;
}

export const OrganizationsView: React.FC = () => {
  const { setActiveView, setNotification, projectSettings, updateProjectSettings } = useSupabase();

  const [projects, setProjects] = useState<ProjectCardData[]>([
    {
      id: projectSettings.id || 'chocobase-production',
      name: projectSettings.name || 'chocobase-production',
      provider: 'Local / Self-Hosted',
      region: projectSettings.region || '127.0.0.1:8080',
      compute: 'NATIVE',
      status: 'active',
      createdAt: 'Active instance'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created'>('name');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // New Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectRegion, setNewProjectRegion] = useState('ap-southeast-1 (Singapore)');
  const [newProjectPassword, setNewProjectPassword] = useState('PgSuper_Secure_2026!#');

  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const handleOpenProject = (project: ProjectCardData) => {
    if (project.status === 'paused') {
      setNotification({
        type: 'info',
        message: `Project ${project.name} is paused. Resuming Postgres instance...`
      });
      setTimeout(() => {
        setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'active' } : p));
        updateProjectSettings({ name: project.name, region: `${project.region} (AWS)` });
        setActiveView('overview');
      }, 800);
      return;
    }

    updateProjectSettings({ name: project.name, region: `${project.region} (AWS)` });
    setActiveView('overview');
  };

  const handleToggleProjectStatus = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const nextStatus = p.status === 'active' ? 'paused' : 'active';
        setNotification({
          type: 'success',
          message: `Project ${p.name} is now ${nextStatus}`
        });
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject: ProjectCardData = {
      id: newProjectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: newProjectName.trim(),
      provider: 'AWS',
      region: newProjectRegion.split(' ')[0],
      compute: 'NANO',
      status: 'active',
      createdAt: 'Just now'
    };

    setProjects(prev => [newProject, ...prev]);
    updateProjectSettings({ name: newProject.name, region: newProjectRegion });
    setIsNewProjectModalOpen(false);
    setNewProjectName('');
    setNotification({
      type: 'success',
      message: `Project ${newProject.name} provisioned successfully in ${newProjectRegion}!`
    });
    setActiveView('overview');
  };

  return (
    <div id="organizations-view-container" className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150 relative">
      {/* Top Organization Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#E8DDD2] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B1E3F] text-white flex items-center justify-center font-bold text-base shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#2B1D20]">{projectSettings.organization || 'Personal Workspace'}</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#F4EFEA] border border-[#E8DDD2] text-[10px] font-bold text-[#685559] uppercase tracking-wider">
                {projectSettings.tier || 'Free'} Plan • {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>
            <p className="text-xs text-[#685559] mt-0.5">Manage Postgres clusters, compute resources, and project branches.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B1E3F] hover:bg-[#72142E] text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New project</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Projects on Left, Usage Metrics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Projects Filter & Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#2B1D20]">Projects</h2>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B888C]" />
              <input
                type="text"
                placeholder="Search for a project"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl text-xs text-[#2B1D20] placeholder-[#9B888C] focus:outline-hidden focus:border-[#8B1E3F]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
              >
                <option value="name">Sorted by name</option>
                <option value="created">Sorted by date</option>
              </select>

              <div className="flex items-center rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#F4EFEA] text-[#8B1E3F]' : 'text-[#9B888C] hover:text-[#2B1D20]'}`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#F4EFEA] text-[#8B1E3F]' : 'text-[#9B888C] hover:text-[#2B1D20]'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Projects View */}
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl">
              <Database className="w-8 h-8 text-[#9B888C] mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold text-[#2B1D20]">No projects found</p>
              <p className="text-xs text-[#685559] mt-1">Try adjusting your search terms or create a new project.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProjects.map((p) => {
                const isCurrent = projectSettings.name.toLowerCase() === p.name.toLowerCase();
                const isPaused = p.status === 'paused';

                return (
                  <div
                    key={p.id}
                    onClick={() => handleOpenProject(p)}
                    className={`p-5 rounded-2xl bg-[#FFFDF9] border transition-all cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 group flex flex-col justify-between min-h-[160px] ${
                      isCurrent 
                        ? 'border-[#8B1E3F]/50 ring-1 ring-[#8B1E3F]/20' 
                        : 'border-[#E8DDD2] hover:border-[#8B1E3F]/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors font-mono">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[#685559] mt-1">
                            <span>{p.provider}</span>
                            <span>|</span>
                            <span className="font-mono">{p.region}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded-md bg-[#F4EFEA] text-[9px] font-bold text-[#685559] uppercase tracking-wider">
                            {p.compute}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-[#F4EFEA] flex items-center justify-between">
                      {isPaused ? (
                        <div className="flex items-center gap-1.5 text-xs text-[#9B888C]">
                          <Pause className="w-3.5 h-3.5" />
                          <span>Project is paused</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-[#286E4F] font-semibold">
                          <span className="w-2 h-2 rounded-full bg-[#286E4F] animate-pulse" />
                          <span>Active</span>
                        </div>
                      )}

                      <button
                        onClick={(e) => handleToggleProjectStatus(p.id, e)}
                        className="text-[11px] font-semibold text-[#8B1E3F] hover:underline"
                      >
                        {isPaused ? 'Resume' : 'Manage'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl overflow-hidden divide-y divide-[#E8DDD2]">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleOpenProject(p)}
                  className="p-4 flex items-center justify-between hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center text-[#8B1E3F]">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#2B1D20] font-mono">{p.name}</span>
                      <p className="text-[11px] text-[#685559]">{p.provider} • {p.region} • {p.compute}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold ${p.status === 'active' ? 'text-[#286E4F]' : 'text-[#9B888C]'}`}>
                      {p.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#9B888C]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: Plan Usage & Upgrade Summary */}
        <div className="space-y-6">
          <div className="bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#2B1D20]">Plan usage</h3>
                <p className="text-[11px] text-[#685559]">Current instance quota</p>
              </div>
              <button 
                onClick={() => {
                  setNotification({
                    type: 'info',
                    message: 'Pro Plan features unlocked: Dedicated compute, PITR backups, 100k MAU, and unlimited edge invocations.'
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-[#286E4F] hover:bg-[#20583F] text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Quota Progress Items */}
            <div className="space-y-4">
              {/* Egress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-[#9B888C]">EGRESS</span>
                  <span className="font-mono text-[#2B1D20]">0 MB / 5 GB</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4EFEA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B1E3F] w-[0%] rounded-full" />
                </div>
              </div>

              {/* Database Size */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-[#9B888C]">DATABASE SIZE</span>
                  <span className="font-mono text-[#2B1D20]">0.1 MB / 500 MB</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4EFEA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B1E3F] w-[0.1%] rounded-full" />
                </div>
              </div>

              {/* Monthly Active Users */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-[#9B888C]">MONTHLY ACTIVE USERS</span>
                  <span className="font-mono text-[#2B1D20]">0 / 50,000</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4EFEA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B1E3F] w-[0%] rounded-full" />
                </div>
              </div>

              {/* File Storage */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-[#9B888C]">FILE STORAGE</span>
                  <span className="font-mono text-[#2B1D20]">0 GB / 1 GB</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4EFEA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B1E3F] w-[0%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Project Provisioning Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#8B1E3F] text-white flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#2B1D20]">Create a new project</h3>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-[#9B888C] hover:text-[#2B1D20] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2B1D20] mb-1.5">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ecommerce-backend"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1D20] mb-1.5">Database Password</label>
                <input
                  type="password"
                  required
                  value={newProjectPassword}
                  onChange={(e) => setNewProjectPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1D20] mb-1.5">Cloud Region</label>
                <select
                  value={newProjectRegion}
                  onChange={(e) => setNewProjectRegion(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
                >
                  <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore)</option>
                  <option value="us-west-1 (N. California)">us-west-1 (N. California)</option>
                  <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
                  <option value="eu-central-1 (Frankfurt)">eu-central-1 (Frankfurt)</option>
                  <option value="ap-south-1 (Mumbai)">ap-south-1 (Mumbai)</option>
                  <option value="ap-northeast-1 (Tokyo)">ap-northeast-1 (Tokyo)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8DDD2] bg-[#FAF7F2] text-xs font-medium text-[#685559] hover:bg-[#F4EFEA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8B1E3F] hover:bg-[#72142E] text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
