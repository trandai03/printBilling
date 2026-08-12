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
      className={`h-full bg-white dark:bg-surface-container-lowest text-slate-900 dark:text-primary font-sans border-r border-slate-200 dark:border-outline-variant flex flex-col py-4 shrink-0 select-none transition-all duration-300 ${
        isCollapsed ? 'w-16 px-2' : 'w-16 md:w-[260px] px-2 md:px-3'
      }`}
    >
      {/* Sidebar Header & Toggle */}
      <div className="px-2 pb-3 flex items-center justify-between border-b border-slate-200/60 dark:border-outline-variant/20 mb-2">
        <span
          className={`text-[11px] font-bold text-slate-400 dark:text-outline uppercase tracking-widest transition-opacity ${
            isCollapsed ? 'hidden' : 'hidden md:block'
          }`}
        >
          Danh mục chính
        </span>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-on-surface hover:bg-slate-100 dark:hover:bg-white/5 transition-colors mx-auto md:mx-0"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-primary" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 hidden md:block" />
              <PanelLeftOpen className="w-4 h-4 md:hidden text-blue-600 dark:text-primary" />
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
                  ? 'bg-blue-50 dark:bg-primary-container/15 text-blue-700 dark:text-primary border-l-[3px] border-blue-600 dark:border-primary font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface hover:bg-slate-100 dark:hover:bg-white/5 border-l-[3px] border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-blue-600 dark:text-primary' : 'text-slate-400 dark:text-on-surface-variant'
                  }`}
                />
                <div className={`text-left ${isCollapsed ? 'hidden' : 'hidden md:block'}`}>
                  <div
                    className={`text-sm ${
                      isActive ? 'text-blue-700 dark:text-primary font-semibold' : 'text-slate-800 dark:text-on-surface'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-on-surface-variant/70 font-normal truncate max-w-[170px]">
                    {item.subtitle}
                  </div>
                </div>
              </div>
              {isActive && (
                <ChevronRight
                  className={`w-4 h-4 text-blue-600 dark:text-primary opacity-80 ${
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
        className={`mt-auto px-2 pt-3 border-t border-slate-200/60 dark:border-outline-variant/20 flex items-center text-[11px] text-slate-400 dark:text-on-surface-variant/50 font-medium ${
          isCollapsed ? 'justify-center' : 'justify-center md:justify-between'
        }`}
      >
        <span className={isCollapsed ? 'hidden' : 'hidden md:inline'}>QuickPrice</span>
        <span>v1.0</span>
      </div>
    </aside>
  );
};

