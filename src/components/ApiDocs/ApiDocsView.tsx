import React, { useState } from 'react';
import { 
  FileCode, 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Database,
  Send,
  Zap,
  BookOpen,
  Search,
  Bot,
  Sparkles,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Key,
  FolderGit2,
  Cpu,
  Boxes,
  Compass,
  MonitorSmartphone,
  Server
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';

interface FrameworkQuickstart {
  id: string;
  name: string;
  category: 'web' | 'mobile' | 'backend';
  iconColor: string;
  snippet: string;
  installCmd: string;
}

const frameworks: FrameworkQuickstart[] = [
  { id: 'nextjs', name: 'Next.js', category: 'web', iconColor: '#000000', installCmd: 'npm install @chocobase/ssr @chocobase/chocobase-js', snippet: `import { createServerClient } from '@chocobase/ssr'\nimport { cookies } from 'next/headers'\n\nexport async function createClient() {\n  const cookieStore = await cookies()\n  return createServerClient(\n    process.env.NEXT_PUBLIC_CHOCOBASE_URL!,\n    process.env.NEXT_PUBLIC_CHOCOBASE_ANON_KEY!,\n    { cookies: { getAll: () => cookieStore.getAll() } }\n  )\n}` },
  { id: 'react', name: 'React', category: 'web', iconColor: '#61DAFB', installCmd: 'npm install @chocobase/chocobase-js', snippet: `import { createClient } from '@chocobase/chocobase-js'\n\nexport const chocobase = createClient(\n  'https://djyephboyfoglucmcopn.chocobase.co',\n  'sb_anon_public_key_here'\n)` },
  { id: 'nuxt', name: 'Nuxt', category: 'web', iconColor: '#00DC82', installCmd: 'npm install @chocobase/chocobase-js @nuxtjs/supabase', snippet: `export default defineNuxtConfig({\n  modules: ['@nuxtjs/supabase'],\n  supabase: {\n    redirect: false,\n    url: 'https://djyephboyfoglucmcopn.chocobase.co'\n  }\n})` },
  { id: 'astro', name: 'Astro', category: 'web', iconColor: '#FF5D01', installCmd: 'npm install @chocobase/chocobase-js', snippet: `import { createClient } from '@chocobase/chocobase-js'\n\nexport const chocobase = createClient(\n  import.meta.env.CHOCOBASE_URL,\n  import.meta.env.CHOCOBASE_ANON_KEY\n)` },
  { id: 'vue', name: 'Vue', category: 'web', iconColor: '#42B883', installCmd: 'npm install @chocobase/chocobase-js', snippet: `import { createClient } from '@chocobase/chocobase-js'\nconst chocobase = createClient(url, anonKey)` },
  { id: 'hono', name: 'Hono', category: 'backend', iconColor: '#E36002', installCmd: 'npm install hono @chocobase/chocobase-js', snippet: `import { Hono } from 'hono'\nimport { createClient } from '@chocobase/chocobase-js'\n\nconst app = new Hono()\napp.get('/users', async (c) => {\n  const chocobase = createClient(c.env.URL, c.env.KEY)\n  const { data } = await chocobase.from('profiles').select('*')\n  return c.json(data)\n})` },
  { id: 'expo', name: 'Expo React Native', category: 'mobile', iconColor: '#000020', installCmd: 'npx expo install @chocobase/chocobase-js @react-native-async-storage/async-storage', snippet: `import { createClient } from '@chocobase/chocobase-js'\nimport AsyncStorage from '@react-native-async-storage/async-storage'\n\nexport const chocobase = createClient(url, anonKey, {\n  auth: { storage: AsyncStorage, autoRefreshToken: true }\n})` },
  { id: 'flutter', name: 'Flutter', category: 'mobile', iconColor: '#02569B', installCmd: 'flutter pub add chocobase_flutter', snippet: `await Chocobase.initialize(\n  url: 'https://djyephboyfoglucmcopn.chocobase.co',\n  anonKey: 'sb_anon_key',\n);` },
  { id: 'swiftui', name: 'iOS SwiftUI', category: 'mobile', iconColor: '#F05138', installCmd: 'swift package add Chocobase', snippet: `import Chocobase\n\nlet client = ChocobaseClient(\n  chocobaseURL: URL(string: "https://djyephboyfoglucmcopn.chocobase.co")!,\n  chocobaseKey: "sb_anon_key"\n)` },
  { id: 'sveltekit', name: 'SvelteKit', category: 'web', iconColor: '#FF3E00', installCmd: 'npm install @chocobase/ssr @chocobase/chocobase-js', snippet: `import { createServerClient } from '@chocobase/ssr'\n// Load function handler for hooks.server.ts` },
  { id: 'flask', name: 'Flask (Python)', category: 'backend', iconColor: '#000000', installCmd: 'pip install chocobase', snippet: `from chocobase import create_client\nchocobase = create_client("https://djyephboyfoglucmcopn.chocobase.co", "key")` },
  { id: 'laravel', name: 'Laravel PHP', category: 'backend', iconColor: '#FF2D20', installCmd: 'composer require chocobase/chocobase-php', snippet: `$chocobase = new \\Chocobase\\ChocobaseClient('https://...', 'key');` }
];

export const ApiDocsView: React.FC = () => {
  const { tables, projectSettings, showNotification, setIsCommandPaletteOpen } = useSupabase();
  const [docTab, setDocTab] = useState<'getting_started' | 'api_reference' | 'ai_tools'>('getting_started');
  const [selectedFramework, setSelectedFramework] = useState<FrameworkQuickstart>(frameworks[0]);
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || 'tbl-posts');
  const [selectedLang, setSelectedLang] = useState<'js' | 'curl' | 'python' | 'graphql'>('js');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);

  const currentTable = tables.find(t => t.id === selectedTableId) || tables[0];

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    showNotification('Snippet copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getSnippets = (tableName: string) => {
    return {
      readAll: {
        js: `// Fetch all records from '${tableName}'\nconst { data, error } = await chocobase\n  .from('${tableName}')\n  .select('*')\n\nif (error) console.error(error)\nelse console.log(data)`,
        curl: `curl -X GET '${projectSettings.apiUrl}/rest/v1/${tableName}?select=*' \\\n  -H 'apikey: ${projectSettings.anonKey}' \\\n  -H 'Authorization: Bearer ${projectSettings.anonKey}'`,
        python: `# Python client for '${tableName}'\nresponse = chocobase.table('${tableName}').select("*").execute()\nprint(response.data)`,
        graphql: `query Get${tableName.charAt(0).toUpperCase() + tableName.slice(1)} {\n  ${tableName}Collection(first: 20) {\n    edges {\n      node {\n        id\n        created_at\n      }\n    }\n  }\n}`
      },
      insert: {
        js: `// Insert a new record into '${tableName}'\nconst { data, error } = await chocobase\n  .from('${tableName}')\n  .insert([\n    { title: 'New Entry', author_id: 'user_123' }\n  ])\n  .select()`,
        curl: `curl -X POST '${projectSettings.apiUrl}/rest/v1/${tableName}' \\\n  -H 'apikey: ${projectSettings.anonKey}' \\\n  -H 'Authorization: Bearer ${projectSettings.anonKey}' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Prefer: return=representation' \\\n  -d '{"title": "New Entry"}'`,
        python: `response = chocobase.table('${tableName}').insert({"title": "New Entry"}).execute()`,
        graphql: `mutation Create${tableName.charAt(0).toUpperCase() + tableName.slice(1)} {\n  insertInto${tableName}Collection(objects: [{ title: "New Entry" }]) {\n    records {\n      id\n    }\n  }\n}`
      }
    };
  };

  const snippets = currentTable ? getSnippets(currentTable.name) : null;

  return (
    <div id="docs-guides-container" className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#FAF7F2] text-[#2B1D20] overflow-hidden">
      
      {/* Top Docs Global Header (Screenshot 4) */}
      <header className="h-12 border-b border-[#E8DDD2] bg-[#FFFDF9] px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button 
            onClick={() => setDocTab('getting_started')}
            className={`pb-1 border-b-2 transition-colors ${docTab === 'getting_started' ? 'border-[#8B1E3F] text-[#8B1E3F]' : 'border-transparent text-[#685559] hover:text-[#2B1D20]'}`}
          >
            Start
          </button>
          <button 
            onClick={() => setDocTab('api_reference')}
            className={`pb-1 border-b-2 transition-colors ${docTab === 'api_reference' ? 'border-[#8B1E3F] text-[#8B1E3F]' : 'border-transparent text-[#685559] hover:text-[#2B1D20]'}`}
          >
            REST Reference
          </button>
          <button 
            onClick={() => setDocTab('ai_tools')}
            className={`pb-1 border-b-2 transition-colors ${docTab === 'ai_tools' ? 'border-[#8B1E3F] text-[#8B1E3F]' : 'border-transparent text-[#685559] hover:text-[#2B1D20]'}`}
          >
            AI & MCP
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#685559] hover:text-[#2B1D20]"
          >
            <Search className="w-3.5 h-3.5 text-[#8B1E3F]" />
            <span>Search docs...</span>
            <kbd className="text-[10px] font-mono bg-white px-1 rounded border border-[#E8DDD2]">Ctrl K</kbd>
          </button>
        </div>
      </header>

      {/* Main 3-Column Docs Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Docs Navigation Sidebar */}
        <aside className="w-64 border-r border-[#E8DDD2] bg-[#FFFDF9] flex flex-col flex-shrink-0 overflow-y-auto p-4 space-y-6 scrollbar-thin text-xs">
          <div>
            <span className="font-bold text-[10px] uppercase tracking-wider text-[#9B888C] block mb-2">GETTING STARTED</span>
            <div className="space-y-1">
              <button onClick={() => setDocTab('getting_started')} className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#FDF0F3] text-[#8B1E3F] font-semibold">
                Overview & Guides
              </button>
              <button className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#685559] hover:bg-[#FAF7F2]">
                Local Development
              </button>
              <button className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#685559] hover:bg-[#FAF7F2]">
                Architecture
              </button>
              <button className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#685559] hover:bg-[#FAF7F2]">
                Migrating to new API keys
              </button>
            </div>
          </div>

          <div>
            <span className="font-bold text-[10px] uppercase tracking-wider text-[#9B888C] block mb-2">FRAMEWORK QUICKSTARTS</span>
            <div className="space-y-0.5">
              {frameworks.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFramework(f);
                    setDocTab('getting_started');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedFramework.id === f.id ? 'bg-[#FAF7F2] text-[#8B1E3F] font-semibold' : 'text-[#685559] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span>{f.name}</span>
                  <span className="text-[9px] uppercase font-mono text-[#9B888C]">{f.category}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Main Guide Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin max-w-4xl">
          {docTab === 'getting_started' && (
            <div className="space-y-8 animate-in fade-in duration-150">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#2B1D20]">Getting Started</h1>
                <p className="text-[#685559] text-sm mt-1.5">
                  Guides, tutorials, and quickstarts for building with Chocobase Postgres, Auth, Storage, and Realtime.
                </p>
              </div>

              {/* 3 Featured Guide Cards (Screenshot 4) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  onClick={() => setDocTab('ai_tools')}
                  className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-2xs hover:border-[#8B1E3F]/40 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center text-[#8B1E3F] mb-3 group-hover:scale-105 transition-transform">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors">Build with AI tools</h3>
                  <p className="text-xs text-[#685559] mt-1">Develop with Chocobase AI-first using plugins, MCP, and agent skills.</p>
                </div>

                <div 
                  onClick={() => setDocTab('api_reference')}
                  className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-2xs hover:border-[#8B1E3F]/40 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center text-[#8B1E3F] mb-3 group-hover:scale-105 transition-transform">
                    <Key className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors">API Keys</h3>
                  <p className="text-xs text-[#685559] mt-1">Learn about anon keys, service role keys, and secure JWT rotation.</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-2xs hover:border-[#8B1E3F]/40 transition-all cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-center text-[#8B1E3F] mb-3 group-hover:scale-105 transition-transform">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#2B1D20] group-hover:text-[#8B1E3F] transition-colors">Local Development</h3>
                  <p className="text-xs text-[#685559] mt-1">Use the Chocobase CLI to develop offline and run branch migrations.</p>
                </div>
              </div>

              {/* Selected Framework Quickstart Interactive Snippet (Screenshot 4) */}
              <div className="bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#8B1E3F] text-white flex items-center justify-center font-bold text-xs">
                      {selectedFramework.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#2B1D20]">{selectedFramework.name} Quickstart</h3>
                      <p className="text-xs text-[#685559]">Connect your {selectedFramework.name} app in less than 2 minutes.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => copyCode(selectedFramework.snippet, 'framework-code')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs font-semibold text-[#2B1D20]"
                  >
                    {copiedKey === 'framework-code' ? <Check className="w-3.5 h-3.5 text-[#286E4F]" /> : <Copy className="w-3.5 h-3.5 text-[#8B1E3F]" />}
                    <span>{copiedKey === 'framework-code' ? 'Copied' : 'Copy code'}</span>
                  </button>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DDD2] font-mono text-xs text-[#2B1D20] flex items-center justify-between">
                  <span>{selectedFramework.installCmd}</span>
                  <button onClick={() => copyCode(selectedFramework.installCmd, 'install-cmd')} className="text-[#8B1E3F] hover:underline font-sans font-semibold">
                    Copy
                  </button>
                </div>

                <pre className="p-4 bg-[#FFFDF9] rounded-xl border border-[#E8DDD2] font-mono text-xs text-[#2B1D20] overflow-x-auto leading-relaxed">
                  {selectedFramework.snippet}
                </pre>
              </div>

              {/* Frameworks Grid */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#2B1D20]">All Framework Quickstarts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {frameworks.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFramework(f)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedFramework.id === f.id
                          ? 'border-[#8B1E3F] bg-[#FDF0F3] text-[#8B1E3F] shadow-2xs font-semibold'
                          : 'border-[#E8DDD2] bg-[#FFFDF9] text-[#2B1D20] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <span className="text-xs font-bold block">{f.name}</span>
                      <span className="text-[10px] text-[#685559] uppercase">{f.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {docTab === 'api_reference' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#2B1D20]">REST & GraphQL Schema API</h2>
                  <p className="text-xs text-[#685559]">Auto-generated PostgREST routes for table: <code className="font-bold text-[#8B1E3F]">{currentTable.name}</code></p>
                </div>

                <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2]">
                  {(['js', 'curl', 'python', 'graphql'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${
                        selectedLang === lang ? 'bg-[#8B1E3F] text-white shadow-2xs' : 'text-[#685559] hover:text-[#2B1D20]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {snippets && (
                <div className="space-y-4">
                  <div className="bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2B1D20]">Read / Query Rows</span>
                      <button
                        onClick={() => copyCode(snippets.readAll[selectedLang], 'read')}
                        className="text-xs text-[#8B1E3F] hover:underline font-semibold"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DDD2] text-xs font-mono text-[#2B1D20] overflow-x-auto leading-relaxed">
                      {snippets.readAll[selectedLang]}
                    </pre>
                  </div>

                  <div className="bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2B1D20]">Insert New Row</span>
                      <button
                        onClick={() => copyCode(snippets.insert[selectedLang], 'insert')}
                        className="text-xs text-[#8B1E3F] hover:underline font-semibold"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DDD2] text-xs font-mono text-[#2B1D20] overflow-x-auto leading-relaxed">
                      {snippets.insert[selectedLang]}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {docTab === 'ai_tools' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl font-bold text-[#2B1D20]">AI & Model Context Protocol (MCP)</h2>
                <p className="text-xs text-[#685559]">Integrate Cursor, Claude Desktop, Gemini, or Windsurf directly with your Postgres cluster.</p>
              </div>

              <div className="p-6 bg-[#FFFDF9] border border-[#E8DDD2] rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-[#2B1D20]">Claude Desktop Configuration</h3>
                <p className="text-xs text-[#685559]">Add this configuration to your <code className="font-mono bg-[#FAF7F2] px-1 py-0.5 rounded border border-[#E8DDD2]">claude_desktop_config.json</code>:</p>
                <pre className="p-4 bg-[#FAF7F2] border border-[#E8DDD2] rounded-xl text-xs font-mono text-[#2B1D20] overflow-x-auto">
{`{
  "mcpServers": {
    "chocobase": {
      "command": "npx",
      "args": [
        "-y",
        "@chocobase/mcp-server",
        "--project-ref", "djyephboyfoglucmcopn",
        "--token", "sbp_your_secret_pat_here"
      ]
    }
  }
}`}
                </pre>
              </div>
            </div>
          )}
        </main>

        {/* Right AI Tools & Quick Actions Panel (Screenshot 4) */}
        <aside className="w-72 border-l border-[#E8DDD2] bg-[#FFFDF9] flex flex-col flex-shrink-0 p-5 space-y-6 overflow-y-auto scrollbar-thin text-xs">
          <div className="space-y-2">
            <span className="font-bold text-[10px] uppercase tracking-wider text-[#9B888C]">AI ACTIONS</span>
            
            <button
              onClick={() => {
                copyCode(document.body.innerText.slice(0, 1000), 'markdown-doc');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#2B1D20] font-medium transition-colors"
            >
              <span>Copy as Markdown</span>
              <Copy className="w-3.5 h-3.5 text-[#8B1E3F]" />
            </button>

            <button
              onClick={() => {
                window.open('https://chatgpt.com/?q=How+to+use+Chocobase+Postgres+with+' + selectedFramework.name, '_blank');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#2B1D20] font-medium transition-colors"
            >
              <span>Ask ChatGPT</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#685559]" />
            </button>

            <button
              onClick={() => {
                window.open('https://claude.ai/new?q=Chocobase+' + selectedFramework.name + '+guide', '_blank');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#E8DDD2] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#2B1D20] font-medium transition-colors"
            >
              <span>Ask Claude</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#685559]" />
            </button>
          </div>

          <div className="pt-4 border-t border-[#E8DDD2] space-y-2">
            <span className="font-bold text-[10px] uppercase tracking-wider text-[#9B888C]">FEEDBACK</span>
            <p className="text-xs text-[#685559]">Was this page helpful?</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFeedbackGiven(true);
                  setNotification({ type: 'success', message: 'Thanks for your feedback!' });
                }}
                className={`p-2 rounded-lg border border-[#E8DDD2] transition-colors ${feedbackGiven === true ? 'bg-[#EFF7F3] text-[#286E4F]' : 'bg-[#FAF7F2] text-[#685559] hover:text-[#2B1D20]'}`}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setFeedbackGiven(false);
                  setNotification({ type: 'info', message: 'We appreciate your input and will improve this doc.' });
                }}
                className={`p-2 rounded-lg border border-[#E8DDD2] transition-colors ${feedbackGiven === false ? 'bg-[#FDF0F3] text-[#8B1E3F]' : 'bg-[#FAF7F2] text-[#685559] hover:text-[#2B1D20]'}`}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
