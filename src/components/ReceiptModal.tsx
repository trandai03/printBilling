import React from 'react';
import { OrderRecord } from '../types/billing';
import { formatCurrencyVND, formatDateTime } from '../utils/fileParser';
import { Printer, X, CheckCircle2, Clock } from 'lucide-react';

interface ReceiptModalProps {
  order: OrderRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isUnpaid = order.status === 'UNPAID';


  const extraItems: string[] = [];
  if (order.extraServices?.coverPage) extraItems.push('Bìa kiếng');
  if (order.extraServices?.staple) extraItems.push('Đóng ghim');
  if (order.extraServices?.spiralBinding) extraItems.push('Đóng lò xo');

  const fileList = order.fileItems && order.fileItems.length > 0 ? order.fileItems : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#353535] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl print:shadow-none print:border-none print:w-full print:max-w-none print:bg-white print:text-black">
        {/* Header - Screen only */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#353535] flex items-center justify-between bg-slate-100 dark:bg-[#1b1b1c] print:hidden">
          <div className="flex items-center gap-2 font-semibold text-sm">
            {isUnpaid ? (
              <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5" />
                <span>Đã lưu đơn: Chưa thanh toán (Ghi nợ)</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span>Đã thanh toán thành công!</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt printable body */}
        <div className="p-6 space-y-5 text-slate-900 dark:text-on-surface print:text-black print:p-4">
          {/* Receipt Store Header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-outline-variant/60 print:border-gray-400">
            <h2 className="text-xl font-bold text-blue-700 dark:text-primary tracking-tight print:text-black">
              CỬA HÀNG PHOTOCOPY PRO
            </h2>
            <p className="text-xs text-slate-500 dark:text-on-surface-variant print:text-gray-600">
              Dịch vụ In ấn, Photocopy, Đóng sổ & Đóng bìa
            </p>
            <p className="text-[11px] font-mono text-slate-400 dark:text-outline font-code print:text-gray-600 uppercase tracking-widest pt-1">
              {isUnpaid ? 'PHIẾU GHI NỢ / DEBT TICKET' : 'PHIẾU THANH TOÁN / RECEIPT'}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono font-code">
            <div>
              <span className="text-slate-500 dark:text-on-surface-variant print:text-gray-600">Mã đơn: </span>
              <span className="font-bold text-slate-900 dark:text-on-surface print:text-black">{order.id}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-on-surface-variant print:text-gray-600">Ngày: </span>
              <span className="text-slate-900 dark:text-on-surface print:text-black">{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-[#252525]">
              <span className="text-slate-500 dark:text-on-surface-variant print:text-gray-600">Khách hàng: </span>
              <span className="font-bold text-blue-700 dark:text-primary print:text-black">
                {order.customerName || 'Khách vãng lai'}
                {order.customerPhone ? ` (${order.customerPhone})` : ''}
              </span>
            </div>
            <div className="col-span-2 pt-1">
              <span className="text-slate-500 dark:text-on-surface-variant print:text-gray-600">Trạng thái: </span>
              <span className={`font-bold ${isUnpaid ? 'text-amber-600 print:text-black' : 'text-emerald-600 print:text-black'}`}>
                {isUnpaid ? 'ĐÃ IN XONG - CHƯA TRẢ TIỀN (GHI NỢ)' : 'ĐÃ THANH TOÁN HOÀN TẤT'}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-[#131313] rounded-xl border border-slate-200 dark:border-[#2a2a2a] space-y-2 print:bg-gray-100 print:border-gray-300">
              <div className="font-semibold text-slate-900 dark:text-on-surface print:text-black border-b border-slate-200 dark:border-[#252525] pb-1">
                Tài liệu: {order.fileName}
              </div>

              {/* Multi-file items list if available */}
              {fileList ? (
                <div className="space-y-1 py-1">
                  {fileList.map((f, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-slate-700 dark:text-on-surface-variant">
                      <span className="truncate pr-2">• {f.fileName}</span>
                      <span className="font-mono font-code shrink-0">{f.pageCount} trang × {f.copies} bản</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="flex justify-between text-slate-600 dark:text-on-surface-variant text-[11px] print:text-gray-700 pt-1">
                <span>Cấu hình:</span>
                <span>
                  {order.paperSize} | {order.printMode === 'BW' ? 'Đen trắng' : 'In màu'} | {order.sidesMode === 'SIMPLEX' ? '1 Mặt' : '2 Mặt'} | {order.paperWeight}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-on-surface-variant text-[11px] print:text-gray-700">
                <span>Tổng cộng:</span>
                <span className="font-mono font-code">{order.totalPages} trang ({order.totalSheets} tờ)</span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-outline-variant/40 print:border-gray-300">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-on-surface-variant print:text-gray-700">Tiền in ({order.totalPages} trang):</span>
                <span className="font-mono font-code">{formatCurrencyVND(order.printCost)}</span>
              </div>
              {order.extraCost > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-on-surface-variant print:text-gray-700">
                    Phụ phí ({extraItems.join(', ')}):
                  </span>
                  <span className="font-mono font-code">{formatCurrencyVND(order.extraCost)}</span>
                </div>
              )}
            </div>

            {/* Total Highlight */}
            <div className="pt-3 border-t-2 border-blue-600 dark:border-primary/50 flex justify-between items-center print:border-black">
              <span className="font-bold text-sm text-slate-900 dark:text-on-surface print:text-black">
                {isUnpaid ? 'TỔNG CẦN THANH TOÁN:' : 'TỔNG THÀNH TIỀN:'}
              </span>
              <span className={`text-2xl font-bold font-mono font-code print:text-black ${isUnpaid ? 'text-amber-600 dark:text-amber-400' : 'text-blue-700 dark:text-primary'}`}>
                {formatCurrencyVND(order.totalAmount)}
              </span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 dark:text-outline pt-2 print:text-gray-500">
            Cảm ơn quý khách & Hẹn gặp lại!
          </div>
        </div>

        {/* Footer actions - Screen only */}
        <div className="p-4 bg-slate-100 dark:bg-[#1b1b1c] border-t border-slate-200 dark:border-[#353535] flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#404752] text-slate-700 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-[#b8d6ff] text-white dark:text-on-primary-container font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 dark:shadow-primary-container/20"
          >
            <Printer className="w-4 h-4" />
            In Phiếu Hóa Đơn
          </button>
        </div>
      </div>
    </div>
  );
};
