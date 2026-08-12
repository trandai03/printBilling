import { OrderRecord } from '../types/billing';
import { formatDateTime } from './fileParser';

export function exportOrdersToCSV(orders: OrderRecord[]) {
  if (!orders || orders.length === 0) {
    alert('Không có dữ liệu đơn hàng để xuất CSV.');
    return;
  }

  const headers = [
    'Mã Đơn',
    'Khách Hàng',
    'Số Điện Thoại',
    'Trạng Thái',
    'Ngày Tạo',
    'Tên File In',
    'Dung Lượng',
    'Số Trang File',
    'Số Bản In',
    'Khổ Giấy',
    'Loại In',
    'Mặt In',
    'Định Lượng Giấy',
    'Dịch Vụ Phụ',
    'Tổng Số Trang',
    'Tổng Số Tờ',
    'Tiền In (VND)',
    'Phụ Phí (VND)',
    'Tổng Tiền (VND)',
    'Ghi Chú',
  ];

  const statusLabel = (st: string) => {
    switch (st) {
      case 'UNPAID':
        return 'Chưa trả tiền (Nợ)';
      case 'COMPLETED':
        return 'Đã thanh toán';
      case 'PROCESSING':
        return 'Đang in';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return 'Đã thanh toán';
    }
  };

  const rows = orders.map((o) => {
    const extraList: string[] = [];
    if (o.extraServices?.coverPage) extraList.push('Bìa kiếng');
    if (o.extraServices?.staple) extraList.push('Đóng ghim');
    if (o.extraServices?.spiralBinding) extraList.push('Đóng lò xo');
    const extraStr = extraList.length > 0 ? extraList.join(' + ') : 'Không';

    return [
      `"${o.id}"`,
      `"${(o.customerName || 'Khách vãng lai').replace(/"/g, '""')}"`,
      `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
      `"${statusLabel(o.status)}"`,
      `"${formatDateTime(o.createdAt)}"`,
      `"${o.fileName.replace(/"/g, '""')}"`,
      `"${o.fileSize} B"`,
      o.pageCount,
      o.copies,
      `"${o.paperSize}"`,
      `"${o.printMode === 'BW' ? 'Đen trắng' : 'In màu'}"`,
      `"${o.sidesMode === 'SIMPLEX' ? '1 Mặt' : '2 Mặt'}"`,
      `"${o.paperWeight}"`,
      `"${extraStr}"`,
      o.totalPages,
      o.totalSheets,
      o.printCost,
      o.extraCost,
      o.totalAmount,
      `"${(o.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  link.setAttribute('download', `Bang_ke_don_hang_photocopy_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
