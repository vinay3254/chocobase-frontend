import React, { useState } from 'react';
import { 
  Zap, 
  Play, 
  Plus, 
  Terminal, 
  Clock, 
  Key, 
  Code, 
  Activity, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  ShieldCheck,
  RefreshCw,
  Copy
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { EdgeFunction } from '../../types';

export const FunctionsView: React.FC = () => {
  const { 
    edgeFunctions, 
    selectedFunctionId, 
    setSelectedFunctionId, 
    invokeEdgeFunction, 
    updateFunctionSecret, 
    createEdgeFunction,
    projectSettings,
    showNotification 
  } = useSupabase();

  const [activeTab, setActiveTab] = useState<'test' | 'code' | 'secrets' | 'logs'>('test');
  const [testPayload, setTestPayload] = useState('{\n  "input": "How to optimize PostgreSQL indexes for vector search?"\n}');
  const [testResult, setTestResult] = useState<{ status: number; data: any; latencyMs: number } | null>(null);
  const [isInvoking, setIsInvoking] = useState(false);
  const [isNewFunctionModalOpen, setIsNewFunctionModalOpen] = useState(false);

  // New secret form
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretVal, setNewSecretVal] = useState('');

  const activeFn = edgeFunctions.find(f => f.id === selectedFunctionId) || edgeFunctions[0];

  const handleTestInvoke = async () => {
    if (!activeFn) return;
    setIsInvoking(true);
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(testPayload);
      } catch {
        parsed = { raw: testPayload };
      }
      const res = await invokeEdgeFunction(activeFn.id, parsed);
      setTestResult(res);
      showNotification(`Function executed (${res.latencyMs}ms, HTTP ${res.status})`);
    } catch (err: any) {
      showNotification('Function invocation failed', 'error');
    } finally {
      setIsInvoking(false);
    }
  };

  const handleAddSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFn || !newSecretKey.trim()) return;
    updateFunctionSecret(activeFn.id, newSecretKey.trim().toUpperCase(), newSecretVal.trim());
    setNewSecretKey('');
    setNewSecretVal('');
  };

  return (
    <div id="edge-functions-view" className="flex h-[calc(100vh-3.5rem)] bg-[#FAF7F2] overflow-hidden text-[#2B1D20]">
      {/* Left Sidebar Functions List */}
      <div className="w-64 border-r border-[#E8DDD2] bg-[#FFFDF9] flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#E8DDD2] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2B1D20]">
            <Zap className="w-3.5 h-3.5 text-[#8B1E3F]" />
            <span>Functions ({edgeFunctions.length})</span>
          </div>
          <button
            onClick={() => setIsNewFunctionModalOpen(true)}
            className="p-1 rounded-lg border border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#F4EFEA] text-[#8B1E3F] transition-colors"
            title="Deploy new function"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {edgeFunctions.map((fn) => {
            const isSelected = fn.id === activeFn?.id;
            return (
              <button
                key={fn.id}
                onClick={() => {
                  setSelectedFunctionId(fn.id);
                  setTestResult(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                  isSelected 
                    ? 'bg-[#FDF0F3] text-[#8B1E3F] font-semibold border border-[#F5CBD3] shadow-2xs' 
                    : 'text-[#685559] hover:text-[#2B1D20] hover:bg-[#F4EFEA]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${fn.status === 'active' ? 'bg-[#286E4F]' : 'bg-[#8C6D1F]'}`} />
                  <span className="truncate">{fn.name}</span>
                </div>
                <span className="font-mono text-[10px] text-[#9B888C]">{fn.avgLatencyMs}ms</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Function Detail View */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF7F2]">
        {activeFn && (
          <>
            {/* Function Top Header */}
            <div className="p-4 border-b border-[#E8DDD2] bg-[#FFFDF9] flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#2B1D20] font-mono">{activeFn.name}</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FDF0F3] text-[#8B1E3F] border border-[#F5CBD3] font-semibold">
                    {activeFn.runtime} ({activeFn.version})
                  </span>
                  <span className="text-[11px] text-[#9B888C] font-mono">
                    {activeFn.memoryMb}MB • {activeFn.timeoutSec}s timeout
                  </span>
                </div>
                <div className="text-xs text-[#685559] font-mono mt-1 select-all">
                  Endpoint: {projectSettings.apiUrl}/functions/v1/{activeFn.slug}
                </div>
              </div>

              {/* Sub-Tab Navigation */}
              <div className="flex items-center bg-[#FAF7F2] p-1 rounded-lg border border-[#E8DDD2] text-xs">
                <button
                  onClick={() => setActiveTab('test')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${activeTab === 'test' ? 'bg-[#FFFDF9] text-[#8B1E3F] font-semibold border border-[#E8DDD2] shadow-2xs' : 'text-[#685559] hover:text-[#2B1D20]'}`}
                >
                  Test Runner
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${activeTab === 'code' ? 'bg-[#FFFDF9] text-[#8B1E3F] font-semibold border border-[#E8DDD2] shadow-2xs' : 'text-[#685559] hover:text-[#2B1D20]'}`}
                >
                  Code View
                </button>
                <button
                  onClick={() => setActiveTab('secrets')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${activeTab === 'secrets' ? 'bg-[#FFFDF9] text-[#8B1E3F] font-semibold border border-[#E8DDD2] shadow-2xs' : 'text-[#685559] hover:text-[#2B1D20]'}`}
                >
                  Secrets ({Object.keys(activeFn.secrets).length})
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${activeTab === 'logs' ? 'bg-[#FFFDF9] text-[#8B1E3F] font-semibold border border-[#E8DDD2] shadow-2xs' : 'text-[#685559] hover:text-[#2B1D20]'}`}
                >
                  Logs ({activeFn.recentLogs.length})
                </button>
              </div>
            </div>

            {/* Sub-Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {/* Test Runner */}
              {activeTab === 'test' && (
                <div className="max-w-4xl space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Request payload */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#2B1D20]">
                        <span>HTTP POST Request JSON Body</span>
                        <span className="text-[11px] text-[#9B888C] font-mono">application/json</span>
                      </div>
                      <textarea
                        rows={10}
                        value={testPayload}
                        onChange={(e) => setTestPayload(e.target.value)}
                        className="w-full p-3 rounded-lg bg-[#FFFDF9] border border-[#E8DDD2] text-xs font-mono text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F] resize-none shadow-xs"
                      />
                      <button
                        onClick={handleTestInvoke}
                        disabled={isInvoking}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white transition-colors shadow-xs disabled:opacity-50"
                      >
                        {isInvoking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isInvoking ? 'Invoking Isolate...' : 'Invoke Function'}</span>
                      </button>
                    </div>

                    {/* Response Payload */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#2B1D20]">
                        <span>Execution Response</span>
                        {testResult && (
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="text-[#286E4F] font-semibold">HTTP {testResult.status}</span>
                            <span>•</span>
                            <span className="text-[#8B1E3F]">{testResult.latencyMs}ms</span>
                          </div>
                        )}
                      </div>

                      <div className="h-60 p-3 rounded-lg bg-[#FFFDF9] border border-[#E8DDD2] overflow-auto font-mono text-xs text-[#286E4F] shadow-xs">
                        {testResult ? (
                          <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-[#9B888C] text-xs">
                            <Terminal className="w-6 h-6 mb-1 text-[#E8DDD2]" />
                            <span>Click "Invoke Function" to test</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Code Snippet */}
              {activeTab === 'code' && (
                <div className="max-w-4xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#2B1D20]">
                    <span>Deno TypeScript Source Code (index.ts)</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeFn.codeSnippet);
                        showNotification('Function code copied');
                      }}
                      className="text-xs text-[#8B1E3F] hover:underline flex items-center gap-1 font-mono font-medium"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] text-xs font-mono text-[#2B1D20] overflow-auto leading-relaxed select-text shadow-xs">
                    {activeFn.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Secrets Manager */}
              {activeTab === 'secrets' && (
                <div className="max-w-3xl space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold text-[#2B1D20] mb-1">Environment Secrets</h3>
                    <p className="text-xs text-[#685559]">
                      Encrypted environment variables injected into the Deno runtime via <code className="font-mono text-[#8B1E3F] bg-[#FDF0F3] px-1 py-0.5 rounded">Deno.env.get("KEY")</code>.
                    </p>
                  </div>

                  {/* Existing secrets */}
                  <div className="space-y-2">
                    {Object.entries(activeFn.secrets).length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#9B888C] border border-dashed border-[#E8DDD2] bg-[#FFFDF9] rounded-xl">
                        No custom secrets configured for this function.
                      </div>
                    ) : (
                      Object.entries(activeFn.secrets).map(([k, v]) => (
                        <div key={k} className="p-3 rounded-lg bg-[#FFFDF9] border border-[#E8DDD2] flex items-center justify-between font-mono text-xs shadow-xs">
                          <div className="flex items-center gap-2">
                            <Key className="w-3.5 h-3.5 text-[#8B1E3F]" />
                            <span className="text-[#2B1D20] font-semibold">{k}</span>
                          </div>
                          <span className="text-[#9B888C]">••••••••••••••••</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Secret Form */}
                  <form onSubmit={handleAddSecret} className="p-4 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xs space-y-3">
                    <h4 className="text-xs font-semibold text-[#2B1D20]">Add or Update Secret</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="KEY_NAME (e.g. RESEND_KEY)"
                        value={newSecretKey}
                        onChange={(e) => setNewSecretKey(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#2B1D20] uppercase focus:outline-hidden focus:border-[#8B1E3F]"
                      />
                      <input
                        type="password"
                        required
                        placeholder="Secret Value"
                        value={newSecretVal}
                        onChange={(e) => setNewSecretVal(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white shadow-xs"
                      >
                        Save Secret
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Logs Stream */}
              {activeTab === 'logs' && (
                <div className="max-w-4xl space-y-3">
                  <div className="text-xs font-semibold text-[#2B1D20]">Recent Invocation Logs</div>
                  <div className="divide-y divide-[#E8DDD2] rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] overflow-hidden shadow-xs">
                    {activeFn.recentLogs.map((log) => (
                      <div key={log.id} className="p-3 text-xs font-mono flex items-start gap-3">
                        <span className="text-[#9B888C] flex-shrink-0 text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-[#286E4F] font-semibold flex-shrink-0 text-[11px]">
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="text-[#2B1D20] flex-1">{log.message}</span>
                        {log.executionTimeMs && (
                          <span className="text-[#9B888C] text-[11px] flex-shrink-0">{log.executionTimeMs}ms</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* New Function Modal */}
      {isNewFunctionModalOpen && (
        <CreateFunctionModal
          onClose={() => setIsNewFunctionModalOpen(false)}
          onCreate={(name) => {
            createEdgeFunction(name);
            setIsNewFunctionModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Subcomponent: Create Function Modal
const CreateFunctionModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string) => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2B1D20]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl shadow-2xl overflow-hidden text-[#2B1D20]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD2] bg-[#FAF7F2]">
          <h3 className="text-sm font-semibold text-[#2B1D20]">Create Edge Function</h3>
          <button onClick={onClose} className="text-[#9B888C] hover:text-[#2B1D20]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#2B1D20] mb-1">Function Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. process-payment, generate-pdf, slack-bot"
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E8DDD2] text-xs text-[#2B1D20] font-mono focus:outline-hidden focus:border-[#8B1E3F]"
            />
          </div>

          <p className="text-xs text-[#685559]">
            Deployed on Deno 2.x globally distributed V8 isolates with sub-50ms cold starts.
          </p>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E8DDD2]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs text-[#685559] hover:bg-[#F4EFEA] border border-[#E8DDD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-medium text-white shadow-xs"
            >
              Create Function
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
