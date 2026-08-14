import React from 'react';
import { Calculator, Database, RefreshCw, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  appName?: string;
  isDbReady?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  appName = 'QuickPrice Photocopy',
  isDbReady = true,
  isDarkMode = true,
  onToggleDarkMode,
}) => {
  return (
    <header
      data-tauri-drag-region
      className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 acrylic-blur flex items-center justify-between px-4 sm:px-6 select-none shrink-0 z-50 shadow-sm transition-colors duration-200"
    >
      {/* App Branding */}
      <div className="flex items-center gap-3" data-tauri-drag-region>
        <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
          <Calculator className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 font-sans">
            {appName}
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-800/60">
              v1.0
            </span>
          </h1>
        </div>
      </div>

      {/* Right Controls & Unified Status */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Database Status Badge */}
        <div 
          title={isDbReady ? 'Cơ sở dữ liệu SQLite đã kết nối cục bộ' : 'Đang sử dụng bộ nhớ tạm LocalStorage'}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 font-medium"
        >
          <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className={`w-2 h-2 rounded-full ${isDbReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="hidden sm:inline">{isDbReady ? 'SQLite (Nội bộ)' : 'LocalStorage'}</span>
        </div>

        {/* Quick Dark/Light Mode Toggle */}
        {onToggleDarkMode && (
          <button
            type="button"
            title={isDarkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            onClick={() => onToggleDarkMode(!isDarkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/60 dark:border-slate-700/50"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" />
            )}
          </button>
        )}

        {/* Refresh App Button */}
        <button
          type="button"
          title="Tải lại trang ứng dụng"
          onClick={() => window.location.reload()}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

