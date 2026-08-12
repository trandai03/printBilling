# Thiết Kế Tính Năng: Cài Đặt Ưu Đãi In Theo Số Lượng Tờ (Bulk Sheet Pricing)

## 1. Tổng Quan Feature
Bổ sung tùy chọn cài đặt bật/tắt trong ứng dụng PrintBilling cho phép thiết lập ngưỡng số tờ in (ví dụ: trên 100 tờ) và mức đơn giá ưu đãi đồng giá (ví dụ: 200đ/trang hoặc tờ). Khi đơn hàng có tổng số tờ $\ge$ ngưỡng đã cài đặt, hệ thống tự động áp dụng đơn giá ưu đãi này cho toàn bộ bản in.

---

## 2. Thay Đổi Cấu Trúc Dữ Liệu (`src/types/billing.ts`)

Bổ sung interface `BulkSheetPricingConfig` và trường `bulkSheetPricing` vào `PricingConfig`:

```typescript
export interface BulkSheetPricingConfig {
  enabled: boolean;        // Trạng thái bật/tắt tính năng
  thresholdSheets: number; // Số tờ tối thiểu để kích hoạt ưu đãi (mặc định: 100)
  unitPrice: number;       // Đơn giá ưu đãi áp dụng (đ/trang hoặc đ/tờ, mặc định: 200)
}

export interface PricingConfig {
  printPrices: {
    A4: PrintPricePerSize;
    A3: PrintPricePerSize;
    A5: PrintPricePerSize;
  };
  duplexSurcharge: number;
  extraServices: {
    coverPagePrice: number;
    staplePrice: number;
    spiralBindingPrice: number;
  };
  bulkSheetPricing: BulkSheetPricingConfig; // Bổ sung mới
}
```

Bổ sung trường `isBulkPricingApplied?: boolean` vào `CalculationResult` để giao diện hiển thị badge thông báo:

```typescript
export interface CalculationResult {
  filePages: number;
  copies: number;
  totalPages: number;
  totalSheets: number;
  unitPrintPrice: number;
  printCost: number;
  extraCost: number;
  totalAmount: number;
  isBulkPricingApplied?: boolean; // Bổ sung mới
}
```

Giá trị mặc định (`DEFAULT_PRICING_CONFIG`):
```typescript
export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  printPrices: {
    A4: { bw: 300, color: 1500 },
    A3: { bw: 600, color: 3000 },
    A5: { bw: 200, color: 1000 },
  },
  duplexSurcharge: 0,
  extraServices: {
    coverPagePrice: 3000,
    staplePrice: 2000,
    spiralBindingPrice: 15000,
  },
  bulkSheetPricing: {
    enabled: false,
    thresholdSheets: 100,
    unitPrice: 200,
  },
};
```

---

## 3. Logic Tính Tiền (`src/utils/calculator.ts`)

Trong hàm `calculateBilling`:
1. Tính tổng số trang `totalPages` và tổng số tờ `totalSheets`.
2. Kiểm tra điều kiện áp dụng ưu đãi sỉ:
   ```typescript
   const bulkConfig = pricingConfig.bulkSheetPricing;
   const isBulkPricingApplied = 
     !!bulkConfig?.enabled && totalSheets >= (bulkConfig.thresholdSheets || 0);

   const unitPrintPrice = isBulkPricingApplied
     ? bulkConfig.unitPrice
     : (pricingConfig.printPrices[paperSize]?.[printMode === 'BW' ? 'bw' : 'color'] ?? 0);
   ```
3. Tính `printCost = totalPages * unitPrintPrice` và tổng tiền `totalAmount`.
4. Trả về `isBulkPricingApplied` trong kết quả.

---

## 4. Giao Diện Cài Đặt (`src/components/TabPricing.tsx`)

Bổ sung thẻ Card số 3: **3. Cài Đặt Ưu Đãi In Theo Số Lượng Tờ (Bulk Sheet Pricing)**:
- Nút Toggle Switch mượt mà bật/tắt `formState.bulkSheetPricing.enabled`.
- Khi tính năng được BẬT, hiển thị 2 ô nhập liệu:
  1. *Ngưỡng số tờ áp dụng (tờ)*: `thresholdSheets` (input number, min: 1)
  2. *Đơn giá ưu đãi đồng giá (đ/trang)*: `unitPrice` (input number, min: 0, step: 50)
- Giúp người dùng dễ dàng cấu hình và lưu trực tiếp vào database SQLite / LocalStorage.

---

## 5. Màn Hình Tính Tiền (`src/components/TabCalculator.tsx`)

- Khi `calculation.isBulkPricingApplied === true`:
  - Hiển thị badge / banner ưu đãi màu ngọc bích (Emerald Green) bên cạnh thông số tính tiền:
    `🎉 Đã áp dụng giá ưu đãi sỉ: {unitPrice}đ/trang (Đơn hàng ≥ {thresholdSheets} tờ)`.

---

## 6. Tương Thích Dữ Liệu Cũ (`src/services/db.ts`)

Đảm bảo khi tải cấu hình cũ chưa có trường `bulkSheetPricing`, hàm `fetchPricingConfig()` tự động merge cấu hình mặc định:
```typescript
return {
  ...DEFAULT_PRICING_CONFIG,
  ...parsedConfig,
  bulkSheetPricing: {
    ...DEFAULT_PRICING_CONFIG.bulkSheetPricing,
    ...(parsedConfig.bulkSheetPricing || {}),
  },
};
```
