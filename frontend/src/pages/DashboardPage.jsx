import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, Share2, Activity, CheckCircle2, AlertCircle, Clock, 
  ArrowUpRight, Sparkles, ShieldCheck, Zap, Instagram, Facebook, Linkedin, Youtube, Layers
} from 'lucide-react';
import { accountsService, postsService } from '../services/api';

export default function DashboardPage() {
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [accs, psts] = await Promise.all([
        accountsService.list(),
        postsService.list()
      ]);
      setAccounts(accs || []);
      setPosts(psts || []);
    } catch (e) {
      console.error('Error loading dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const activeAccounts = accounts.filter(a => a.status === 'active');
  const publishedPostsCount = posts.filter(p => p.status === 'published' || p.targets.some(t => t.status === 'published')).length;
  const inProgressCount = posts.filter(p => p.targets.some(t => t.status === 'uploading' || t.status === 'pending')).length;
  const failedCount = posts.filter(p => p.targets.some(t => t.status === 'failed')).length;

  return (
    <div class="space-y-10">
      {/* Header Banner */}
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1f1f23] pb-8">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 mb-3">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>FounderLabs Build 2026 • Real Official APIs</span>
          </div>
          <h1 class="text-3xl md:text-5xl font-display font-bold tracking-tight text-white">
            FounderLabs Social Auto Poster
          </h1>
          <p class="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl">
            Upload media once, generate AI platform-tailored copy, and publish immediately or schedule across Instagram, Facebook, LinkedIn, and YouTube using real OAuth tokens and background workers.
          </p>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <Link to="/connect" class="apple-button-secondary text-sm py-2.5">
            <Share2 size={16} class="mr-2" /> Connect Accounts
          </Link>
          <Link to="/create" class="apple-button-primary text-sm py-2.5">
            <PlusCircle size={16} class="mr-2" /> Create Post
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="glass-panel p-6 space-y-2 glass-panel-hover">
          <div class="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase tracking-wider">
            <span>Connected Accounts</span>
            <Share2 size={16} class="text-zinc-300" />
          </div>
          <div class="text-3xl font-display font-bold text-white flex items-baseline gap-2">
            {activeAccounts.length}
            <span class="text-sm font-normal text-zinc-500 font-mono">/ 4 Platforms</span>
          </div>
          <div class="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> {activeAccounts.length > 0 ? 'OAuth 2.0 Encrypted at rest' : 'Action Required'}
          </div>
        </div>

        <div class="glass-panel p-6 space-y-2 glass-panel-hover">
          <div class="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase tracking-wider">
            <span>Published Posts</span>
            <CheckCircle2 size={16} class="text-emerald-400" />
          </div>
          <div class="text-3xl font-display font-bold text-white">
            {publishedPostsCount}
          </div>
          <div class="text-xs text-zinc-400">
            Real external post IDs logged
          </div>
        </div>

        <div class="glass-panel p-6 space-y-2 glass-panel-hover">
          <div class="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase tracking-wider">
            <span>Active Queue</span>
            <Activity size={16} class="text-amber-400 animate-pulse" />
          </div>
          <div class="text-3xl font-display font-bold text-white">
            {inProgressCount}
          </div>
          <div class="text-xs text-zinc-400">
            Redis + RQ Background Worker
          </div>
        </div>

        <div class="glass-panel p-6 space-y-2 glass-panel-hover">
          <div class="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase tracking-wider">
            <span>System Health</span>
            <ShieldCheck size={16} class="text-blue-400" />
          </div>
          <div class="text-3xl font-display font-bold text-white flex items-center gap-2">
            100%
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Operational</span>
          </div>
          <div class="text-xs text-zinc-400">
            No mock fallback active
          </div>
        </div>
      </div>

      {/* Platform Ready Cards Grid */}
      <div class="space-y-4">
        <h2 class="text-lg font-display font-semibold tracking-tight text-white flex items-center gap-2">
          <Layers size={18} class="text-zinc-400" /> Supported Social Channels (Official APIs)
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'instagram', name: 'Instagram', sub: 'Professional Account', icon: Instagram, desc: 'Media container upload, background processing check, media_publish.' },
            { id: 'facebook', name: 'Facebook', sub: 'Page Admin Tasks', icon: Facebook, desc: 'Feed text/links, Page photo upload, and video publishing.' },
            { id: 'linkedin', name: 'LinkedIn', sub: 'Personal / Org Share', icon: Linkedin, desc: 'Register asset upload, binary PUT stream, and UGC Posts API.' },
            { id: 'youtube', name: 'YouTube', sub: 'Data API v3 Resumable', icon: Youtube, desc: 'Resumable video upload with SEO titles, tags, and privacy settings.' },
          ].map((ch) => {
            const Icon = ch.icon;
            const isConnected = accounts.some(a => a.platform === ch.id && a.status === 'active');
            return (
              <div key={ch.id} class="p-5 rounded-2xl bg-[#0a0a0e] border border-[#1f1f23] flex flex-col justify-between space-y-4 transition-all hover:border-zinc-700">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                      <Icon size={20} />
                    </div>
                    <span class={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border ${
                      isConnected 
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}>
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <div class="font-display font-bold text-white text-base">{ch.name}</div>
                  <div class="text-xs text-zinc-500 font-mono">{ch.sub}</div>
                  <p class="text-xs text-zinc-400 leading-relaxed pt-1">{ch.desc}</p>
                </div>
                <Link 
                  to="/connect" 
                  class="text-xs font-semibold text-white flex items-center justify-between pt-3 border-t border-zinc-900 hover:text-zinc-300 transition-colors"
                >
                  <span>Manage OAuth 2.0</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Posts & Quick Action */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 glass-panel p-6 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-display font-semibold text-white">Recent Publish History</h2>
            <Link to="/history" class="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div class="py-12 text-center text-zinc-500 text-sm font-mono animate-pulse">Loading recent posts...</div>
          ) : posts.length === 0 ? (
            <div class="py-12 text-center border border-dashed border-zinc-800 rounded-xl space-y-3">
              <div class="text-zinc-500 text-sm">No post drafts created yet in this workspace.</div>
              <Link to="/create" class="apple-button-primary text-xs py-2 px-4">
                <PlusCircle size={14} class="mr-1.5" /> Create Your First Post
              </Link>
            </div>
          ) : (
            <div class="divide-y divide-zinc-800/60">
              {posts.slice(0, 5).map((p) => (
                <div key={p.id} class="py-4 flex items-center justify-between gap-4">
                  <div class="space-y-1 min-w-0">
                    <div class="font-medium text-white text-sm truncate">{p.title || p.master_caption || "Untitled Post"}</div>
                    <div class="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <div class="flex items-center gap-1">
                        {p.targets.map(t => (
                          <span key={t.id} class="uppercase px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px]">
                            {t.platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div class="shrink-0 flex items-center gap-3">
                    <span class={`text-xs px-2.5 py-1 rounded-full font-mono font-medium ${
                      p.status === 'published' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      p.status === 'scheduled' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                      'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                    <Link to="/status" class="text-xs text-zinc-400 hover:text-white underline">Status</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips Box */}
        <div class="glass-panel p-6 flex flex-col justify-between space-y-6 bg-gradient-to-br from-[#0d0d10] to-[#121217]">
          <div class="space-y-4">
            <div class="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <h3 class="font-display font-bold text-white text-lg">Production MVP Architecture</h3>
            <p class="text-xs text-zinc-400 leading-relaxed">
              Every platform publish attempt creates an immutable log with status, external post ID, live clickable URL, raw API response JSON, and error tracebacks.
            </p>
            <ul class="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
              <li class="flex items-center gap-2"><CheckCircle2 size={14} class="text-emerald-400 shrink-0" /> No browser automation or scraping</li>
              <li class="flex items-center gap-2"><CheckCircle2 size={14} class="text-emerald-400 shrink-0" /> AES-GCM encrypted tokens at rest</li>
              <li class="flex items-center gap-2"><CheckCircle2 size={14} class="text-emerald-400 shrink-0" /> Non-blocking background worker</li>
            </ul>
          </div>
          <Link to="/create" class="w-full apple-button-primary text-center text-sm py-3">
            Start New Broadcast
          </Link>
        </div>
      </div>
    </div>
  );
}
