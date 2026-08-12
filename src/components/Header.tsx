import React from 'react';
import { Calculator, Database, RefreshCw } from 'lucide-react';

interface HeaderProps {
  appName?: string;
  isDbReady?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  appName = 'QuickPrice Photocopy',
  isDbReady = true,
}) => {
  return (
    <header
      data-tauri-drag-region
      className="h-14 border-b border-slate-200 dark:border-surface-container-high bg-white/95 dark:bg-[#131313]/95 acrylic-blur flex items-center justify-between px-6 select-none shrink-0 z-50 shadow-sm transition-colors duration-200"
    >
      {/* App Branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-md shadow-primary-container/30">
          <Calculator className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide text-slate-900 dark:text-on-surface flex items-center gap-2 font-sans">
            {appName}
          </h1>
        </div>
      </div>

      {/* Right Controls & Unified Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/40 text-xs text-slate-700 dark:text-on-surface-variant font-medium">
          <Database className="w-3.5 h-3.5 text-blue-600 dark:text-primary" />
          <span className={`w-2 h-2 rounded-full ${isDbReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{isDbReady ? 'SQLite Local (Offline)' : 'LocalStorage (Offline)'}</span>
        </div>
        <button
          title="Tải lại ứng dụng"
          onClick={() => window.location.reload()}
          className="p-2 text-slate-600 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface rounded-lg hover:bg-slate-100 dark:hover:bg-surface-container transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
