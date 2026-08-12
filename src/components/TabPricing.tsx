import React, { useState, useEffect } from 'react';
import { PricingConfig, PaperSize } from '../types/billing';
import { usePricing } from '../hooks/usePricing';
import { Save, RotateCcw, Check, Printer, Wrench, Moon, Sun } from 'lucide-react';

interface TabPricingProps {
  isDarkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
}

export const TabPricing: React.FC<TabPricingProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const { config, loading, saving, toastMessage, updateConfig, resetToDefault } = usePricing();
  const [formState, setFormState] = useState<PricingConfig>(config);

  useEffect(() => {
    setFormState(config);
  }, [config]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfig(formState);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-on-surface-variant font-medium">
        Đang tải cấu hình bảng giá từ SQLite Database...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="w-full max-w-5xl space-y-6 animate-fade-in pb-16">
      {/* Top Banner Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-on-surface">Cấu Hình Bảng Giá & Giao Diện</h2>
          <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">
            Quản lý đơn giá in, phụ phí dịch vụ và chế độ hiển thị Dark Mode.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetToDefault}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface hover:bg-slate-200 dark:hover:bg-[#252525] text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Khôi Phục Mặc Định
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-[#b8d6ff] text-white dark:text-on-primary-container text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 dark:shadow-primary-container/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu...' : 'Lưu Bảng Giá'}
          </button>
        </div>
      </div>

      {/* 0. Dark Mode Switcher Card */}
      <div className="bg-white dark:bg-[#2D2D2D] rounded-xl border border-slate-200 dark:border-[#3D3D3D] p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 dark:text-primary border-b border-slate-200 dark:border-[#3D3D3D] pb-3">
          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
          <h3 className="font-bold text-sm text-slate-900 dark:text-on-surface">Chế Độ Hiển Thị Giao Diện (Theme Mode)</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/30">
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-on-surface">
              {isDarkMode ? 'Đang bật Giao diện Tối (Dark Mode)' : 'Đang bật Giao diện Sáng (Light Mode)'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">
              Chuyển đổi tức thì giữa giao diện sáng sạch sẽ hoặc tối đen chuẩn Windows 11 Fluent Design từ StitchMCP.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleDarkMode(!isDarkMode)}
            className={`w-14 h-8 rounded-full p-1 transition-colors relative flex items-center shadow-inner ${
              isDarkMode ? 'bg-blue-600 dark:bg-primary-container justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 transition-transform">
              {isDarkMode ? <Moon className="w-3.5 h-3.5 text-blue-700" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </div>
          </button>
        </div>
      </div>

      {/* 1. Print Price per Page Card */}
      <div className="bg-white dark:bg-[#2D2D2D] rounded-xl border border-slate-200 dark:border-[#3D3D3D] p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 dark:text-primary border-b border-slate-200 dark:border-[#3D3D3D] pb-3">
          <Printer className="w-5 h-5" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-on-surface">1. Đơn Giá In (Tính Trên 1 Trang)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['A4', 'A3', 'A5'] as PaperSize[]).map((size) => (
            <div key={size} className="p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/30 space-y-3">
              <span className="font-bold text-sm text-blue-700 dark:text-primary font-mono font-code">Khổ {size}</span>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-on-surface-variant block mb-1">In Đen trắng (đ/trang):</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formState.printPrices[size].bw}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setFormState((prev) => ({
                        ...prev,
                        printPrices: {
                          ...prev.printPrices,
                          [size]: { ...prev.printPrices[size], bw: val },
                        },
                      }));
                    }}
                    className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-3 py-2 text-slate-900 dark:text-on-surface font-mono font-code text-sm font-semibold focus:border-blue-600 dark:focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-on-surface-variant block mb-1">In Màu (đ/trang):</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formState.printPrices[size].color}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setFormState((prev) => ({
                        ...prev,
                        printPrices: {
                          ...prev.printPrices,
                          [size]: { ...prev.printPrices[size], color: val },
                        },
                      }));
                    }}
                    className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-3 py-2 text-slate-900 dark:text-on-surface font-mono font-code text-sm font-semibold focus:border-blue-600 dark:focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Extra Services & Surcharge Card */}
      <div className="bg-white dark:bg-[#2D2D2D] rounded-xl border border-slate-200 dark:border-[#3D3D3D] p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 dark:text-primary border-b border-slate-200 dark:border-[#3D3D3D] pb-3">
          <Wrench className="w-5 h-5" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-on-surface">2. Phụ Phí Dịch Vụ & Gia Công</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/30 space-y-2">
            <label className="text-xs font-semibold text-slate-800 dark:text-on-surface block">Bìa kiếng (đ/bộ):</label>
            <input
              type="number"
              min="0"
              step="500"
              value={formState.extraServices.coverPagePrice}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setFormState((prev) => ({
                  ...prev,
                  extraServices: { ...prev.extraServices, coverPagePrice: val },
                }));
              }}
              className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-3 py-2 text-slate-900 dark:text-on-surface font-mono font-code text-sm font-semibold focus:border-blue-600 dark:focus:border-primary focus:outline-none"
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/30 space-y-2">
            <label className="text-xs font-semibold text-slate-800 dark:text-on-surface block">Đóng ghim (đ/cuốn):</label>
            <input
              type="number"
              min="0"
              step="500"
              value={formState.extraServices.staplePrice}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setFormState((prev) => ({
                  ...prev,
                  extraServices: { ...prev.extraServices, staplePrice: val },
                }));
              }}
              className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-3 py-2 text-slate-900 dark:text-on-surface font-mono font-code text-sm font-semibold focus:border-blue-600 dark:focus:border-primary focus:outline-none"
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/30 space-y-2">
            <label className="text-xs font-semibold text-slate-800 dark:text-on-surface block">Đóng lò xo (đ/cuốn):</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formState.extraServices.spiralBindingPrice}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setFormState((prev) => ({
                  ...prev,
                  extraServices: { ...prev.extraServices, spiralBindingPrice: val },
                }));
              }}
              className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-3 py-2 text-slate-900 dark:text-on-surface font-mono font-code text-sm font-semibold focus:border-blue-600 dark:focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
