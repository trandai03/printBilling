# Thiết Kế Chi Tiết: Tính Năng Nhập Trang / Số Tờ Thủ Công Trong TabCalculator

## 1. Tổng quan (Overview)
Hiện tại, `TabCalculator` yêu cầu người dùng phải tải file (PDF, DOC/DOCX) từ máy tính để phân tích số trang và tính tiền in. Tuy nhiên, trong thực tế có nhiều trường hợp khách hàng chỉ đưa tài liệu giấy cứng hoặc báo trực tiếp số trang/tờ.
Tính năng này cho phép chủ cửa hàng tự thêm dòng tài liệu thủ công và nhập số trang, số bản trực tiếp vào danh sách mà không cần upload file.

## 2. Thay đổi về Cấu trúc dữ liệu & State

### 2.1 `SelectedFileItem` (`src/types/billing.ts`)
Giữ nguyên interface `SelectedFileItem`, hỗ trợ các trường hợp item không có `File` thực tế:
- `file?: File | null`: Rỗng đối với tài liệu nhập thủ công.
- `fileName`: Tên hiển thị (ví dụ: "Tài liệu nhập tay 1" hoặc tên do người dùng sửa).
- `fileSize`: 0 cho tài liệu nhập tay.
- `pageCount`: Số trang do người dùng nhập (mặc định 1).
- `copies`: Số bản in do người dùng nhập (mặc định 1).
- `isManual?: boolean`: Đánh dấu item là nhập thủ công.

### 2.2 Hook `useFileAnalyzer` (`src/hooks/useFileAnalyzer.ts`)
Bổ sung 2 hàm mới:
1. `addManualItem(name?: string)`:
   - Tạo một `SelectedFileItem` mới với `isManual: true`, `file: null`, `fileSize: 0`, `loading: false`.
   - Đặt tên mặc định dựa trên số lượng item nhập tay hiện có (VD: "Tài liệu nhập tay 1").
2. `updateFileName(id: string, name: string)`:
   - Cập nhật tên của file/tài liệu tương ứng theo `id`.

## 3. Thay đổi về Giao diện & Trải nghiệm (UI/UX)

### 3.1 Thẻ "Danh Sách File In" (`src/components/TabCalculator.tsx`)
- **Header:**
  - Bổ sung nút `+ Nhập thủ công` kế bên nút `Thêm File`.
  - Icon: `Edit3` hoặc `Plus`.
- **Khu vực Dropzone (Trạng thái rỗng):**
  - Thêm tùy chọn phụ: *"Hoặc bấm vào đây để tự nhập số trang"* bên dưới gợi ý kéo thả file.

### 3.2 Dòng đại diện Tài liệu Nhập tay
- **Icon / Badge:** Dùng icon `Edit3` với hiệu ứng màu sắc phân biệt với PDF/DOCX (VD: mảng nền tím/cam nhạt) kèm nhãn nhỏ `Thủ công`.
- **Tên tài liệu:** Cho phép bấm vào để đổi tên tài liệu nhập tay linh hoạt.
- **Ô nhập Số trang & Số bản:**
  - Hoạt động tương tự file upload. Khi thay đổi số trang/số bản, `calculateBilling` lập tức tính toán lại tổng số tờ, chi phí in và phụ phí.
- **Nút xóa:** Xóa mục nhập tay ra khỏi danh sách tương tự file upload.

## 4. Kiểm thử & Đánh giá (Verification)
- Đảm bảo tính toán tổng chi phí (`totalAmount`, `totalSheets`, `totalPages`) chính xác khi kết hợp cả file upload lẫn item nhập tay.
- Đảm bảo việc lưu đơn hàng (`onSaveOrder`) hoạt động bình thường với danh sách chứa item nhập tay.
