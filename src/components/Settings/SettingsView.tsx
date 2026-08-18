import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Server, 
  Database, 
  ShieldAlert, 
  Globe, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';

export const SettingsView: React.FC = () => {
  const { projectSettings, updateProjectSettings, showNotification } = useSupabase();
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'database' | 'danger'>('api');
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [showJwtSecret, setShowJwtSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [projectNameInput, setProjectNameInput] = useState(projectSettings.name);
  const [selectedDriver, setSelectedDriver] = useState<'uri' | 'nodejs' | 'prisma' | 'drizzle' | 'golang'>('uri');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showNotification(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectSettings({ name: projectNameInput });
    showNotification('Project settings updated');
  };

  const connectionStrings = {
    uri: `postgresql://${projectSettings.databaseUser}:[YOUR-PASSWORD]@${projectSettings.databaseHost}:${projectSettings.databasePort}/${projectSettings.databaseName}?sslmode=require`,
    nodejs: `import { createClient } from '@supabase/supabase-js'\n\nconst supabase = createClient(\n  '${projectSettings.apiUrl}',\n  '${projectSettings.anonKey}'\n)`,
    prisma: `datasource db {\n  provider = "postgresql"\n  url      = "postgresql://${projectSettings.databaseUser}:[YOUR-PASSWORD]@${projectSettings.databaseHost}:${projectSettings.databasePort}/${projectSettings.databaseName}?sslmode=require&pgbouncer=true"\n}`,
    drizzle: `import { drizzle } from 'drizzle-orm/postgres-js'\nimport postgres from 'postgres'\n\nconst client = postgres('postgresql://${projectSettings.databaseUser}:[YOUR-PASSWORD]@${projectSettings.databaseHost}:${projectSettings.databasePort}/${projectSettings.databaseName}?sslmode=require')\nexport const db = drizzle(client)`,
    golang: `connStr := "postgresql://${projectSettings.databaseUser}:[YOUR-PASSWORD]@${projectSettings.databaseHost}:${projectSettings.databasePort}/${projectSettings.databaseName}?sslmode=require"\ndb, err := pgx.Connect(context.Background(), connStr)`,
  };

  return (
    <div id="settings-view" className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150 text-[#2B1D20]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#FDF0F3] border border-[#F5CBD3] flex items-center justify-center text-[#8B1E3F]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#2B1D20]">Project Configuration & Secrets</h1>
            <p className="text-xs text-[#685559]">API keys, connection pooling, direct PostgreSQL connection strings, and security credentials</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#FAF7F2] p-1 rounded-lg border border-[#E8DDD2] text-xs">
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'api' ? 'bg-[#FFFDF9] text-[#8B1E3F] font-semibold border border-[#E8DDD2] shadow-2xs' : 'text-[#685559] hover:text-[#2B1D20]'}`}
          >
            API Credentials
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'database' ? 'bg-[#FFFDF9] text-[#8B1E3F] font-semibold border border-[#E8DDD2] shadow-2xs' : 'text-[#685559] hover:text-[#2B1D20]'}`}
          >
            Database & Drivers
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'general' ? 'bg-[#FFFDF9] text-[#8B1E3F] font-semibold border border-[#E8DDD2] shadow-2xs' : 'text-[#685559] hover:text-[#2B1D20]'}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'danger' ? 'bg-[#FDF0F3] text-[#8B1E3F] border border-[#F5CBD3]' : 'text-[#685559] hover:text-[#8B1E3F]'}`}
          >
            Danger Zone
          </button>
        </div>
      </div>

      {/* API Credentials Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          {/* Project URL */}
          <div className="p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#2B1D20]">Project API URL</label>
              <span className="text-[10px] font-mono text-[#286E4F] bg-[#EFF7F3] px-2 py-0.5 rounded-full border border-[#C4E6D5] font-semibold">
                HTTPS REST & GraphQL Gateway
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={projectSettings.apiUrl}
                className="flex-1 px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#2B1D20]"
              />
              <button
                onClick={() => copyToClipboard(projectSettings.apiUrl, 'Project URL')}
                className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#685559] hover:text-[#2B1D20] border border-[#E8DDD2] transition-colors"
                title="Copy API URL"
              >
                {copiedField === 'Project URL' ? <Check className="w-4 h-4 text-[#286E4F]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#685559]">A RESTful endpoint for querying and managing your database through PostgREST.</p>
          </div>

          {/* Anon Public Key */}
          <div className="p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#2B1D20]">anon / public API Key</label>
              <span className="text-[10px] font-mono text-[#3B5B88] bg-[#F0F4FA] px-2 py-0.5 rounded-full border border-[#D0DDEF] font-semibold">
                Safe for Client Browsers & Apps
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={projectSettings.anonKey}
                className="flex-1 px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#685559]"
              />
              <button
                onClick={() => copyToClipboard(projectSettings.anonKey, 'Anon Key')}
                className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#685559] hover:text-[#2B1D20] border border-[#E8DDD2] transition-colors"
                title="Copy Anon Key"
              >
                {copiedField === 'Anon Key' ? <Check className="w-4 h-4 text-[#286E4F]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#685559]">This key is safe to use in a browser if you have enabled Row Level Security (RLS) for your tables.</p>
          </div>

          {/* Service Role Secret Key */}
          <div className="p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#2B1D20]">service_role Secret Key</label>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#8B1E3F] bg-[#FDF0F3] px-2 py-0.5 rounded-full border border-[#F5CBD3] font-semibold">
                <ShieldAlert className="w-3 h-3 text-[#8B1E3F]" />
                <span>Bypasses Row Level Security</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type={showServiceKey ? 'text' : 'password'}
                readOnly
                value={projectSettings.serviceRoleKey}
                className="flex-1 px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#685559]"
              />
              <button
                onClick={() => setShowServiceKey(!showServiceKey)}
                className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#685559] hover:text-[#2B1D20] border border-[#E8DDD2] transition-colors"
                title={showServiceKey ? 'Hide key' : 'Reveal key'}
              >
                {showServiceKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(projectSettings.serviceRoleKey, 'Service Role Key')}
                className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#685559] hover:text-[#2B1D20] border border-[#E8DDD2] transition-colors"
                title="Copy Service Role Key"
              >
                {copiedField === 'Service Role Key' ? <Check className="w-4 h-4 text-[#286E4F]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#8B1E3F]">Never expose this key in client-side code. Use exclusively in secure backend server environments.</p>
          </div>

          {/* JWT Secret */}
          <div className="p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#2B1D20]">JWT Signing Secret</label>
              <span className="text-[10px] font-mono text-[#9B888C]">HMAC-SHA256</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type={showJwtSecret ? 'text' : 'password'}
                readOnly
                value={projectSettings.jwtSecret}
                className="flex-1 px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#685559]"
              />
              <button
                onClick={() => setShowJwtSecret(!showJwtSecret)}
                className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#685559] hover:text-[#2B1D20] border border-[#E8DDD2] transition-colors"
              >
                {showJwtSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(projectSettings.jwtSecret, 'JWT Secret')}
                className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] text-[#685559] hover:text-[#2B1D20] border border-[#E8DDD2] transition-colors"
              >
                {copiedField === 'JWT Secret' ? <Check className="w-4 h-4 text-[#286E4F]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database & Drivers Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#2B1D20]">Direct PostgreSQL Connection Info</h3>
              <span className="text-[11px] font-mono text-[#286E4F] bg-[#EFF7F3] px-2 py-0.5 rounded border border-[#C4E6D5] font-semibold">{projectSettings.pgVersion}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2]">
                <div className="text-[#9B888C] text-[10px]">HOST</div>
                <div className="text-[#2B1D20] font-semibold mt-0.5 truncate">{projectSettings.databaseHost}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2]">
                <div className="text-[#9B888C] text-[10px]">PORT</div>
                <div className="text-[#2B1D20] font-semibold mt-0.5">{projectSettings.databasePort} (Pooler: {projectSettings.poolerPort})</div>
              </div>
              <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2]">
                <div className="text-[#9B888C] text-[10px]">DATABASE</div>
                <div className="text-[#2B1D20] font-semibold mt-0.5">{projectSettings.databaseName}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2]">
                <div className="text-[#9B888C] text-[10px]">USER</div>
                <div className="text-[#2B1D20] font-semibold mt-0.5">{projectSettings.databaseUser}</div>
              </div>
            </div>
          </div>

          {/* Connection String Code Snippets */}
          <div className="p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#2B1D20]">Connect from Client SDK / ORM</h3>
              <div className="flex items-center bg-[#FAF7F2] p-0.5 rounded-lg border border-[#E8DDD2] text-xs">
                {(['uri', 'nodejs', 'prisma', 'drizzle', 'golang'] as const).map((drv) => (
                  <button
                    key={drv}
                    onClick={() => setSelectedDriver(drv)}
                    className={`px-2.5 py-1 rounded text-[11px] uppercase font-mono font-medium transition-colors ${selectedDriver === drv ? 'bg-[#FFFDF9] text-[#8B1E3F] font-bold border border-[#E8DDD2] shadow-2xs' : 'text-[#685559] hover:text-[#2B1D20]'}`}
                  >
                    {drv}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#8B1E3F] overflow-x-auto select-all">
                {connectionStrings[selectedDriver]}
              </pre>
              <button
                onClick={() => copyToClipboard(connectionStrings[selectedDriver], 'Connection String')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#FFFDF9] hover:bg-[#F4EFEA] text-[#685559] hover:text-[#2B1D20] border border-[#E8DDD2]"
              >
                {copiedField === 'Connection String' ? <Check className="w-3.5 h-3.5 text-[#286E4F]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="p-5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] space-y-4 max-w-2xl shadow-xs">
          <div>
            <label className="block text-xs font-medium text-[#2B1D20] mb-1">Project Name</label>
            <input
              type="text"
              value={projectNameInput}
              onChange={(e) => setProjectNameInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2B1D20] mb-1">Project Reference ID</label>
            <input
              type="text"
              readOnly
              value={projectSettings.id}
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#685559]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2B1D20] mb-1">Compute Region</label>
            <input
              type="text"
              readOnly
              value={`${projectSettings.region} (${projectSettings.tier} Tier)`}
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#685559]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white transition-colors shadow-xs"
            >
              Save Project Changes
            </button>
          </div>
        </form>
      )}

      {/* Danger Zone */}
      {activeTab === 'danger' && (
        <div className="p-5 rounded-xl bg-[#FDF0F3] border border-[#F5CBD3] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#8B1E3F] font-semibold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>Danger Zone & Reset Project</span>
          </div>
          <p className="text-xs text-[#685559]">
            Resetting your local state will restore all sample PostgreSQL relations, users, buckets, and edge functions to initial demo values.
          </p>
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                showNotification('Local state reset. Reloading...');
                setTimeout(() => window.location.reload(), 500);
              }}
              className="px-4 py-2 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State & Reload</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
