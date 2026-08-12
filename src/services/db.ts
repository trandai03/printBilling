import Database from '@tauri-apps/plugin-sql';
import { PricingConfig, OrderRecord, OrderStatus, DEFAULT_PRICING_CONFIG } from '../types/billing';

const DB_NAME = 'sqlite:print_billing.db';
const LOCAL_STORAGE_PRICING_KEY = 'print_billing_pricing_config_v3';
const LOCAL_STORAGE_ORDERS_KEY = 'print_billing_orders_v3';

let dbInstance: Database | null = null;
let isTauriSqlAvailable = false;

export async function initDatabase(): Promise<boolean> {
  try {
    if (dbInstance) return true;
    dbInstance = await Database.load(DB_NAME);
    isTauriSqlAvailable = true;

    // Create pricing_config table
    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS pricing_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        config_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Create orders table with status & customer columns
    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        page_count INTEGER NOT NULL,
        copies INTEGER NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        status TEXT DEFAULT 'COMPLETED',
        file_items_json TEXT,
        paper_size TEXT NOT NULL,
        print_mode TEXT NOT NULL,
        sides_mode TEXT NOT NULL,
        paper_weight TEXT NOT NULL,
        extra_services_json TEXT NOT NULL,
        total_pages INTEGER NOT NULL,
        total_sheets INTEGER NOT NULL,
        print_cost REAL NOT NULL,
        paper_cost REAL DEFAULT 0,
        extra_cost REAL NOT NULL,
        total_amount REAL NOT NULL,
        notes TEXT
      );
    `);

    // Check if initial pricing config exists in SQLite
    const existingConfig = await dbInstance.select<{ config_json: string }[]>(
      'SELECT config_json FROM pricing_config WHERE id = 1'
    );

    if (existingConfig.length === 0) {
      await dbInstance.execute(
        'INSERT INTO pricing_config (id, config_json, updated_at) VALUES (1, $1, $2)',
        [JSON.stringify(DEFAULT_PRICING_CONFIG), new Date().toISOString()]
      );
    }

    console.log('SQLite database initialized successfully via Tauri Plugin.');
    return true;
  } catch (error) {
    console.warn('Tauri SQLite plugin unavailable or error, falling back to LocalStorage:', error);
    isTauriSqlAvailable = false;
    return false;
  }
}

// ---------------- PRICING CONFIG API ----------------

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

export async function savePricingConfig(config: PricingConfig): Promise<void> {
  const jsonStr = JSON.stringify(config);

  if (isTauriSqlAvailable && dbInstance) {
    try {
      await dbInstance.execute(
        `INSERT INTO pricing_config (id, config_json, updated_at) 
         VALUES (1, $1, $2)
         ON CONFLICT(id) DO UPDATE SET config_json = excluded.config_json, updated_at = excluded.updated_at`,
        [jsonStr, new Date().toISOString()]
      );
    } catch (err) {
      console.error('Error saving pricing config to SQLite:', err);
    }
  }

  // Always keep LocalStorage synced as well
  localStorage.setItem(LOCAL_STORAGE_PRICING_KEY, jsonStr);
}

// ---------------- ORDERS HISTORY & CUSTOMERS API ----------------

export async function fetchOrderRecords(): Promise<OrderRecord[]> {
  if (isTauriSqlAvailable && dbInstance) {
    try {
      const rows = await dbInstance.select<any[]>('SELECT * FROM orders ORDER BY created_at DESC');
      return rows.map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        fileName: row.file_name,
        fileSize: row.file_size,
        pageCount: row.page_count,
        copies: row.copies,
        customerName: row.customer_name || undefined,
        customerPhone: row.customer_phone || undefined,
        status: (row.status as OrderStatus) || 'COMPLETED',
        fileItems: row.file_items_json ? JSON.parse(row.file_items_json) : undefined,
        paperSize: row.paper_size,
        printMode: row.print_mode,
        sidesMode: row.sides_mode,
        paperWeight: row.paper_weight,
        extraServices: JSON.parse(row.extra_services_json || '{}'),
        totalPages: row.total_pages,
        totalSheets: row.total_sheets,
        printCost: row.print_cost,
        paperCost: row.paper_cost || 0,
        extraCost: row.extra_cost,
        totalAmount: row.total_amount,
        notes: row.notes || undefined,
      }));
    } catch (err) {
      console.error('Error fetching orders from SQLite:', err);
    }
  }

  // LocalStorage Fallback
  const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((o: any) => ({ ...o, status: o.status || 'COMPLETED' }));
    } catch (e) {
      console.error('Failed to parse orders from localStorage', e);
    }
  }
  return [];
}

export async function insertOrderRecord(order: OrderRecord): Promise<void> {
  if (isTauriSqlAvailable && dbInstance) {
    try {
      await dbInstance.execute(
        `INSERT INTO orders (
          id, created_at, file_name, file_size, page_count, copies, customer_name, customer_phone, status, file_items_json,
          paper_size, print_mode, sides_mode, paper_weight, extra_services_json,
          total_pages, total_sheets, print_cost, paper_cost, extra_cost, total_amount, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [
          order.id,
          order.createdAt,
          order.fileName,
          order.fileSize,
          order.pageCount,
          order.copies,
          order.customerName || '',
          order.customerPhone || '',
          order.status || 'COMPLETED',
          order.fileItems ? JSON.stringify(order.fileItems) : '',
          order.paperSize,
          order.printMode,
          order.sidesMode,
          order.paperWeight,
          JSON.stringify(order.extraServices),
          order.totalPages,
          order.totalSheets,
          order.printCost,
          order.paperCost || 0,
          order.extraCost,
          order.totalAmount,
          order.notes || '',
        ]
      );
    } catch (err) {
      console.error('Error inserting order into SQLite:', err);
    }
  }

  // LocalStorage sync
  const currentOrders = fetchOrderRecordsFromLocalStorage();
  const updatedOrders = [order, ...currentOrders];
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));
}

export async function updateOrderStatusRecord(id: string, status: OrderStatus): Promise<void> {
  if (isTauriSqlAvailable && dbInstance) {
    try {
      await dbInstance.execute('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    } catch (err) {
      console.error('Error updating order status in SQLite:', err);
    }
  }

  const currentOrders = fetchOrderRecordsFromLocalStorage();
  const updatedOrders = currentOrders.map((o) => (o.id === id ? { ...o, status } : o));
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));
}

export async function deleteOrderRecord(id: string): Promise<void> {
  if (isTauriSqlAvailable && dbInstance) {
    try {
      await dbInstance.execute('DELETE FROM orders WHERE id = $1', [id]);
    } catch (err) {
      console.error('Error deleting order from SQLite:', err);
    }
  }

  const currentOrders = fetchOrderRecordsFromLocalStorage();
  const updatedOrders = currentOrders.filter((o) => o.id !== id);
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON