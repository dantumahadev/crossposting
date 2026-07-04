import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Share2, PlusCircle, Activity, History, Settings, 
  Sparkles, ShieldCheck, ExternalLink, Menu, X, ChevronRight, User
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
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Connect Accounts', path: '/connect', icon: Share2, badge: accounts.length },
    { name: 'Create Post', path: '/create', icon: PlusCircle, highlight: true },
    { name: 'Live Status', path: '/status', icon: Activity },
    { name: 'Post History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const activeAccountsCount = accounts.filter(a => a.status === 'active').length;

  return (
    <div class="min-h-screen flex flex-col md:flex-row bg-[#050507] text-[#f4f4f5]">
      {/* Mobile Top Nav */}
      <div class="md:hidden flex items-center justify-between px-6 py-4 border-b border-[#1f1f23] bg-[#0a0a0d]/90 backdrop-blur-md sticky top-0 z-50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold text-lg tracking-tighter">
            FL
          </div>
          <span class="font-display font-bold tracking-tight text-lg">FounderLabs</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          class="p-2 rounded-lg bg-[#17171b] border border-[#27272a] text-white"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside class={`w-full md:w-72 bg-[#09090c] border-r border-[#1f1f23] flex flex-col justify-between p-6 fixed md:sticky top-0 h-screen z-40 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          {/* Logo Brand */}
          <div class="hidden md:flex items-center gap-3.5 mb-8 px-2">
            <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black font-extrabold text-xl tracking-tighter shadow-lg shadow-white/10">
              FL
            </div>
            <div>
              <div class="font-display font-bold tracking-tight text-lg leading-tight text-white">FounderLabs</div>
              <div class="text-xs text-zinc-400 flex items-center gap-1 font-mono mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Real APIs v1.0</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav class="space-y-1.5">
            <div class="text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-3 mb-2 font-semibold">Menu</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  class={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-black font-semibold shadow-md shadow-white/10' 
                      : item.highlight
                        ? 'bg-zinc-900/80 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <div class="flex items-center gap-3">
                    <Icon size={18} class="shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span class={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${item.badge > 0 ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-900 text-zinc-600'}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Workspace Status & Admin Box */}
        <div class="pt-6 border-t border-[#1f1f23] space-y-4">
          <div class="p-3.5 rounded-xl bg-[#0d0d11] border border-[#1f1f23] space-y-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-zinc-400">Connected Accounts</span>
              <span class="text-emerald-400 font-bold">{activeAccountsCount} / 4 Active</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                class="h-full bg-white transition-all duration-500"
                style={{ width: `${Math.min(100, (activeAccountsCount / 4) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div class="flex items-center gap-3 px-2 py-1">
            <div class="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white">
              <User size={14} />
            </div>
            <div class="text-xs">
              <div class="font-semibold text-white">FounderLabs Admin</div>
              <div class="text-zinc-500 truncate max-w-[150px]">admin@founderlabs.com</div>
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
