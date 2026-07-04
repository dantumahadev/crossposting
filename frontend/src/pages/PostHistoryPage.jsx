import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, Filter, RefreshCw, ExternalLink, Code2, CheckCircle2, 
  AlertCircle, Clock, RotateCcw, X, Search, Instagram, Facebook, Linkedin, Youtube
} from 'lucide-react';
import { postsService } from '../services/api';

export default function PostHistoryPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedDebugTarget, setSelectedDebugTarget] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [filterPlatform, filterStatus]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await postsService.list({
        platform: filterPlatform || undefined,
        status: filterStatus || undefined
      });
      setPosts(data || []);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryJob = async (t) => {
    // find job id from target summary or call status
    try {
      setRetryingId(t.id);
      // We can trigger retry via post target status or requeue
      await postsService.retryJob(t.id);
      await loadHistory();
      alert('Requeued job for retry.');
    } catch (e) {
      alert(`Retry failed: ${e.message}`);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div class="space-y-10">
      {/* Header */}
      <div class="border-b border-[#1f1f23] pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-display font-bold tracking-tight text-white flex items-center gap-3">
            <History size={32} class="text-white" /> Broadcast History & Audit Logs
          </h1>
          <p class="text-zinc-400 text-sm mt-1">Review past automated broadcasts, filter by platform or status, and inspect raw API JSON proof logs.</p>
        </div>
        <button onClick={loadHistory} class="apple-button-secondary text-xs py-2.5 px-4 shrink-0">
          <RefreshCw size={14} class="mr-2" /> Refresh Logs
        </button>
      </div>

      {/* Filters Bar */}
      <div class="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Filter size={16} />
          <span>Filter Audit Records:</span>
        </div>
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={filterPlatform} 
            onChange={(e) => setFilterPlatform(e.target.value)}
            class="apple-input text-xs py-2 w-full sm:w-44 bg-[#0a0a0e]"
          >
            <option value="">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            class="apple-input text-xs py-2 w-full sm:w-44 bg-[#0a0a0e]"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="uploading">Uploading / Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div class="glass-panel overflow-hidden">
        {loading ? (
          <div class="py-16 text-center text-zinc-500 font-mono animate-pulse">Loading broadcast logs...</div>
        ) : posts.length === 0 ? (
          <div class="py-16 text-center space-y-3">
            <div class="text-zinc-500 text-sm">No broadcast history matching your filter criteria.</div>
            <Link to="/create" class="apple-button-primary text-xs py-2 px-4 inline-flex">Create New Broadcast</Link>
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-zinc-800/80 bg-[#0a0a0e]/60 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  <th class="py-4 px-6">Broadcast Subject</th>
                  <th class="py-4 px-6">Date & Time</th>
                  <th class="py-4 px-6">Global Status</th>
                  <th class="py-4 px-6">Platform Targets & Proof</th>
                  <th class="py-4 px-6 text-right">Admin Inspector</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800/40 text-sm">
                {posts.map((p) => {
                  const isPub = p.status === 'published';
                  const isFail = p.targets.some(t => t.status === 'failed');
                  return (
                    <tr key={p.id} class="hover:bg-white/[0.02] transition-colors">
                      <td class="py-4 px-6 font-medium text-white max-w-xs truncate">
                        {p.title || p.master_caption.split('\n')[0] || `Broadcast #${p.id}`}
                      </td>
                      <td class="py-4 px-6 text-zinc-400 font-mono text-xs whitespace-nowrap">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                      <td class="py-4 px-6">
                        <span class={`text-[11px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider ${
                          isPub ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          isFail ? 'bg-red-950 text-red-300 border border-red-800' :
                          'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td class="py-4 px-6">
                        <div class="flex flex-wrap items-center gap-2">
                          {p.targets.map((t) => (
                            <div key={t.id} class="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-xs font-mono">
                              <span class={`w-1.5 h-1.5 rounded-full ${
                                t.status === 'published' ? 'bg-emerald-400' :
                                t.status === 'failed' ? 'bg-red-400' : 'bg-amber-400'
                              }`}></span>
                              <span class="capitalize text-zinc-300">{t.platform}</span>
                              {t.external_url && (
                                <a href={t.external_url} target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 ml-1">
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td class="py-4 px-6 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <Link to={`/status?id=${p.id}`} class="apple-button-secondary text-xs py-1.5 px-3">
                            Live Status
                          </Link>
                          <button
                            onClick={() => setSelectedDebugTarget({ broadcast: p, targets: p.targets })}
                            class="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                            title="Inspect Raw API Response JSON Logs"
                          >
                            <Code2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Debug Inspector Modal */}
      {selectedDebugTarget && (
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="glass-panel p-6 sm:p-8 max-w-3xl w-full max-h-[85vh] flex flex-col space-y-6 animate-slide-up border border-zinc-700">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-white/10 text-white"><Code2 size={20} /></div>
                <div>
                  <h3 class="font-display font-bold text-white text-lg">Admin Raw API Debug Inspector</h3>
                  <div class="text-xs text-zinc-400 font-mono">Broadcast #{selectedDebugTarget.broadcast.id} • Immutable Audit Proof</div>
                </div>
              </div>
              <button onClick={() => setSelectedDebugTarget(null)} class="p-2 text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>

            <div class="flex-1 overflow-y-auto space-y-6 pr-2 font-mono text-xs">
              {selectedDebugTarget.targets.map((t) => (
                <div key={t.id} class="p-4 rounded-xl bg-[#0a0a0e] border border-zinc-800 space-y-3">
                  <div class="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span class="font-bold text-white uppercase text-sm">{t.platform} Target #{t.id}</span>
                    <span class={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
                      t.status === 'published' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      t.status === 'failed' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-zinc-900 text-zinc-400'
                    }`}>{t.status}</span>
                  </div>

                  {t.error && (
                    <div class="text-red-400 bg-red-950/30 p-3 rounded border border-red-900/50">
                      <strong>Error Traceback:</strong> {t.error}
                    </div>
                  )}

                  <div class="space-y-1">
                    <div class="text-zinc-500 uppercase text-[10px]">External URL Proof:</div>
                    {t.external_url ? (
                      <a href={t.external_url} target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline flex items-center gap-1">
                        <span>{t.external_url}</span> <ExternalLink size={12} />
                      </a>
                    ) : <span class="text-zinc-600">No URL issued yet</span>}
                  </div>

                  <div class="space-y-1">
                    <div class="text-zinc-500 uppercase text-[10px]">Raw API Response JSON (Meta / LinkedIn / Google):</div>
                    <pre class="p-3 rounded bg-black border border-zinc-900 text-zinc-300 overflow-x-auto max-h-48">
                      {t.raw_response ? JSON.stringify(t.raw_response, null, 2) : '// No JSON response payload recorded'}
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            <div class="pt-4 border-t border-zinc-800 flex justify-end">
              <button onClick={() => setSelectedDebugTarget(null)} class="apple-button-primary text-xs py-2 px-6">Close Inspector</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
