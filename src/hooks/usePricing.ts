import { useState, useEffect, useCallback } from 'react';
import { PricingConfig, DEFAULT_PRICING_CONFIG } from '../types/billing';
import { fetchPricingConfig, savePricingConfig } from '../services/db';

export function usePricing() {
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPricingConfig();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load pricing config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const updateConfig = async (newConfig: PricingConfig) => {
    setSaving(true);
    try {
      await savePricingConfig(newConfig);
      setConfig(newConfig);
      showToast('Đã lưu cấu hình bảng giá vào SQLite database!');
    } catch (err) {
      console.error('Failed to save pricing config:', err);
      showToast('Lỗi khi lưu bảng giá!');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    await updateConfig(DEFAULT_PRICING_CONFIG);
    showToast('Đã khôi phục bảng giá về mặc định!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return {
    config,
    loading,
    saving,
    toastMessage,
    updateConfig,
    resetToDefault,
    reload: loadConfig,
  };
}
