import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Share2, PlusCircle, Activity, CheckCircle2, AlertCircle, ArrowUpRight, 
  Sparkles, Clock, RefreshCw, Send, Layers, Zap, Flame, Award
} from 'lucide-react';
import { accountsService, postsService } from '../services/api';

export default function DashboardPage() {
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [accs, pts] = await Promise.all([
        accountsService.list(),
        postsService.list(0, 5)
      ]);
      setAccounts(accs || []);
      setPosts(pts || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const activeAccounts = accounts.filter(a => a.status === 'active');
  const publishedPosts = posts.filter(p => p.status === 'published' || p.status === 'partially_published');

  return (
    <div class="space-y-10">
      {/* Top Welcome Hero */}
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#13141f] via-[#1b1929] to-[#13141f] border border-[#232538] p-8 md:p-10 shadow-2xl">
        <div class="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-500/10 via-orange-500/10 to-rose-500/10 blur-3xl pointer-events-none"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-3 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-gradient text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles size={14} class="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Artisanly Cross-Posting Studio</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
              Create once. <span class="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Broadcast everywhere.</span>
            </h1>
            <p class="text-slate-300 text-base md:text-lg font-normal leading-relaxed">
              Upload media once, generate AI platform-tailored copy, and publish instantly across Instagram, Facebook, LinkedIn, and YouTube using 100% real official APIs.
            </p>
          </div>
          <div class="flex items-center gap-4 shrink-0">
            <Link to="/create" class="artisan-button-primary shadow-xl shadow-amber-500/20 text-base py-3.5 px-7">
              <PlusCircle size={20} class="mr-2" /> New Broadcast
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-panel p-6 space-y-4 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Connected Channels</span>
            <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Share2 size={20} />
            </div>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-4xl font-display font-extrabold text-white tracking-tight">{activeAccounts.length}</span>
            <span class="text-xs text-amber-400 font-mono flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active APIs
            </span>
          </div>
          <div class="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-[#232538]">
            <span>Meta, LinkedIn, YouTube</span>
            <Link to="/connect" class="text-amber-400 hover:underline flex items-center gap-0.5 font-bold">
              Manage <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        <div class="glass-panel p-6 space-y-4 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Total Broadcasts</span>
            <div class="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Send size={20} />
            </div>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-4xl font-display font-extrabold text-white tracking-tight">{posts.length}</span>
            <span class="text-xs text-slate-400 font-mono">lifetime drafts</span>
          </div>
          <div class="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-[#232538]">
            <span>Recent automation jobs</span>
            <Link to="/history" class="text-rose-400 hover:underline flex items-center gap-0.5 font-bold">
              History <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        <div class="glass-panel p-6 space-y-4 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Worker Engine Status</span>
            <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity size={20} />
            </div>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-2xl font-display font-extrabold text-emerald-400 tracking-tight flex items-center gap-2">
              <Zap size={22} class="fill-emerald-400" /> Operational
            </span>
          </div>
          <div class="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-[#232538]">
            <span>Redis Async Queue</span>
            <Link to="/status" class="text-emerald-400 hover:underline flex items-center gap-0.5 font-bold">
              Live Monitor <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Section Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connected Channels Overview */}
        <div class="lg:col-span-2 glass-panel p-8 space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                <Layers size={20} class="text-amber-400" /> Active OAuth Channels
              </h2>
              <p class="text-xs text-slate-400 mt-1">Real developer OAuth connections ready for multi-network broadcasting</p>
            </div>
            <Link to="/connect" class="text-xs text-amber-400 hover:underline font-bold font-mono">View All &rarr;</Link>
          </div>

          {loading ? (
            <div class="py-12 flex justify-center text-slate-500 text-sm font-mono animate-pulse">Loading connected channels...</div>
          ) : activeAccounts.length === 0 ? (
            <div class="p-8 rounded-2xl bg-[#0d0e17] border border-dashed border-[#232538] text-center space-y-4">
              <div class="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div class="space-y-1">
                <h3 class="font-display font-bold text-white text-base">No Social Channels Connected Yet</h3>
                <p class="text-slate-400 text-xs max-w-sm mx-auto">Connect your official Meta, LinkedIn, and YouTube developer accounts to start automated posting.</p>
              </div>
              <Link to="/connect" class="artisan-button-primary text-xs py-2.5 px-5">
                Connect Channels Now
              </Link>
            </div>
          ) : (
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAccounts.map((acc) => (
                <div key={acc.id} class="p-4 rounded-2xl bg-[#0d0e17] border border-[#232538] flex items-center justify-between hover:border-amber-500/40 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-[#1a1c2e] border border-[#232538] flex items-center justify-center text-sm font-bold uppercase text-amber-400">
                      {acc.platform[0]}
                    </div>
                    <div>
                      <div class="font-bold text-white text-sm capitalize">{acc.platform}</div>
                      <div class="text-xs text-slate-400 truncate max-w-[140px]">{acc.account_name}</div>
                    </div>
                  </div>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Studio Quick Actions */}
        <div class="glass-panel p-8 space-y-6">
          <h2 class="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <Flame size={20} class="text-rose-400" /> Artisan Studio
          </h2>
          <div class="space-y-3">
            <Link to="/create" class="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 hover:border-amber-500/60 flex items-center justify-between group transition-all">
              <div class="space-y-1">
                <div class="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">Launch New Broadcast</div>
                <div class="text-xs text-slate-400">Upload media & generate AI copy</div>
              </div>
              <PlusCircle size={20} class="text-amber-400 group-hover:scale-110 transition-transform" />
            </Link>

            <Link to="/status" class="w-full p-4 rounded-2xl bg-[#0d0e17] border border-[#232538] hover:border-[#3b3f5c] flex items-center justify-between group transition-all">
              <div class="space-y-1">
                <div class="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">Monitor Live Worker</div>
                <div class="text-xs text-slate-400">Watch real-time background queues</div>
              </div>
              <Activity size={20} class="text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </Link>

            <Link to="/connect" class="w-full p-4 rounded-2xl bg-[#0d0e17] border border-[#232538] hover:border-[#3b3f5c] flex items-center justify-between group transition-all">
              <div class="space-y-1">
                <div class="font-bold text-white text-sm group-hover:text-rose-400 transition-colors">OAuth Security Panel</div>
                <div class="text-xs text-slate-400">256-bit AES-GCM token encryption</div>
              </div>
              <Share2 size={20} class="text-slate-400 group-hover:text-rose-400 transition-colors" />
            </Link>
          </div>

          <div class="pt-4 border-t border-[#232538]">
            <div class="p-4 rounded-xl bg-[#0d0e17] border border-[#232538] text-xs text-slate-400 space-y-2 font-mono">
              <div class="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} /> Artisan Guarantee
              </div>
              <p>No browser automation or scraping. 100% official Meta, LinkedIn & Google API compliance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div class="glass-panel p-8 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-display font-bold text-white tracking-tight">Recent Broadcast Activity</h2>
            <p class="text-xs text-slate-400 mt-1">Latest automated multi-channel posts and schedule queues</p>
          </div>
          <Link to="/history" class="text-xs text-amber-400 hover:underline font-bold font-mono">View Complete Log &rarr;</Link>
        </div>

        {loading ? (
          <div class="py-8 text-center text-slate-500 text-xs font-mono animate-pulse">Loading recent activity...</div>
        ) : posts.length === 0 ? (
          <div class="py-12 text-center space-y-3 border border-dashed border-[#232538] rounded-2xl">
            <Clock size={24} class="text-slate-600 mx-auto" />
            <div class="text-sm font-bold text-slate-400">No broadcasts recorded yet</div>
            <p class="text-xs text-slate-500">Create your first multi-network post to see real-time verification proof logs here.</p>
          </div>
        ) : (
          <div class="divide-y divide-[#232538]">
            {posts.slice(0, 5).map((p) => (
              <div key={p.id} class="py-4 flex items-center justify-between gap-4">
                <div class="space-y-1 min-w-0">
                  <div class="font-bold text-white text-sm truncate">{p.title || p.master_caption || "Untitled Broadcast"}</div>
                  <div class="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span class="capitalize text-amber-400/80">{p.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <Link to={`/status?job=${p.job_id || ''}`} class="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-[#1a1c2e] border border-[#232538] text-slate-300 hover:text-white hover:border-amber-500/40 transition-all">
                  Inspect &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
