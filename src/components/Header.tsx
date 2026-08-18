import React, { useEffect, useState, useRef } from 'react';
import { 
  Search, 
  Terminal, 
  Database, 
  Sparkles, 
  CloudLightning, 
  BookOpen, 
  ExternalLink,
  Check,
  AlertCircle,
  Info,
  Radio,
  Cpu,
  Compass,
  User,
  LogOut,
  LogIn,
  Activity
} from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';

export const Header: React.FC = () => {
  const { 
    activeView, 
    setIsCommandPaletteOpen, 
    setIsConnectModalOpen, 
    connectionMode, 
    addSqlTab, 
    setActiveView,
    notification,
    projectSettings,
    metrics,
    currentUser,
    openAuthModal,
    signOut
  } = useSupabase();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCommandPaletteOpen]);

  const viewTitles: Record<string, string> = {
    landing: 'Home & Showcase',
    overview: 'Project Overview',
    table_editor: 'Table Editor',
    sql_editor: 'SQL Editor & Query Runner',
    database_schema: 'Database, Schemas & Extensions',
    auth: 'Authentication & Users',
    storage: 'Storage Buckets & Media',
    edge_functions: 'Edge Functions & Webhooks',
    realtime: 'Realtime Inspector & Broadcast',
    api_docs: 'Auto-Generated REST & GraphQL Docs',
    observability: 'Database Logs & Observability',
    settings: 'Project Settings & Credentials',
  };

  return (
    <header 
      id="supabase-top-header"
      className="h-16 bg-[#FFFDF9] border-b border-[#E8DDD2] flex items-center justify-between px-6 text-[#2B1D20] select-none relative z-20"
    >
      {/* Left: Breadcrumbs & View Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-[#685559]">
          <span className="font-semibold text-sm text-[#2B1D20]">{projectSettings.name}</span>
          <span className="text-[#C2B3B5]">/</span>
          <span className="text-[#685559] font-medium">{viewTitles[activeView] || activeView}</span>
        </div>

        {/* Live health pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DDD2] text-[10px] font-semibold text-[#685559] uppercase tracking-wider">
          <Activity className="w-3 h-3 text-[#286E4F]" />
          <span>{metrics.tps} TPS</span>
          <span className="text-[#C2B3B5]">•</span>
          <span>{metrics.cacheHitRatio}% Cache</span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-6 hidden sm:block">
        <button
          id="btn-open-command-palette"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#E8DDD2] text-xs text-[#685559] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#9B888C]" />
            <span>Search tables, queries, functions, docs...</span>
          </div>
          <kbd className="text-[10px] font-mono bg-[#FFFDF9] text-[#685559] px-1.5 py-0.5 rounded border border-[#E8DDD2] shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Action Buttons & Project switcher */}
      <div className="flex items-center gap-3">
        {/* Intro & Showcase link */}
        <button
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[12px] font-semibold text-[#8B1E3F] transition-colors shadow-2xs"
          title="View the Supabase Intro Landing Page"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Intro & Showcase</span>
        </button>

        <button
          id="btn-quick-sql"
          onClick={() => {
            addSqlTab('Quick Query', 'SELECT * FROM public.profiles LIMIT 10;');
            setActiveView('sql_editor');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#F4EFEA] text-[13px] font-medium text-[#2B1D20] transition-colors shadow-2xs"
          title="Open a new SQL Editor tab"
        >
          <Terminal className="w-3.5 h-3.5 text-[#8B1E3F]" />
          <span className="hidden sm:inline">New SQL</span>
        </button>

        <button
          id="btn-connect-target"
          onClick={() => setIsConnectModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all shadow-xs ${
            connectionMode === 'remote'
              ? 'bg-[#FDF0F3] border border-[#F5CBD3] text-[#8B1E3F]'
              : 'bg-[#8B1E3F] text-white hover:bg-[#72142E]'
          }`}
        >
          <CloudLightning className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {connectionMode === 'remote' ? 'Connected: Remote' : 'Sandbox DB'}
          </span>
        </button>

        {/* User profile avatar & dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-lg bg-[#FDF0F3] border border-[#F5CBD3] hover:border-[#8B1E3F] flex items-center justify-center text-xs font-bold text-[#8B1E3F] select-none shadow-2xs transition-colors"
            title="User Account Menu"
          >
            {currentUser ? currentUser.email.substring(0, 2).toUpperCase() : '??'}
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl shadow-xl p-2 z-50 text-xs text-[#2B1D20] animate-in fade-in zoom-in-95 duration-150">
              {currentUser ? (
                <div className="space-y-1">
                  <div className="p-2 border-b border-[#E8DDD2] bg-[#FAF7F2] rounded-lg mb-1">
                    <div className="font-bold truncate text-[#2B1D20]">{currentUser.email}</div>
                    <div className="text-[10px] text-[#8B1E3F] font-mono capitalize">Role: {currentUser.role}</div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveView('landing');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#685559] hover:text-[#2B1D20]"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#8B1E3F]" />
                    <span>Supabase Home Intro</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#685559] hover:text-[#2B1D20]"
                  >
                    <User className="w-3.5 h-3.5 text-[#8B1E3F]" />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FDF0F3] text-[#8B1E3F] font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      openAuthModal('signin');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#8B1E3F] text-white font-semibold"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal('signup');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#685559]"
                  >
                    <span>Create Account</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
