import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Share2, CheckCircle2, AlertCircle, RefreshCw, Unlink, Shield, 
  ExternalLink, Key, Lock, Instagram, Facebook, Linkedin, Youtube, ArrowRight, Sparkles
} from 'lucide-react';
import { accountsService } from '../services/api';

export default function ConnectAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadAccounts();
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    if (success) {
      setNotification({ type: 'success', text: `Successfully connected ${success.toUpperCase()} account via OAuth 2.0!` });
    } else if (error) {
      setNotification({ type: 'error', text: `OAuth Error: ${error}` });
    }
  }, [searchParams]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountsService.list();
      setAccounts(data || []);
    } catch (e) {
      console.error('Error fetching accounts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform, simulate = false) => {
    try {
      const res = await accountsService.startOAuth(platform, simulate);
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (e) {
      alert(`Failed to start OAuth flow: ${e.message}`);
    }
  };

  const handleDisconnect = async (id, platformName) => {
    if (window.confirm(`Are you sure you want to revoke and disconnect ${platformName}?`)) {
      try {
        await accountsService.disconnect(id);
        await loadAccounts();
        setNotification({ type: 'success', text: `Revoked token and disconnected ${platformName}.` });
      } catch (e) {
        alert('Failed to disconnect account.');
      }
    }
  };

  const platforms = [
    {
      id: 'meta',
      name: 'Meta (Facebook + Instagram)',
      icon: Facebook,
      description: 'Connect your Facebook Page and linked Instagram Professional account for feed, photo, and Reels publishing.',
      scopes: 'pages_show_list, pages_read_engagement, pages_manage_posts, instagram_content_publish',
      badgeText: 'Official Graph API v19.0',
      keys: ['facebook', 'instagram']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Share & UGC',
      icon: Linkedin,
      description: 'Connect your LinkedIn Member Profile or Company Page for professional commentary, article links, and media uploads.',
      scopes: 'w_member_social, r_liteprofile',
      badgeText: 'REST API v2.0.0',
      keys: ['linkedin']
    },
    {
      id: 'google',
      name: 'YouTube Data API v3',
      icon: Youtube,
      description: 'Connect your YouTube Studio channel for resumable video uploads with custom titles, descriptions, tags, and privacy controls.',
      scopes: 'youtube.upload, userinfo.profile',
      badgeText: 'Resumable Upload Flow',
      keys: ['youtube']
    }
  ];

  return (
    <div class="space-y-10">
      {/* Header */}
      <div class="border-b border-[#232538] pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-gradient text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} class="text-amber-400" /> Official Developer OAuth
          </div>
          <h1 class="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white flex items-center gap-3">
            <Share2 size={32} class="text-amber-400" /> Social Account Channels
          </h1>
          <p class="text-slate-300 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Connect your official social media profiles via secure OAuth 2.0. All access tokens and refresh tokens are encrypted at rest using AES-GCM 256-bit encryption.
          </p>
        </div>
        <button 
          onClick={loadAccounts} 
          class="artisan-button-secondary self-start md:self-auto text-xs py-2.5 px-4"
        >
          <RefreshCw size={14} class={`mr-2 ${loading ? 'animate-spin text-amber-400' : ''}`} /> Sync Status
        </button>
      </div>

      {notification && (
        <div class={`p-4 rounded-2xl border flex items-center justify-between text-sm shadow-lg ${
          notification.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border-rose-800 text-rose-300'
        }`}>
          <div class="flex items-center gap-3 font-medium">
            {notification.type === 'success' ? <CheckCircle2 size={18} class="text-emerald-400" /> : <AlertCircle size={18} class="text-rose-400" />}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} class="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Security Banner */}
      <div class="p-6 rounded-2xl bg-gradient-to-r from-[#13141f] via-[#1a1728] to-[#13141f] border border-[#232538] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 shadow">
            <Lock size={22} />
          </div>
          <div>
            <div class="font-display font-bold text-white text-base">Enterprise Token Security</div>
            <div class="text-xs text-slate-300 mt-0.5 max-w-2xl">
              No user passwords or browser sessions are ever stored or scraped. Tokens are rotated and encrypted via AES-GCM.
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 font-mono text-xs text-amber-400/90 shrink-0 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
          <Shield size={14} class="text-emerald-400" />
          <span>OAuth 2.0 Verified</span>
        </div>
      </div>

      {/* Platform Cards */}
      <div class="space-y-6">
        {platforms.map((plat) => {
          const Icon = plat.icon;
          const connectedForPlat = accounts.filter(a => plat.keys.includes(a.platform) && a.status === 'active');
          const isConnected = connectedForPlat.length > 0;

          return (
            <div key={plat.id} class="glass-panel p-6 md:p-8 space-y-6 glass-panel-hover group">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div class="flex items-start gap-5 min-w-0">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-black flex items-center justify-center font-bold text-2xl shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                    <Icon size={28} />
                  </div>
                  <div class="space-y-1.5 min-w-0">
                    <div class="flex items-center gap-3 flex-wrap">
                      <h3 class="font-display font-bold text-white text-xl">{plat.name}</h3>
                      <span class="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#1a1c2e] text-amber-400 border border-amber-500/30">
                        {plat.badgeText}
                      </span>
                    </div>
                    <p class="text-sm text-slate-300 leading-relaxed max-w-2xl">{plat.description}</p>
                    <div class="text-xs text-slate-400 font-mono pt-1">
                      <span class="text-amber-400 font-semibold">Scopes:</span> {plat.scopes}
                    </div>
                  </div>
                </div>

                <div class="shrink-0 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleConnect(plat.id, false)}
                    class="w-full sm:w-auto artisan-button-primary text-sm py-3 px-6 shadow-md shadow-amber-500/10"
                  >
                    <span>{isConnected ? 'Reconnect OAuth' : 'Connect Official OAuth'}</span>
                    <ArrowRight size={16} class="ml-2" />
                  </button>
                  <button
                    onClick={() => handleConnect(plat.id, true)}
                    class="w-full sm:w-auto artisan-button-secondary text-xs py-3 px-4 text-slate-300 hover:text-white"
                    title="Use developer simulation mode if your App Secret isn't configured in .env yet"
                  >
                    <span>Simulate Dev Token</span>
                  </button>
                </div>
              </div>

              {/* Connected Account Details Sub-box */}
              {isConnected && (
                <div class="pt-6 border-t border-[#232538] space-y-3">
                  <div class="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                    <CheckCircle2 size={14} class="text-emerald-400" /> Active Connected Channels
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {connectedForPlat.map((acc) => (
                      <div key={acc.id} class="p-4 rounded-xl bg-[#0d0e17] border border-[#232538] flex items-center justify-between gap-3 hover:border-amber-500/30 transition-colors">
                        <div class="flex items-center gap-3 min-w-0">
                          <div class="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                            <CheckCircle2 size={16} />
                          </div>
                          <div class="min-w-0">
                            <div class="font-bold text-white text-sm truncate">{acc.account_name}</div>
                            <div class="text-[11px] text-slate-400 font-mono truncate">ID: {acc.external_account_id}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDisconnect(acc.id, acc.account_name)}
                          class="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
                          title="Revoke Token & Disconnect"
                        >
                          <Unlink size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
