import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TabCalculator } from './components/TabCalculator';
import { TabPricing } from './components/TabPricing';
import { TabHistory } from './components/TabHistory';
import { ReceiptModal } from './components/ReceiptModal';
import { OrderRecord } from './types/billing';
import { usePricing } from './hooks/usePricing';
import { useOrderHistory } from './hooks/useOrderHistory';
import { initDatabase } from './services/db';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'pricing' | 'history'>('calculator');
  const [isDbReady, setIsDbReady] = useState<boolean>(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderRecord | null>(null);

  // Dark mode state (defaults to true)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('print_billing_darkmode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('print_billing_darkmode', isDarkMode ? 'true' : 'false');
  }, [isDarkMode]);

  const { config: pricingConfig, reload: reloadPricing } = usePricing();
  const { addOrder, reload: reloadHistory } = useOrderHistory();

  useEffect(() => {
    // Initialize SQLite Database on startup
    initDatabase().then((ready) => {
      setIsDbReady(ready);
      reloadPricing();
      reloadHistory();
    });
  }, [reloadPricing, reloadHistory]);

  const handleSaveOrder = async (newOrder: OrderRecord) => {
    await addOrder(newOrder);
    setSelectedReceiptOrder(newOrder);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f9f9f9] dark:bg-[#131313] text-slate-900 dark:text-on-surface overflow-hidden font-sans selection:bg-primary-container selection:text-on-primary-container transition-colors duration-200">
      {/* Top Windows Fluent App Header */}
      <Header isDbReady={isDbReady} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f9f9f9] dark:bg-[#131313] relative transition-colors duration-200">
          {/* Ambient Lighting Background Accent */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-primary/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/3 z-0"></div>

          <div className="w-full max-w-[1400px] mx-auto relative z-10">
            {activeTab === 'calculator' && (
              <TabCalculator
                pricingConfig={pricingConfig}
                onSaveOrder={handleSaveOrder}
              />
            )}

            {activeTab === 'pricing' && (
              <TabPricing
                isDarkMode={isDarkMode}
                onToggleDarkMode={(enabled) => setIsDarkMode(enabled)}
              />
            )}

            {activeTab === 'history' && (
              <TabHistory
                onViewReceipt={(order) => setSelectedReceiptOrder(order)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        order={selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />
    </div>
  );
};

export default App;
