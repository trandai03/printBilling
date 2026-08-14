import React, { useState, useMemo } from 'react';
import {
  PaperSize,
  PrintMode,
  SidesMode,
  PaperWeight,
  ExtraServices,
  PricingConfig,
  OrderRecord,
  OrderStatus,
  CustomerRecord,
} from '../types/billing';
import { useFileAnalyzer } from '../hooks/useFileAnalyzer';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { calculateBilling } from '../utils/calculator';
import { formatCurrencyVND, formatFileSize } from '../utils/fileParser';
import {
  FileText,
  FileCode,
  Loader2,
  Printer,
  RotateCcw,
  BookOpen,
  Paperclip,
  Book,
  Palette,
  SunMedium,
  FileCheck,
  Edit3,
  Plus,
  Trash2,
  Files,
  User,
  Phone,
  UserCheck,
  ChevronDown,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TabCalculatorProps {
  pricingConfig: PricingConfig;
  onSaveOrder: (order: OrderRecord) => void;
}

export const TabCalculator: React.FC<TabCalculatorProps> = ({
  pricingConfig,
  onSaveOrder,
}) => {
  // Multi-file analyzer hook
  const {
    fileItems,
    addFiles,
    addManualItem,
    updateFileName,
    updateFilePageCount,
    updateFileCopies,
    removeFileItem,
    clearAllFiles,
  } = useFileAnalyzer();

  // History hook for customer suggestions & search
  const { uniqueCustomers } = useOrderHistory();

  // Custom document & Customer inputs
  const [orderNameInput, setOrderNameInput] = useState<string>('');
  const [customerNameInput, setCustomerNameInput] = useState<string>('');
  const [customerPhoneInput, setCustomerPhoneInput] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('COMPLETED');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState<boolean>(false);
  const [selectedCustomerObj, setSelectedCustomerObj] = useState<CustomerRecord | null>(null);

  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [printMode, setPrintMode] = useState<PrintMode>('BW');
  const [sidesMode, setSidesMode] = useState<SidesMode>('SIMPLEX');
  const [paperWeight, setPaperWeight] = useState<PaperWeight>('70gsm');
  const [extraServices, setExtraServices] = useState<ExtraServices>({
    coverPage: false,
    staple: false,
    spiralBinding: false,
  });

  // Drag & drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Filtered customer list based on search query
  const filteredCustomers = useMemo(() => {
    if (!customerNameInput.trim()) return uniqueCustomers;
    const q = customerNameInput.toLowerCase().trim();
    return uniqueCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    );
  }, [uniqueCustomers, customerNameInput]);

  const handleSelectCustomer = (cust: CustomerRecord) => {
    setCustomerNameInput(cust.name);
    if (cust.phone) {
      setCustomerPhoneInput(cust.phone);
    }
    setSelectedCustomerObj(cust);
    setIsCustomerDropdownOpen(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  // Realtime calculation across all files
  const calculation = useMemo(() => {
    return calculateBilling(
      fileItems,
      paperSize,
      printMode,
      sidesMode,
      paperWeight,
      extraServices,
      pricingConfig
    );
  }, [
    fileItems,
    paperSize,
    printMode,
    sidesMode,
    paperWeight,
    extraServices,
    pricingConfig,
  ]);

  // Save Order
  const handleSaveAndPrint = () => {
    if (fileItems.length === 0) {
      alert('Vui lòng thêm ít nhất 1 file tài liệu!');
      return;
    }

    let summaryName = orderNameInput.trim();
    if (!summaryName) {
      if (fileItems.length === 1) {
        summaryName = fileItems[0].fileName;
      } else {
        summaryName = `${fileItems[0].fileName} (+ ${fileItems.length - 1} file khác)`;
      }
    }

    const totalSize = fileItems.reduce((acc, f) => acc + f.fileSize, 0);

    const newOrder: OrderRecord = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      fileName: summaryName,
      fileSize: totalSize,
      pageCount: calculation.filePages,
      copies: calculation.copies,
      customerName: customerNameInput.trim() || 'Khách vãng lai',
      customerPhone: customerPhoneInput.trim() || undefined,
      status: orderStatus,
      fileItems,
      paperSize,
      printMode,
      sidesMode,
      paperWeight,
      extraServices,
      totalPages: calculation.totalPages,
      totalSheets: calculation.totalSheets,
      printCost: calculation.printCost,
      extraCost: calculation.extraCost,
      totalAmount: calculation.totalAmount,
    };

    onSaveOrder(newOrder);
  };

  const handleResetForm = () => {
    clearAllFiles();
    setOrderNameInput('');
    setCustomerNameInput('');
    setCustomerPhoneInput('');
    setSelectedCustomerObj(null);
    setOrderStatus('COMPLETED');
    setPaperSize('A4');
    setPrintMode('BW');
    setSidesMode('SIMPLEX');
    setPaperWeight('70gsm');
    setExtraServices({
      coverPage: false,
      staple: false,
      spiralBinding: false,
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-16 animate-fade-in">
      {/* Left Column: Multi-File Dropzone & Config Form */}
      <div className="flex-1 flex flex-col gap-6 w-full max-w-full lg:max-w-4xl">
        {/* Dropzone / File List Container Card */}
        <div className="bg-white dark:bg-[#2D2D2D] rounded-xl border border-slate-200 dark:border-[#3D3D3D] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#3D3D3D] pb-3">
            <div className="flex items-center gap-2">
              <Files className="w-5 h-5 text-blue-600 dark:text-primary" />
              <h3 className="font-bold text-base text-slate-900 dark:text-on-surface">
                Danh Sách File In ({fileItems.length} file)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="fileInputMulti"
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('fileInputMulti');
                  if (el) el.click();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-[#b8d6ff] text-white dark:text-on-primary-container text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm File
              </button>

              <button
                type="button"
                onClick={() => addManualItem()}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-400 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
                Nhập Thủ Công
              </button>

              {fileItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllFiles}
                  className="px-3 py-1.5 text-xs text-red-600 dark:text-error hover:bg-red-50 dark:hover:bg-error/10 rounded-lg transition-colors border border-red-200 dark:border-error/20"
                >
                  Xóa Hết
                </button>
              )}
            </div>
          </div>

          {/* Render File Cards List */}
          {fileItems.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {fileItems.map((item) => {
                const ext = item.fileName.split('.').pop()?.toLowerCase();
                const isPdf = ext === 'pdf';
                const isManual = item.isManual || !item.file;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/40 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors"
                  >
                    {/* Left: File info */}
                    <div className="flex items-center gap-3 truncate flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isManual
                            ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20'
                            : isPdf
                            ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-error border border-red-200 dark:border-red-500/20'
                            : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-primary border border-blue-200 dark:border-blue-500/20'
                        }`}
                      >
                        {isManual ? (
                          <Edit3 className="w-5 h-5" />
                        ) : isPdf ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <FileCode className="w-5 h-5" />
                        )}
                      </div>

                      <div className="truncate text-left flex-1">
                        {isManual ? (
                          <input
                            type="text"
                            value={item.fileName}
                            onChange={(e) => updateFileName(item.id, e.target.value)}
                            placeholder="Nhập tên tài liệu..."
                            className="font-semibold text-slate-900 dark:text-on-surface text-xs bg-white dark:bg-[#131313] border border-slate-300 dark:border-outline-variant/40 rounded px-2 py-0.5 focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 w-full max-w-xs"
                          />
                        ) : (
                          <h4 className="font-semibold text-slate-900 dark:text-on-surface text-xs truncate">
                            {item.fileName}
                          </h4>
                        )}
                        <p className="text-[11px] text-slate-500 dark:text-on-surface-variant font-mono font-code mt-0.5">
                          {isManual ? (
                            <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                              Nhập thủ công
                            </span>
                          ) : (
                            formatFileSize(item.fileSize)
                          )}
                          {item.loading && ' | Đang đếm số trang...'}
                        </p>
                      </div>
                    </div>

                    {/* Controls per file: Pages & Copies */}
                    <div className="flex items-center gap-4 shrink-0">
                      {item.loading ? (
                        <Loader2 className="w-5 h-5 text-blue-600 dark:text-primary animate-spin" />
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-500 dark:text-on-surface-variant">Trang:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.pageCount}
                              onChange={(e) =>
                                updateFilePageCount(item.id, parseInt(e.target.value, 10) || 1)
                              }
                              className="w-16 bg-white dark:bg-[#131313] border border-slate-300 dark:border-outline-variant/40 rounded-lg px-2 py-1 text-slate-900 dark:text-on-surface text-center font-mono font-code text-xs font-bold focus:outline-none focus:border-blue-600 dark:focus:border-primary"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-500 dark:text-on-surface-variant">Bản:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.copies}
                              onChange={(e) =>
                                updateFileCopies(item.id, parseInt(e.target.value, 10) || 1)
                              }
                              className="w-16 bg-white dark:bg-[#131313] border border-slate-300 dark:border-outline-variant/40 rounded-lg px-2 py-1 text-slate-900 dark:text-on-surface text-center font-mono font-code text-xs font-bold focus:outline-none focus:border-blue-600 dark:focus:border-primary"
                            />
                          </div>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => removeFileItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-error hover:bg-slate-200 dark:hover:bg-error/10 rounded-lg transition-colors"
                        title="Xóa dòng này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Dropzone Box when empty */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-xl border-dashed border-2 p-8 flex flex-col items-center justify-center text-center transition-all ${
                isDragging
                  ? 'border-blue-600 dark:border-primary bg-blue-50 dark:bg-primary/10 scale-[1.01]'
                  : 'border-slate-300 dark:border-outline-variant hover:border-blue-500 dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-[#323232]'
              }`}
            >
              <div className="flex gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-surface-container flex items-center justify-center shadow-md">
                  <FileText className="w-7 h-7 text-red-500 dark:text-error" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-surface-container flex items-center justify-center shadow-md">
                  <FileCode className="w-7 h-7 text-blue-600 dark:text-primary" />
                </div>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-on-surface mb-1">
                Kéo thả 1 hoặc NHIỀU file (PDF / DOCX) vào đây
              </h3>
              <p className="text-slate-500 dark:text-on-surface-variant text-xs mb-4">
                hoặc chọn file từ máy tính của bạn
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('fileInputMulti');
                    if (el) el.click();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-[#b8d6ff] text-white dark:text-on-primary-container text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Chọn File Từ Máy
                </button>
                <button
                  type="button"
                  onClick={() => addManualItem()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-400 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Tự Nhập Số Trang
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Searchable Customer Information Level 1 Card */}
        <div className="bg-white dark:bg-[#2D2D2D] rounded-xl border border-slate-200 dark:border-[#3D3D3D] p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#3D3D3D] pb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-primary" />
              <h3 className="font-bold text-base text-slate-900 dark:text-on-surface">
                Thông Tin Khách Hàng & Đơn Hàng
              </h3>
            </div>

            {/* Direct Select Customer Dropdown */}
            {uniqueCustomers.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-on-surface-variant hidden sm:inline">Chọn khách cũ:</span>
                <select
                  onChange={(e) => {
                    const found = uniqueCustomers.find((c) => c.name === e.target.value);
                    if (found) handleSelectCustomer(found);
                  }}
                  value={selectedCustomerObj?.name || ''}
                  className="bg-slate-100 dark:bg-[#1A1A1A] border border-slate-300 dark:border-outline-variant/40 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-on-surface font-semibold focus:outline-none focus:border-blue-600 dark:focus:border-primary"
                >
                  <option value="">-- Danh sách khách hàng sẵn có --</option>
                  {uniqueCustomers.map((cust) => (
                    <option key={cust.id} value={cust.name}>
                      {cust.name} ({cust.orderCount} đơn - {formatCurrencyVND(cust.totalSpent)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name Input with Searchable Autocomplete Dropdown */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider mb-2 font-code flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-primary" />
                  Tên Khách Hàng / Công Ty
                </span>
                {selectedCustomerObj && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                    Khách cũ ({selectedCustomerObj.orderCount} đơn)
                  </span>
                )}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={customerNameInput}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
                  onChange={(e) => {
                    setCustomerNameInput(e.target.value);
                    setSelectedCustomerObj(null);
                    setIsCustomerDropdownOpen(true);
                  }}
                  placeholder="Gõ tìm hoặc nhập tên khách hàng mới..."
                  className="w-full bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-outline-variant/40 rounded-lg pl-4 pr-10 py-3 text-slate-900 dark:text-on-surface focus:outline-none focus:border-blue-600 dark:focus:border-primary transition-all text-sm font-sans"
                />
                <ChevronDown
                  onClick={() => setIsCustomerDropdownOpen((prev) => !prev)}
                  className="w-4 h-4 text-slate-400 cursor-pointer absolute right-3 top-1/2 -translate-y-1/2"
                />
              </div>

              {/* Searchable Autocomplete Dropdown Panel */}
              {isCustomerDropdownOpen && filteredCustomers.length > 0 && (
                <div
                  onMouseLeave={() => setIsCustomerDropdownOpen(false)}
                  className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-outline-variant rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-[#252525]"
                >
                  {filteredCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className="p-3 hover:bg-blue-50 dark:hover:bg-primary/10 cursor-pointer flex items-center justify-between transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-primary/20 flex items-center justify-center text-blue-600 dark:text-primary font-bold text-xs">
                          {cust.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-on-surface">{cust.name}</div>
                          {cust.phone && (
                            <div className="text-[11px] text-slate-500 font-mono font-code">{cust.phone}</div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono font-code">
                          {formatCurrencyVND(cust.totalSpent)}
                        </div>
                        <div className="text-[10px] text-slate-400">{cust.orderCount} đơn hàng</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Customer Selection Badges */}
              {uniqueCustomers.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Gợi ý nhanh:</span>
                  {uniqueCustomers.slice(0, 5).map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleSelectCustomer(cust)}
                      className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-surface-container hover:bg-blue-50 dark:hover:bg-primary/10 text-slate-700 dark:text-on-surface-variant hover:text-blue-600 dark:hover:text-primary text-[11px] font-medium border border-slate-200 dark:border-outline-variant/30 transition-colors"
                    >
                      {cust.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Phone Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider mb-2 font-code flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-primary" />
                <span>Số Điện Thoại (Tùy chọn)</span>
              </label>
              <input
                type="text"
                value={customerPhoneInput}
                onChange={(e) => setCustomerPhoneInput(e.target.value)}
                placeholder="SĐT khách hàng..."
                className="w-full bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-4 py-3 text-slate-900 dark:text-on-surface focus:outline-none focus:border-blue-600 dark:focus:border-primary transition-all text-sm font-sans font-mono font-code"
              />
            </div>

            {/* Document Order Title */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider mb-2 font-code">
                Tên Ghi Chú Đơn Hàng (Tùy chọn)
              </label>
              <input
                type="text"
                value={orderNameInput}
                onChange={(e) => setOrderNameInput(e.target.value)}
                placeholder="Nhập tên đơn hàng hoặc ghi chú..."
                className="w-full bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-4 py-3 text-slate-900 dark:text-on-surface focus:outline-none focus:border-blue-600 dark:focus:border-primary transition-all text-sm font-sans"
              />
            </div>
          </div>
        </div>

        {/* Configuration Form Options Level 1 Card */}
        <div className="bg-white dark:bg-[#2D2D2D] rounded-xl border border-slate-200 dark:border-[#3D3D3D] p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#3D3D3D] pb-3">
            <Edit3 className="w-5 h-5 text-blue-600 dark:text-primary" />
            <h3 className="font-bold text-base text-slate-900 dark:text-on-surface">
              Cấu Hình Quy Cách In
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field: Paper Size */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider mb-2 font-code">
                Khổ Giấy
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['A4', 'A3', 'A5'] as PaperSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPaperSize(size)}
                    className={`py-3 rounded-lg border text-sm font-semibold transition-all ${
                      paperSize === size
                        ? 'border-blue-600 dark:border-primary bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary shadow-sm font-bold'
                        : 'border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-[#252525]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Inking Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider mb-2 font-code">
                Loại In
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrintMode('BW')}
                  className={`py-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    printMode === 'BW'
                      ? 'border-blue-600 dark:border-primary bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary font-bold'
                      : 'border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-[#252525]'
                  }`}
                >
                  <SunMedium className="w-4 h-4" />
                  <span>Đen trắng</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintMode('COLOR')}
                  className={`py-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    printMode === 'COLOR'
                      ? 'border-blue-600 dark:border-primary bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary font-bold'
                      : 'border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-[#252525]'
                  }`}
                >
                  <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>In màu</span>
                </button>
              </div>
            </div>

            {/* Field: Sides Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider mb-2 font-code">
                Mặt In
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSidesMode('SIMPLEX')}
                  className={`py-3 rounded-lg border text-xs font-semibold transition-all ${
                    sidesMode === 'SIMPLEX'
                      ? 'border-blue-600 dark:border-primary bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary font-bold'
                      : 'border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-[#252525]'
                  }`}
                >
                  1 Mặt (Simplex)
                </button>

                <button
                  type="button"
                  onClick={() => setSidesMode('DUPLEX')}
                  className={`py-3 rounded-lg border text-xs font-semibold transition-all ${
                    sidesMode === 'DUPLEX'
                      ? 'border-blue-600 dark:border-primary bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary font-bold'
                      : 'border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-[#252525]'
                  }`}
                >
                  2 Mặt (Duplex)
                </button>
              </div>
            </div>

            {/* Field: Paper Weight */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider mb-2 font-code">
                Loại Giấy
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['70gsm', '80gsm'] as PaperWeight[]).map((weight) => (
                  <button
                    key={weight}
                    type="button"
                    onClick={() => setPaperWeight(weight)}
                    className={`py-3 rounded-lg border text-xs font-semibold transition-all ${
                      paperWeight === weight
                        ? 'border-blue-600 dark:border-primary bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary shadow-sm font-bold'
                        : 'border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-[#252525]'
                    }`}
                  >
                    Giấy {weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Bento-style Extra Services Checkboxes */}
            <div className="col-span-1 md:col-span-2 pt-2 border-t border-slate-200 dark:border-[#3D3D3D]">
              <label className="block text-xs font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider mb-3 font-code">
                Dịch Vụ Đi Kèm / Gia Công
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Bìa kiếng */}
                <button
                  type="button"
                  onClick={() =>
                    setExtraServices((prev) => ({
                      ...prev,
                      coverPage: !prev.coverPage,
                    }))
                  }
                  className={`h-24 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden ${
                    extraServices.coverPage
                      ? 'border-blue-600 dark:border-primary bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary font-bold'
                      : 'border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-[#252525]'
                  }`}
                >
                  <BookOpen className="w-6 h-6" />
                  <span className="text-xs font-semibold">Bìa kiếng</span>
                </button>

                {/* Đóng ghim */}
                <button
                  type="button"
                  onClick={() =>
                    setExtraServices((prev) => ({
                      ...prev,
                      staple: !prev.staple,
                    }))
                  }
                  className={`h-24 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden ${
                    extraServices.staple
                      ? 'border-blue-600 dark:border-primary bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary font-bold'
                      : 'border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-[#252525]'
                  }`}
                >
                  <Paperclip className="w-6 h-6" />
                  <span className="text-xs font-semibold">Đóng ghim</span>
                </button>

                {/* Đóng lò xo */}
                <button
                  type="button"
                  onClick={() =>
                    setExtraServices((prev) => ({
                      ...prev,
                      spiralBinding: !prev.spiralBinding,
                    }))
                  }
                  className={`h-24 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden ${
                    extraServices.spiralBinding
                      ? 'border-blue-600 dark:border-primary bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary font-bold'
                      : 'border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-on-surface-variant hover:bg-slate-200 dark:hover:bg-[#252525]'
                  }`}
                >
                  <Book className="w-6 h-6" />
                  <span className="text-xs font-semibold">Đóng lò xo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Order Summary Sticky Panel */}
      <div className="w-full lg:w-[340px] xl:w-[360px] shrink-0">
        <div className="sticky top-6">
          <div className="bg-white/90 dark:bg-surface-container-high/90 acrylic-blur rounded-xl border border-slate-200 dark:border-outline-variant/50 p-6 shadow-xl relative overflow-hidden space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-outline-variant/40 pb-4">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-primary" />
              <h3 className="font-bold text-base text-slate-900 dark:text-on-surface">Tóm Tắt Đơn Hàng</h3>
            </div>

            {/* Order Status Selector Box */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider font-code">
                Trạng Thái Thanh Toán Khi Lưu
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderStatus('COMPLETED')}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    orderStatus === 'COMPLETED'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-600 dark:text-on-surface-variant'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã thanh toán</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderStatus('UNPAID')}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    orderStatus === 'UNPAID'
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                      : 'border-slate-200 dark:border-outline-variant/40 bg-slate-100 dark:bg-[#1A1A1A] text-slate-600 dark:text-on-surface-variant'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Chưa trả tiền (Nợ)</span>
                </button>
              </div>
            </div>

            {/* Bulk Sheet Pricing Badge */}
            {calculation.isBulkPricingApplied && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Đã áp dụng đơn giá sỉ: <strong>{formatCurrencyVND(pricingConfig.bulkSheetPricing?.unitPrice || 0)}/trang</strong> (&ge; {pricingConfig.bulkSheetPricing?.thresholdSheets} tờ)
                </span>
              </div>
            )}

            {/* Calculations Breakdown */}
            <ul className="space-y-3.5 text-xs font-sans">
              <li className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-on-surface-variant">Khách hàng:</span>
                <span className="text-slate-900 dark:text-on-surface font-semibold truncate max-w-[150px]">
                  {customerNameInput.trim() || 'Khách vãng lai'}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-on-surface-variant">Số lượng file:</span>
                <span className="text-slate-900 dark:text-on-surface font-semibold font-mono font-code">
                  {fileItems.length} file
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-on-surface-variant">Tổng trang in:</span>
                <span className="text-slate-900 dark:text-on-surface font-semibold font-mono font-code">
                  {calculation.totalPages} trang
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-on-surface-variant">Tổng số tờ giấy:</span>
                <span className="text-slate-900 dark:text-on-surface font-semibold font-mono font-code">
                  {calculation.totalSheets} tờ ({paperSize})
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-on-surface-variant">Tiền in tài liệu:</span>
                <span className="text-blue-700 dark:text-primary font-bold font-mono font-code text-sm">
                  {formatCurrencyVND(calculation.printCost)}
                </span>
              </li>
              {calculation.extraCost > 0 && (
                <li className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-on-surface-variant">Phụ phí dịch vụ:</span>
                  <span className="text-slate-900 dark:text-on-surface font-semibold font-mono font-code">
                    {formatCurrencyVND(calculation.extraCost)}
                  </span>
                </li>
              )}
            </ul>

            {/* Total Amount Box */}
            <div className="border-t border-dashed border-slate-300 dark:border-outline-variant/60 pt-4">
              <div className="text-xs font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider mb-1 font-code">
                TỔNG THÀNH TIỀN
              </div>
              <div className="font-mono font-code text-3xl font-extrabold text-blue-700 dark:text-primary tracking-tight">
                {formatCurrencyVND(calculation.totalAmount)}
              </div>
            </div>

            {/* Save & Print CTA Button */}
            <button
              type="button"
              onClick={handleSaveAndPrint}
              disabled={fileItems.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-[#b8d6ff] text-white dark:text-on-primary-container font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 dark:shadow-primary-container/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4.5 h-4.5" />
              Lưu Đơn / In Phiếu
            </button>

            {/* Reset Button */}
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs font-bold font-code text-slate-500 dark:text-on-surface-variant hover:text-slate-800 dark:hover:text-on-surface transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                LÀM MỚI FORM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
