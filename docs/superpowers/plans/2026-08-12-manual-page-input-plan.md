# Manual Page Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to manually add custom document entries with page and copy counts directly in `TabCalculator` without uploading files.

**Architecture:** Extend `useFileAnalyzer` hook to support adding manual file items (`file: null`, `isManual: true`), and update `TabCalculator` UI to render manual entry controls, editable document names, and quick action buttons in both the header and empty dropzone state.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide Icons.

## Global Constraints

- Keep existing file analyzer flow intact for uploaded PDF and Word files.
- Ensure total billing calculations (`calculateBilling`) work seamlessly with mixed manual and uploaded items.

---

### Task 1: Extend Types & Hook (`types/billing.ts` & `useFileAnalyzer.ts`)

**Files:**
- Modify: `src/types/billing.ts`
- Modify: `src/hooks/useFileAnalyzer.ts`

- [ ] **Step 1: Add `isManual?: boolean` to `SelectedFileItem` in `src/types/billing.ts`**

```typescript
export interface SelectedFileItem {
  id: string;
  file?: File | null;
  fileName: string;
  fileSize: number;
  pageCount: number;
  copies: number;
  loading?: boolean;
  error?: string | null;
  isManual?: boolean;
}
```

- [ ] **Step 2: Add `addManualItem` and `updateFileName` to `useFileAnalyzer` hook**

In `src/hooks/useFileAnalyzer.ts`:
```typescript
const addManualItem = (customName?: string) => {
  const manualCount = fileItems.filter((f) => f.isManual).length + 1;
  const name = customName || `Tài liệu nhập tay ${manualCount}`;
  const newItem: SelectedFileItem = {
    id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    file: null,
    fileName: name,
    fileSize: 0,
    pageCount: 1,
    copies: 1,
    loading: false,
    error: null,
    isManual: true,
  };
  setFileItems((prev) => [...prev, newItem]);
};

const updateFileName = (id: string, name: string) => {
  setFileItems((prev) =>
    prev.map((item) => (item.id === id ? { ...item, fileName: name } : item))
  );
};
```
Return `addManualItem` and `updateFileName` from `useFileAnalyzer`.

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

---

### Task 2: Update UI in `TabCalculator.tsx`

**Files:**
- Modify: `src/components/TabCalculator.tsx`

- [ ] **Step 1: Destructure `addManualItem` and `updateFileName` from `useFileAnalyzer()`**

- [ ] **Step 2: Add "+ Nhập thủ công" button in header & Dropzone action**

Add button with icon `Plus` or `Edit3` in header next to `Thêm File`.
In Dropzone when `fileItems.length === 0`, add button/link for `Nhập thủ công`.

- [ ] **Step 3: Render manual document items in file list**

For `item.isManual`:
- Show `Edit3` icon and a badge `"Thủ công"`.
- Allow editing `item.fileName` with inline input.
- Keep `pageCount`, `copies`, and remove buttons fully functional.

- [ ] **Step 4: Verify UI build & type correctness**

Run: `npm run build`
Expected: PASS with 0 build errors.

---

### Task 3: Verification & Walkthrough

- Verify manual addition, page updating, total billing recalculation.
- Create walkthrough documentation if needed.
