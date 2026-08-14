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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl print:shadow-none print:border-none print:w-full print:max-w-none print:bg-white print:text-black">
        {/* Header - Screen only */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 print:hidden">
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
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt printable body */}
        <div className="p-6 space-y-5 text-slate-900 dark:text-slate-100 print:text-black print:p-4">
          {/* Receipt Store Header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700 print:border-gray-400">
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight print:text-black font-sans">
              CỬA HÀNG PHOTOCOPY PRO
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 print:text-gray-600">
              Dịch vụ In ấn, Photocopy, Đóng sổ & Đóng bìa
            </p>
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-1">
              {isUnpaid ? 'PHIẾU GHI NỢ / DEBT TICKET' : 'PHIẾU THANH TOÁN / RECEIPT'}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 dark:text-slate-400 print:text-gray-600">Mã đơn: </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 print:text-black">{order.id}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 print:text-gray-600">Ngày: </span>
              <span className="text-slate-900 dark:text-slate-100 print:text-black">{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 print:text-gray-600">Khách hàng: </span>
              <span className="font-bold text-blue-600 dark:text-blue-400 print:text-black">
                {order.customerName || 'Khách vãng lai'}
                {order.customerPhone ? ` (${order.customerPhone})` : ''}
              </span>
            </div>
            <div className="col-span-2 pt-1">
              <span className="text-slate-500 dark:text-slate-400 print:text-gray-600">Trạng thái: </span>
              <span className={`font-bold ${isUnpaid ? 'text-amber-600 print:text-black' : 'text-emerald-600 print:text-black'}`}>
                {isUnpaid ? 'ĐÃ IN XONG - CHƯA TRẢ TIỀN (GHI NỢ)' : 'ĐÃ THANH TOÁN HOÀN TẤT'}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 print:bg-gray-100 print:border-gray-300">
              <div className="font-semibold text-slate-900 dark:text-slate-100 print:text-black border-b border-slate-200 dark:border-slate-800 pb-1">
                Tài liệu: {order.fileName}
              </div>

              {/* Multi-file items list if available */}
              {fileList ? (
                <div className="space-y-1 py-1">
                  {fileList.map((f, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-slate-700 dark:text-slate-300">
                      <span className="truncate pr-2">• {f.fileName}</span>
                      <span className="font-mono shrink-0">{f.pageCount} trang × {f.copies} bản</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px] print:text-gray-700 pt-1">
                <span>Cấu hình:</span>
                <span>
                  {order.paperSize} | {order.printMode === 'BW' ? 'Đen trắng' : 'In màu'} | {order.sidesMode === 'SIMPLEX' ? '1 Mặt' : '2 Mặt'} | {order.paperWeight}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px] print:text-gray-700">
                <span>Tổng cộng:</span>
                <span className="font-mono">{order.totalPages} trang ({order.totalSheets} tờ)</span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 print:border-gray-300">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 print:text-gray-700">Tiền in ({order.totalPages} trang):</span>
                <span className="font-mono">{formatCurrencyVND(order.printCost)}</span>
              </div>
              {order.extraCost > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 print:text-gray-700">
                    Phụ phí ({extraItems.join(', ')}):
                  </span>
                  <span className="font-mono">{formatCurrencyVND(order.extraCost)}</span>
                </div>
              )}
            </div>

            {/* Total Highlight */}
            <div className="pt-3 border-t-2 border-blue-600 dark:border-blue-500 flex justify-between items-center print:border-black">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 print:text-black">
                {isUnpaid ? 'TỔNG CẦN THANH TOÁN:' : 'TỔNG THÀNH TIỀN:'}
              </span>
              <span className={`text-2xl font-bold font-mono print:text-black ${isUnpaid ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {formatCurrencyVND(order.totalAmount)}
              </span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 pt-2 print:text-gray-500">
            Cảm ơn quý khách & Hẹn gặp lại!
          </div>
        </div>

        {/* Footer actions - Screen only */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            In Phiếu Hóa Đơn
          </button>
        </div>
      </div>
    </div>
  );
};
