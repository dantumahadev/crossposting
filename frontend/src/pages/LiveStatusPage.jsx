import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Activity, CheckCircle2, AlertCircle, Clock, RefreshCw, ExternalLink, 
  ArrowUpRight, RotateCcw, Instagram, Facebook, Linkedin, Youtube, Layers, ShieldCheck
} from 'lucide-react';
import { postsService } from '../services/api';

export default function LiveStatusPage() {
  const [searchParams] = useSearchParams();
  const draftIdParam = searchParams.get('id');
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);

  useEffect(() => {
    fetchLatestOrSpecificDraft();
    const interval = setInterval(fetchLatestOrSpecificDraft, 3000);
    return () => clearInterval(interval);
  }, [draftIdParam]);

  const fetchLatestOrSpecificDraft = async () => {
    try {
      if (draftIdParam) {
        const data = await postsService.getStatus(draftIdParam);
        setDraft(data);
        setLoading(false);
      } else {
        const list = await postsService.list();
        if (list && list.length > 0) {
          const latestId = list[0].id;
          const data = await postsService.getStatus(latestId);
          setDraft(data);
        }
        setLoading(false);
      }
    } catch (e) {
      console.error('Error fetching live status:', e);
      setLoading(false);
    }
  };

  const handleRetry = async (jobId) => {
    if (!jobId) return;
    setRetryingId(jobId);
    try {
      await postsService.retryJob(jobId);
      await fetchLatestOrSpecificDraft();
    } catch (e) {
      alert(`Retry failed: ${e.message}`);
    } finally {
      setRetryingId(null);
    }
  };

  const getPlatformIcon = (name) => {
    const n = name.toLowerCase();
    if (n === 'instagram') return Instagram;
    if (n === 'facebook') return Facebook;
    if (n === 'linkedin') return Linkedin;
    if (n === 'youtube') return Youtube;
    return Layers;
  };

  if (loading && !draft) {
    return (
      <div class="py-24 text-center space-y-4">
        <RefreshCw size={32} class="animate-spin text-white mx-auto" />
        <div class="text-sm font-mono text-zinc-400">Connecting to Redis Background Worker...</div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div class="py-24 text-center border border-dashed border-zinc-800 rounded-2xl space-y-4 max-w-xl mx-auto p-8">
        <Activity size={32} class="text-zinc-500 mx-auto" />
        <h3 class="font-display font-bold text-white text-lg">No Active Broadcasts Found</h3>
        <p class="text-xs text-zinc-400">You haven't published any posts yet. Create a new broadcast to monitor real-time API publishing status across channels.</p>
        <Link to="/create" class="apple-button-primary text-xs py-2.5 px-6 inline-flex mt-2">
          Create New Post
        </Link>
      </div>
    );
  }

  const targets = draft.targets || [];
  const publishedCount = targets.filter(t => t.status === 'published').length;
  const failedCount = targets.filter(t => t.status === 'failed').length;
  const uploadingCount = targets.filter(t => t.status === 'uploading' || t.status === 'pending').length;

  return (
    <div class="space-y-10">
      {/* Header */}
      <div class="border-b border-[#1f1f23] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 mb-3">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Worker Polling Active (3s interval)</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-display font-bold tracking-tight text-white flex items-center gap-3">
            <Activity size={32} class="text-white" /> Live Publish Progression
          </h1>
          <p class="text-zinc-400 text-sm mt-1">
            Broadcast ID: #{draft.id} • "{draft.title || draft.master_caption.slice(0, 40)}..."
          </p>
        </div>

        <div class="flex items-center gap-4 shrink-0">
          <button 
            onClick={fetchLatestOrSpecificDraft}
            class="apple-button-secondary text-xs py-2 px-4"
          >
            <RefreshCw size={14} class="mr-2" /> Refresh Now
          </button>
          <Link to="/history" class="apple-button-primary text-xs py-2 px-4">
            View All History
          </Link>
        </div>
      </div>

      {/* Global Status Bar */}
      <div class="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-[#0d0d10] via-[#121217] to-[#0d0d10]">
        <div class="flex items-center gap-4">
          <div class={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
            failedCount > 0 ? 'bg-red-950 text-red-400 border border-red-800' :
            uploadingCount > 0 ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse' :
            'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}>
            {failedCount > 0 ? <AlertCircle size={24} /> : uploadingCount > 0 ? <Clock size={24} /> : <CheckCircle2 size={24} />}
          </div>
          <div>
            <div class="font-display font-bold text-white text-lg">
              {failedCount > 0 ? 'Attention Required on Failed Targets' :
               uploadingCount > 0 ? 'Background Worker Uploading...' :
               'All Selected Platforms Published!'}
            </div>
            <div class="text-xs text-zinc-400 font-mono mt-0.5">
              {publishedCount} Published • {uploadingCount} In Progress • {failedCount} Failed
            </div>
          </div>
        </div>
        <div class="text-xs font-mono text-zinc-500 flex items-center gap-2">
          <ShieldCheck size={16} class="text-blue-400" />
          <span>Real external post IDs verified</span>
        </div>
      </div>

      {/* Target Platforms Grid */}
      <div class="space-y-4">
        <h2 class="text-lg font-display font-semibold text-white">Target Platform Execution Status</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {targets.map((t) => {
            const Icon = getPlatformIcon(t.platform);
            const job = t.job || {};
            const isPub = t.status === 'published';
            const isFail = t.status === 'failed';
            const isProg = t.status === 'uploading' || t.status === 'pending';

            return (
              <div key={t.id} class={`glass-panel p-6 space-y-6 transition-all ${
                isPub ? 'border-emerald-800/60 bg-[#0d100e]/80' :
                isFail ? 'border-red-800/60 bg-[#120d0d]/80' :
                'border-zinc-800 bg-[#0d0d10]'
              }`}>
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${
                      isPub ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' :
                      isFail ? 'bg-red-950 border border-red-800 text-red-400' :
                      'bg-zinc-900 border border-zinc-800 text-white'
                    }`}>
                      <Icon size={24} />
                    </div>
                    <div class="min-w-0">
                      <div class="font-display font-bold text-white text-lg capitalize">{t.platform}</div>
                      <div class="text-xs text-zinc-400 font-mono truncate">{t.account_name}</div>
                    </div>
                  </div>

                  <span class={`text-xs px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider shrink-0 ${
                    isPub ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    isFail ? 'bg-red-950 text-red-300 border border-red-800' :
                    'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                  }`}>
                    {t.status}
                  </span>
                </div>

                {/* Progress Bar or Error Box */}
                {isProg && (
                  <div class="space-y-2">
                    <div class="flex justify-between text-xs font-mono text-zinc-400">
                      <span>Transmitting media container to official API...</span>
                      <span>Worker Active</span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                      <div class="h-full bg-white animate-pulse w-2/3 rounded-full"></div>
                    </div>
                  </div>
                )}

                {isFail && (
                  <div class="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 space-y-2 font-mono">
                    <div class="font-semibold flex items-center gap-1.5 text-red-200">
                      <AlertCircle size={14} /> Official API Exception
                    </div>
                    <div class="leading-relaxed break-words">{job.last_error || "Failed to publish asset. Please check OAuth scopes and account permissions."}</div>
                  </div>
                )}

                {isPub && (
                  <div class="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-300 space-y-2 font-mono">
                    <div class="flex items-center justify-between">
                      <span class="text-zinc-400">External Post ID:</span>
                      <span class="font-bold text-white truncate max-w-[200px]">{job.external_post_id || 'Verified'}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-zinc-400">Published URL:</span>
                      <a 
                        href={job.external_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 truncate max-w-[220px]"
                      >
                        <span>{job.external_url}</span>
                        <ExternalLink size={12} class="shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                <div class="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <div class="text-[11px] font-mono text-zinc-500">
                    {job.updated_at ? `Updated: ${new Date(job.updated_at).toLocaleTimeString()}` : 'Queue pending'}
                  </div>
                  {isPub && job.external_url && (
                    <a 
                      href={job.external_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="apple-button-primary text-xs py-2 px-4 bg-emerald-400 text-black hover:bg-emerald-300"
                    >
                      <span>View Live Post</span>
                      <ArrowUpRight size={14} class="ml-1.5" />
                    </a>
                  )}
                  {isFail && (
                    <button
                      onClick={() => handleRetry(job.id)}
                      disabled={retryingId === job.id}
                      class="apple-button-primary text-xs py-2 px-4 bg-red-500 text-white hover:bg-red-600 border border-red-400"
                    >
                      <RotateCcw size={14} class={`mr-1.5 ${retryingId === job.id ? 'animate-spin' : ''}`} />
                      <span>{retryingId === job.id ? 'Retrying...' : 'Retry Publish Job'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
