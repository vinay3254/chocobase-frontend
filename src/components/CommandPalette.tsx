import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Table, 
  Terminal, 
  Users, 
  FolderArchive, 
  Zap, 
  Settings, 
  Activity, 
  Radio,
  FileCode,
  ArrowRight,
  Database
} from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { ActiveView } from '../types';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setActiveView, 
    tables, 
    setSelectedTableId, 
    edgeFunctions, 
    setSelectedFunctionId,
    storageBuckets,
    setSelectedBucketId,
    sqlTabs,
    setActiveSqlTabId,
    addSqlTab
  } = useSupabase();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  interface CommandItem {
    id: string;
    title: string;
    category: string;
    icon: React.ElementType;
    action: () => void;
  }

  const items: CommandItem[] = [
    // Views
    { id: 'view-overview', title: 'Go to Project Overview', category: 'Navigation', icon: Activity, action: () => { setActiveView('overview'); setIsCommandPaletteOpen(false); } },
    { id: 'view-tables', title: 'Go to Table Editor', category: 'Navigation', icon: Table, action: () => { setActiveView('table_editor'); setIsCommandPaletteOpen(false); } },
    { id: 'view-sql', title: 'Go to SQL Editor', category: 'Navigation', icon: Terminal, action: () => { setActiveView('sql_editor'); setIsCommandPaletteOpen(false); } },
    { id: 'view-schema', title: 'Go to Database & Schemas', category: 'Navigation', icon: Database, action: () => { setActiveView('database_schema'); setIsCommandPaletteOpen(false); } },
    { id: 'view-auth', title: 'Go to Authentication & Users', category: 'Navigation', icon: Users, action: () => { setActiveView('auth'); setIsCommandPaletteOpen(false); } },
    { id: 'view-storage', title: 'Go to Storage Buckets', category: 'Navigation', icon: FolderArchive, action: () => { setActiveView('storage'); setIsCommandPaletteOpen(false); } },
    { id: 'view-functions', title: 'Go to Edge Functions', category: 'Navigation', icon: Zap, action: () => { setActiveView('edge_functions'); setIsCommandPaletteOpen(false); } },
    { id: 'view-realtime', title: 'Go to Realtime Inspector', category: 'Navigation', icon: Radio, action: () => { setActiveView('realtime'); setIsCommandPaletteOpen(false); } },
    { id: 'view-api-docs', title: 'Go to API & GraphQL Docs', category: 'Navigation', icon: FileCode, action: () => { setActiveView('api_docs'); setIsCommandPaletteOpen(false); } },
    { id: 'view-settings', title: 'Go to Project Settings & API Keys', category: 'Navigation', icon: Settings, action: () => { setActiveView('settings'); setIsCommandPaletteOpen(false); } },

    // Quick Actions
    { id: 'action-new-sql', title: 'Create New SQL Snippet', category: 'Action', icon: Terminal, action: () => { addSqlTab(); setActiveView('sql_editor'); setIsCommandPaletteOpen(false); } },

    // Tables
    ...tables.map(t => ({
      id: `table-${t.id}`,
      title: `Table: ${t.schema}.${t.name} (${t.columns.length} columns, ${t.rowsCount || 0} rows)`,
      category: 'Tables',
      icon: Table,
      action: () => {
        setSelectedTableId(t.id);
        setActiveView('table_editor');
        setIsCommandPaletteOpen(false);
      }
    })),

    // Edge Functions
    ...edgeFunctions.map(f => ({
      id: `fn-${f.id}`,
      title: `Edge Function: ${f.name} (${f.status})`,
      category: 'Functions',
      icon: Zap,
      action: () => {
        setSelectedFunctionId(f.id);
        setActiveView('edge_functions');
        setIsCommandPaletteOpen(false);
      }
    })),

    // Storage Buckets
    ...storageBuckets.map(b => ({
      id: `bucket-${b.id}`,
      title: `Bucket: ${b.name} (${b.isPublic ? 'Public' : 'Private'})`,
      category: 'Storage',
      icon: FolderArchive,
      action: () => {
        setSelectedBucketId(b.id);
        setActiveView('storage');
        setIsCommandPaletteOpen(false);
      }
    }))
  ];

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  return (
    <div 
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div 
        id="command-palette-modal"
        className="w-full max-w-xl bg-[#FFFDF9] border border-[#E8DDD2] rounded-xl shadow-2xl overflow-hidden text-[#2B1D20] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8DDD2] bg-[#FAF7F2]">
          <Search className="w-4 h-4 text-[#8B1E3F] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search tables, functions, buckets..."
            className="w-full bg-transparent text-sm text-[#2B1D20] placeholder-[#9B888C] focus:outline-hidden"
          />
          <kbd className="text-[10px] font-mono bg-[#FFFDF9] text-[#685559] px-1.5 py-0.5 rounded border border-[#E8DDD2] shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 bg-[#FFFDF9]">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9B888C]">
              No matching commands or database resources found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                    isSelected 
                      ? 'bg-[#FDF0F3] text-[#8B1E3F] border border-[#F5CBD3]' 
                      : 'text-[#2B1D20] hover:bg-[#F4EFEA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#8B1E3F]' : 'text-[#685559]'}`} />
                    <span className="truncate font-medium">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#685559] border border-[#E8DDD2]">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#8B1E3F]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#FAF7F2] border-t border-[#E8DDD2] flex items-center justify-between text-[11px] text-[#685559]">
          <span>Navigate with <kbd className="font-mono text-[#2B1D20] bg-[#FFFDF9] px-1 py-0.5 rounded border border-[#E8DDD2]">↑</kbd> <kbd className="font-mono text-[#2B1D20] bg-[#FFFDF9] px-1 py-0.5 rounded border border-[#E8DDD2]">↓</kbd></span>
          <span>Select with <kbd className="font-mono text-[#2B1D20] bg-[#FFFDF9] px-1 py-0.5 rounded border border-[#E8DDD2]">↵</kbd></span>
        </div>
      </div>
    </div>
  );
};
