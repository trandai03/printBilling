import { useState, useEffect, useCallback, useMemo } from 'react';
import { OrderRecord, OrderStatus, CustomerRecord } from '../types/billing';
import {
  fetchOrderRecords,
  insertOrderRecord,
  updateOrderStatusRecord,
  deleteOrderRecord,
  clearAllOrders,
} from '../services/db';
import { exportOrdersToCSV } from '../utils/exportCsv';

export function useOrderHistory() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrderRecords();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const addOrder = async (order: OrderRecord) => {
    await insertOrderRecord(order);
    await loadOrders();
  };

  const updateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    await updateOrderStatusRecord(id, newStatus);
    await loadOrders();
  };

  const removeOrder = async (id: string) => {
    await deleteOrderRecord(id);
    await loadOrders();
  };

  const clearHistory = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đơn hàng không? Hành động này không thể hoàn tác.')) {
      await clearAllOrders();
      await loadOrders();
    }
  };

  // Get list of unique customers & their stats
  const uniqueCustomers = useMemo(() => {
    const customerMap = new Map<string, { phone?: string; totalSpent: number; orderCount: number; unpaidCount: number; lastDate: string }>();

    for (const order of orders) {
      const name = (order.customerName || 'Khách vãng lai').trim();
      const existing = customerMap.get(name) || { phone: order.customerPhone, totalSpent: 0, orderCount: 0, unpaidCount: 0, lastDate: order.createdAt };
      customerMap.set(name, {
        phone: order.customerPhone || existing.phone,
        totalSpent: existing.totalSpent + order.totalAmount,
        orderCount: existing.orderCount + 1,
        unpaidCount: existing.unpaidCount + (order.status === 'UNPAID' ? 1 : 0),
        lastDate: order.createdAt > existing.lastDate ? order.createdAt : existing.lastDate,
      });
    }

    const list: CustomerRecord[] = [];
    customerMap.forEach((stats, name) => {
      list.push({
        id: name,
        name,
        phone: stats.phone,
        totalSpent: stats.totalSpent,
        orderCount: stats.orderCount,
        lastOrderDate: stats.lastDate,
      });
    });

    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Status filter
      if (selectedStatusFilter !== 'ALL' && order.status !== selectedStatusFilter) {
        return false;
      }

      // 2. Customer name filter
      if (selectedCustomerFilter) {
        const name = (order.customerName || 'Khách vãng lai').trim();
        if (name !== selectedCustomerFilter) return false;
      }

      // 3. Search Query filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.fileName.toLowerCase().includes(q) ||
        (order.customerName && order.customerName.toLowerCase().includes(q)) ||
        (order.customerPhone && order.customerPhone.toLowerCase().includes(q)) ||
        order.paperSize.toLowerCase().includes(q) ||
        (order.notes && order.notes.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // 4. Date filter
      const orderDateStr = order.createdAt.slice(0, 10); // YYYY-MM-DD
      if (startDate && orderDateStr < startDate) return false;
      if (endDate && orderDateStr > endDate) return false;

      return true;
    });
  }, [orders, searchQuery, selectedCustomerFilter, selectedStatusFilter, startDate, endDate]);

  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status === 'COMPLETED')
      .reduce((sum, item) => sum + item.totalAmount, 0);
  }, [filteredOrders]);

  const totalUnpaid = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status === 'UNPAID')
      .reduce((sum, item) => sum + item.totalAmount, 0);
  }, [filteredOrders]);

  const handleExportCSV = () => {
    exportOrdersToCSV(filteredOrders);
  };

  return {
    orders: filteredOrders,
    rawOrdersCount: orders.length,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCustomerFilter,
    setSelectedCustomerFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    uniqueCustomers,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    totalRevenue,
    totalUnpaid,
    addOrder,
    updateOrderStatus,
    removeOrder,
    clearHistory,
    exportCSV: handleExportCSV,
    reload: loadOrders,
  };
}
