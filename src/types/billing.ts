export type PaperSize = 'A4' | 'A3' | 'A5';

export type PrintMode = 'BW' | 'COLOR'; // Đen trắng / In màu

export type SidesMode = 'SIMPLEX' | 'DUPLEX'; // 1 Mặt / 2 Mặt

export type PaperWeight = '70gsm' | '80gsm'; // Định lượng giấy

export type OrderStatus = 'UNPAID' | 'COMPLETED' | 'PROCESSING' | 'CANCELLED';
// UNPAID: Đã in xong, chưa trả tiền (Ghi nợ)
// COMPLETED: Đã hoàn thành & đã thanh toán
// PROCESSING: Đang in / Đang xử lý
// CANCELLED: Đã hủy

export interface ExtraServices {
  coverPage: boolean; // Bìa kiếng
  staple: boolean;    // Đóng ghim
  spiralBinding: boolean; // Đóng lò xo
}

export interface PrintPricePerSize {
  bw: number;    // Giá đơn sắc/đen trắng per trang
  color: number; // Giá in màu per trang
}

export interface BulkSheetPricingConfig {
  enabled: boolean;        // Bật/tắt ưu đãi in theo số lượng tờ
  thresholdSheets: number; // Số tờ tối thiểu để áp dụng ưu đãi (vd: 100 tờ)
  unitPrice: number;       // Đơn giá đồng giá ưu đãi (vd: 200đ/trang)
}

export interface PricingConfig {
  // Đơn giá in theo khổ (trên 1 trang)
  printPrices: {
    A4: PrintPricePerSize;
    A3: PrintPricePerSize;
    A5: PrintPricePerSize;
  };
  // Phụ phí in 2 mặt (chênh lệch/tờ nếu có)
  duplexSurcharge: number; 
  // Phụ phí dịch vụ đi kèm
  extraServices: {
    coverPagePrice: number;    // Giá bìa kiếng (bộ)
    staplePrice: number;       // Phí đóng ghim
    spiralBindingPrice: number; // Phí đóng lò xo
  };
  // Cài đặt ưu đãi in theo số lượng tờ
  bulkSheetPricing: BulkSheetPricingConfig;
}

export interface SelectedFileItem {
  id: string;
  file?: File | null;
  fileName: string;
  fileSize: number;
  pageCount: number;
  copies: number;
  loading?: boolean;
  error?: string | null;
}

export interface CalculationResult {
  filePages: number;        // Tổng trang đơn file / tất cả file
  copies: number;           // Tổng số bản in
  totalPages: number;       // Tổng số trang = sum(pageCount * copies)
  totalSheets: number;      // Tổng số tờ giấy sử dụng
  unitPrintPrice: number;   // Đơn giá in 1 trang áp dụng
  printCost: number;        // Tiền in = totalPages * unitPrintPrice
  extraCost: number;        // Phụ phí dịch vụ (bìa, ghim, lò xo)
  totalAmount: number;      // TỔNG TIỀN làm tròn = printCost + extraCost
  isBulkPricingApplied?: boolean; // Cờ báo hiệu có áp dụng giá sỉ hay không
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone?: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate?: string;
}

export interface OrderRecord {
  id: string;              // Mã đơn hàng (VD: ORD-1700000000)
  createdAt: string;       // ISO String / YYYY-MM-DD HH:mm
  fileName: string;        // Tên file chính hoặc tóm tắt danh sách file
  fileSize: number;        // Tổng dung lượng
  pageCount: number;       // Tổng số trang các file
  copies: number;          // Tổng số bản
  customerName?: string;   // Tên khách hàng / Công ty
  customerPhone?: string;  // Số điện thoại khách hàng
  status: OrderStatus;     // Trạng thái đơn hàng
  fileItems?: SelectedFileItem[]; // Chi tiết danh sách file
  paperSize: PaperSize;
  printMode: PrintMode;
  sidesMode: SidesMode;
  paperWeight: PaperWeight;
  e