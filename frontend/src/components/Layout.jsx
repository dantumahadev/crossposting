import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Share2, PlusCircle, Activity, History, Settings, 
  Sparkles, ShieldCheck, ExternalLink, Menu, X, ChevronRight, User, Layers, Zap
} from 'lucide-react';
import { accountsService } from '../services/api';

export default function Layout() {
  const [accounts, setAccounts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchAccounts();
  }, [location.pathname]);

  const fetchAccounts = async () => {
    try {
      const data = await accountsService.list();
      setAccounts(data || []);
    } catch (e) {
      console.error('Failed to fetch accounts:', e);
    }
  };

  const navItems = [
    { name: 'Studio Overview', path: '/', icon: LayoutDashboard },
    { name: 'Social Channels', path: '/connect', icon: Share2, badge: accounts.length },
    { name: 'New Broadcast', path: '/create', icon: PlusCircle, highlight: true },
    { name: 'Live Monitor', path: '/status', icon: Activity },
    { name: 'Publish History', path: '/history', icon: History },
    { name: 'Studio Settings', path: '/settings', icon: Settings },
  ];

  const activeAccountsCount = accounts.filter(a => a.status === 'active').length;

  return (
    <div class="min-h-screen flex flex-col md:flex-row bg-[#0a0b10] text-[#f8fafc]">
      {/* Mobile Top Nav */}
      <div class="md:hidden flex items-center justify-between px-6 py-4 border-b border-[#232538] bg-[#13141f]/95 backdrop-blur-md sticky top-0 z-50">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-black font-brand font-black text-lg tracking-tighter shadow-lg shadow-amber-500/20">
            A
          </div>
          <span class="font-display font-bold tracking-tight text-lg text-white">Artisanly</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          class="p-2 rounded-xl bg-[#1a1c2e] border border-[#232538] text-white"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside class={`w-full md:w-72 bg-[#0e0f18] border-r border-[#232538] flex flex-col justify-between p-6 fixed md:sticky top-0 h-screen z-40 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          {/* Logo Brand */}
          <div class="hidden md:flex items-center gap-3.5 mb-8 px-2">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-black font-brand font-black text-2xl tracking-tighter shadow-xl shadow-amber-500/20 shrink-0">
              A
            </div>
            <div>
              <div class="font-display font-bold tracking-tight text-xl leading-tight text-white flex items-center gap-1.5">
                <span>Artisanly</span>
                <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">PRO</span>
              </div>
              <div class="text-xs text-slate-400 flex items-center gap-1.5 font-mono mt-0.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Cross-Posting Studio</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav class="space-y-2">
            <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 mb-3 font-bold">Navigation</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  class={({ isActive }) => `
                    flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border-l-4 border-amber-500 text-white font-bold shadow-md' 
                      : item.highlight
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-black font-bold shadow-lg shadow-amber-500/20 hover:brightness-110'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <div class="flex items-center gap-3">
                    <Icon size={18} class="shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span class={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${item.badge > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Workspace Status & Admin Box */}
        <div class="pt-6 border-t border-[#232538] space-y-4">
          <div class="p-4 rounded-2xl bg-[#13141f] border border-[#232538] space-y-2.5">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-400 flex items-center gap-1.5">
                <Layers size={13} class="text-amber-400" /> Channels
              </span>
              <span class="text-amber-400 font-bold">{activeAccountsCount} / 4 Connected</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (activeAccountsCount / 4) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div class="flex items-center gap-3 px-2 py-1">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0 shadow">
              <User size={15} />
            </div>
            <div class="text-xs min-w-0">
              <div class="font-bold text-white truncate">Artisanly Studio</div>
              <div class="text-slate-400 truncate max-w-[150px]">studio@artisanly.io</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main class="flex-1 min-w-0 overflow-y-auto p-6 md:p-10 lg:p-12 max-w-7xl mx-auto w-full">
        <div class="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
