import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, 
  Users, 
  FolderArchive, 
  Zap, 
  Radio, 
  Cpu, 
  Clock, 
  Layers, 
  Sparkles, 
  FileText, 
  Code, 
  HeartHandshake, 
  BookOpen, 
  ChevronDown, 
  ArrowRight,
  ExternalLink,
  Github,
  CheckCircle2,
  Boxes,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { ActiveView } from '../../types';

export const MegaMenuNav: React.FC = () => {
  const { setActiveView, setNotification } = useSupabase();
  const [activeMenu, setActiveMenu] = useState<'product' | 'developers' | 'solutions' | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menu: 'product' | 'developers' | 'solutions') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const navigateToView = (view: ActiveView) => {
    setActiveView(view);
    setActiveMenu(null);
  };

  const handleCompareClick = (competitor: string) => {
    setNotification({
      type: 'info',
      message: `Chocobase vs ${competitor}: 100% portable PostgreSQL with zero vendor lock-in.`
    });
    setActiveMenu(null);
  };

  return (
    <div className="relative" onMouseLeave={handleMouseLeave}>
      {/* Nav Link Triggers */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium text-[#685559]">
        
        {/* Product Menu Trigger */}
        <div 
          onMouseEnter={() => handleMouseEnter('product')}
          className="relative"
        >
          <button 
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              activeMenu === 'product' ? 'text-[#8B1E3F] bg-[#F4EFEA]' : 'hover:text-[#2B1D20]'
            }`}
          >
            <span>Product</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'product' ? 'rotate-180 text-[#8B1E3F]' : 'text-[#9B888C]'}`} />
          </button>
        </div>

        {/* Developers Menu Trigger */}
        <div 
          onMouseEnter={() => handleMouseEnter('developers')}
          className="relative"
        >
          <button 
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              activeMenu === 'developers' ? 'text-[#8B1E3F] bg-[#F4EFEA]' : 'hover:text-[#2B1D20]'
            }`}
          >
            <span>Developers</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'developers' ? 'rotate-180 text-[#8B1E3F]' : 'text-[#9B888C]'}`} />
          </button>
        </div>

        {/* Solutions Menu Trigger */}
        <div 
          onMouseEnter={() => handleMouseEnter('solutions')}
          className="relative"
        >
          <button 
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              activeMenu === 'solutions' ? 'text-[#8B1E3F] bg-[#F4EFEA]' : 'hover:text-[#2B1D20]'
            }`}
          >
            <span>Solutions</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'solutions' ? 'rotate-180 text-[#8B1E3F]' : 'text-[#9B888C]'}`} />
          </button>
        </div>

        {/* Direct Links */}
        <button 
          onClick={() => navigateToView('api_docs')} 
          className="px-3 py-1.5 hover:text-[#2B1D20] transition-colors"
        >
          Docs
        </button>
        <button 
          onClick={() => navigateToView('organizations')} 
          className="px-3 py-1.5 hover:text-[#2B1D20] transition-colors"
        >
          Pricing
        </button>
      </nav>

      {/* Product Mega Menu Dropdown (Screenshot 1) */}
      {activeMenu === 'product' && (
        <div 
          onMouseEnter={() => handleMouseEnter('product')}
          className="absolute top-full left-0 mt-2 w-[720px] bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl shadow-2xl p-6 grid grid-cols-3 gap-6 z-50 animate-in fade-in zoom-in-98 duration-150"
        >
          {/* Column 1: Core Products */}
          <div className="space-y-3 border-r border-[#E8DDD2] pr-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] block">CORE PRODUCTS</span>
            
            <div 
              onClick={() => navigateToView('table_editor')}
              className="group p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1D20] group-hover:text-[#8B1E3F]">
                <Database className="w-4 h-4 text-[#8B1E3F]" />
                <span>Database</span>
              </div>
              <p className="text-[11px] text-[#685559] mt-0.5">Fully portable Postgres database</p>
            </div>

            <div 
              onClick={() => navigateToView('auth')}
              className="group p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1D20] group-hover:text-[#8B1E3F]">
                <Users className="w-4 h-4 text-[#8B1E3F]" />
                <span>Authentication</span>
              </div>
              <p className="text-[11px] text-[#685559] mt-0.5">User Management out of the box</p>
            </div>

            <div 
              onClick={() => navigateToView('storage')}
              className="group p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1D20] group-hover:text-[#8B1E3F]">
                <FolderArchive className="w-4 h-4 text-[#8B1E3F]" />
                <span>Storage</span>
              </div>
              <p className="text-[11px] text-[#685559] mt-0.5">Serverless storage for any media</p>
            </div>

            <div 
              onClick={() => navigateToView('edge_functions')}
              className="group p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1D20] group-hover:text-[#8B1E3F]">
                <Zap className="w-4 h-4 text-[#8B1E3F]" />
                <span>Edge Functions</span>
              </div>
              <p className="text-[11px] text-[#685559] mt-0.5">Deploy code globally on the edge</p>
            </div>

            <div 
              onClick={() => navigateToView('realtime')}
              className="group p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1D20] group-hover:text-[#8B1E3F]">
                <Radio className="w-4 h-4 text-[#8B1E3F]" />
                <span>Realtime</span>
              </div>
              <p className="text-[11px] text-[#685559] mt-0.5">Synchronize and broadcast events</p>
            </div>
          </div>

          {/* Column 2: Modules */}
          <div className="space-y-3 border-r border-[#E8DDD2] pr-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] block">MODULES</span>
            
            <div 
              onClick={() => navigateToView('overview')}
              className="group p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1D20] group-hover:text-[#8B1E3F]">
                <Cpu className="w-4 h-4 text-[#8B1E3F]" />
                <span>Vector</span>
              </div>
              <p className="text-[11px] text-[#685559] mt-0.5">AI toolkit to manage embeddings</p>
            </div>

            <div 
              onClick={() => navigateToView('sql_editor')}
              className="group p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1D20] group-hover:text-[#8B1E3F]">
                <Clock className="w-4 h-4 text-[#8B1E3F]" />
                <span>Cron</span>
              </div>
              <p className="text-[11px] text-[#685559] mt-0.5">Schedule and manage recurring jobs</p>
            </div>

            <div 
              onClick={() => navigateToView('realtime')}
              className="group p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1D20] group-hover:text-[#8B1E3F]">
                <Layers className="w-4 h-4 text-[#8B1E3F]" />
                <span>Queues</span>
              </div>
              <p className="text-[11px] text-[#685559] mt-0.5">Durable message queues</p>
            </div>

            <div 
              onClick={() => navigateToView('overview')}
              className="group p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#2B1D20] group-hover:text-[#8B1E3F]">
                <Sparkles className="w-4 h-4 text-[#8B1E3F]" />
                <span>Features</span>
              </div>
              <p className="text-[11px] text-[#685559] mt-0.5">Explore everything Chocobase does</p>
            </div>
          </div>

          {/* Column 3: Customer Stories & Comparison */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] block mb-2">CUSTOMER STORIES</span>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DDD2] text-xs space-y-1">
                <span className="font-bold text-[#2B1D20]">QA.tech</span>
                <p className="text-[11px] text-[#685559]">How QA.tech automated AI web testing with Chocobase Vector.</p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] block mb-1.5">COMPARE CHOCOBASE</span>
              <div className="space-y-1 text-xs">
                <button 
                  onClick={() => handleCompareClick('Firebase')}
                  className="w-full text-left p-1 text-[#685559] hover:text-[#8B1E3F] transition-colors font-medium flex items-center justify-between"
                >
                  <span>vs Firebase</span>
                  <ArrowRight className="w-3 h-3 text-[#9B888C]" />
                </button>
                <button 
                  onClick={() => handleCompareClick('Heroku Postgres')}
                  className="w-full text-left p-1 text-[#685559] hover:text-[#8B1E3F] transition-colors font-medium flex items-center justify-between"
                >
                  <span>vs Heroku Postgres</span>
                  <ArrowRight className="w-3 h-3 text-[#9B888C]" />
                </button>
                <button 
                  onClick={() => handleCompareClick('Auth0')}
                  className="w-full text-left p-1 text-[#685559] hover:text-[#8B1E3F] transition-colors font-medium flex items-center justify-between"
                >
                  <span>vs Auth0</span>
                  <ArrowRight className="w-3 h-3 text-[#9B888C]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developers Mega Menu Dropdown (Screenshot 2) */}
      {activeMenu === 'developers' && (
        <div 
          onMouseEnter={() => handleMouseEnter('developers')}
          className="absolute top-full left-0 mt-2 w-[720px] bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl shadow-2xl p-6 grid grid-cols-3 gap-6 z-50 animate-in fade-in zoom-in-98 duration-150"
        >
          {/* Column 1: Docs */}
          <div className="space-y-2 border-r border-[#E8DDD2] pr-5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] block mb-2">DEVELOPERS</span>
            
            <button onClick={() => navigateToView('api_docs')} className="w-full text-left p-2 rounded-xl hover:bg-[#FAF7F2] font-semibold text-[#2B1D20] block">
              Documentation
            </button>
            <button onClick={() => navigateToView('api_docs')} className="w-full text-left p-2 rounded-xl hover:bg-[#FAF7F2] font-semibold text-[#2B1D20] block">
              Contribute
            </button>
            <button onClick={() => navigateToView('api_docs')} className="w-full text-left p-2 rounded-xl hover:bg-[#FAF7F2] font-semibold text-[#2B1D20] block">
              Chocobase Library
            </button>
            <button onClick={() => navigateToView('observability')} className="w-full text-left p-2 rounded-xl hover:bg-[#FAF7F2] font-semibold text-[#2B1D20] block">
              Changelog
            </button>
            <button onClick={() => navigateToView('settings')} className="w-full text-left p-2 rounded-xl hover:bg-[#FAF7F2] font-semibold text-[#2B1D20] block">
              Support
            </button>
          </div>

          {/* Column 2: Resources */}
          <div className="space-y-2 border-r border-[#E8DDD2] pr-5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] block mb-2">RESOURCES</span>
            
            <button onClick={() => navigateToView('api_docs')} className="w-full text-left p-2 rounded-xl hover:bg-[#FAF7F2] font-semibold text-[#2B1D20] block">
              Open Source
            </button>
            <button onClick={() => navigateToView('settings')} className="w-full text-left p-2 rounded-xl hover:bg-[#FAF7F2] font-semibold text-[#2B1D20] block">
              Become a Partner
            </button>
            <button onClick={() => navigateToView('api_docs')} className="w-full text-left p-2 rounded-xl hover:bg-[#FAF7F2] font-semibold text-[#2B1D20] block">
              Partner Catalog
            </button>
            <div className="p-2 rounded-xl hover:bg-[#FAF7F2] flex items-center justify-between">
              <span className="font-semibold text-[#2B1D20]">Careers</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#EFF7F3] text-[#286E4F] text-[10px] font-bold">52</span>
            </div>
            <button onClick={() => navigateToView('overview')} className="w-full text-left p-2 rounded-xl hover:bg-[#FAF7F2] font-semibold text-[#2B1D20] block">
              Events & Webinars
            </button>
          </div>

          {/* Column 3: Latest Engineering Blog Posts */}
          <div className="space-y-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] block">BLOG</span>
            
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DDD2] space-y-1">
              <span className="font-bold text-[#2B1D20] block">Connect client traces to your logs</span>
              <p className="text-[11px] text-[#685559]">Distributed observability across Postgres, Auth, and Edge.</p>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DDD2] space-y-1">
              <span className="font-bold text-[#2B1D20] block">Chocobase on Perplexity</span>
              <p className="text-[11px] text-[#685559]">Chocobase is now a live database connector on Perplexity Computer.</p>
            </div>
          </div>
        </div>
      )}

      {/* Solutions Mega Menu Dropdown (Screenshot 3) */}
      {activeMenu === 'solutions' && (
        <div 
          onMouseEnter={() => handleMouseEnter('solutions')}
          className="absolute top-full left-0 mt-2 w-[760px] bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl shadow-2xl p-6 grid grid-cols-4 gap-5 z-50 animate-in fade-in zoom-in-98 duration-150 text-xs"
        >
          {/* Col 1: Skill Level */}
          <div className="space-y-1.5 border-r border-[#E8DDD2] pr-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] block mb-2">SKILL LEVEL</span>
            {['AI Builders', 'No Code', 'Beginners', 'Developers', 'Postgres Devs', 'Vibe Coders'].map((item) => (
              <button 
                key={item} 
                onClick={() => navigateToView('api_docs')}
                className="w-full text-left py-1 text-[#685559] hover:text-[#8B1E3F] font-medium"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Col 2: Who It's For */}
          <div className="space-y-1.5 border-r border-[#E8DDD2] pr-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] block mb-2">WHO IT'S FOR</span>
            {['Hackathon Contestants', 'Startups', 'Agencies', 'Enterprise', 'Innovation Teams'].map((item) => (
              <button 
                key={item} 
                onClick={() => navigateToView('organizations')}
                className="w-full text-left py-1 text-[#685559] hover:text-[#8B1E3F] font-medium"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Col 3: App Type */}
          <div className="space-y-1.5 border-r border-[#E8DDD2] pr-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] block mb-2">APP TYPE</span>
            {['Hosted Postgres', 'B2B SaaS', 'FinServ', 'Healthcare', 'Agents'].map((item) => (
              <button 
                key={item} 
                onClick={() => navigateToView('overview')}
                className="w-full text-left py-1 text-[#685559] hover:text-[#8B1E3F] font-medium"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Col 4: Migration */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B888C] block mb-2">MIGRATION</span>
            <button 
              onClick={() => handleCompareClick('Firebase')}
              className="w-full text-left p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] hover:bg-[#F4EFEA] font-semibold text-[#2B1D20] block"
            >
              Switch from Firebase →
            </button>
            <button 
              onClick={() => handleCompareClick('Neon')}
              className="w-full text-left p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] hover:bg-[#F4EFEA] font-semibold text-[#2B1D20] block"
            >
              Switch from Neon →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
