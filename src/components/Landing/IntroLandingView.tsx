import React, { useState } from 'react';
import { 
  Zap, 
  Database, 
  Lock, 
  Terminal, 
  FolderOpen, 
  Radio, 
  Cpu, 
  Globe, 
  ArrowRight, 
  Boxes, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Server,
  Activity,
  CheckCircle,
  Search
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { Hero3DCanvas } from './Hero3DCanvas';
import { Globe3D } from './Globe3D';
import { VectorCloud3D } from './VectorCloud3D';
import { RealtimeWave3D } from './RealtimeWave3D';
import { PostgresCluster3D } from './PostgresCluster3D';

export const IntroLandingView: React.FC = () => {
  const { 
    openAuthModal, 
    setActiveView, 
    currentUser, 
    signOut,
    setIsCommandPaletteOpen
  } = useSupabase();

  const [activeTier, setActiveTier] = useState<'primary' | 'replica' | 'analytics'>('primary');

  return (
    <div id="chocobase-intro-landing" className="relative min-h-screen bg-[#FAF7F2] text-[#2B1D20] font-sans antialiased selection:bg-[#8B1E3F] selection:text-white overflow-hidden">
      
      {/* Background Soft Ambient 3D Radial Lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(139,30,63,0.07)_0%,rgba(214,142,109,0.05)_40%,transparent_70%)] blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-[700px] -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(139,30,63,0.05)_0%,transparent_70%)] blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-[1100px] -right-40 w-[700px] h-[600px] bg-[radial-gradient(circle,rgba(40,110,79,0.04)_0%,transparent_70%)] blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-40 left-1/3 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(139,30,63,0.06)_0%,transparent_70%)] blur-3xl -z-10" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E8DDD2]/70 bg-[#FAF7F2]/80 backdrop-blur-xl transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div 
              onClick={() => setActiveView('landing')} 
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#8B1E3F] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#2B1D20]">chocobase</span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#685559]">
              <a href="#database" className="hover:text-[#2B1D20] transition-colors">Database</a>
              <a href="#security" className="hover:text-[#2B1D20] transition-colors">Authentication</a>
              <a href="#edge" className="hover:text-[#2B1D20] transition-colors">Global Edge</a>
              <a href="#realtime" className="hover:text-[#2B1D20] transition-colors">Realtime</a>
              <a href="#ai-vector" className="hover:text-[#2B1D20] transition-colors">Vector AI</a>
              <a href="#storage" className="hover:text-[#2B1D20] transition-colors">Storage</a>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="btn-landing-search"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#E8DDD2]/80 bg-white/70 hover:bg-white/95 backdrop-blur-md text-xs text-[#685559] hover:text-[#2B1D20] transition-all shadow-[0_2px_8px_-2px_rgba(43,29,32,0.04)]"
              title="Search workspace (Cmd+K or Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#8B1E3F]" />
              <span className="hidden sm:inline text-[11px] font-medium">Search</span>
              <kbd className="text-[10px] font-mono bg-[#FFFDF9] text-[#685559] px-1 py-0.5 rounded border border-[#E8DDD2] shadow-2xs">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setActiveView('overview')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/80 bg-white/70 hover:bg-white/90 backdrop-blur-md text-xs font-semibold text-[#2B1D20] transition-all shadow-[0_2px_8px_-2px_rgba(43,29,32,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]"
            >
              <Boxes className="w-3.5 h-3.5 text-[#8B1E3F]" />
              <span>Studio</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('overview')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white transition-colors shadow-xs"
                >
                  Dashboard
                </button>
                <button
                  onClick={signOut}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#685559] hover:text-[#2B1D20]"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#2B1D20] hover:bg-[#E8DDD2]/40 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white transition-colors shadow-xs"
                >
                  <span>Start Project</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3D Hero Section */}
      <section className="pt-10 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Vision & Actions */}
          <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-xs font-medium text-[#685559] shadow-[0_2px_8px_-2px_rgba(43,29,32,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <Sparkles className="w-3.5 h-3.5 text-[#8B1E3F]" />
              <span>Next-Gen Database Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2B1D20] tracking-tight leading-tight">
              Build in a weekend <br />
              <span className="text-[#8B1E3F]">Scale to millions</span>
            </h1>

            <p className="text-sm text-[#685559] leading-relaxed">
              Full-featured PostgreSQL with built-in authentication, instant APIs, global edge functions, realtime data sync, and vector search.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => openAuthModal('signup')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white transition-all shadow-[0_4px_16px_-4px_rgba(139,30,63,0.35)] hover:shadow-[0_8px_20px_-4px_rgba(139,30,63,0.45)] hover:-translate-y-0.5"
              >
                <span>Start your project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveView('overview')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/80 bg-white/70 hover:bg-white/90 backdrop-blur-md text-xs font-semibold text-[#2B1D20] transition-all shadow-[0_2px_10px_-2px_rgba(43,29,32,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-0.5"
              >
                <span>Launch Studio</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E8DDD2]/70">
              <div>
                <div className="text-lg font-bold text-[#2B1D20]">99.99%</div>
                <div className="text-[11px] text-[#685559]">Uptime SLA</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#2B1D20]">&lt;10ms</div>
                <div className="text-[11px] text-[#685559]">Edge Latency</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#2B1D20]">1M+</div>
                <div className="text-[11px] text-[#685559]">Active DBs</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Canvas with Glassmorphic Housing & Smooth Elevation */}
          <div className="lg:col-span-7 h-[420px] rounded-3xl bg-gradient-to-b from-white/90 via-white/70 to-[#FAF7F2]/60 hover:from-white hover:via-white/85 hover:to-[#FAF7F2]/80 backdrop-blur-xl border border-white/80 hover:border-[#8B1E3F]/30 shadow-[0_12px_36px_-6px_rgba(43,29,32,0.06),0_2px_8px_rgba(43,29,32,0.03),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_24px_50px_-10px_rgba(139,30,63,0.12),0_4px_16px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden relative group">
            {/* Dynamic Inner Glass Highlight with intensity shift */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,30,63,0.08)_0%,transparent_65%)] opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
            <Hero3DCanvas />
          </div>
        </div>
      </section>

      {/* Fast Growing Companies Strip */}
      <section className="border-y border-[#E8DDD2]/70 bg-white/50 backdrop-blur-md py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-6 text-xs font-bold text-[#685559]">
          <span>LOVABLE</span>
          <span>MOZILLA</span>
          <span>PWC</span>
          <span>FIGMA</span>
          <span>GITHUB</span>
          <span>RESEND</span>
          <span>LANGCHAIN</span>
          <span>1PASSWORD</span>
        </div>
      </section>

      {/* Interactive 3D Architecture Pillars */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <h2 className="text-2xl font-extrabold text-[#2B1D20]">Platform Architecture</h2>
          <p className="text-xs text-[#685559]">Explore the interconnected engines powering modern enterprise applications.</p>
        </div>

        {/* 2-Column Grid of 3D Pillars with Tactile Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. Postgres Database Engine */}
          <div 
            id="database" 
            className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/90 via-white/75 to-[#FFFDF9]/60 hover:from-white hover:via-white/90 hover:to-[#FFF9F6]/85 backdrop-blur-xl border border-white/80 hover:border-[#8B1E3F]/35 shadow-[0_8px_30px_-6px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_24px_48px_-12px_rgba(139,30,63,0.14),0_6px_16px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 overflow-hidden"
          >
            {/* Top glass reflection gradient with dynamic shift */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(139,30,63,0.08),transparent_70%)] opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/90 border border-[#E8DDD2]/80 backdrop-blur-sm flex items-center justify-center text-[#8B1E3F] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] group-hover:scale-105 transition-transform">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors">PostgreSQL Core</h3>
                    <p className="text-[11px] text-[#685559]">Dedicated Postgres cluster with connection pooling & 3D storage mesh</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[#8B1E3F]">v16.4</span>
              </div>

              {/* 3D Interactive Postgres Engine Canvas */}
              <div className="relative z-10 my-1">
                <PostgresCluster3D 
                  activeTier={activeTier} 
                  onTierChange={(t) => setActiveTier(t)} 
                />
              </div>
            </div>

            <div className="relative z-10 p-3 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-between text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] group-hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#8B1E3F]" />
                <span className="font-semibold text-[#2B1D20]">Postgres Engine Status</span>
              </div>
              <span className="text-[#286E4F] font-semibold text-[11px]">Active • Zero Cold-Start</span>
            </div>
          </div>

          {/* 2. Global Edge Network (3D Globe) */}
          <div 
            id="edge" 
            className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/90 via-white/75 to-[#FFFDF9]/60 hover:from-white hover:via-white/90 hover:to-[#FFF9F6]/85 backdrop-blur-xl border border-white/80 hover:border-[#8B1E3F]/35 shadow-[0_8px_30px_-6px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_24px_48px_-12px_rgba(139,30,63,0.14),0_6px_16px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 overflow-hidden"
          >
            {/* Top glass reflection gradient with dynamic shift */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(40,110,79,0.07),transparent_70%)] opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/90 border border-[#E8DDD2]/80 backdrop-blur-sm flex items-center justify-center text-[#8B1E3F] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] group-hover:scale-105 transition-transform">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors">Global Edge Network</h3>
                    <p className="text-[11px] text-[#685559]">Distributed runtime deployed across 35 worldwide regions</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[#286E4F]">35 Regions</span>
              </div>

              <Globe3D />
            </div>
          </div>

          {/* 3. Realtime Broadcast & Presence (3D Mesh) */}
          <div 
            id="realtime" 
            className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/90 via-white/75 to-[#FFFDF9]/60 hover:from-white hover:via-white/90 hover:to-[#FFF9F6]/85 backdrop-blur-xl border border-white/80 hover:border-[#8B1E3F]/35 shadow-[0_8px_30px_-6px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_24px_48px_-12px_rgba(139,30,63,0.14),0_6px_16px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 overflow-hidden"
          >
            {/* Top glass reflection gradient with dynamic shift */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(139,30,63,0.08),transparent_70%)] opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/90 border border-[#E8DDD2]/80 backdrop-blur-sm flex items-center justify-center text-[#8B1E3F] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] group-hover:scale-105 transition-transform">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors">Realtime Data Mesh</h3>
                    <p className="text-[11px] text-[#685559]">Postgres CDC stream broadcasting changes to millions of clients</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[#8B1E3F]">WebSockets</span>
              </div>

              <RealtimeWave3D />
            </div>
          </div>

          {/* 4. pgvector Semantic Search (3D Vector Point Cloud) */}
          <div 
            id="ai-vector" 
            className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/90 via-white/75 to-[#FFFDF9]/60 hover:from-white hover:via-white/90 hover:to-[#FFF9F6]/85 backdrop-blur-xl border border-white/80 hover:border-[#8B1E3F]/35 shadow-[0_8px_30px_-6px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_24px_48px_-12px_rgba(139,30,63,0.14),0_6px_16px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between space-y-4 overflow-hidden"
          >
            {/* Top glass reflection gradient with dynamic shift */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(139,30,63,0.08),transparent_70%)] opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/90 border border-[#E8DDD2]/80 backdrop-blur-sm flex items-center justify-center text-[#8B1E3F] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] group-hover:scale-105 transition-transform">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors">pgvector AI Engine</h3>
                    <p className="text-[11px] text-[#685559]">High-dimensional embedding indexing with HNSW and IVFFlat</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[#8B1E3F]">1536 Dim</span>
              </div>

              <VectorCloud3D />
            </div>
          </div>

        </div>

        {/* Bottom Tier: Storage & Authentication Cards with Tactile Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Storage Engine */}
          <div 
            id="storage" 
            className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/90 via-white/75 to-[#FFFDF9]/60 hover:from-white hover:via-white/90 hover:to-[#FFF9F6]/85 backdrop-blur-xl border border-white/80 hover:border-[#8B1E3F]/35 shadow-[0_8px_30px_-6px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_24px_48px_-12px_rgba(139,30,63,0.14),0_6px_16px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-300 ease-out space-y-4 overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(40,110,79,0.06),transparent_70%)] opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/90 border border-[#E8DDD2]/80 backdrop-blur-sm flex items-center justify-center text-[#8B1E3F] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] group-hover:scale-105 transition-transform">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors">Object Storage</h3>
                  <p className="text-[11px] text-[#685559]">S3-compatible global asset storage with image transformation</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#286E4F]">Multi-CDN</span>
            </div>

            <div className="relative z-10 grid grid-cols-4 gap-2">
              {[
                { name: 'Media Assets', size: '24.8 GB' },
                { name: 'User Avatars', size: '1.2 GB' },
                { name: 'DB Backups', size: '118 GB' },
                { name: 'Documents', size: '8.4 GB' },
              ].map((item) => (
                <div key={item.name} className="p-3 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 hover:border-[#8B1E3F]/30 backdrop-blur-xs text-center shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200">
                  <div className="text-xs font-bold text-[#2B1D20] truncate">{item.name}</div>
                  <div className="text-[10px] text-[#8B1E3F] font-mono mt-0.5">{item.size}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Authentication & RLS */}
          <div 
            id="security" 
            className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/90 via-white/75 to-[#FFFDF9]/60 hover:from-white hover:via-white/90 hover:to-[#FFF9F6]/85 backdrop-blur-xl border border-white/80 hover:border-[#8B1E3F]/35 shadow-[0_8px_30px_-6px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_24px_48px_-12px_rgba(139,30,63,0.14),0_6px_16px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-300 ease-out space-y-4 overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(139,30,63,0.08),transparent_70%)] opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/90 border border-[#E8DDD2]/80 backdrop-blur-sm flex items-center justify-center text-[#8B1E3F] shadow-[0_2px_6px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] group-hover:scale-105 transition-transform">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors">Auth & Access Policies</h3>
                  <p className="text-[11px] text-[#685559]">Cryptographic user authentication with granular Row Level Security</p>
                </div>
              </div>
              <button
                onClick={() => openAuthModal('signin')}
                className="text-xs font-semibold text-[#8B1E3F] hover:underline"
              >
                Sign In
              </button>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 hover:border-[#8B1E3F]/30 backdrop-blur-xs text-center shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-xs font-bold text-[#2B1D20]">SSO / OAuth</div>
                <div className="text-[10px] text-[#685559] mt-0.5">GitHub, Google</div>
              </div>
              <div className="p-3 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 hover:border-[#8B1E3F]/30 backdrop-blur-xs text-center shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-xs font-bold text-[#2B1D20]">Magic Links</div>
                <div className="text-[10px] text-[#685559] mt-0.5">Passwordless</div>
              </div>
              <div className="p-3 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 hover:border-[#8B1E3F]/30 backdrop-blur-xs text-center shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-xs font-bold text-[#2B1D20]">MFA & Biometrics</div>
                <div className="text-[10px] text-[#286E4F] mt-0.5">Hardware Keys</div>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* Production Starter Systems */}
      <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-5">
        <h2 className="text-base font-bold text-[#2B1D20]">Production Starters</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { title: 'SaaS Billing & Subscriptions', desc: 'Pre-configured customer portal and auth state.' },
            { title: 'Enterprise Portal', desc: 'Multi-tenant workspaces with role-based policies.' },
            { title: 'AI Assistant & pgvector', desc: 'Vector memory indexing with semantic search.' },
            { title: 'Collaborative Realtime Canvas', desc: 'Live presence tracking and broadcast syncing.' },
            { title: 'Mobile App Foundation', desc: 'Cross-platform session persistence and offline sync.' },
            { title: 'Edge Microservices', desc: 'Globally distributed compute with sub-50ms response.' }
          ].map((t, idx) => (
            <div 
              key={idx}
              onClick={() => openAuthModal('signup')}
              className="relative p-4 rounded-xl bg-gradient-to-b from-white/90 via-white/75 to-[#FFFDF9]/60 hover:from-white hover:via-white/90 hover:to-[#FFF9F6]/85 backdrop-blur-lg border border-white/80 hover:border-[#8B1E3F]/40 shadow-[0_4px_16px_-4px_rgba(43,29,32,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:shadow-[0_16px_32px_-8px_rgba(139,30,63,0.12),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer group overflow-hidden"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,30,63,0.08),transparent_70%)] opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
              <div className="relative z-10">
                <h3 className="text-xs font-bold text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-[#685559] mt-1">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA with Floating Glassmorphic Card & Tactile Hover */}
      <section className="py-14 px-4">
        <div className="group max-w-3xl mx-auto rounded-3xl bg-gradient-to-b from-white/95 via-white/80 to-[#FFFDF9]/70 hover:from-white hover:via-white/90 hover:to-[#FFF9F6]/85 backdrop-blur-2xl border border-white/90 hover:border-[#8B1E3F]/35 shadow-[0_20px_50px_-12px_rgba(139,30,63,0.08),0_4px_12px_rgba(43,29,32,0.03),inset_0_1px_1px_rgba(255,255,255,1)] hover:shadow-[0_30px_65px_-12px_rgba(139,30,63,0.16),0_8px_20px_rgba(43,29,32,0.04),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-300 ease-out p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,30,63,0.1),transparent_70%)] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B1D20] tracking-tight">
              Build in a weekend, scale to millions
            </h2>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => openAuthModal('signup')}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white shadow-[0_4px_16px_-4px_rgba(139,30,63,0.35)] hover:shadow-[0_8px_20px_-4px_rgba(139,30,63,0.45)] hover:-translate-y-0.5 transition-all"
              >
                <span>Start your project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveView('overview')}
                className="px-4 py-2.5 rounded-xl border border-white/80 bg-white/70 hover:bg-white/90 backdrop-blur-md text-xs font-semibold text-[#2B1D20] shadow-[0_2px_8px_-2px_rgba(43,29,32,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] hover:-translate-y-0.5 transition-all"
              >
                Launch Studio
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-[#685559] pt-4">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#286E4F]" />
                <span>SOC2 Type 2</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#286E4F]" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#286E4F]" />
                <span>ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8DDD2]/70 bg-[#FAF7F2]/80 backdrop-blur-md py-8 px-4 sm:px-6 text-xs text-[#685559]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#8B1E3F] text-white flex items-center justify-center text-[9px] font-bold">
              <Zap className="w-2.5 h-2.5 fill-current" />
            </div>
            <span className="font-bold text-[#2B1D20]">Chocobase Studio</span>
            <span className="text-[#9B888C]">2026 Chocobase Inc.</span>
          </div>

          <div className="flex items-center gap-4 text-[#685559]">
            <button onClick={() => setActiveView('overview')} className="hover:text-[#2B1D20]">Studio</button>
            <button onClick={() => openAuthModal('signin')} className="hover:text-[#2B1D20]">Sign In</button>
            <button onClick={() => openAuthModal('signup')} className="hover:text-[#8B1E3F] font-semibold">Sign Up</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
