import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Sparkles, Check, Send, Calendar, Image as ImageIcon, Video, 
  Trash2, AlertCircle, RefreshCw, Instagram, Facebook, Linkedin, Youtube, Sliders, ChevronRight
} from 'lucide-react';
import { mediaService, postsService, accountsService } from '../services/api';

export default function CreatePostPage() {
  const [file, setFile] = useState(null);
  const [mediaAsset, setMediaAsset] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [masterCaption, setMasterCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'facebook', 'linkedin', 'youtube']);
  const [platformCaptions, setPlatformCaptions] = useState({});
  const [activeTab, setActiveTab] = useState('instagram');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    accountsService.list().then(data => setAccounts(data || []));
  }, []);

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!droppedFile) return;

    setFile(droppedFile);
    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await mediaService.upload(droppedFile, (progress) => {
        setUploadProgress(progress);
      });
      setMediaAsset(res);
    } catch (err) {
      alert(`File upload failed: ${err.message}`);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!masterCaption.trim()) {
      alert('Please enter a master caption first.');
      return;
    }
    setGeneratingAI(true);
    try {
      const res = await postsService.generateAICaptions({
        master_caption: masterCaption,
        platforms: selectedPlatforms,
        brand_tone: 'Professional',
        default_hashtags: '#FounderLabs #Innovation #Tech #Growth'
      });
      
      const newCaptions = { ...platformCaptions };
      for (const p of selectedPlatforms) {
        const pLower = p.lower ? p.lower() : p.toLowerCase();
        if (res[pLower]) {
          newCaptions[pLower] = {
            caption: res[pLower].caption || masterCaption,
            title: res[pLower].title || '',
            description: res[pLower].description || '',
            privacy: newCaptions[pLower]?.privacy || 'public'
          };
        }
      }
      setPlatformCaptions(newCaptions);
    } catch (e) {
      alert('AI generation failed.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCaptionChange = (platform, field, value) => {
    setPlatformCaptions(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const togglePlatform = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length === 1) return; // keep at least 1
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
      if (activeTab === platform) {
        setActiveTab(selectedPlatforms.find(p => p !== platform) || 'instagram');
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleSubmit = async (isScheduled = false) => {
    if (!masterCaption.trim() && !mediaAsset) {
      alert('Please provide either a media file or a master caption.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one target platform.');
      return;
    }

    setPublishing(true);
    try {
      // 1. Create Draft
      const draft = await postsService.createDraft({
        title: platformCaptions['youtube']?.title || masterCaption.split('\n')[0].slice(0, 50) || 'FounderLabs Post',
        master_caption: masterCaption,
        media_asset_id: mediaAsset ? mediaAsset.id : null,
        scheduled_at: isScheduled && scheduleDate ? new Date(scheduleDate).toISOString() : null,
        platforms: selectedPlatforms
      });

      // 2. Patch Target customizations
      if (draft && draft.targets) {
        for (const t of draft.targets) {
          const cust = platformCaptions[t.platform];
          if (cust) {
            await postsService.updateTarget(t.id, {
              caption: cust.caption || masterCaption,
              title: cust.title || '',
              description: cust.description || '',
              privacy: cust.privacy || 'public'
            });
          }
        }
      }

      // 3. Publish or finish schedule
      if (!isScheduled) {
        await postsService.publish(draft.id);
        navigate('/status');
      } else {
        alert(`Post successfully scheduled for ${new Date(scheduleDate).toLocaleString()}!`);
        navigate('/history');
      }
    } catch (e) {
      alert(`Publish error: ${e.message}`);
    } finally {
      setPublishing(false);
      setShowScheduleModal(false);
    }
  };

  const platformsMeta = [
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'youtube', name: 'YouTube', icon: Youtube },
  ];

  return (
    <div class="space-y-10">
      {/* Header */}
      <div class="border-b border-[#1f1f23] pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">Create New Broadcast</h1>
          <p class="text-zinc-400 text-sm mt-1">Upload once, customize per platform, and publish across your connected official API endpoints.</p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            onClick={() => setShowScheduleModal(true)} 
            disabled={publishing || uploading}
            class="apple-button-secondary text-sm py-2.5"
          >
            <Calendar size={16} class="mr-2" /> Schedule
          </button>
          <button 
            onClick={() => handleSubmit(false)} 
            disabled={publishing || uploading}
            class="apple-button-primary text-sm py-2.5"
          >
            {publishing ? <RefreshCw size={16} class="mr-2 animate-spin" /> : <Send size={16} class="mr-2" />}
            <span>Post Now</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Media & Master Caption */}
        <div class="lg:col-span-6 space-y-6">
          {/* Media Upload Box */}
          <div class="glass-panel p-6 space-y-4">
            <h3 class="font-display font-semibold text-white text-base flex items-center justify-between">
              <span>1. Media Asset (Image or Video)</span>
              {mediaAsset && <span class="text-xs font-mono text-emerald-400">Uploaded ({Math.round(mediaAsset.file_size / 1024)} KB)</span>}
            </h3>

            {!file ? (
              <label 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                class="border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer bg-[#0a0a0e]/50 transition-all group"
              >
                <input type="file" onChange={handleFileDrop} accept="image/*,video/*" class="hidden" />
                <div class="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all mb-4">
                  <Upload size={24} />
                </div>
                <div class="font-semibold text-white text-base">Drag and drop your media file</div>
                <div class="text-xs text-zinc-500 mt-1 max-w-xs">Supports JPG, PNG, MP4, MOV, and Reels video containers up to 500MB</div>
              </label>
            ) : (
              <div class="p-4 rounded-xl bg-[#0a0a0e] border border-zinc-800 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0">
                      {file.type?.startsWith('video') ? <Video size={20} /> : <ImageIcon size={20} />}
                    </div>
                    <div class="min-w-0">
                      <div class="font-medium text-white text-sm truncate">{file.name}</div>
                      <div class="text-xs text-zinc-500 font-mono">{file.type || 'Media file'}</div>
                    </div>
                  </div>
                  <button onClick={() => { setFile(null); setMediaAsset(null); }} class="p-2 text-zinc-500 hover:text-red-400 transition-colors shrink-0">
                    <Trash2 size={18} />
                  </button>
                </div>

                {uploading && (
                  <div class="space-y-1">
                    <div class="flex justify-between text-xs font-mono text-zinc-400">
                      <span>Uploading to storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div class="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div class="h-full bg-white transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {mediaAsset && (
                  <div class="mt-2 rounded-lg overflow-hidden border border-zinc-800 bg-black max-h-60 flex items-center justify-center">
                    {mediaAsset.file_type.startsWith('video') ? (
                      <video src={mediaAsset.file_url} controls class="max-h-60 w-full object-contain" />
                    ) : (
                      <img src={mediaAsset.file_url} alt="Uploaded asset" class="max-h-60 w-full object-contain" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Master Caption Box */}
          <div class="glass-panel p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-display font-semibold text-white text-base">2. Master Caption</h3>
              <button
                onClick={handleGenerateAI}
                disabled={generatingAI || !masterCaption.trim()}
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 text-xs font-medium text-white hover:border-zinc-500 transition-all disabled:opacity-50"
              >
                <Sparkles size={14} class="text-amber-400" />
                <span>{generatingAI ? 'Generating Copy...' : 'Generate Platform Captions'}</span>
              </button>
            </div>
            <textarea
              value={masterCaption}
              onChange={(e) => setMasterCaption(e.target.value)}
              placeholder="Write your primary caption or message here... Click 'Generate Platform Captions' to automatically tailor copy for each social network."
              rows={6}
              class="apple-input resize-none font-sans text-sm leading-relaxed"
            ></textarea>
            <div class="flex justify-between text-xs font-mono text-zinc-500">
              <span>Pro Tip: Press Generate to craft platform-specific hashtags & formatting</span>
              <span>{masterCaption.length} characters</span>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Target Selection & Customization */}
        <div class="lg:col-span-6 space-y-6">
          <div class="glass-panel p-6 space-y-6">
            <div class="space-y-3">
              <h3 class="font-display font-semibold text-white text-base">3. Select Target Platforms</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {platformsMeta.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPlatforms.includes(p.id);
                  const isConnected = accounts.some(a => a.platform === p.id && a.status === 'active');
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      class={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                        isSelected 
                          ? 'bg-white text-black font-semibold border-white shadow-md shadow-white/10' 
                          : 'bg-[#0a0a0e] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <Icon size={20} />
                      <span class="text-xs font-medium">{p.name}</span>
                      {!isConnected && (
                        <span class={`text-[9px] font-mono px-1.5 py-0.2 rounded ${isSelected ? 'bg-black/10 text-black' : 'bg-zinc-900 text-zinc-500'}`}>
                          No OAuth
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Customization Tabs */}
            <div class="space-y-4 pt-4 border-t border-zinc-800">
              <div class="flex items-center justify-between">
                <h3 class="font-display font-semibold text-white text-base flex items-center gap-2">
                  <Sliders size={16} class="text-zinc-400" /> Platform Copy & Settings Preview
                </h3>
              </div>

              {/* Tab headers */}
              <div class="flex gap-1 border-b border-zinc-800 pb-2 overflow-x-auto">
                {selectedPlatforms.map((plat) => {
                  const meta = platformsMeta.find(p => p.id === plat);
                  if (!meta) return null;
                  const Icon = meta.icon;
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setActiveTab(plat)}
                      class={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 shrink-0 transition-all ${
                        activeTab === plat 
                          ? 'bg-zinc-800 text-white font-semibold' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{meta.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active tab content */}
              <div class="p-5 rounded-2xl bg-[#0a0a0e] border border-zinc-800/80 space-y-4">
                {activeTab === 'youtube' ? (
                  <div class="space-y-4">
                    <div class="space-y-1.5">
                      <label class="text-xs font-mono text-zinc-400 uppercase">YouTube Video Title (SEO)</label>
                      <input 
                        type="text" 
                        value={platformCaptions['youtube']?.title || ''} 
                        onChange={(e) => handleCaptionChange('youtube', 'title', e.target.value)}
                        placeholder="Enter video title under 70 characters..."
                        class="apple-input text-sm py-2.5"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs font-mono text-zinc-400 uppercase">Video Description</label>
                      <textarea 
                        value={platformCaptions['youtube']?.description || ''} 
                        onChange={(e) => handleCaptionChange('youtube', 'description', e.target.value)}
                        placeholder="Enter YouTube video description, links, chapters..."
                        rows={5}
                        class="apple-input text-sm py-2.5 resize-none"
                      ></textarea>
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs font-mono text-zinc-400 uppercase">Privacy Status</label>
                      <select 
                        value={platformCaptions['youtube']?.privacy || 'public'} 
                        onChange={(e) => handleCaptionChange('youtube', 'privacy', e.target.value)}
                        class="apple-input text-sm py-2.5 bg-[#0a0a0e]"
                      >
                        <option value="public">Public (Visible to everyone)</option>
                        <option value="unlisted">Unlisted (Anyone with the link)</option>
                        <option value="private">Private (Only visible to you)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div class="space-y-2">
                    <div class="flex justify-between items-center text-xs font-mono text-zinc-400 uppercase">
                      <span>{activeTab} Customized Copy</span>
                      <span>{(platformCaptions[activeTab]?.caption || masterCaption).length} chars</span>
                    </div>
                    <textarea 
                      value={platformCaptions[activeTab]?.caption !== undefined ? platformCaptions[activeTab].caption : masterCaption} 
                      onChange={(e) => handleCaptionChange(activeTab, 'caption', e.target.value)}
                      placeholder={`Custom caption for ${activeTab.toUpperCase()}...`}
                      rows={7}
                      class="apple-input text-sm py-2.5 resize-none leading-relaxed"
                    ></textarea>
                    <div class="text-[11px] text-zinc-500 font-mono">
                      {activeTab === 'instagram' && '💡 Tip: Add 10-15 curated hashtags and spacing for Reels / Image engagement.'}
                      {activeTab === 'linkedin' && '💡 Tip: Structure with bullet points and key takeaways for professional reach.'}
                      {activeTab === 'facebook' && '💡 Tip: Ask a question to encourage discussion and algorithmic reach.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="glass-panel p-6 sm:p-8 max-w-md w-full space-y-6 animate-slide-up border border-zinc-700">
            <h3 class="text-xl font-display font-bold text-white">Schedule Post Broadcast</h3>
            <p class="text-xs text-zinc-400">Select the date and time when your post draft will be queued for automated background publishing across {selectedPlatforms.length} platforms.</p>
            
            <div class="space-y-2">
              <label class="text-xs font-mono text-zinc-400 uppercase">Target Date & Time</label>
              <input 
                type="datetime-local" 
                value={scheduleDate} 
                onChange={(e) => setScheduleDate(e.target.value)}
                class="apple-input"
              />
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setShowScheduleModal(false)} class="apple-button-secondary text-xs py-2.5 px-4">Cancel</button>
              <button onClick={() => handleSubmit(true)} disabled={!scheduleDate} class="apple-button-primary text-xs py-2.5 px-5">
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
