import React from 'react';
import { SupabaseProvider, useSupabase } from './context/SupabaseContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { ConnectModal } from './components/ConnectModal';
import { OverviewView } from './components/Overview/OverviewView';
import { TableEditorView } from './components/TableEditor/TableEditorView';
import { SqlEditorView } from './components/SqlEditor/SqlEditorView';
import { DatabaseSchemaView } from './components/DatabaseSchema/DatabaseSchemaView';
import { AuthView } from './components/Auth/AuthView';
import { StorageView } from './components/Storage/StorageView';
import { FunctionsView } from './components/Functions/FunctionsView';
import { RealtimeView } from './components/Realtime/RealtimeView';
import { ObservabilityView } from './components/Observability/ObservabilityView';
import { SettingsView } from './components/Settings/SettingsView';
import { ApiDocsView } from './components/ApiDocs/ApiDocsView';
import { IntroLandingView } from './components/Landing/IntroLandingView';
import { AuthModal } from './components/Auth/AuthModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { activeView, notification, clearNotification, setIsCommandPaletteOpen } = useSupabase();

  // Global Keyboard Shortcut Listener for Cmd+K (Mac) and Ctrl+K (Windows/Linux)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCommandPaletteOpen]);

  if (activeView === 'landing') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#2B1D20] font-sans antialiased">
        <IntroLandingView />
        <AuthModal />
        <CommandPalette />
        <ConnectModal />
        {notification && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xl text-xs font-medium text-[#2B1D20] animate-in slide-in-from-bottom-2 fade-in duration-200">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#8B1E3F] flex-shrink-0" />
            ) : notification.type === 'info' ? (
              <Info className="w-4 h-4 text-[#3B5B88] flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#8B1E3F] flex-shrink-0" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={clearNotification}
              className="ml-2 text-[#9C888C] hover:text-[#2B1D20] p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView />;
      case 'table_editor':
        return <TableEditorView />;
      case 'sql_editor':
        return <SqlEditorView />;
      case 'database_schema':
        return <DatabaseSchemaView />;
      case 'auth':
        return <AuthView />;
      case 'storage':
        return <StorageView />;
      case 'functions':
      case 'edge_functions':
        return <FunctionsView />;
      case 'realtime':
        return <RealtimeView />;
      case 'observability':
        return <ObservabilityView />;
      case 'api_docs':
        return <ApiDocsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#FAF7F2] text-[#2B1D20] font-sans antialiased overflow-hidden select-none">
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 overflow-y-auto bg-[#FAF7F2]">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal />
      <CommandPalette />
      <ConnectModal />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E8DDD2] shadow-xl text-xs font-medium text-[#2B1D20] animate-in slide-in-from-bottom-2 fade-in duration-200">
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-[#8B1E3F] flex-shrink-0" />
          ) : notification.type === 'info' ? (
            <Info className="w-4 h-4 text-[#3B5B88] flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#8B1E3F] flex-shrink-0" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={clearNotification}
            className="ml-2 text-[#9C888C] hover:text-[#2B1D20] p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <SupabaseProvider>
      <DashboardContent />
    </SupabaseProvider>
  );
}

export default App;
