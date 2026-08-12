# Bulk Sheet Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toggleable setting in PrintBilling to configure bulk sheet threshold and special unit pricing (e.g., printing $\ge 100$ sheets applies a fixed discount rate for all pages).

**Architecture:** Extend `PricingConfig` interface with `bulkSheetPricing`, update `calculateBilling` function to conditionally apply `unitPrice` when total sheets meet or exceed `thresholdSheets`, add setting controls to `TabPricing.tsx`, add indicator badge to `TabCalculator.tsx`, and ensure backward compatibility in `db.ts`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React, Tauri SQL Plugin / LocalStorage.

## Global Constraints

- Preserve all existing billing features and pricing types
- Maintain dark mode compatibility with existing Fluent/Tailwind theme classes
- Guarantee backward compatibility for existing saved database configs

---

### Task 1: Update Types & Calculation Logic

**Files:**
- Modify: `src/types/billing.ts:15-112`
- Modify: `src/utils/calculator.ts:1-90`

**Interfaces:**
- Consumes: Existing `PricingConfig`, `CalculationResult`, `calculateBilling`
- Produces: Updated `PricingConfig` with `bulkSheetPricing`, updated `CalculationResult` with `isBulkPricingApplied`

- [ ] **Step 1: Update `src/types/billing.ts` to include `BulkSheetPricingConfig`**

