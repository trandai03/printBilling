import React, { useState, useEffect, useRef } from 'react';
import { PricingConfig, PaperSize, BackupPayload } from '../types/billing';
import { usePricing } from '../hooks/usePricing';
import { Save, RotateCcw, Check, Printer, Wrench, Moon, Sun, Layers, Database, Download, Upload, FileJson, X } from 'lucide-react';
import { exportFullBackupPayload, importFullBackupPayload } from '../services/db';

interface TabPricingProps {
  isDarkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
}

export const TabPricing: React.FC<TabPricingProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const { config, loading, saving, toastMessage, updateConfig, resetToDefault } = usePricing();
  const [formState, setFormState] = useState<PricingConfig>(config);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<BackupPayload | null>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('overwrite');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormState(config);
  }, [config]);

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const payload = await exportFullBackupPayload();
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(11, 16).replace(':', '');
      const fileName = `print_billing_backup_${dateStr}_${timeStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupMessage(`Đã xuất file sao lưu thành công (${fileName})!`);
      setTimeout(() => setBackupMessage(null), 4000);
    } catch (err) {
      console.error('Lỗi xuất dữ liệu sao lưu:', err);
      alert('Có lỗi xảy ra khi xuất dữ liệu sao lưu.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as BackupPayload;

        if (!parsed || !parsed.pricingConfig || !Array.isArray(parsed.orders)) {
          alert('File sao lưu không đúng định dạng (.json) hoặc bị lỗi cấu trúc dữ liệu!');
          return;
        }

        setPendingPayload(parsed);
        setIsImportModalOpen(true);
      } catch (err) {
        alert('Không thể đọc file sao lưu. Vui lòng kiểm tra lại định dạng JSON.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!pendingPayload) return;
    try {
      setIsImporting(true);
      const res = await importFullBackupPayload(pendingPayload, importMode);
      setIsImportModalOpen(false);
      setPendingPayload(null);

      setFormState(pendingPayload.pricingConfig);
      setBackupMessage(
        `Khôi phục thành công! Đã ${importMode === 'overwrite' ? 'ghi đè' : 'gộp'} ${res.importedOrdersCount} đơn hàng và đồng bộ bảng giá.`
      );
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Khôi phục dữ liệu thất bại.');
    } finally {
      setIsImporting(false);
    }
  };


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

      {/* 3. Bulk Sheet Pricing Card */}
      <div className="bg-white dark:bg-[#2D2D2D] rounded-xl border border-slate-200 dark:border-[#3D3D3D] p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 dark:text-primary border-b border-slate-200 dark:border-[#3D3D3D] pb-3">
          <Layers className="w-5 h-5" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-on-surface">3. Ưu Đãi In Theo Số Lượng Tờ (Bulk Sheet Pricing)</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/30">
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-on-surface">
              {formState.bulkSheetPricing?.enabled
                ? 'Đang BẬT chế độ đồng giá ưu đãi khi in số lượng lớn'
                : 'Đang TẮT chế độ đồng giá ưu đãi'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">
              Khi đơn hàng đạt từ số tờ tối thiểu trở lên, hệ thống sẽ tự động áp dụng đơn giá đồng giá ưu đãi cho tất cả các trang/tờ.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                bulkSheetPricing: {
                  ...prev.bulkSheetPricing,
                  enabled: !prev.bulkSheetPricing?.enabled,
                },
              }))
            }
            className={`w-14 h-8 rounded-full p-1 transition-colors relative flex items-center shadow-inner ${
              formState.bulkSheetPricing?.enabled
                ? 'bg-blue-600 dark:bg-primary-container justify-end'
                : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 transition-transform font-bold text-[10px]">
              {formState.bulkSheetPricing?.enabled ? 'ON' : 'OFF'}
            </div>
          </button>
        </div>

        {formState.bulkSheetPricing?.enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/30 space-y-2">
              <label className="text-xs font-semibold text-slate-800 dark:text-on-surface block">
                Số tờ tối thiểu để áp dụng ưu đãi (tờ):
              </label>
              <input
                type="number"
                min="1"
                step="10"
                value={formState.bulkSheetPricing.thresholdSheets}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  setFormState((prev) => ({
                    ...prev,
                    bulkSheetPricing: {
                      ...prev.bulkSheetPricing,
                      thresholdSheets: val,
                    },
                  }));
                }}
                className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-3 py-2 text-slate-900 dark:text-on-surface font-mono font-code text-sm font-semibold focus:border-blue-600 dark:focus:border-primary focus:outline-none"
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/30 space-y-2">
              <label className="text-xs font-semibold text-slate-800 dark:text-on-surface block">
                Đơn giá ưu đãi đồng giá (đ/trang):
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={formState.bulkSheetPricing.unitPrice}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  setFormState((prev) => ({
                    ...prev,
                    bulkSheetPricing: {
                      ...prev.bulkSheetPricing,
                      unitPrice: val,
                    },
                  }));
                }}
                className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-3 py-2 text-slate-900 dark:text-on-surface font-mono font-code text-sm font-semibold focus:border-blue-600 dark:focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. QUẢN LÝ DỮ LIỆU & SAO LƯU */}
      <div className="bg-white dark:bg-surface-container-high/60 rounded-2xl p-6 border border-slate-200/80 dark:border-outline-variant/30 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-on-surface">Quản Lý Dữ Liệu & Sao Lưu</h3>
              <p className="text-xs text-slate-500 dark:text-on-surface-variant">
                Xuất file sao lưu (.json) toàn bộ bảng giá và lịch sử đơn hàng hoặc khôi phục dữ liệu khi nâng cấp ứng dụng.
              </p>
            </div>
          </div>
        </div>

        {backupMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{backupMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-primary text-white dark:text-on-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-xs font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Đang xuất file...' : 'Xuất File Sao Lưu (.json)'}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-outline-variant/60 bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-on-surface hover:bg-slate-100 dark:hover:bg-[#252525] text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4 text-blue-500" />
            Khôi Phục Dữ Liệu
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* IMPORT MODAL */}
      {isImportModalOpen && pendingPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-outline-variant/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-outline-variant/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <FileJson className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-on-surface">Tùy Chọn Khôi Phục Dữ Liệu</h3>
                  <p className="text-xs text-slate-500 dark:text-on-surface-variant">Xác nhận chế độ khôi phục dữ liệu từ file sao lưu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-on-surface p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-[#141414] p-4 rounded-xl space-y-2 border border-slate-200/60 dark:border-outline-variant/20 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-on-surface-variant">Ngày xuất file:</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-on-surface">
                  {new Date(pendingPayload.exportedAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-on-surface-variant">Phiên bản ứng dụng:</span>
                <span className="font-semibold text-slate-900 dark:text-on-surface">{pendingPayload.version || '1.0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-on-surface-variant">Số lượng đơn hàng trong file:</span>
                <span className="font-semibold font-mono text-blue-600 dark:text-primary">{pendingPayload.orders.length} đơn hàng</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 dark:text-on-surface block">
                Chọn phương thức khôi phục:
              </label>

              <label
                onClick={() => setImportMode('overwrite')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  importMode === 'overwrite'
                    ? 'border-blue-600 bg-blue-50/50 dark:border-primary dark:bg-primary-container/20'
                    : 'border-slate-200 dark:border-outline-variant/40 bg-white dark:bg-[#181818]'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'overwrite'}
                  onChange={() => setImportMode('overwrite')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-on-surface flex items-center gap-1.5">
                    Ghi đè hoàn toàn (Overwrite)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-on-surface-variant mt-0.5">
                    Xóa toàn bộ đơn hàng hiện tại và nạp lại toàn bộ dữ liệu từ file sao lưu.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setImportMode('merge')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  importMode === 'merge'
                    ? 'border-blue-600 bg-blue-50/50 dark:border-primary dark:bg-primary-container/20'
                    : 'border-slate-200 dark:border-outline-variant/40 bg-white dark:bg-[#181818]'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-on-surface flex items-center gap-1.5">
                    Gộp dữ liệu (Merge)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-on-surface-variant mt-0.5">
                    Giữ các đơn hàng hiện tại và gộp bổ sung các đơn hàng chưa có từ file sao lưu.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-outline-variant/30">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-on-surface-variant hover:bg-slate-100 dark:hover:bg-[#252525]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 dark:bg-primary text-white dark:text-on-primary hover:bg-blue-700 dark:hover:bg-primary/90 text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {isImporting ? 'Đang Khôi Phục...' : 'Xác Nhận Khôi Phục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

