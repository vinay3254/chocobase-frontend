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
  CheckCircle
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { Hero3DCanvas } from './Hero3DCanvas';
import { Globe3D } from './Globe3D';
import { VectorCloud3D } from './VectorCloud3D';
import { RealtimeWave3D } from './RealtimeWave3D';

export const IntroLandingView: React.FC = () => {
  const { 
    openAuthModal, 
    setActiveView, 
    currentUser, 
    signOut 
  } = useSupabase();

  const [activeTier, setActiveTier] = useState<'primary' | 'replica' | 'analytics'>('primary');

  return (
    <div id="supabase-intro-landing" className="min-h-screen bg-[#FAF7F2] text-[#2B1D20] font-sans antialiased selection:bg-[#8B1E3F] selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E8DDD2] bg-[#FAF7F2]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div 
              onClick={() => setActiveView('landing')} 
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#8B1E3F] flex items-center justify-center text-white shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#2B1D20]">supabase</span>
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
              onClick={() => setActiveView('overview')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#F4EFEA] text-xs font-semibold text-[#2B1D20] transition-colors shadow-2xs"
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
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#2B1D20] hover:bg-[#E8DDD2]/50 transition-colors"
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#E8DDD2] text-xs font-medium text-[#685559] shadow-2xs">
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white transition-all shadow-xs"
              >
                <span>Start your project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveView('overview')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#F4EFEA] text-xs font-semibold text-[#2B1D20] transition-colors shadow-2xs"
              >
                <span>Launch Studio</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E8DDD2]">
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

          {/* Right Column: 3D Interactive Canvas */}
          <div className="lg:col-span-7 h-[420px] rounded-3xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-sm overflow-hidden relative">
            <Hero3DCanvas />
          </div>
        </div>
      </section>

      {/* Fast Growing Companies Strip */}
      <section className="border-y border-[#E8DDD2] bg-[#FFFDF9] py-6 px-4">
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

        {/* 2-Column Grid of 3D Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. Postgres Database Engine */}
          <div id="database" className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center text-[#8B1E3F]">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2B1D20]">PostgreSQL Core</h3>
                    <p className="text-[11px] text-[#685559]">Dedicated Postgres with instant branching and connection pooling</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[#8B1E3F]">v16.4</span>
              </div>

              {/* Interactive 3D Tier Stack Selector */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {(['primary', 'replica', 'analytics'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTier(t)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      activeTier === t
                        ? 'border-[#8B1E3F] bg-[#FAF7F2] shadow-xs'
                        : 'border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="text-xs font-bold capitalize text-[#2B1D20]">{t}</div>
                    <div className="text-[10px] text-[#685559] mt-0.5">
                      {t === 'primary' ? 'Read / Write' : t === 'replica' ? 'Global Read' : 'OLAP Shard'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#8B1E3F]" />
                <span className="font-semibold text-[#2B1D20]">Cluster Status</span>
              </div>
              <span className="text-[#286E4F] font-semibold text-[11px]">Active • Zero Cold-Start</span>
            </div>
          </div>

          {/* 2. Global Edge Network (3D Globe) */}
          <div id="edge" className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center text-[#8B1E3F]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2B1D20]">Global Edge Network</h3>
                    <p className="text-[11px] text-[#685559]">Distributed runtime deployed across 35 worldwide regions</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[#286E4F]">35 Regions</span>
              </div>

              <Globe3D />
            </div>
          </div>

          {/* 3. Realtime Broadcast & Presence (3D Mesh) */}
          <div id="realtime" className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center text-[#8B1E3F]">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2B1D20]">Realtime Data Mesh</h3>
                    <p className="text-[11px] text-[#685559]">Postgres CDC stream broadcasting changes to millions of clients</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[#8B1E3F]">WebSockets</span>
              </div>

              <RealtimeWave3D />
            </div>
          </div>

          {/* 4. pgvector Semantic Search (3D Vector Point Cloud) */}
          <div id="ai-vector" className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center text-[#8B1E3F]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2B1D20]">pgvector AI Engine</h3>
                    <p className="text-[11px] text-[#685559]">High-dimensional embedding indexing with HNSW and IVFFlat</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-[#8B1E3F]">1536 Dim</span>
              </div>

              <VectorCloud3D />
            </div>
          </div>

        </div>

        {/* Bottom Tier: Storage & Authentication Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Storage Engine */}
          <div id="storage" className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center text-[#8B1E3F]">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2B1D20]">Object Storage</h3>
                  <p className="text-[11px] text-[#685559]">S3-compatible global asset storage with image transformation</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#286E4F]">Multi-CDN</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'Media Assets', size: '24.8 GB' },
                { name: 'User Avatars', size: '1.2 GB' },
                { name: 'DB Backups', size: '118 GB' },
                { name: 'Documents', size: '8.4 GB' },
              ].map((item) => (
                <div key={item.name} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-center">
                  <div className="text-xs font-bold text-[#2B1D20] truncate">{item.name}</div>
                  <div className="text-[10px] text-[#8B1E3F] font-mono mt-0.5">{item.size}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Authentication & RLS */}
          <div id="security" className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center text-[#8B1E3F]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2B1D20]">Auth & Access Policies</h3>
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

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-center">
                <div className="text-xs font-bold text-[#2B1D20]">SSO / OAuth</div>
                <div className="text-[10px] text-[#685559] mt-0.5">GitHub, Google</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-center">
                <div className="text-xs font-bold text-[#2B1D20]">Magic Links</div>
                <div className="text-[10px] text-[#685559] mt-0.5">Passwordless</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-center">
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
              className="p-4 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] hover:border-[#8B1E3F] transition-colors shadow-2xs cursor-pointer group"
            >
              <h3 className="text-xs font-bold text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors">
                {t.title}
              </h3>
              <p className="text-xs text-[#685559] mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#E8DDD2] bg-[#FFFDF9] py-14 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl font-extrabold text-[#2B1D20]">
            Build in a weekend, scale to millions
          </h2>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openAuthModal('signup')}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white shadow-xs"
            >
              <span>Start your project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveView('overview')}
              className="px-4 py-2.5 rounded-xl border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs font-semibold text-[#2B1D20]"
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
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8DDD2] bg-[#FAF7F2] py-8 px-4 sm:px-6 text-xs text-[#685559]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#8B1E3F] text-white flex items-center justify-center text-[9px] font-bold">
              <Zap className="w-2.5 h-2.5 fill-current" />
            </div>
            <span className="font-bold text-[#2B1D20]">Supabase Studio</span>
            <span className="text-[#9B888C]">2026 Supabase Inc.</span>
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