```typescript
export interface BulkSheetPricingConfig {
  enabled: boolean;
  thresholdSheets: number;
  unitPrice: number;
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
  bulkSheetPricing: BulkSheetPricingConfig;
}

export interface CalculationResult {
  filePages: number;
  copies: number;
  totalPages: number;
  totalSheets: number;
  unitPrintPrice: number;
  printCost: number;
  extraCost: number;
  totalAmount: number;
  isBulkPricingApplied?: boolean;
}

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

- [ ] **Step 2: Update `calculateBilling` in `src/utils/calculator.ts`**

```typescript
export function calculateBilling(
  fileItems: SelectedFileItem[],
  paperSize: PaperSize,
  printMode: PrintMode,
  sidesMode: SidesMode,
  _paperWeight: PaperWeight,
  extraServices: ExtraServices,
  pricingConfig: PricingConfig
): CalculationResult {
  if (!fileItems || fileItems.length === 0) {
    return {
      filePages: 0,
      copies: 0,
      totalPages: 0,
      totalSheets: 0,
      unitPrintPrice: 0,
      printCost: 0,
      extraCost: 0,
      totalAmount: 0,
      isBulkPricingApplied: false,
    };
  }

  let totalPages = 0;
  let totalSheets = 0;
  let totalCopies = 0;
  let totalRawFilePages = 0;

  for (const item of fileItems) {
    const pages = Math.max(1, item.pageCount);
    const copies = Math.max(1, item.copies);
    const itemPages = pages * copies;
    const itemSheets = sidesMode === 'SIMPLEX' ? itemPages : Math.ceil(itemPages / 2);

    totalRawFilePages += pages;
    totalCopies += copies;
    totalPages += itemPages;
    totalSheets += itemSheets;
  }

  // Check bulk sheet pricing rule
  const bulkConfig = pricingConfig.bulkSheetPricing;
  const isBulkPricingApplied =
    !!bulkConfig?.enabled && totalSheets >= (bulkConfig.thresholdSheets || 0);

  // Unit print price per page
  const unitPrintPrice = isBulkPricingApplied
    ? bulkConfig.unitPrice
    : (pricingConfig.printPrices[paperSize]?.[printMode === 'BW' ? 'bw' : 'color'] ?? 0);

  const printCost = totalPages * unitPrintPrice;

  // Duplex surcharge
  const duplexSurchargeTotal =
    sidesMode === 'DUPLEX' ? totalSheets * (pricingConfig.duplexSurcharge || 0) : 0;

  // Extra service fees
  let extraCost = 0;
  const setMultiplier = Math.max(1, fileItems.length);

  if (extraServices.coverPage) {
    extraCost += (pricingConfig.extraServices.coverPagePrice || 0) * setMultiplier;
  }
  if (extraServices.staple) {
    extraCost += (pricingConfig.extraServices.staplePrice || 0) * setMultiplier;
  }
  if (extraServices.spiralBinding) {
    extraCost += (pricingConfig.extraServices.spiralBindingPrice || 0) * setMultiplier;
  }
  extraCost += duplexSurchargeTotal;

  // Grand Total rounded to nearest 100 VND
  const rawTotal = printCost + extraCost;
  const totalAmount = Math.round(rawTotal / 100) * 100;

  return {
    filePages: totalRawFilePages,
    copies: totalCopies,
    totalPages,
    totalSheets,
    unitPrintPrice,
    printCost,
    extraCost,
    totalAmount,
    isBulkPricingApplied,
  };
}
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npm run build` or `npx tsc --noEmit`
Expected: Clean compilation with 0 type errors.

---

### Task 2: Ensure Database Fallback & Merging

**Files:**
- Modify: `src/services/db.ts:77-101`

**Interfaces:**
- Consumes: `DEFAULT_PRICING_CONFIG` from `src/types/billing.ts`
- Produces: Safe `fetchPricingConfig()` function merging default bulk pricing when loading legacy configs

- [ ] **Step 1: Update `fetchPricingConfig()` in `src/services/db.ts`**

```typescript
export async function fetchPricingConfig(): Promise<PricingConfig> {
  let loadedConfig: Partial<PricingConfig> | null = null;

  if (isTauriSqlAvailable && dbInstance) {
    try {
      const rows = await dbInstance.select<{ config_json: string }[]>(
        'SELECT config_json FROM pricing_config WHERE id = 1'
      );
      if (rows.length > 0) {
        loadedConfig = JSON.parse(rows[0].config_json);
      }
    } catch (err) {
      console.error('Error fetching pricing from SQLite:', err);
    }
  }

  if (!loadedConfig) {
    const stored = localStorage.getItem(LOCAL_STORAGE_PRICING_KEY);
    if (stored) {
      try {
        loadedConfig = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse pricing config from localStorage', e);
      }
    }
  }

  // Merge loaded config with DEFAULT_PRICING_CONFIG to guarantee bulkSheetPricing exists
  return {
    ...DEFAULT_PRICING_CONFIG,
    ...(loadedConfig || {}),
    printPrices: {
      ...DEFAULT_PRICING_CONFIG.printPrices,
      ...(loadedConfig?.printPrices || {}),
    },
    extraServices: {
      ...DEFAULT_PRICING_CONFIG.extraServices,
      ...(loadedConfig?.extraServices || {}),
    },
    bulkSheetPricing: {
      ...DEFAULT_PRICING_CONFIG.bulkSheetPricing,
      ...(loadedConfig?.bulkSheetPricing || {}),
    },
  };
}
```

- [ ] **Step 2: Verify type safety**

Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 3: Add Bulk Pricing UI Controls in Settings Tab

**Files:**
- Modify: `src/components/TabPricing.tsx`

**Interfaces:**
- Consumes: `PricingConfig`, `usePricing`
- Produces: New Card component in Settings UI for Bulk Sheet Pricing

- [ ] **Step 1: Add Lucide icon imports and render Card 3 in `TabPricing.tsx`**

Add `Tag` or `Layers` to Lucide imports in `TabPricing.tsx`.
Add Card 3 below Card 2 in `TabPricing.tsx`:

```tsx
{/* 3. Bulk Sheet Pricing Card */}
<div className="bg-white dark:bg-[#2D2D2D] rounded-xl border border-slate-200 dark:border-[#3D3D3D] p-6 space-y-4 shadow-sm">
  <div className="flex items-center gap-2 text-blue-600 dark:text-primary border-b border-slate-200 dark:border-[#3D3D3D] pb-3">
    <Layers className="w-5 h-5" />
    <h3 className="font-bold text-sm text-slate-900 dark:text-on-surface">3. Ưu Đãi In Theo Số Lượng Tờ (Bulk Sheet Pricing)</h3>
  </div>

  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/30">
    <div>
      <h4 className="font-semibold text-sm text-slate-900 dark:text-on-surface">
        {formState.bulkSheetPricing?.enabled
          ? 'Đang BẬT chế độ đồng giá ưu đãi khi in số lượng lớn'
          : 'Đang TẮT chế độ đồng giá ưu đãi'}
      </h4>
      <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">
        Khi đơn hàng đạt từ số tờ tối thiểu trở lên, hệ thống sẽ áp dụng đơn giá đồng giá ưu đãi cho tất cả các trang/tờ.
      </p>
    </div>

    <button
      type="button"
      onClick={() =>
        setFormState((prev) => ({
          ...prev,
          bulkSheetPricing: {
            ...prev.bulkSheetPricing,
            enabled: !prev.bulkSheetPricing?.enabled,
          },
        }))
      }
      className={`w-14 h-8 rounded-full p-1 transition-colors relative flex items-center shadow-inner ${
        formState.bulkSheetPricing?.enabled
          ? 'bg-blue-600 dark:bg-primary-container justify-end'
          : 'bg-slate-300 justify-start'
      }`}
    >
      <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 transition-transform font-bold text-[10px]">
        {formState.bulkSheetPricing?.enabled ? 'ON' : 'OFF'}
      </div>
    </button>
  </div>

  {formState.bulkSheetPricing?.enabled && (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
      <div className="p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/30 space-y-2">
        <label className="text-xs font-semibold text-slate-800 dark:text-on-surface block">
          Số tờ tối thiểu để áp dụng ưu đãi (tờ):
        </label>
        <input
          type="number"
          min="1"
          step="10"
          value={formState.bulkSheetPricing.thresholdSheets}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10) || 0;
            setFormState((prev) => ({
              ...prev,
              bulkSheetPricing: {
                ...prev.bulkSheetPricing,
                thresholdSheets: val,
              },
            }));
          }}
          className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-3 py-2 text-slate-900 dark:text-on-surface font-mono font-code text-sm font-semibold focus:border-blue-600 dark:focus:border-primary focus:outline-none"
        />
      </div>

      <div className="p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-outline-variant/30 space-y-2">
        <label className="text-xs font-semibold text-slate-800 dark:text-on-surface block">
          Đơn giá ưu đãi đồng giá (đ/trang):
        </label>
        <input
          type="number"
          min="0"
          step="50"
          value={formState.bulkSheetPricing.unitPrice}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10) || 0;
            setFormState((prev) => ({
              ...prev,
              bulkSheetPricing: {
                ...prev.bulkSheetPricing,
                unitPrice: val,
              },
            }));
          }}
          className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-outline-variant/40 rounded-lg px-3 py-2 text-slate-900 dark:text-on-surface font-mono font-code text-sm font-semibold focus:border-blue-600 dark:focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  )}
