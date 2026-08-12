# Data Backup & Restore Feature Design

## Overview
To protect user data (pricing configuration and order history) during software updates (e.g. upgrading from v1.0 to v2.0) or when migrating to a new machine, a full data Backup & Restore system is added to the application.

## User Workflow
1. User navigates to **Cấu Hình Bảng Giá** (Tab Pricing).
2. Under a new section **Quản Lý Dữ Liệu & Sao Lưu** (Data Backup & Management):
   - **Export**: User clicks **"Xuất dữ liệu sao lưu (.json)"** to download a single JSON backup file containing all pricing options and order records.
   - **Import**: User clicks **"Khôi phục dữ liệu"** and selects a `.json` backup file.
3. Upon selecting a valid backup file, an **Import Options Modal** appears displaying:
   - Metadata: Export date & time, number of order records included.
   - Two Import Modes:
     - **Ghi đè hoàn toàn (Overwrite)**: Replaces all current pricing configs and order history with the file data.
     - **Gộp dữ liệu (Merge)**: Merges pricing configs and appends orders from the backup (skipping any orders with duplicate IDs).
4. After confirmation, the database (SQLite & LocalStorage) is updated, a success notification toast is displayed, and application state reloads immediately.

## Data Structures & Validation

### Backup JSON Schema (`BackupPayload`)
```typescript
export interface BackupPayload {
  version: string; // e.g. "1.0"
  exportedAt: string; // ISO 8601 string
  pricingConfig: PricingConfig;
  orders: OrderRecord[];
}
```

### Validation Rules
- JSON file must contain `pricingConfig` object with required structures (`printPrices`, `extraServices`, `paperPrices`).
- JSON file must contain `orders` array.
- Invalid format triggers a error toast message: "File sao lưu không hợp lệ hoặc bị lỗi cấu trúc."

## Core Changes

### 1. Database Service (`src/services/db.ts`)
- `exportBackupPayload()`: Fetches current pricing config and all order records, returning a formatted `BackupPayload`.
- `importBackupPayload(payload: BackupPayload, mode: 'overwrite' | 'merge')`:
  - **Overwrite**:
    - Truncates `orders` table and deletes existing `pricing_config`.
    - Inserts all orders from `payload.orders`.
    - Saves `payload.pricingConfig`.
    - Clears and sets corresponding LocalStorage keys (`print_billing_orders_v3`, `print_billing_pricing_config_v3`).
  - **Merge**:
    - Updates `pricing_config` with `payload.pricingConfig`.
    - Selects existing order IDs to avoid duplicate key conflicts.
    - Inserts only non-duplicate orders from `payload.orders`.
    - Merges LocalStorage order arrays.

### 2. Custom Hooks & Service Wrappers
- Update `usePricing.ts` or `useOrderHistory.ts` to export backup/restore helper functions and trigger state refresh across tabs.

### 3. UI Component (`src/components/TabPricing.tsx`)
- Add a new section card **"Quản Lý Dữ Liệu & Sao Lưu"**.
- Add hidden file input `<input type="file" accept=".json" ... />`.
- Add **Import Modal** component to select between Overwrite and Merge modes before applying changes.

## Verification Plan
1. **Export Verification**:
   - Click "Xuất dữ liệu sao lưu", verify `.json` file downloads with correct timestamp and structure.
2. **Import (Overwrite) Verification**:
   - Delete/change some records, click "Khôi phục dữ liệu", choose "Ghi đè hoàn toàn". Verify all previous records and pricing configs are restored exact.
3. **Import (Merge) Verification**:
   - Add new order record, import backup with "Gộp dữ liệu". Verify new record is kept while missing records from backup are added.
