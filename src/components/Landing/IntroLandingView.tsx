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
  Check, 
  Copy, 
  Boxes, 
  Github, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  MousePointer2,
  Table,
  Layers,
  Gamepad2,
  Code2
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';

export const IntroLandingView: React.FC = () => {
  const { 
    openAuthModal, 
    setActiveView, 
    currentUser, 
    signOut,
    showNotification 
  } = useSupabase();

  const [activeFramework, setActiveFramework] = useState<'react' | 'nextjs' | 'flutter' | 'python' | 'svelte' | 'vue'>('react');
  const [activeDashboardTab, setActiveDashboardTab] = useState<'table' | 'sql' | 'rls'>('table');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Realtime cursor state
  const [realtimePosition, setRealtimePosition] = useState({ x: 50, y: 35 });
  const [realtimeClicks, setRealtimeClicks] = useState(8);

  // Vector test state
  const [vectorQuery, setVectorQuery] = useState('semantic search over documents');
  const [vectorSimilarity, setVectorSimilarity] = useState(0.942);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    showNotification('Copied code snippet');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const frameworkSnippets: Record<string, string> = {
    react: `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default function App() {
  const [todos, setTodos] = useState([])

  useEffect(() => {
    supabase.from('todos').select('*')
      .then(({ data }) => setTodos(data))
  }, [])

  return <TodoList items={todos} />
}`,
    nextjs: `import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: posts } = await supabase.from('posts').select('*')
  return <PostsFeed initialData={posts} />
}`,
    flutter: `import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  await Supabase.initialize(
    url: 'https://xyzcompany.supabase.co',
    anonKey: 'public-anon-key',
  );
  runApp(const MyApp());
}

final supabase = Supabase.instance.client;
final data = await supabase.from('countries').select();`,
    python: `from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

response = supabase.table("countries").select("*").execute()
print(response.data)`,
    svelte: `<script>
  import { supabase } from '$lib/supabaseClient'
  import { onMount } from 'svelte'

  let profiles = []
  onMount(async () => {
    const { data } = await supabase.from('profiles').select()
    profiles = data
  })
</script>

<ul>
  {#each profiles as profile}
    <li>{profile.username}</li>
  {/each}
</ul>`,
    vue: `<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'

const products = ref([])

onMounted(async () => {
  const { data } = await supabase.from('products').select('*')
  products.value = data
})
</script>`
  };

  return (
    <div id="supabase-intro-landing" className="min-h-screen bg-[#FAF7F2] text-[#2B1D20] font-sans antialiased">
      
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

            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-[#685559]">
              <a href="#postgres" className="hover:text-[#2B1D20] transition-colors">Database</a>
              <a href="#auth" className="hover:text-[#2B1D20] transition-colors">Auth</a>
              <a href="#functions" className="hover:text-[#2B1D20] transition-colors">Functions</a>
              <a href="#realtime" className="hover:text-[#2B1D20] transition-colors">Realtime</a>
              <a href="#storage" className="hover:text-[#2B1D20] transition-colors">Storage</a>
              <a href="#templates" className="hover:text-[#2B1D20] transition-colors">Templates</a>
              <button onClick={() => setActiveView('api_docs')} className="hover:text-[#2B1D20] transition-colors">
                Docs
              </button>
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

      {/* Hero Section */}
      <section className="pt-14 pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#E8DDD2] text-xs font-medium text-[#685559] mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#8B1E3F]" />
          <span>General Availability</span>
          <span className="text-[#8B1E3F] font-semibold flex items-center gap-0.5 ml-1">
            Explore <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#2B1D20] tracking-tight leading-tight">
          Build in a weekend <br />
          <span className="text-[#8B1E3F]">Scale to millions</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-[#685559] max-w-xl mx-auto">
          Postgres database with Auth, Data APIs, Edge Functions, Realtime, and Storage.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
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
            <span>Live Studio</span>
          </button>
        </div>
      </section>

      {/* Feature Blocks */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-5 pb-20">
        
        {/* 1. Postgres Database */}
        <div id="postgres" className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#8B1E3F]" />
              <h2 className="text-sm font-bold text-[#2B1D20]">Postgres Database</h2>
            </div>
            <span className="text-xs text-[#685559] font-mono">PostgreSQL 16.4</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] space-y-1.5">
              <div className="flex items-center justify-between text-[#8B1E3F] font-bold border-b border-[#E8DDD2] pb-1">
                <span>public.users</span>
                <span className="text-[10px] text-[#286E4F]">RLS</span>
              </div>
              <div className="text-[11px] text-[#685559] space-y-0.5">
                <div className="flex justify-between"><span>id</span><span className="text-[#9B888C]">uuid</span></div>
                <div className="flex justify-between"><span>email</span><span className="text-[#9B888C]">text</span></div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] space-y-1.5">
              <div className="flex items-center justify-between text-[#8B1E3F] font-bold border-b border-[#E8DDD2] pb-1">
                <span>public.posts</span>
                <span className="text-[10px] text-[#286E4F]">RLS</span>
              </div>
              <div className="text-[11px] text-[#685559] space-y-0.5">
                <div className="flex justify-between"><span>title</span><span className="text-[#9B888C]">text</span></div>
                <div className="flex justify-between"><span>embedding</span><span className="text-[#9B888C]">vector</span></div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] space-y-1.5">
              <div className="flex items-center justify-between text-[#8B1E3F] font-bold border-b border-[#E8DDD2] pb-1">
                <span>public.events</span>
                <span className="text-[10px] text-[#3B5B88]">Timescale</span>
              </div>
              <div className="text-[11px] text-[#685559] space-y-0.5">
                <div className="flex justify-between"><span>event</span><span className="text-[#9B888C]">text</span></div>
                <div className="flex justify-between"><span>meta</span><span className="text-[#9B888C]">jsonb</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Authentication */}
        <div id="auth" className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#8B1E3F]" />
              <h2 className="text-sm font-bold text-[#2B1D20]">Authentication & Row Level Security</h2>
            </div>
            <button 
              onClick={() => openAuthModal('signin')}
              className="text-xs font-semibold text-[#8B1E3F] hover:underline"
            >
              Test Login
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              onClick={() => openAuthModal('signin')}
              className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] hover:border-[#8B1E3F] cursor-pointer transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#2B1D20]">vinaygk219@gmail.com</span>
                <span className="text-[10px] font-mono text-[#286E4F]">Verified</span>
              </div>
              <span className="text-[11px] text-[#685559] font-mono">Role: admin</span>
            </div>

            <div 
              onClick={() => openAuthModal('signin')}
              className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] hover:border-[#8B1E3F] cursor-pointer transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#2B1D20]">alex160198@gmail.com</span>
                <span className="text-[10px] font-mono text-[#286E4F]">Verified</span>
              </div>
              <span className="text-[11px] text-[#685559] font-mono">Role: developer</span>
            </div>
          </div>
        </div>

        {/* 3. Edge Functions */}
        <div id="functions" className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#8B1E3F]" />
              <h2 className="text-sm font-bold text-[#2B1D20]">Edge Functions</h2>
            </div>
            <span className="text-xs text-[#685559] font-mono">Deno 2.1</span>
          </div>

          <div className="rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] p-3.5 font-mono text-xs space-y-1">
            <div className="text-[#685559] font-bold pb-1 border-b border-[#E8DDD2]">
              $ supabase functions deploy ai-search
            </div>
            <div className="text-[#286E4F]">Bundled index.ts in 42ms (35 regions active)</div>
            <div className="text-[#8B1E3F]">URL: https://project.supabase.co/functions/v1/ai-search</div>
          </div>
        </div>

        {/* 4. Realtime */}
        <div id="realtime" className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#8B1E3F]" />
              <h2 className="text-sm font-bold text-[#2B1D20]">Realtime Data & Presence</h2>
            </div>
            <span className="text-xs font-mono text-[#8B1E3F]">{realtimeClicks} events</span>
          </div>

          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setRealtimePosition({
                x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
                y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
              });
              setRealtimeClicks(prev => prev + 1);
            }}
            className="h-32 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] relative overflow-hidden cursor-crosshair flex items-center justify-center text-xs text-[#685559]"
          >
            <span>Click inside box to test broadcast presence</span>

            <div 
              className="absolute pointer-events-none transition-all duration-150 flex items-center gap-1"
              style={{ left: `${realtimePosition.x}%`, top: `${realtimePosition.y}%` }}
            >
              <MousePointer2 className="w-3.5 h-3.5 text-[#8B1E3F] fill-[#8B1E3F]" />
              <span className="text-[10px] font-mono bg-[#8B1E3F] text-white px-1.5 py-0.2 rounded">
                vinay
              </span>
            </div>
          </div>
        </div>

        {/* 5. Vector & Storage & APIs in a 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vector */}
          <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#8B1E3F]" />
              <h3 className="text-xs font-bold text-[#2B1D20]">pgvector</h3>
            </div>
            <input
              type="text"
              value={vectorQuery}
              onChange={(e) => {
                setVectorQuery(e.target.value);
                setVectorSimilarity(+(0.91 + Math.random() * 0.08).toFixed(3));
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono"
            />
            <div className="text-[11px] font-mono text-[#8B1E3F]">
              Cosine distance: {vectorSimilarity}
            </div>
          </div>

          {/* Storage */}
          <div id="storage" className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#8B1E3F]" />
              <h3 className="text-xs font-bold text-[#2B1D20]">Storage</h3>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {['avatars', 'images', 'backups', 'docs'].map((f) => (
                <div key={f} className="p-2 rounded bg-[#FAF7F2] border border-[#E8DDD2] text-[10px] font-mono text-center truncate">
                  {f}
                </div>
              ))}
            </div>
            <div className="text-[11px] font-mono text-[#286E4F]">S3 Compatible API</div>
          </div>

          {/* Data APIs */}
          <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#8B1E3F]" />
              <h3 className="text-xs font-bold text-[#2B1D20]">Auto REST & GraphQL</h3>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-[#685559]">
              <div>GET /rest/v1/posts</div>
              <div>POST /rest/v1/users</div>
              <div>GET /rest/v1/analytics</div>
            </div>
            <div className="text-[11px] font-mono text-[#8B1E3F]">OpenAPI Spec Gen</div>
          </div>
        </div>
      </section>

      {/* Fast Growing Companies Strip */}
      <section className="border-y border-[#E8DDD2] bg-[#FFFDF9] py-8 px-4 text-center">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-[#685559]">
          <span>Lovable</span>
          <span>Mozilla</span>
          <span>PwC</span>
          <span>Figma</span>
          <span>GitHub</span>
          <span>Resend</span>
          <span>LangChain</span>
          <span>1Password</span>
        </div>
      </section>

      {/* Code & Framework Selector */}
      <section className="py-14 px-4 sm:px-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#2B1D20]">Client Libraries</h2>
          <div className="flex items-center gap-1.5">
            {(['react', 'nextjs', 'flutter', 'python', 'svelte', 'vue'] as const).map((fw) => (
              <button
                key={fw}
                onClick={() => setActiveFramework(fw)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  activeFramework === fw 
                    ? 'bg-[#8B1E3F] text-white shadow-2xs' 
                    : 'bg-[#FFFDF9] border border-[#E8DDD2] text-[#685559] hover:text-[#2B1D20]'
                }`}
              >
                {fw === 'nextjs' ? 'Next' : fw}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#685559]">{activeFramework}.code</span>
            <button
              onClick={() => copyCode(frameworkSnippets[activeFramework], activeFramework)}
              className="flex items-center gap-1 text-[#8B1E3F] font-semibold hover:underline"
            >
              {copiedKey === activeFramework ? <Check className="w-3.5 h-3.5 text-[#286E4F]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === activeFramework ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#8B1E3F] overflow-x-auto select-all leading-relaxed">
            {frameworkSnippets[activeFramework]}
          </pre>
        </div>
      </section>

      {/* Production Starter Templates */}
      <section id="templates" className="py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-5">
        <h2 className="text-base font-bold text-[#2B1D20]">Starter Templates</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { title: 'Stripe SaaS Starter', desc: 'Subscriptions, auth, and billing portal.' },
            { title: 'Next.js App Router', desc: 'Cookie SSR auth and Server Actions.' },
            { title: 'AI Chatbot & pgvector', desc: 'Embeddings RAG with streaming responses.' },
            { title: 'LangChain Agents', desc: 'Vector search and tool calling pipelines.' },
            { title: 'Flutter Mobile App', desc: 'Cross-platform mobile auth and realtime.' },
            { title: 'Expo React Native', desc: 'Secure session caching on iOS and Android.' }
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

          <div className="flex items-center justify-center gap-4 text-xs text-[#685559] pt-4">
            <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#286E4F]" /> SOC2 Type 2</div>
            <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#286E4F]" /> HIPAA Ready</div>
            <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#286E4F]" /> ISO 27001</div>
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