</div>
```

- [ ] **Step 2: Build project and verify compilation**

Run: `npm run build`
Expected: Successful build.

---

### Task 4: Display Bulk Pricing Indicator Badge on Calculator Tab

**Files:**
- Modify: `src/components/TabCalculator.tsx`

**Interfaces:**
- Consumes: `calculation.isBulkPricingApplied`, `pricingConfig.bulkSheetPricing`
- Produces: UI notification badge when bulk sheet pricing is applied

- [ ] **Step 1: Add Sparkles / Tag icon and render Bulk Pricing Banner in `TabCalculator.tsx`**

In `TabCalculator.tsx`, near the calculation summary section:

```tsx
{calculation.isBulkPricingApplied && (
  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
    <Sparkles className="w-4 h-4 text-emerald-500" />
    <span>
      Đã áp dụng đơn giá ưu đãi sỉ: <strong>{formatCurrencyVND(pricingConfig.bulkSheetPricing.unitPrice)}/trang</strong> (Đơn hàng có <strong>{calculation.totalSheets}</strong> tờ &ge; ngưỡng {pricingConfig.bulkSheetPricing.thresholdSheets} tờ)
    </span>
  </div>
)}
```

- [ ] **Step 2: Build and test**

Run: `npm run build`
Expected: Build passes with no errors.
