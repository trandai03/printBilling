# Data Backup & Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full data backup (export to JSON) and restore (import with Overwrite/Merge choices) functionality in the Settings tab to safeguard pricing configurations and order history across software updates.

**Architecture:** Extend `src/services/db.ts` with backup export/import handlers interacting with SQLite database and LocalStorage fallback. Create a "Quản Lý Dữ Liệu & Sao Lưu" card and an `ImportModal` component in `TabPricing.tsx` for file selection, validation, mode picking, and database restoration.

**Tech Stack:** React, TypeScript, Tauri Plugin SQL / LocalStorage, Lucide React icons, Tailwind CSS.

## Global Constraints

- Preserve all existing SQLite table schemas and LocalStorage keys (`print_billing_orders_v3`, `print_billing_pricing_config_v3`).
- Backup file format must be JSON with UTF-8 encoding.
- Ensure state reloads across components when restore finishes.

---

### Task 1: Add Backup Types & Database Service Functions

**Files:**
- Modify: `src/types/billing.ts`
- Modify: `src/services/db.ts`

**Interfaces:**
- Produces: `BackupPayload` interface in `src/types/billing.ts`
- Produces: `exportFullBackupPayload(): Promise<BackupPayload>` in `src/services/db.ts`
- Produces: `importFullBackupPayload(payload: BackupPayload, mode: 'overwrite' | 'merge'): Promise<{ success: boolean; importedOrdersCount: number }>` in `src/services/db.ts`

- [ ] **Step 1: Add `BackupPayload` interface to `src/types/billing.ts`**

Add `BackupPayload` definition to `src/types/billing.ts`:
```typescript
export interface BackupPayload {
  version: string;
  exportedAt: string;
  pricingConfig: PricingConfig;
  orders: OrderRecord[];
}
```

- [ ] **Step 2: Add `exportFullBackupPayload` and `importFullBackupPayload` to `src/services/db.ts`**

Implement `exportFullBackupPayload` and `importFullBackupPayload`:
```typescript
export async function exportFullBackupPayload(): Promise<BackupPayload> {
  const pricingConfig = await fetchPricingConfig();
  const orders = await fetchOrderRecords();

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    pricingConfig,
    orders,
  };
}

export async function importFullBackupPayload(
  payload: BackupPayload,
  mode: 'overwrite' | 'merge'
): Promise<{ success: boolean; importedOrdersCount: number }> {
  if (!payload || !payload.pricingConfig || !Array.isArray(payload.orders)) {
    throw new Error('File sao lưu không hợp lệ hoặc thiếu dữ liệu.');
  }

  // 1. Save pricing config
  await savePricingConfig(payload.pricingConfig);

  // 2. Handle Orders
  let importedCount = 0;
  if (mode === 'overwrite') {
    await clearAllOrders();
    for (const order of payload.orders) {
      await insertOrderRecord(order);
      importedCount++;
    }
  } else {
    // Merge mode: fetch existing order IDs to avoid duplicate insertion
    const currentOrders = await fetchOrderRecords();
    const existingIds = new Set(currentOrders.map((o) => o.id));

    for (const order of payload.orders) {
      if (!existingIds.has(order.id)) {
        await insertOrderRecord(order);
        importedCount++;
      }
    }
  }

  return {
    success: true,
    importedOrdersCount: importedCount,
  };
}
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: Clean compilation with 0 errors.

- [ ] **Step 4: Commit changes**

```bash
git add src/types/billing.ts src/services/db.ts
git commit -m "feat: add exportFullBackupPayload and importFullBackupPayload services"
```

---

### Task 2: Implement Backup & Restore UI Card and Import Modal in `TabPricing.tsx`

**Files:**
- Modify: `src/components/TabPricing.tsx`

**Interfaces:**
- Consumes: `exportFullBackupPayload`, `importFullBackupPayload`, `BackupPayload` from `src/services/db.ts` and `src/types/billing.ts`

- [ ] **Step 1: Add state variables and file picker handler in `TabPricing.tsx`**

Add state for modal visibility, pending payload, import mode, and file input ref:
- `isImportModalOpen`: boolean
- `pendingPayload`: `BackupPayload | null`
- `importMode`: `'overwrite' | 'merge'`
- `importing`: boolean

Add helper functions:
- `handleExportBackup()`: calls `exportFullBackupPayload()`, generates JSON string formatted with 2-space indentation, creates a download anchor element with filename `print_billing_backup_YYYY-MM-DD.json`, clicks it, and revokes object URL.
- `handleFileSelect(event)`: reads selected `.json` file via `FileReader`, parses JSON, validates `pricingConfig` and `orders`, sets `pendingPayload` and opens `isImportModalOpen`.
- `handleConfirmImport()`: calls `importFullBackupPayload(pendingPayload, importMode)`, triggers success toast, reloads window/state, and closes modal.

- [ ] **Step 2: Add UI Card "Quản Lý Dữ Liệu & Sao Lưu" to `TabPricing.tsx`**

Render a styled card section at the bottom of `TabPricing.tsx` featuring:
- Icon `Database`
- Header: "Quản Lý Dữ Liệu & Sao Lưu"
- Subtitle: "Xuất dữ liệu hệ thống (Bảng giá & Lịch sử đơn hàng) hoặc khôi phục từ file JSON."
- Two action buttons:
  - "Xuất File Sao Lưu (.json)" (with `Download` icon)
  - "Khôi Phục Dữ Liệu" (with `Upload` icon, triggering hidden file input)

- [ ] **Step 3: Render Import Options Modal in `TabPricing.tsx`**

When `isImportModalOpen` is true:
- Display modal backdrop and dialog box.
- Show metadata:
  - Ngày xuất file: formatted `exportedAt`
  - Số lượng đơn hàng trong file: `pendingPayload.orders.length`
- Render radio options for Import Mode:
  - **Ghi đè hoàn toàn (Overwrite)**: "Xóa toàn bộ đơn hàng hiện tại và thay thế bằng dữ liệu từ file sao lưu."
  - **Gộp dữ liệu (Merge)**: "Giữ đơn hàng hiện tại, gộp thêm các đơn hàng mới từ file sao lưu."
- Action buttons: "Hủy" & "Xác Nhận Khôi Phục"

- [ ] **Step 4: Verify UI build and TypeScript checking**

Run: `npx tsc --noEmit`
Expected: Clean compilation with 0 errors.

- [ ] **Step 5: Test build**

Run: `npm run build`
Expected: Build succeeds without errors.

- [ ] **Step 6: Commit changes**

```bash
git add src/components/TabPricing.tsx
git commit -m "feat: add Backup & Restore UI card and import modal in TabPricing"
```
