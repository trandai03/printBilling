import React from 'react';
import { OrderRecord } from '../types/billing';

import { useOrderHistory } from '../hooks/useOrderHistory';
import { formatCurrencyVND, formatDateTime } from '../utils/fileParser';
import {
  Search,
  Download,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Inbox,
  User,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';

interface TabHistoryProps {
  onViewReceipt: (order: OrderRecord) => void;
}

export const TabHistory: React.FC<TabHistoryProps> = ({ onViewReceipt }) => {
  const {
    orders,
    rawOrdersCount,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCustomerFilter,
    setSelectedCustomerFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    uniqueCustomers,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    totalRevenue,
    totalUnpaid,
    updateOrderStatus,
    removeOrder,
    clearHistory,
    exportCSV,
  } = useOrderHistory();

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Lịch Sử Đơn Hàng & Thống Kê Công Nợ Khách Hàng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tổng số đơn hàng: <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{rawOrdersCount}</span> | 
            Khách hàng đã in: <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{uniqueCustomers.length}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          {/* Revenue Collected */}
          <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0 shadow-sm">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">Đã thu: </span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {formatCurrencyVND(totalRevenue)}
              </span>
            </div>
          </div>

          {/* Unpaid Debt Total */}
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/40 flex items-center gap-2 shrink-0 shadow-sm">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div className="text-xs">
              <span className="text-amber-700 dark:text-amber-300 font-semibold">Chưa thu (Nợ): </span>
              <span className="font-bold font-mono text-amber-700 dark:text-amber-400 text-sm">
                {formatCurrencyVND(totalUnpaid)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 shrink-0 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Customer Quick Stats Cards Grid */}
      {uniqueCustomers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setSelectedCustomerFilter('')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedCustomerFilter === ''
                ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 shadow-sm font-bold'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Tất Cả Khách
              </span>
              <span className="font-mono">{rawOrdersCount} đơn</span>
            </div>
            <div className="text-sm font-extrabold font-mono mt-1 text-slate-900 dark:text-slate-100">
              {formatCurrencyVND(totalRevenue + totalUnpaid)}
            </div>
          </button>

          {uniqueCustomers.slice(0, 3).map((cust) => (
            <button
              key={cust.id}
              type="button"
              onClick={() => setSelectedCustomerFilter(cust.name)}
              className={`p-3 rounded-xl border text-left transition-all truncate ${
                selectedCustomerFilter === cust.name
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 shadow-sm font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold truncate">
                <span className="truncate flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {cust.name}
                </span>
                <span className="font-mono shrink-0">{cust.orderCount} đơn</span>
              </div>
              <div className="text-sm font-extrabold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                {formatCurrencyVND(cust.totalSpent)}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search & Status Select Filter Card */}
      <div className="p-4 bg-white dark:bg-[#2D2D2D] rounded-xl border border-slate-200 dark:border-[#3D3D3D] flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-slate-400 dark:text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên khách, tên file..."
              className="w-full bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-outline-variant/40 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-on-surface focus:outline-none focus:border-blue-600 dark:focus:border-primary font-sans"
            />
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-on-surface font-semibold focus:outline-none focus:border-blue-600 dark:focus:border-primary"
          >
            <option value="ALL">-- Tất cả trạng thái --</option>
            <option value="UNPAID">Chưa thanh toán (Chưa trả tiền / Nợ)</option>
            <option value="COMPLETED">Đã thanh toán (Đã xong)</option>
            <option value="PROCESSING">Đang in / Đang xử lý</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          {/* Customer Filter Dropdown */}
          <select
            value={selectedCustomerFilter}
            onChange={(e) => setSelectedCustomerFilter(e.target.value)}
            className="bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-on-surface font-semibold focus:outline-none focus:border-blue-600 dark:focus:border-primary"
          >
            <option value="">-- Lọc Theo Khách Hàng --</option>
            {uniqueCustomers.map((cust) => (
              <option key={cust.id} value={cust.name}>
                {cust.name} ({cust.orderCount} đơn - {formatCurrencyVND(cust.totalSpent)})
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
          <Calendar className="w-4 h-4 text-slate-400 dark:text-on-surface-variant shrink-0" />
          <span className="text-slate-600 dark:text-on-surface-variant">Từ:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-on-surface text-xs font-mono font-code focus:outline-none focus:border-blue-600 dark:focus:border-primary"
          />
          <span className="text-slate-600 dark:text-on-surface-variant">Đến:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-on-surface text-xs font-mono font-code focus:outline-none focus:border-blue-600 dark:focus:border-primary"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-[#2D2D2D] rounded-xl border border-slate-200 dark:border-[#3D3D3D] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-on-surface-variant font-medium text-xs">
            Đang tải dữ liệu lịch sử từ SQLite database...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-surface-container flex items-center justify-center text-slate-400 dark:text-outline">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-on-surface">Không tìm thấy đơn hàng phù hợp!</p>
            <p className="text-xs text-slate-500 dark:text-on-surface-variant max-w-sm">
              Thử xóa bộ lọc trạng thái hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-xs">
              <thead className="bg-slate-100 dark:bg-[#1A1A1A] text-slate-600 dark:text-on-surface-variant font-mono font-code uppercase tracking-wider border-b border-slate-200 dark:border-[#3D3D3D]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Mã Đơn</th>
                  <th className="py-3.5 px-4 font-bold">Khách Hàng</th>
                  <th className="py-3.5 px-4 font-bold">Trạng Thái</th>
                  <th className="py-3.5 px-4 font-bold">Ngày Tạo</th>
                  <th className="py-3.5 px-4 font-bold">Tên File In</th>
                  <th className="py-3.5 px-4 font-bold">Cấu Hình</th>
                  <th className="py-3.5 px-4 font-bold text-center">Trang / Bản</th>
                  <th className="py-3.5 px-4 font-bold text-right">Tổng Tiền</th>
                  <th className="py-3.5 px-4 font-bold text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#353535] text-slate-900 dark:text-on-surface">
                {orders.map((order) => {
                  const isUnpaid = order.status === 'UNPAID';
                  const isCompleted = order.status === 'COMPLETED';
                  const isProcessing = order.status === 'PROCESSING';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono font-code font-bold text-blue-600 dark:text-primary">
                        {order.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-on-surface">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600 dark:text-primary shrink-0" />
                          <span className="truncate max-w-[120px]">{order.customerName || 'Khách vãng lai'}</span>
                        </div>
                        {order.customerPhone && (
                          <div className="text-[10px] text-slate-400 font-mono font-code pl-5">
                            {order.customerPhone}
                          </div>
                        )}
                      </td>

                      {/* Status Badge & Quick Change */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isUnpaid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-[11px] font-bold">
                            <Clock className="w-3 h-3" />
                            Chưa trả tiền (Nợ)
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã thanh toán
                          </span>
                        )}
                        {isProcessing && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 text-[11px] font-bold">
                            Đang in
                          </span>
                        )}
                        {order.status === 'CANCELLED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                            Đã hủy
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 dark:text-on-surface-variant font-mono font-code whitespace-nowrap">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-medium">
                        {order.fileName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-on-surface-variant">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/30 text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-on-surface">{order.paperSize}</span>
                          <span>•</span>
                          <span>{order.printMode === 'BW' ? 'Đen trắng' : 'In màu'}</span>
                          <span>•</span>
                          <span>{order.sidesMode === 'SIMPLEX' ? '1m' : '2m'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-code">
                        {order.pageCount} trang × {order.copies}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-code font-bold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                        {formatCurrencyVND(order.totalAmount)}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Mark Paid Button if Unpaid */}
                          {isUnpaid && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                              title="Xác nhận đã nhận tiền"
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm"
                            >
                              <Check className="w-3 h-3" />
                              Thu Tiền
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onViewReceipt(order)}
                            title="Xem Phiếu Hóa Đơn"
                            className="p-1.5 text-blue-600 dark:text-primary hover:bg-blue-50 dark:hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeOrder(order.id)}
                            title="Xóa Đơn Hàng"
                            className="p-1.5 text-red-600 dark:text-error hover:bg-red-50 dark:hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rawOrdersCount > 0 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={clearHistory}
            className="text-xs text-red-600 dark:text-error/80 hover:text-red-700 dark:hover:text-error transition-colors flex items-center gap-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa Toàn Bộ Lịch Sử Đơn Hàng
          </button>
        </div>
      )}
    </div>
  );
};
