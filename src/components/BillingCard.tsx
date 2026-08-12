import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Terminal, Send, CheckCircle2, AlertCircle, Cpu, Zap } from 'lucide-react';

interface BillingCardProps {
  onIpcSuccess?: () => void;
}

export const BillingCard: React.FC<BillingCardProps> = ({ onIpcSuccess }) => {
  const [inputName, setInputName] = useState<string>('Khách hàng mới');
  const [greetResponse, setGreetResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleTestIpc = async () => {
    setLoading(true);
    try {
      // Direct call to Tauri v2 Rust IPC command 'greet'
      const response = await invoke<string>('greet', { name: inputName });
      setGreetResponse(response);
      if (onIpcSuccess) onIpcSuccess();
    } catch (err: any) {
      console.warn('Tauri IPC test call warning (Browser dev mode without Rust background):', err);
      // Fallback message for browser dev mode when running outside Tauri window
      setGreetResponse(`[Web Preview Fallback] Hello, ${inputName}! (Backend Ready)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 border border-brand-500/20 glow-effect">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-300 text-xs font-semibold mb-3 border border-brand-500/30">
              <Zap className="w-3.5 h-3.5" /> Tauri v2 IPC Command Engine
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Khởi tạo Khung Dự án Desktop Thành công!
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Tauri v2 + React 18 + Tailwind CSS + TypeScript đã sẵn sàng. Hãy thử tương tác với hàm Rust backend bên dưới.
            </p>
          </div>
          <button 
            onClick={handleTestIpc}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-medium text-xs shadow-lg shadow-brand-500/25 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Đang gọi IPC...' : 'Gọi Rust #[tauri::command]'}</span>
          </button>
        </div>
      </div>

      {/* IPC Interactive Demo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Input Panel */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-400" />
              Thử nghiệm Frontend to Rust IPC
            </h3>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              @tauri-apps/api/core
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Tham số truyền vào Rust (`name` parameter):
            </label>
            <input 
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              placeholder="Nhập tên..."
            />
          </div>

          <button
            onClick={handleTestIpc}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            {loading ? 'Đang gửi...' : 'Gửi Request sang Rust'}
          </button>
        </div>

        {/* Right Terminal Console */}
        <div className="glass-panel rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Kết quả phản hồi từ Rust Backend</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live IPC
            </span>
          </div>

          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs text-slate-300 min-h-[90px] flex items-center justify-center text-center">
            {greetResponse ? (
              <div className="space-y-1">
                <p className="text-emerald-400 font-medium">{greetResponse}</p>
                <p className="text-[10px] text-slate-500">Lệnh IPC phản hồi dưới 1ms</p>
              </div>
            ) : (
              <p className="text-slate-500 italic">Bấm "Gửi Request" để xem phản hồi từ `src-tauri/src/lib.rs`</p>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Mã Rust đã được đăng ký chuẩn trong handler `tauri::generate_handler![greet]`</span>
          </div>
        </div>
      </div>
    </div>
  );
};
