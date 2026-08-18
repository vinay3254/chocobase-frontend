import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  Users, 
  Layers, 
  Trash2, 
  CheckCircle2, 
  Plus, 
  X,
  Sparkles,
  RefreshCw,
  Terminal,
  Activity
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { RealtimeMessage } from '../../types';

export const RealtimeView: React.FC = () => {
  const { 
    realtimeChannels, 
    realtimeMessages, 
    sendRealtimeBroadcast, 
    clearRealtimeLogs,
    showNotification 
  } = useSupabase();

  const [selectedChannelName, setSelectedChannelName] = useState<string>(realtimeChannels[0]?.name || 'realtime:public:posts');
  const [broadcastEventName, setBroadcastEventName] = useState('cursor-update');
  const [broadcastPayload, setBroadcastPayload] = useState('{\n  "user": "vinaygk",\n  "position": { "x": 320, "y": 580 },\n  "status": "online"\n}');
  const [filterTopic, setFilterTopic] = useState<'all' | 'posts' | 'comments' | 'custom'>('all');

  const filteredMessages = realtimeMessages.filter(msg => {
    if (filterTopic === 'posts') return msg.topic.includes('posts');
    if (filterTopic === 'comments') return msg.topic.includes('comments');
    return true;
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    let payloadObj = {};
    try {
      payloadObj = JSON.parse(broadcastPayload);
    } catch {
      payloadObj = { text: broadcastPayload };
    }

    sendRealtimeBroadcast(selectedChannelName, broadcastEventName, payloadObj);
  };

  return (
    <div id="realtime-inspector-view" className="flex h-[calc(100vh-3.5rem)] bg-[#FAF7F2] overflow-hidden text-[#2B1D20]">
      {/* Left Channels List */}
      <div className="w-64 border-r border-[#E8DDD2] bg-[#FFFDF9] flex flex-col flex-shrink-0 hidden md:flex">
        <div className="p-3 border-b border-[#E8DDD2] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2B1D20]">
            <Radio className="w-3.5 h-3.5 text-[#8B1E3F]" />
            <span>Active Channels ({realtimeChannels.length})</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {realtimeChannels.map((channel) => {
            const isSelected = channel.name === selectedChannelName;
            return (
              <button
                key={channel.name}
                onClick={() => setSelectedChannelName(channel.name)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                  isSelected 
                    ? 'bg-[#FDF0F3] text-[#8B1E3F] font-semibold border border-[#F5CBD3]' 
                    : 'text-[#685559] hover:text-[#2B1D20] hover:bg-[#F4EFEA]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#8B1E3F] animate-pulse" />
                  <span className="truncate font-mono">{channel.name}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#9B888C] font-mono">
                  <Users className="w-3 h-3" />
                  <span>{channel.subscribersCount}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#E8DDD2] bg-[#FAF7F2] text-[11px] text-[#685559]">
          WebSocket protocol: <span className="text-[#286E4F] font-mono font-medium">Phoenix V2</span>
        </div>
      </div>

      {/* Main Realtime Inspector Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF7F2]">
        {/* Channel Header */}
        <div className="p-4 border-b border-[#E8DDD2] bg-[#FFFDF9] flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#2B1D20] font-mono">{selectedChannelName}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFF7F3] text-[#286E4F] border border-[#C4E6D5] font-semibold">
                Connected
              </span>
            </div>
            <p className="text-xs text-[#685559] mt-0.5">PostgreSQL WAL Change Data Capture (CDC) + Broadcast + Presence stream</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearRealtimeLogs}
              className="p-1.5 rounded-lg bg-[#FFFDF9] hover:bg-[#F4EFEA] text-[#685559] hover:text-[#2B1D20] border border-[#E8DDD2] transition-colors"
              title="Clear event stream"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Event Stream and Simulator */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Live Message Feed (Left) */}
          <div className="flex-1 flex flex-col border-r border-[#E8DDD2] bg-[#FFFDF9] min-w-0">
            <div className="p-3 border-b border-[#E8DDD2] bg-[#FAF7F2] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2B1D20]">Live CDC & WebSocket Messages</span>
              <span className="text-[11px] font-mono text-[#9B888C]">{filteredMessages.length} events logged</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
              {filteredMessages.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-[#9B888C] text-xs">
                  <Radio className="w-8 h-8 text-[#E8DDD2] mb-2" />
                  <p>Listening for Postgres CDC events and channel broadcasts...</p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] text-xs font-mono space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-[11px] px-1.5 py-0.5 rounded ${
                          msg.event === 'INSERT' ? 'bg-[#EFF7F3] text-[#286E4F] border border-[#C4E6D5]' :
                          msg.event === 'UPDATE' ? 'bg-[#FDF8E8] text-[#8C6D1F] border border-[#F5E5B8]' :
                          msg.event === 'DELETE' ? 'bg-[#FDF0F3] text-[#8B1E3F] border border-[#F5CBD3]' : 
                          'bg-[#F0F4FA] text-[#3B5B88] border border-[#D0DDEF]'
                        }`}>
                          {msg.event}
                        </span>
                        <span className="text-[#2B1D20] font-medium truncate">{msg.topic}</span>
                      </div>
                      <span className="text-[10px] text-[#9B888C]">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <pre className="p-2.5 rounded-lg bg-[#FFFDF9] text-[11px] text-[#286E4F] overflow-x-auto border border-[#E8DDD2]">
                      {JSON.stringify(msg.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Broadcast Simulator (Right) */}
          <div className="w-full lg:w-96 bg-[#FAF7F2] p-5 flex flex-col justify-between overflow-y-auto space-y-4 scrollbar-thin">
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-[#2B1D20] mb-1">Broadcast Simulator</h3>
                <p className="text-xs text-[#685559]">
                  Send low-latency messages to all clients subscribed to <code className="font-mono text-[#8B1E3F] bg-[#FDF0F3] px-1 py-0.5 rounded text-[11px]">{selectedChannelName}</code>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2B1D20] mb-1">Event Name</label>
                <input
                  type="text"
                  value={broadcastEventName}
                  onChange={(e) => setBroadcastEventName(e.target.value)}
                  placeholder="e.g. chat-message, cursor-position"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#FFFDF9] border border-[#E8DDD2] text-xs font-mono text-[#2B1D20] focus:outline-hidden focus:border-[#8B1E3F] shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2B1D20] mb-1">JSON Payload</label>
                <textarea
                  rows={6}
                  value={broadcastPayload}
                  onChange={(e) => setBroadcastPayload(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#FFFDF9] border border-[#E8DDD2] text-xs font-mono text-[#3B5B88] focus:outline-hidden focus:border-[#8B1E3F] resize-none shadow-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#8B1E3F] hover:bg-[#721833] text-xs font-semibold text-white transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Broadcast</span>
              </button>
            </form>

            <div className="p-3 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] text-xs space-y-1 shadow-xs">
              <div className="font-semibold text-[#2B1D20]">Client Code Example</div>
              <pre className="text-[10px] font-mono text-[#685559] overflow-x-auto p-2 bg-[#FAF7F2] rounded-lg border border-[#E8DDD2]">
{`const channel = supabase.channel('${selectedChannelName}')
channel.on('broadcast', { event: '${broadcastEventName}' }, payload => {
  console.log('Received:', payload)
}).subscribe()`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
