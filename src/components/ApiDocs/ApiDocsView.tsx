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
  Zap
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';

export const ApiDocsView: React.FC = () => {
  const { tables, projectSettings, showNotification } = useSupabase();
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || 'tbl-posts');
  const [selectedLang, setSelectedLang] = useState<'js' | 'curl' | 'python' | 'graphql'>('js');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentTable = tables.find(t => t.id === selectedTableId) || tables[0];

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    showNotification('Code snippet copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getSnippets = (tableName: string) => {
    return {
      readAll: {
        js: `// Fetch all records from '${tableName}'\nconst { data, error } = await supabase\n  .from('${tableName}')\n  .select('*')\n\nif (error) console.error(error)\nelse console.log(data)`,
        curl: `curl -X GET '${projectSettings.apiUrl}/rest/v1/${tableName}?select=*' \\\n  -H 'apikey: ${projectSettings.anonKey}' \\\n  -H 'Authorization: Bearer ${projectSettings.anonKey}'`,
        python: `# Python client for '${tableName}'\nresponse = supabase.table('${tableName}').select("*").execute()\nprint(response.data)`,
        graphql: `query Get${tableName.charAt(0).toUpperCase() + tableName.slice(1)} {\n  ${tableName}Collection(first: 20) {\n    edges {\n      node {\n        id\n        created_at\n      }\n    }\n  }\n}`
      },
      insert: {
        js: `// Insert a new record into '${tableName}'\nconst { data, error } = await supabase\n  .from('${tableName}')\n  .insert([\n    { title: 'New Entry', author_id: 'user_123' }\n  ])\n  .select()`,
        curl: `curl -X POST '${projectSettings.apiUrl}/rest/v1/${tableName}' \\\n  -H 'apikey: ${projectSettings.anonKey}' \\\n  -H 'Authorization: Bearer ${projectSettings.anonKey}' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Prefer: return=representation' \\\n  -d '{"title": "New Entry"}'`,
        python: `response = supabase.table('${tableName}').insert({"title": "New Entry"}).execute()`,
        graphql: `mutation Create${tableName.charAt(0).toUpperCase() + tableName.slice(1)} {\n  insertInto${tableName}Collection(objects: [{ title: "New Entry" }]) {\n    records {\n      id\n    }\n  }\n}`
      },
      filter: {
        js: `// Filter records with conditions\nconst { data, error } = await supabase\n  .from('${tableName}')\n  .select('id, title, created_at')\n  .eq('status', 'published')\n  .order('created_at', { ascending: false })\n  .limit(10)`,
        curl: `curl -X GET '${projectSettings.apiUrl}/rest/v1/${tableName}?status=eq.published&order=created_at.desc&limit=10' \\\n  -H 'apikey: ${projectSettings.anonKey}' \\\n  -H 'Authorization: Bearer ${projectSettings.anonKey}'`,
        python: `response = supabase.table('${tableName}').select("id, title").eq("status", "published").limit(10).execute()`,
        graphql: `query Filtered${tableName.charAt(0).toUpperCase() + tableName.slice(1)} {\n  ${tableName}Collection(filter: { status: { eq: "published" } }, orderBy: [{ created_at: DescNullsLast }], first: 10) {\n    edges {\n      node {\n        id\n        title\n      }\n    }\n  }\n}`
      }
    };
  };

  const snippets = currentTable ? getSnippets(currentTable.name) : null;

  return (
    <div id="api-docs-view" className="flex h-[calc(100vh-3.5rem)] bg-[#FAF7F2] overflow-hidden text-[#2B1D20]">
      {/* Left Sidebar Tables Navigator */}
      <div className="w-64 border-r border-[#E8DDD2] bg-[#FFFDF9] flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#E8DDD2] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2B1D20]">
            <FileCode className="w-3.5 h-3.5 text-[#8B1E3F]" />
            <span>Entities & Collections</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9B888C]">
            Tables & Views ({tables.length})
          </div>
          {tables.map((t) => {
            const isSelected = t.id === selectedTableId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTableId(t.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                  isSelected 
                    ? 'bg-[#FDF0F3] text-[#8B1E3F] font-semibold border border-[#F5CBD3] shadow-2xs' 
                    : 'text-[#685559] hover:text-[#2B1D20] hover:bg-[#F4EFEA]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Database className="w-3.5 h-3.5 text-[#9B888C]" />
                  <span className="truncate font-mono">{t.name}</span>
                </div>
                {t.rlsEnabled && (
                  <span className="text-[9px] font-mono px-1 rounded bg-[#EFF7F3] text-[#286E4F] border border-[#C4E6D5]">
                    RLS
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Endpoints Info */}
        <div className="p-3 border-t border-[#E8DDD2] bg-[#FAF7F2] text-xs space-y-1">
          <div className="text-[11px] font-semibold text-[#2B1D20]">REST & GraphQL Gateway</div>
          <div className="font-mono text-[10px] text-[#685559] truncate">{projectSettings.apiUrl}</div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF7F2] overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#2B1D20] font-mono">
                public.{currentTable?.name}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFF7F3] text-[#286E4F] border border-[#C4E6D5] font-semibold">
                PostgREST Auto-Generated
              </span>
            </div>
            <p className="text-xs text-[#685559] mt-0.5">
              Interactive client SDK reference, cURL commands, and GraphQL schemas generated from your database structure.
            </p>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-[#FAF7F2] p-1 rounded-lg border border-[#E8DDD2] text-xs">
            {(['js', 'curl', 'python', 'graphql'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs uppercase font-medium transition-colors ${
                  selectedLang === lang 
                    ? 'bg-[#FFFDF9] text-[#8B1E3F] font-bold border border-[#E8DDD2] shadow-2xs' 
                    : 'text-[#685559] hover:text-[#2B1D20]'
                }`}
              >
                {lang === 'js' ? 'JavaScript' : lang === 'curl' ? 'cURL' : lang === 'python' ? 'Python' : 'GraphQL'}
              </button>
            ))}
          </div>
        </div>

        {snippets && (
          <div className="space-y-6 max-w-5xl">
            {/* Read / Query Section */}
            <div className="p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[#2B1D20]">Read Rows / Query Data</h3>
                  <p className="text-[11px] text-[#685559]">Retrieve rows with columns selection, pagination, and filters.</p>
                </div>
                <button
                  onClick={() => copyCode(snippets.readAll[selectedLang], 'readAll')}
                  className="flex items-center gap-1 text-xs text-[#8B1E3F] hover:underline font-mono font-medium"
                >
                  {copiedKey === 'readAll' ? <Check className="w-3.5 h-3.5 text-[#286E4F]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'readAll' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#8B1E3F] overflow-x-auto select-all leading-relaxed">
                {snippets.readAll[selectedLang]}
              </pre>
            </div>

            {/* Filter Section */}
            <div className="p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[#2B1D20]">Filter and Order Records</h3>
                  <p className="text-[11px] text-[#685559]">Chain operators like equality (.eq), ordering (.order), and row limits (.limit).</p>
                </div>
                <button
                  onClick={() => copyCode(snippets.filter[selectedLang], 'filter')}
                  className="flex items-center gap-1 text-xs text-[#8B1E3F] hover:underline font-mono font-medium"
                >
                  {copiedKey === 'filter' ? <Check className="w-3.5 h-3.5 text-[#286E4F]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'filter' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#8B1E3F] overflow-x-auto select-all leading-relaxed">
                {snippets.filter[selectedLang]}
              </pre>
            </div>

            {/* Insert Section */}
            <div className="p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[#2B1D20]">Insert Records</h3>
                  <p className="text-[11px] text-[#685559]">Create new rows and return representation payload.</p>
                </div>
                <button
                  onClick={() => copyCode(snippets.insert[selectedLang], 'insert')}
                  className="flex items-center gap-1 text-xs text-[#8B1E3F] hover:underline font-mono font-medium"
                >
                  {copiedKey === 'insert' ? <Check className="w-3.5 h-3.5 text-[#286E4F]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'insert' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#8B1E3F] overflow-x-auto select-all leading-relaxed">
                {snippets.insert[selectedLang]}
              </pre>
            </div>

            {/* Columns Schema Definition Table */}
            <div className="p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-3 shadow-xs">
              <h3 className="text-xs font-semibold text-[#2B1D20]">Schema & Fields</h3>
              <div className="border border-[#E8DDD2] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAF7F2] border-b border-[#E8DDD2] text-[#685559]">
                    <tr>
                      <th className="p-2.5 font-semibold">Column</th>
                      <th className="p-2.5 font-semibold">Type</th>
                      <th className="p-2.5 font-semibold">Attributes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DDD2] bg-[#FFFDF9]">
                    {currentTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-[#FAF7F2]/60">
                        <td className="p-2.5 font-bold text-[#2B1D20]">{col.name}</td>
                        <td className="p-2.5 text-[#8B1E3F]">{col.type}</td>
                        <td className="p-2.5 text-[11px] text-[#685559]">
                          {col.isPrimary && <span className="mr-2 px-1.5 py-0.5 rounded bg-[#FDF0F3] text-[#8B1E3F] border border-[#F5CBD3]">PK</span>}
                          {col.isNullable === false && <span className="mr-2 text-[#9B888C]">NOT NULL</span>}
                          {col.defaultValue && <span className="text-[#286E4F]">default: {col.defaultValue}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
