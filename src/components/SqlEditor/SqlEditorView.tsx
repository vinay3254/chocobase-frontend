import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  Plus, 
  X, 
  Save, 
  Download, 
  Sparkles, 
  Layers, 
  Check, 
  AlertCircle, 
  Clock, 
  FileCode, 
  Copy,
  ChevronRight,
  Maximize2,
  Table as TableIcon,
  Code2
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { executeSqlQuery } from '../../utils/sqlEngine';
import { SqlQueryResult, SqlQueryTab } from '../../types';

export const SqlEditorView: React.FC = () => {
  const { 
    sqlTabs, 
    activeSqlTabId, 
    setActiveSqlTabId, 
    updateSqlTab, 
    addSqlTab, 
    closeSqlTab,
    tables,
    tableData,
    insertTableRow,
    addNewTable,
    showNotification
  } = useSupabase();

  const [resultView, setResultView] = useState<'table' | 'json' | 'explain'>('table');
  const [isRunning, setIsRunning] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  const activeTab = sqlTabs.find(t => t.id === activeSqlTabId) || sqlTabs[0];

  const handleRunQuery = async () => {
    if (!activeTab || !activeTab.sql.trim()) return;
    setIsRunning(true);

    // Subtle async simulation for realistic query execution
    await new Promise(r => setTimeout(r, 40));

    try {
      const result = executeSqlQuery(
        activeTab.sql,
        tables,
        tableData,
        undefined,
        (tbl) => addNewTable(tbl)
      );

      updateSqlTab(activeTab.id, {
        result,
        lastExecutedAt: new Date().toISOString(),
        executionTimeMs: result.executionTimeMs
      });

      if (result.error) {
        showNotification('SQL execution returned an error', 'error');
      } else {
        showNotification(`Query executed in ${result.executionTimeMs}ms (${result.rowCount} rows)`);
      }
    } catch (err: any) {
      updateSqlTab(activeTab.id, {
        result: {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: 12,
          error: err?.message || 'Unknown database error'
        }
      });
      showNotification('SQL error', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // Keyboard shortcut Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunQuery();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tables, tableData]);

  // AI SQL generation
  const handleGenerateAiSql = () => {
    if (!aiPrompt.trim() || !activeTab) return;
    setIsAiGenerating(true);

    setTimeout(() => {
      let generatedSql = '';
      const promptLower = aiPrompt.toLowerCase();

      if (promptLower.includes('author') || promptLower.includes('comment') || promptLower.includes('post')) {
        generatedSql = `-- AI Generated: Top posts with comments & author profile\nSELECT \n  p.id,\n  p.title,\n  p.view_count,\n  prof.username AS author,\n  count(c.id) AS total_comments\nFROM public.posts p\nLEFT JOIN public.profiles prof ON p.author_id = prof.id\nLEFT JOIN public.comments c ON p.id = c.post_id\nWHERE p.published = true\nGROUP BY p.id, prof.username\nORDER BY p.view_count DESC\nLIMIT 10;`;
      } else if (promptLower.includes('order') || promptLower.includes('revenue') || promptLower.includes('sales')) {
        generatedSql = `-- AI Generated: Calculate total gross revenue and completed order stats\nSELECT \n  count(*) AS total_orders,\n  sum(total_amount) AS gross_revenue_usd,\n  currency\nFROM public.orders\nWHERE status = 'completed'\nGROUP BY currency;`;
      } else if (promptLower.includes('vector') || promptLower.includes('embedding') || promptLower.includes('similarity')) {
        generatedSql = `-- AI Generated: Semantic vector similarity search with pgvector\nSELECT \n  id,\n  document_name,\n  chunk_text,\n  1 - (embedding <=> '[0.0142, -0.0521, 0.0894, ...]'::vector) AS cosine_similarity\nFROM public.document_embeddings\nORDER BY cosine_similarity DESC\nLIMIT 5;`;
      } else if (promptLower.includes('user') || promptLower.includes('admin') || promptLower.includes('profile')) {
        generatedSql = `-- AI Generated: Filter active admin and lead developer profiles\nSELECT \n  id,\n  username,\n  full_name,\n  role,\n  created_at\nFROM public.profiles\nWHERE role IN ('admin', 'lead_developer')\nORDER BY created_at ASC;`;
      } else {
        generatedSql = `-- AI Generated: Inspect active table schema\nSELECT \n  column_name, \n  data_type, \n  is_nullable, \n  column_default\nFROM information_schema.columns\nWHERE table_schema = 'public' AND table_name = 'posts';`;
      }

      updateSqlTab(activeTab.id, { sql: generatedSql });
      setIsAiGenerating(false);
      setIsAiDrawerOpen(false);
      setAiPrompt('');
      showNotification('AI SQL query generated into active workspace');
    }, 600);
  };

  const starterSnippets = [
    { title: 'Top Posts & Authors', sql: `SELECT p.id, p.title, prof.username, p.view_count FROM public.posts p LEFT JOIN public.profiles prof ON p.author_id = prof.id WHERE p.published = true ORDER BY p.view_count DESC LIMIT 10;` },
    { title: 'Check RLS Policies', sql: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public';` },
    { title: 'Buffer Cache Hit Ratio', sql: `SELECT 'index hit rate' AS name, ROUND((sum(idx_blks_hit) - sum(idx_blks_read)) * 100.0 / NULLIF(sum(idx_blks_hit), 0), 2) AS ratio FROM pg_statio_user_indexes;` },
    { title: 'Insert New Article', sql: `INSERT INTO public.posts (id, author_id, title, slug, content, published, view_count, tags, created_at) VALUES (gen_random_uuid(), 'd3b07384-d113-4a1a-9f5b-568b248a8001', 'Mastering PostgreSQL MVCC', 'mastering-postgres-mvcc', 'Deep dive into snapshot isolation...', true, 120, '["database", "postgres"]'::jsonb, NOW());` },
  ];

  return (
    <div id="sql-editor-view" className="flex h-[calc(100vh-4rem)] bg-[#FAF7F2] overflow-hidden">
      {/* Left Sidebar: Saved Snippets & Queries */}
      <div className="w-64 border-r border-[#E8DDD2] bg-[#FFFDF9] flex flex-col flex-shrink-0 hidden md:flex">
        <div className="p-3 border-b border-[#E8DDD2] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2B1D20]">
            <Terminal className="w-3.5 h-3.5 text-[#8B1E3F]" />
            <span>SQL Snippets</span>
          </div>
          <button
            onClick={() => addSqlTab()}
            className="p-1 rounded border border-[#E8DDD2] hover:bg-[#F4EFEA] text-[#685559] hover:text-[#2B1D20] transition-colors"
            title="Create new query"
          >
            <Plus className="w-3.5 h-3.5 text-[#8B1E3F]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-[#FFFDF9]">
          {/* Active Tabs */}
          <div>
            <div className="text-[10px] font-semibold text-[#9B888C] uppercase px-2 mb-1 tracking-wider">
              Open Queries ({sqlTabs.length})
            </div>
            <div className="space-y-1">
              {sqlTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSqlTabId(tab.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    tab.id === activeSqlTabId 
                      ? 'bg-[#FDF0F3] text-[#8B1E3F] font-semibold border-l-2 border-[#8B1E3F]' 
                      : 'text-[#685559] hover:text-[#2B1D20] hover:bg-[#F4EFEA]'
                  }`}
                >
                  <span className="truncate">{tab.title}</span>
                  {tab.isSaved && <Save className="w-3 h-3 text-[#9B888C]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Starter Templates */}
          <div>
            <div className="text-[10px] font-semibold text-[#9B888C] uppercase px-2 mb-1 tracking-wider">
              Starter Templates
            </div>
            <div className="space-y-1">
              {starterSnippets.map((snip, idx) => (
                <button
                  key={idx}
                  onClick={() => addSqlTab(snip.title, snip.sql)}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-[#685559] hover:text-[#2B1D20] hover:bg-[#F4EFEA] transition-colors truncate block"
                >
                  {snip.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Assistant Banner */}
        <div className="p-3 border-t border-[#E8DDD2] bg-[#FAF7F2]">
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="w-full py-2 px-3 rounded-lg bg-[#FDF0F3] hover:bg-[#FBE8EC] border border-[#F5CBD3] text-[#8B1E3F] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B1E3F]" />
            <span>AI SQL Assistant</span>
          </button>
        </div>
      </div>

      {/* Main SQL Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF7F2]">
        {/* Top Tab Bar */}
        <div className="h-10 bg-[#FAF7F2] border-b border-[#E8DDD2] flex items-center px-2 gap-1 overflow-x-auto select-none">
          {sqlTabs.map((tab) => {
            const isActive = tab.id === activeSqlTabId;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveSqlTabId(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer border-t-2 transition-colors ${
                  isActive 
                    ? 'bg-[#FFFDF9] border-[#8B1E3F] text-[#2B1D20] shadow-2xs font-semibold' 
                    : 'border-transparent text-[#9B888C] hover:text-[#2B1D20] hover:bg-[#F4EFEA]'
                }`}
              >
                <Terminal className="w-3 h-3 text-[#8B1E3F]" />
                <span className="max-w-[140px] truncate">{tab.title}</span>
                {sqlTabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeSqlTab(tab.id);
                    }}
                    className="p-0.5 rounded text-[#9B888C] hover:text-[#2B1D20]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => addSqlTab()}
            className="p-1 rounded text-[#9B888C] hover:text-[#2B1D20] hover:bg-[#F4EFEA] transition-colors ml-1"
            title="Add new query tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Header: Run, AI, Format, Result count */}
        <div className="p-2.5 border-b border-[#E8DDD2] bg-[#FFFDF9] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="btn-run-sql-query"
              onClick={handleRunQuery}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#72142E] text-xs font-semibold text-white transition-colors shadow-xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Executing...' : 'Run (⌘↵)'}</span>
            </button>

            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFDF9] hover:bg-[#F4EFEA] border border-[#E8DDD2] text-xs font-medium text-[#2B1D20] transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B1E3F]" />
              <span className="hidden sm:inline">AI Helper</span>
            </button>
          </div>

          {/* Results View Switcher */}
          {activeTab?.result && (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#F4EFEA] p-0.5 rounded-lg border border-[#E8DDD2] text-xs">
                <button
                  onClick={() => setResultView('table')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 ${resultView === 'table' ? 'bg-[#FFFDF9] text-[#8B1E3F] font-semibold shadow-2xs' : 'text-[#685559]'}`}
                >
                  <TableIcon className="w-3 h-3" /> Table
                </button>
                <button
                  onClick={() => setResultView('json')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 ${resultView === 'json' ? 'bg-[#FFFDF9] text-[#8B1E3F] font-semibold shadow-2xs' : 'text-[#685559]'}`}
                >
                  <Code2 className="w-3 h-3" /> JSON
                </button>
              </div>

              <div className="text-[11px] font-mono text-[#685559] flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#8B1E3F]" />
                <span>{activeTab.result.executionTimeMs}ms</span>
                <span>•</span>
                <span>{activeTab.result.rowCount} rows</span>
              </div>
            </div>
          )}
        </div>

        {/* Code Editor Textarea */}
        <div className="h-44 bg-[#FFFDF9] border-b border-[#E8DDD2] relative">
          <textarea
            value={activeTab?.sql || ''}
            onChange={(e) => activeTab && updateSqlTab(activeTab.id, { sql: e.target.value })}
            placeholder="Write your PostgreSQL query here..."
            className="w-full h-full p-4 bg-transparent text-[#2B1D20] font-mono text-xs focus:outline-hidden resize-none leading-relaxed placeholder-[#9B888C]"
            spellCheck={false}
          />
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-auto bg-[#FAF7F2] flex flex-col">
          {activeTab?.result ? (
            activeTab.result.error ? (
              <div className="p-6 text-xs text-[#9E1B24] font-mono flex items-start gap-2 bg-[#FDF1F2] border border-[#F7C4C8] m-4 rounded-xl">
                <AlertCircle className="w-4 h-4 text-[#9E1B24] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-[#9E1B24]">Execution Error</div>
                  <pre className="mt-1 whitespace-pre-wrap text-[#9E1B24]">{activeTab.result.error}</pre>
                </div>
              </div>
            ) : resultView === 'json' ? (
              <pre className="p-4 text-xs font-mono text-[#3B5B88] select-text overflow-auto bg-[#FFFDF9] m-4 border border-[#E8DDD2] rounded-xl">
                {JSON.stringify(activeTab.result.rows, null, 2)}
              </pre>
            ) : (
              <table className="w-full border-collapse text-left text-xs font-mono select-text bg-[#FFFDF9]">
                <thead className="sticky top-0 z-10 bg-[#FAF7F2] border-b border-[#E8DDD2] text-[#685559]">
                  <tr>
                    <th className="w-10 px-3 py-2 text-center text-[#9B888C] border-r border-[#E8DDD2]">#</th>
                    {activeTab.result.columns.map((col) => (
                      <th key={col} className="px-3.5 py-2 font-bold text-[#685559] text-[11px] uppercase tracking-wider border-r border-[#E8DDD2] whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD2] text-[#2B1D20]">
                  {activeTab.result.rows.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab.result.columns.length + 1} className="py-12 text-center text-[#9B888C]">
                        Query returned 0 rows.
                      </td>
                    </tr>
                  ) : (
                    activeTab.result.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="px-3 py-2 text-center text-[#9B888C] font-mono text-[11px] border-r border-[#E8DDD2]">
                          {idx + 1}
                        </td>
                        {activeTab.result?.columns.map((col) => {
                          const val = row[col];
                          return (
                            <td key={col} className="px-3.5 py-2 border-r border-[#E8DDD2] whitespace-nowrap max-w-sm truncate text-[#2B1D20]">
                              {val === null || val === undefined ? (
                                <span className="text-[#9B888C] italic">null</span>
                              ) : typeof val === 'object' ? (
                                <span className="text-[#3B5B88]">{JSON.stringify(val)}</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#9B888C] text-xs p-8 text-center">
              <Terminal className="w-8 h-8 text-[#D8C7B8] mb-2" />
              <p>Write your query and click <strong className="text-[#8B1E3F]">Run</strong> or press <strong className="text-[#2B1D20]">⌘ + ↵</strong></p>
            </div>
          )}
        </div>
      </div>

      {/* AI SQL Assistant Drawer */}
      {isAiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md z-50 bg-[#FFFDF9] border-l border-[#E8DDD2] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-[#E8DDD2] bg-[#FAF7F2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8B1E3F]" />
              <h3 className="text-sm font-semibold text-[#2B1D20]">AI SQL Assistant</h3>
            </div>
            <button onClick={() => setIsAiDrawerOpen(false)} className="text-[#9B888C] hover:text-[#2B1D20]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-[#FFFDF9]">
            <p className="text-xs text-[#685559]">
              Describe the query or transformation you need in plain English. The AI generator understands your schemas, relations, and pgvector types.
            </p>

            <div>
              <label className="block text-xs font-medium text-[#2B1D20] mb-1">What do you want to query?</label>
              <textarea
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Find top 10 published posts with author username and comment counts..."
                className="w-full p-3 rounded-md bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] placeholder-[#9B888C] focus:outline-hidden focus:border-[#8B1E3F] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-[#9B888C] uppercase tracking-wider">Example Prompts</div>
              <button
                type="button"
                onClick={() => setAiPrompt('Calculate gross revenue and completed orders grouped by currency')}
                className="w-full text-left p-2.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs text-[#2B1D20] border border-[#E8DDD2]"
              >
                "Calculate gross revenue and completed orders..."
              </button>
              <button
                type="button"
                onClick={() => setAiPrompt('Semantic vector similarity search with pgvector')}
                className="w-full text-left p-2.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs text-[#2B1D20] border border-[#E8DDD2]"
              >
                "Semantic vector similarity search on document_embeddings..."
              </button>
              <button
                type="button"
                onClick={() => setAiPrompt('Find active admin and lead developer profiles')}
                className="w-full text-left p-2.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs text-[#2B1D20] border border-[#E8DDD2]"
              >
                "Find active admin and lead developer profiles..."
              </button>
            </div>

            <div className="pt-4 border-t border-[#E8DDD2] flex justify-end gap-2">
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="px-3.5 py-1.5 text-xs text-[#685559] hover:bg-[#F4EFEA] border border-[#E8DDD2] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAiSql}
                disabled={isAiGenerating || !aiPrompt.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#72142E] text-xs font-semibold text-white shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiGenerating ? 'Generating...' : 'Generate SQL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
