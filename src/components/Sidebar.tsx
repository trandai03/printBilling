import React, { useState } from 'react';
import { Calculator, Settings, History, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface SidebarProps {
  activeTab: 'calculator' | 'pricing' | 'history';
  setActiveTab: (tab: 'calculator' | 'pricing' | 'history') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const menuItems = [
    {
      id: 'calculator' as const,
      label: 'Tính Tiền In / Phô-tô',
      subtitle: 'Đếm trang & Tính đơn hàng',
      icon: Calculator,
    },
    {
      id: 'pricing' as const,
      label: 'Cấu Hình Bảng Giá',
      subtitle: 'Đơn giá in, phụ phí & Dark mode',
      icon: Settings,
    },
    {
      id: 'history' as const,
      label: 'Lịch Sử Đơn Hàng',
      subtitle: 'Tra cứu & Xuất CSV',
      icon: History,
    },
  ];

  return (
    <aside
      className={`h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans border-r border-slate-200 dark:border-slate-800 flex flex-col py-4 shrink-0 select-none transition-all duration-300 ${
        isCollapsed ? 'w-16 px-2' : 'w-16 md:w-[260px] px-2 md:px-3'
      }`}
    >
      {/* Sidebar Header & Toggle */}
      <div className="px-2 pb-3 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 mb-3">
        <span
          className={`text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-opacity ${
            isCollapsed ? 'hidden' : 'hidden md:block'
          }`}
        >
          Menu Chính
        </span>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto md:mx-0"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 hidden md:block" />
              <PanelLeftOpen className="w-4 h-4 md:hidden text-blue-600 dark:text-blue-400" />
            </>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center justify-center ${
                isCollapsed ? 'md:justify-center' : 'md:justify-between'
              } px-2.5 md:px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-l-[3px] border-blue-600 dark:border-blue-500 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border-l-[3px] border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                    isActive ? 'text-blue-600 dark:text-blue-400 scale-105' : 'text-slate-400 dark:text-slate-500 group-hover:scale-105'
                  }`}
                />
                <div className={`text-left ${isCollapsed ? 'hidden' : 'hidden md:block'}`}>
                  <div
                    className={`text-sm tracking-tight ${
                      isActive ? 'text-blue-700 dark:text-blue-400 font-semibold' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate max-w-[170px]">
                    {item.subtitle}
                  </div>
                </div>
              </div>
              {isActive && (
                <ChevronRight
                  className={`w-4 h-4 text-blue-600 dark:text-blue-400 opacity-80 ${
                    isCollapsed ? 'hidden' : 'hidden md:block'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Clean Footer Version Info */}
      <div
        className={`mt-auto px-2 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center text-[11px] text-slate-400 dark:text-slate-500 font-medium ${
          isCollapsed ? 'justify-center' : 'justify-center md:justify-between'
        }`}
      >
        <span className={isCollapsed ? 'hidden' : 'hidden md:inline'}>QuickPrice Photocopy</span>
        <span className="font-mono">v1.0</span>
      </div>
    </aside>
  );
};

