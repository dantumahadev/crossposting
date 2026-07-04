import React, { useState } from 'react';
import { 
  Settings, Shield, Key, Database, Zap, Bell, CheckCircle2, Lock, 
  RefreshCw, Save, Sliders, HardDrive, Cpu
} from 'lucide-react';

export default function SettingsPage() {
  const [aiProvider, setAiProvider] = useState('openai');
  const [dbType, setDbType] = useState('sqlite');
  const [autoRetry, setAutoRetry] = useState(true);
  const [pollInterval, setPollInterval] = useState('3');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div class="space-y-10 max-w-4xl">
      {/* Header */}
      <div class="border-b border-[#1f1f23] pb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl md:text-4xl font-display font-bold tracking-tight text-white flex items-center gap-3">
            <Settings size={32} class="text-white" /> System Configuration & Security
          </h1>
          <p class="text-zinc-400 text-sm mt-1">Manage encryption parameters, AI engine credentials, database drivers, and worker retry policies.</p>
        </div>
        {saved && (
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono animate-fade-in">
            <CheckCircle2 size={16} /> Configuration Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} class="space-y-8">
        {/* Security & Token Encryption Box */}
        <div class="glass-panel p-6 md:p-8 space-y-6">
          <div class="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div class="p-2 rounded-lg bg-white/10 text-white"><Shield size={20} /></div>
            <div>
              <h3 class="font-display font-bold text-white text-lg">AES-GCM Encryption at Rest</h3>
              <div class="text-xs text-zinc-400 font-mono">Active Cipher: 256-bit Advanced Encryption Standard with Galois/Counter Mode</div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-mono text-zinc-400 uppercase flex items-center gap-1.5">
                <Lock size={12} class="text-emerald-400" /> Master Encryption Key Status
              </label>
              <div class="p-3.5 rounded-xl bg-[#0a0a0e] border border-zinc-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
                <span>••••••••••••••••••••••••••••32-BYTE-KEY</span>
                <span class="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 text-emerald-300">ACTIVE</span>
              </div>
              <div class="text-[11px] text-zinc-500 font-mono">Configured via `ENCRYPTION_KEY` in environment. Used for Meta/LinkedIn OAuth access tokens.</div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-mono text-zinc-400 uppercase">JWT Auth Token Expiration</label>
              <select class="apple-input text-xs py-3 bg-[#0a0a0e]">
                <option value="60">60 Minutes (Standard Production)</option>
                <option value="1440">24 Hours (Extended Admin Session)</option>
                <option value="10080">7 Days (Local Development)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Caption & Hashtag Engine */}
        <div class="glass-panel p-6 md:p-8 space-y-6">
          <div class="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div class="p-2 rounded-lg bg-white/10 text-white"><Cpu size={20} /></div>
            <div>
              <h3 class="font-display font-bold text-white text-lg">AI Copy Generation Engine</h3>
              <div class="text-xs text-zinc-400 font-mono">Select active LLM provider for platform-tailored caption formatting</div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${
              aiProvider === 'openai' ? 'bg-white/5 border-white shadow-md' : 'bg-[#0a0a0e] border-zinc-800 hover:border-zinc-700'
            }`}>
              <input type="radio" name="ai" checked={aiProvider === 'openai'} onChange={() => setAiProvider('openai')} class="hidden" />
              <div class="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold">GPT</div>
              <div>
                <div class="font-semibold text-white text-sm">OpenAI gpt-4o-mini</div>
                <div class="text-xs text-zinc-500 font-mono">Fast, optimized for social copy</div>
              </div>
            </label>

            <label class={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${
              aiProvider === 'gemini' ? 'bg-white/5 border-white shadow-md' : 'bg-[#0a0a0e] border-zinc-800 hover:border-zinc-700'
            }`}>
              <input type="radio" name="ai" checked={aiProvider === 'gemini'} onChange={() => setAiProvider('gemini')} class="hidden" />
              <div class="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 font-bold">GEM</div>
              <div>
                <div class="font-semibold text-white text-sm">Google Gemini 1.5 Pro</div>
                <div class="text-xs text-zinc-500 font-mono">Multimodal reasoning capabilities</div>
              </div>
            </label>
          </div>
        </div>

        {/* Database & Storage Engine */}
        <div class="glass-panel p-6 md:p-8 space-y-6">
          <div class="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div class="p-2 rounded-lg bg-white/10 text-white"><Database size={20} /></div>
            <div>
              <h3 class="font-display font-bold text-white text-lg">Storage & Database Driver</h3>
              <div class="text-xs text-zinc-400 font-mono">Configure local SQLite zero-friction fallback or remote PostgreSQL connection</div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-mono text-zinc-400 uppercase">Active Database Engine</label>
              <div class="p-3.5 rounded-xl bg-[#0a0a0e] border border-zinc-800 font-mono text-xs text-white flex items-center justify-between">
                <span>sqlite:///./founderlabs.db</span>
                <span class="text-[10px] bg-blue-950 px-2 py-0.5 rounded border border-blue-800 text-blue-300 font-bold">SQLModel / SQLite</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-mono text-zinc-400 uppercase">Media Storage Bucket</label>
              <div class="p-3.5 rounded-xl bg-[#0a0a0e] border border-zinc-800 font-mono text-xs text-white flex items-center justify-between">
                <span>./storage/media/</span>
                <span class="text-[10px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">Local Volume</span>
              </div>
            </div>
          </div>
        </div>

        {/* Worker & Retry Policies */}
        <div class="glass-panel p-6 md:p-8 space-y-6">
          <div class="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div class="p-2 rounded-lg bg-white/10 text-white"><Zap size={20} /></div>
            <div>
              <h3 class="font-display font-bold text-white text-lg">Redis & RQ Background Worker</h3>
              <div class="text-xs text-zinc-400 font-mono">Configure asynchronous publishing retries and UI polling rate</div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div class="space-y-1">
              <div class="font-medium text-white text-sm">Automatic API Error Retries</div>
              <div class="text-xs text-zinc-400 max-w-md">When checked, failed OAuth Container transfers or network timeouts will be automatically retried up to 3 times with exponential backoff.</div>
            </div>
            <input 
              type="checkbox" 
              checked={autoRetry} 
              onChange={(e) => setAutoRetry(e.target.checked)} 
              class="w-6 h-6 rounded border-zinc-700 text-white focus:ring-0 bg-zinc-900 cursor-pointer"
            />
          </div>

          <div class="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="font-medium text-white text-sm">Live Status Polling Frequency</div>
              <div class="text-xs text-zinc-400">Controls how frequently the UI checks Redis for background publishing completion.</div>
            </div>
            <select 
              value={pollInterval} 
              onChange={(e) => setPollInterval(e.target.value)}
              class="apple-input text-xs py-2 w-full sm:w-44 bg-[#0a0a0e]"
            >
              <option value="1">Every 1 Second (Real-time)</option>
              <option value="3">Every 3 Seconds (Recommended)</option>
              <option value="5">Every 5 Seconds (Low Bandwidth)</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" class="apple-button-primary text-sm py-3 px-8">
            <Save size={16} class="mr-2" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
}
