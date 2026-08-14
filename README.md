# 🖨️ PrintBilling - Ứng Dụng Quản Lý & Tính Tiền In Ấn Chuyên Nghiệp

<p align="center">
  <img src="./app-icon.png" alt="PrintBilling Logo" width="128" height="128" />
</p>

<p align="center">
  <b>Giải pháp phần mềm Desktop hiện đại, tối ưu hóa quy trình đếm trang, tính tiền và quản lý đơn hàng cho các cửa hàng in ấn, tiệm photo và doanh nghiệp dịch vụ tài liệu.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-blue?logo=tauri&logoColor=white" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/SQLite-Local-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## 📌 Giới thiệu

**PrintBilling** là ứng dụng desktop cross-platform nhẹ, tốc độ cao được xây dựng trên nền tảng **Tauri v2** và **React 18**. Phần mềm giúp tự động hóa hoàn toàn quy trình tính tiền in ấn: từ việc tự động đếm trang file tài liệu (PDF, Word, PowerPoint,...), tính toán phụ phí dịch vụ (bìa kiếng, đóng ghim, đóng lò xo), áp dụng ưu đãi giá sỉ đến lưu trữ lịch sử đơn hàng và in hóa đơn biên nhận tức thì.

---

## ✨ Tính năng nổi bật

### 📄 1. Đếm trang & Tính cước tự động
- **Tải lên đa định dạng**: Hỗ trợ kéo thả hoặc chọn nhiều file cùng lúc (`.pdf`, `.docx`, `.doc`, `.pptx`, `.ppt`, `.txt`, ảnh, ZIP...).
- **Tự động phân tích & đếm trang**: Tự động đọc số lượng trang chính xác của file PDF, Word và PowerPoint ngay sau khi tải lên.
- **Nhập thủ công (Manual Entry)**: Hỗ trợ linh hoạt nhập tên tài liệu và số trang/tờ cho tài liệu cứng hoặc file chưa hỗ trợ đọc tự động.
- **Tùy chọn in đa dạng**:
  - **Khổ giấy**: A4, A3, A5.
  - **Chế độ in**: Trắng đen (Monochrome) hoặc In màu (Color).
  - **Mặt in**: In 1 mặt (Simplex) hoặc In 2 mặt (Duplex).
  - **Định lượng giấy**: 70gsm, 80gsm.
  - **Số bản in (Copies)**: Tùy chỉnh số bản in linh hoạt cho từng file hoặc toàn bộ đơn.

### ✂️ 2. Phụ phí dịch vụ & Ưu đãi giá sỉ (Bulk Discount)
- **Dịch vụ gia công đi kèm**: Tùy chọn cộng thêm chi phí Bìa kiếng, Đóng ghim, Đóng lò xo.
- **Tự động áp dụng giá sỉ**: Tùy chỉnh mốc số lượng tờ (VD: từ 100 tờ trở lên) để tự động chiết khấu đơn giá in theo chính sách của cửa hàng.
- **Làm tròn tổng tiền**: Tự động tính toán tổng tiền minh bạch, chính xác và dễ thanh toán.

### 🧾 3. Xuất hóa đơn & In phiếu biên nhận
- **Tạo phiếu biên nhận (Receipt Modal)**: Hiển thị hóa đơn thanh toán chi tiết bao gồm thông tin cửa hàng, danh sách file, tùy chọn in, phụ phí và tổng tiền.
- **In trực tiếp / Lưu PDF**: Hỗ trợ in hóa đơn ra máy in nhiệt/máy in văn phòng hoặc xuất file PDF tức thì.

### 🗄️ 4. Quản lý lịch sử đơn hàng & Khách hàng
- **Cơ sở dữ liệu SQLite nội bộ**: Lưu trữ an toàn, hoạt động 100% offline không cần internet.
- **Tìm kiếm & Bộ lọc nâng cao**: Lọc đơn hàng theo mã đơn (`ORD-...`), tên/số điện thoại khách hàng, thời gian hoặc trạng thái đơn (Chưa thanh toán, Đã hoàn thành, Đang xử lý, Đã hủy).
- **Xuất báo cáo CSV**: Đóng gói và xuất lịch sử đơn hàng ra file Excel/CSV nhanh chóng.

