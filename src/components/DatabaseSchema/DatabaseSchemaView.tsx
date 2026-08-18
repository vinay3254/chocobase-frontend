import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Puzzle, 
  ShieldCheck, 
  Key, 
  Search, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { DatabaseSchemaName } from '../../types';

export const DatabaseSchemaView: React.FC = () => {
  const { tables, selectedSchema, setSelectedSchema, setSelectedTableId, setActiveView, showNotification } = useSupabase();
  const [activeTab, setActiveTab] = useState<'tables' | 'extensions' | 'indexes' | 'maintenance'>('tables');
  const [extensionSearch, setExtensionSearch] = useState('');

  const [extensions, setExtensions] = useState([
    { name: 'vector', version: '0.7.0', schema: 'public', description: 'Vector data type and IVFFlat / HNSW similarity search indexing (OpenAI, Gemini embeddings)', enabled: true },
    { name: 'uuid-ossp', version: '1.1', schema: 'extensions', description: 'Generate universally unique identifiers (UUIDs) with v1, v4 algorithms', enabled: true },
    { name: 'pg_stat_statements', version: '1.10', schema: 'extensions', description: 'Tracking execution statistics of all SQL statements executed', enabled: true },
    { name: 'pgcrypto', version: '1.3', schema: 'extensions', description: 'Cryptographic functions for hashing, HMAC, and AES symmetric encryption', enabled: true },
    { name: 'pg_trgm', version: '1.6', schema: 'public', description: 'Text similarity measurement and trigram index search acceleration', enabled: true },
    { name: 'pg_graphql', version: '1.5.0', schema: 'graphql', description: 'Exposes an auto-generated GraphQL schema for the database', enabled: true },
    { name: 'http', version: '1.5', schema: 'extensions', description: 'HTTP client for PostgreSQL to make outbound REST calls from triggers', enabled: false },
    { name: 'pg_cron', version: '1.6', schema: 'extensions', description: 'Job scheduler for PostgreSQL to run background tasks periodically', enabled: true },
    { name: 'postgis', version: '3.4.1', schema: 'public', description: 'Spatial database extender for geographic coordinates and geometry objects', enabled: false },
  ]);

  const toggleExtension = (extName: string) => {
    setExtensions(prev => prev.map(ext => {
      if (ext.name === extName) {
        const nextState = !ext.enabled;
        showNotification(`Extension "${extName}" ${nextState ? 'installed & enabled' : 'disabled'}`);
        return { ...ext, enabled: nextState };
      }
      return ext;
    }));
  };

  const handleRunVacuum = (type: string) => {
    showNotification(`Running "${type}" maintenance job...`);
    setTimeout(() => {
      showNotification(`"${type}" completed successfully in 142ms. 0 bloat detected.`);
    }, 600);
  };

  return (
    <div id="database-schema-view" className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#ececec] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-[#15803d]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#1a1a1a]">Database & Schema Architecture</h1>
            <p className="text-xs text-[#666]">Manage PostgreSQL schemas, indexes, pgvector, and database extensions</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#f4f4f5] p-1 rounded-lg border border-[#ececec] text-xs">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'tables' ? 'bg-white text-[#1a1a1a] shadow-2xs' : 'text-[#666] hover:text-[#1a1a1a]'}`}
          >
            Schemas & Tables
          </button>
          <button
            onClick={() => setActiveTab('extensions')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'extensions' ? 'bg-white text-[#1a1a1a] shadow-2xs' : 'text-[#666] hover:text-[#1a1a1a]'}`}
          >
            Extensions ({extensions.filter(e => e.enabled).length})
          </button>
          <button
            onClick={() => setActiveTab('indexes')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'indexes' ? 'bg-white text-[#1a1a1a] shadow-2xs' : 'text-[#666] hover:text-[#1a1a1a]'}`}
          >
            Indexes
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'maintenance' ? 'bg-white text-[#1a1a1a] shadow-2xs' : 'text-[#666] hover:text-[#1a1a1a]'}`}
          >
            Maintenance
          </button>
        </div>
      </div>

      {/* Tables View */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((tbl) => (
              <div 
                key={tbl.id}
                className="p-5 rounded-xl bg-white border border-[#ececec] hover:border-[#d0d0d0] shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#f9f9f9] text-[#1a1a1a] border border-[#ececec]">
                      {tbl.schema}.{tbl.name}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${tbl.rlsEnabled ? 'bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]' : 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'}`}>
                      {tbl.rlsEnabled ? 'RLS ON' : 'RLS OFF'}
                    </span>
                  </div>

                  <p className="text-xs text-[#666] mt-2 line-clamp-2">
                    {tbl.comment || 'No comment provided for this relation.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#ececec] space-y-1.5">
                    <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">Columns ({tbl.columns.length})</div>
                    <div className="flex flex-wrap gap-1.5">
                      {tbl.columns.map(col => (
                        <span key={col.name} className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f4f4f5] text-[#333] border border-[#ececec]">
                          {col.isPrimary && <Key className="w-2.5 h-2.5 text-[#8B1E3F]" />}
                          <span>{col.name}</span>
                          <span className="text-[#999]">({col.type})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#ececec] flex items-center justify-between text-xs">
                  <span className="text-[#999] font-mono">{tbl.rowsCount || 0} rows</span>
                  <button
                    onClick={() => {
                      setSelectedTableId(tbl.id);
                      setActiveView('table_editor');
                    }}
                    className="text-[#3ecf8e] hover:text-[#34b27b] font-medium flex items-center gap-1"
                  >
                    Open in Grid <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extensions View */}
      {activeTab === 'extensions' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#999]" />
            <input
              type="text"
              value={extensionSearch}
              onChange={(e) => setExtensionSearch(e.target.value)}
              placeholder="Search PostgreSQL extensions..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#ececec] text-xs text-[#1a1a1a] placeholder-[#999] focus:outline-hidden focus:border-[#3ecf8e] shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {extensions
              .filter(e => e.name.toLowerCase().includes(extensionSearch.toLowerCase()) || e.description.toLowerCase().includes(extensionSearch.toLowerCase()))
              .map((ext) => (
                <div key={ext.name} className="p-5 rounded-xl bg-white border border-[#ececec] shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Puzzle className={`w-4 h-4 ${ext.enabled ? 'text-[#3ecf8e]' : 'text-[#999]'}`} />
                        <h3 className="text-xs font-bold text-[#1a1a1a] font-mono">{ext.name}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-[#999]">v{ext.version}</span>
                    </div>
                    <p className="text-xs text-[#666] mt-2">{ext.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#ececec] flex items-center justify-between">
                    <span className="text-[11px] text-[#999] font-mono">Schema: {ext.schema}</span>
                    <button
                      onClick={() => toggleExtension(ext.name)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        ext.enabled
                          ? 'bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]'
                          : 'bg-[#f4f4f5] text-[#666] hover:text-[#1a1a1a] hover:bg-[#ececec]'
                      }`}
                    >
                      {ext.enabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Indexes View */}
      {activeTab === 'indexes' && (
        <div className="p-5 rounded-xl bg-white border border-[#ececec] shadow-xs space-y-4">
          <div className="text-xs font-semibold text-[#1a1a1a]">Active B-Tree, GIN & HNSW Vector Indexes</div>
          <div className="divide-y divide-[#f0f0f0]">
            {tables.flatMap(t => t.indexes.map(idx => ({ ...idx, tableName: t.name }))).map((idx, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-[#1a1a1a]">{idx.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]">
                      {idx.type.toUpperCase()}
                    </span>
                    {idx.isUnique && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
                        UNIQUE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#666] mt-0.5">
                    Table: <code className="font-mono text-[#333]">{idx.tableName}</code> • Columns: <code className="font-mono text-[#333]">{idx.columns.join(', ')}</code>
                  </div>
                </div>
                <span className="text-xs text-[#999] font-mono">Status: VALID</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance View */}
      {activeTab === 'maintenance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-white border border-[#ececec] shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-[#1a1a1a]">VACUUM & ANALYZE</h3>
            <p className="text-xs text-[#666]">Reclaims storage occupied by dead tuples and updates table optimizer statistics.</p>
            <button
              onClick={() => handleRunVacuum('VACUUM ANALYZE')}
              className="px-3.5 py-1.5 rounded-md bg-[#3ecf8e] hover:bg-[#34b27b] text-xs font-semibold text-white transition-colors shadow-xs"
            >
              Run VACUUM ANALYZE
            </button>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#ececec] shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-[#1a1a1a]">REINDEX Database</h3>
            <p className="text-xs text-[#666]">Rebuilds corrupted or bloated B-tree and HNSW vector indexes concurrently.</p>
            <button
              onClick={() => handleRunVacuum('REINDEX SCHEMA public')}
              className="px-3.5 py-1.5 rounded-md bg-white hover:bg-[#f9f9f9] border border-[#ececec] text-xs font-semibold text-[#333] transition-colors shadow-2xs"
            >
              Reindex Public Schema
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