### ⚙️ 5. Quản lý bảng giá & Hệ thống
- **Tùy chỉnh bảng giá linh hoạt**: Thay đổi đơn giá in A4/A3/A5, đơn giá in màu/đen trắng và đơn giá dịch vụ gia công bất kỳ lúc nào.
- **Sao lưu & Khôi phục dữ liệu**: Xuất/Nhập dữ liệu bảng giá và đơn hàng dưới dạng file JSON backup.
- **Giao diện Hiện đại (Fluent Design)**: Hỗ trợ chế độ Sáng/Tối (Light/Dark Mode) dịu mắt, thao tác mượt mà.

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ / Thư viện |
|---|---|
| **Core Desktop Framework** | [Tauri v2](https://tauri.app/) (Rust Engine) |
| **Frontend Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v3](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) |
| **Database** | SQLite via [`@tauri-apps/plugin-sql`](https://github.com/tauri-apps/plugins-workspace) |
| **File Processors** | `pdfjs-dist` (PDF), `mammoth` (Word `.docx`), `jszip` (PowerPoint `.pptx`) |

---

## 🚀 Hướng dẫn Cài đặt & Chạy ứng dụng

### 📋 Yêu cầu hệ thống (Prerequisites)
- **Node.js**: `v18+` trở lên
- **Rust**: Cài đặt via [rustup.rs](https://rustup.rs/) (Yêu cầu cho Tauri backend)
- **C++ Build Tools**:
  - Windows: Visual Studio C++ Build Tools (hoặc cài qua VS Community)

### 📦 1. Cài đặt Dependencies
Mở terminal tại thư mục dự án và chạy:
```bash
npm install
```

### 💻 2. Chạy ứng dụng ở chế độ Phát triển (Development)
Chạy ứng dụng Tauri kèm Live Reload (Frontend + Backend):
```bash
npm run tauri dev
```
*(Nếu chỉ muốn phát triển giao diện Web trên trình duyệt: `npm run dev`)*

### 🏗️ 3. Đóng gói ứng dụng (Production Build)
Biên dịch ứng dụng thành tệp thực thi (`.exe` trên Windows, `.msi`, `.dmg` trên macOS, `.AppImage` trên Linux):
```bash
npm run tauri build
```
File cài đặt sau khi build thành công sẽ nằm trong thư mục: `src-tauri/target/release/bundle/`.

---

## 📂 Cấu trúc thư mục dự án

```text
printBilling/
├── src/                        # Mã nguồn Frontend (React + TS)
│   ├── components/             # Các React Component chính
│   │   ├── TabCalculator.tsx   # Giao diện Bảng tính cước & Tải file
│   │   ├── TabPricing.tsx      # Giao diện Quản lý bảng giá & Cấu hình
│   │   ├── TabHistory.tsx      # Giao diện Lịch sử đơn hàng & Báo cáo
│   │   ├── ReceiptModal.tsx    # Modal In hóa đơn / Phiếu biên nhận
│   │   ├── BillingCard.tsx     # Card tóm tắt tổng tiền & Thanh toán
│   │   ├── Header.tsx          # Thanh Tiêu đề / Header ứng dụng
│   │   └── Sidebar.tsx         # Thanh điều hướng Tab chính
│   ├── services/               # Quản lý SQLite Database (`db.ts`)
│   ├── utils/                  # Thư viện xử lý đếm trang & tính toán
│   │   ├── fileParser.ts       # Module đếm trang PDF, Word, PPTX
│   │   ├── calculator.ts       # Thuật toán tính tiền in & phụ phí
│   │   └── exportCsv.ts        # Module xuất báo cáo CSV
│   ├── types/                  # TypeScript Types & Interfaces (`billing.ts`)
│   ├── hooks/                  # Custom React Hooks (usePricing, useOrderHistory)
│   ├── App.tsx                 # Root Component
│   └── main.tsx                # Entry point Frontend
├── src-tauri/                  # Mã nguồn Backend (Tauri v2 + Rust)
│   ├── src/                    # Rust Main Code
│   ├── capabilities/           # Cấu hình quyền truy cập (Permissions)
│   ├── tauri.conf.json         # Cấu hình ứng dụng Tauri
│   └── Cargo.toml              # Dependencies Crate của Rust
├── public/ & app-icon.png      # Tài nguyên hình ảnh & Icon ứng dụng
├── package.json                # Dependencies & Scripts Node.js
└── README.md                   # Tài liệu hướng dẫn dự án
```

---

## 📖 Hướng dẫn sử dụng chi tiết

1. **Tính tiền & Lập đơn hàng**:
   - Chọn Tab **Tính tiền**.
   - Kéo thả tệp tài liệu vào vùng tải lên (hoặc chọn **Thêm thủ công** để tự nhập số trang).
   - Tùy chỉnh khổ giấy, chế độ in (Màu/Đen trắng), in 1 hay 2 mặt, và chọn dịch vụ đóng ghim/bìa/lò xo.
   - Nhập tên & SĐT khách hàng (nếu có).
   - Kiểm tra tổng tiền trên **Thẻ thanh toán** và bấm **Lưu & In hóa đơn**.
2. **Quản lý & Điều chỉnh Bảng giá**:
   - Chọn Tab **Bảng giá**.
   - Chỉnh sửa giá in per trang cho A4/A3/A5, phụ phí in 2 mặt, chi phí dịch vụ đi kèm hoặc cài đặt mốc chiết khấu in sỉ.
   - Bấm **Lưu thay đổi**.
3. **Tra cứu Lịch sử & Xuất báo cáo**:
   - Chọn Tab **Lịch sử**.
   - Tra cứu đơn hàng theo thời gian hoặc từ khóa.
   - Nhấp vào đơn hàng bất kỳ để xem chi tiết hoặc **In lại hóa đơn**.
   - Bấm **Xuất CSV** để tải xuống tập tin thống kê đơn hàng.

---

## 📄 Giấy phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Mọi sự đóng góp và phát triển mở rộng đều được hoan nghênh.
