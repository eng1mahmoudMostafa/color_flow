"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { upload } from "@vercel/blob/client";
import { Upload, X, Trash2, Eye, Plus, Image as ImageIcon, Edit2, Play } from "lucide-react";
import { AdModal } from "@/components/ad-modal";

interface Ad { id: string; title: string; message: string; mediaUrl: string; mediaType: "image" | "video"; linkUrl: string | null; durationSeconds: number; slot: number; active: boolean; permanent: boolean; expiresAt: string | null; impressions: number; clicks: number; createdAt: string; }

interface Stats {
  totalPalettes?: number; totalAds?: number; activeAds?: number; totalImpressions?: number; totalClicks?: number;
  overview?: { palettes: number; users: number; adSessions: number; activeAccess: number };
  ads?: { verifiedAds: number; failedAds: number; conversion: number };
}

const TOTAL_SLOTS = 3;

export default function AdminDashboard() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [storage, setStorage] = useState<{ usedBytes: number; limitBytes: number } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ title: "", message: "", mediaUrl: "", mediaType: "image" as "image" | "video", linkUrl: "", durationSeconds: 30, slot: 1, active: true });
  const loadData = useCallback(async () => {
    try {
      const [adsRes, statsRes] = await Promise.all([fetch("/api/admin/ads"), fetch("/api/admin/stats")]);
      if (adsRes.ok) {
        const j = await adsRes.json();
        const list = j?.data?.ads ?? j?.ads ?? [];
        setAds(Array.isArray(list) ? list : []);
        const st = j?.data?.storage ?? j?.storage ?? null;
        if (st) setStorage(st);
      }
      if (statsRes.ok) {
        const j = await statsRes.json();
        setStats(j?.data ?? j ?? null);
      }
    } catch { showNotice("err", "Failed to load data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showNotice = (type: "ok" | "err", msg: string) => { setNotice({ type, msg }); setTimeout(() => setNotice(null), 4000); };

  const resetForm = () => { setForm({ title: "", message: "", mediaUrl: "", mediaType: "image", linkUrl: "", durationSeconds: 30, slot: 1, active: true }); setEditingId(null); setShowForm(false); };

  /** Paste an external image/video URL — auto-detect the type from the extension. */
  const setMediaUrlInput = (url: string) => {
    const clean = url.trim();
    const lower = clean.toLowerCase().split("?")[0];
    const isVideo = /\.(mp4|webm|mov)(\/|$)/.test(lower) || lower.includes("video");
    setForm((f) => ({ ...f, mediaUrl: clean, mediaType: isVideo ? "video" : "image" }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true);
    try {
      // Upload straight from the browser to cloud storage.
      // Uses FormData (local dev, disk storage) or direct-to-Blob (live site).
      const fdCheck = await fetch("/api/admin/blob-check").catch(() => null);
      const blobMode = Boolean(fdCheck && fdCheck.ok && (await fdCheck.json().catch(() => null))?.blob);
      if (blobMode) {
        const ext = (file.name.split(".").pop() || "bin").toLowerCase();
        const blob = await upload(`ads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/ads/blob-token",
        });
        setForm((f) => ({ ...f, mediaUrl: blob.url, mediaType: (file.type.startsWith("video") ? "video" : "image") as "image" | "video" }));
      } else {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/ads/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message || json?.error || "Upload failed");
        const uploaded = json.file || json.data?.file || {};
        setForm((f) => ({ ...f, mediaUrl: uploaded.mediaUrl || f.mediaUrl, mediaType: (uploaded.mediaType || (file.type.startsWith("video") ? "video" : "image")).toLowerCase() }));
      }
      showNotice("ok", "Media uploaded");
    } catch (err: any) { showNotice("err", err.message || "Upload failed"); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); try {
      const res = await fetch(editingId ? `/api/admin/ads/${editingId}` : "/api/admin/ads", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, mediaType: form.mediaType.toUpperCase(), linkUrl: form.linkUrl || null }) });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error?.message || j?.error || `Failed (${res.status})`);
      }
      showNotice("ok", editingId ? "Ad updated" : "Ad created"); resetForm(); loadData();
    } catch (err: any) { showNotice("err", err.message); }
  };
  const handleEdit = (ad: Ad) => { setForm({ title: ad.title, message: ad.message, mediaUrl: ad.mediaUrl, mediaType: ad.mediaType, linkUrl: ad.linkUrl || "", durationSeconds: ad.durationSeconds, slot: ad.slot, active: ad.active }); setEditingId(ad.id); setShowForm(true); };

  const handleDelete = async (ad: Ad) => {
    if (!confirm(`Delete "${ad.title}"? This will also delete its media file.`)) return;
    try {
      const res = await fetch(`/api/admin/ads/${ad.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      showNotice("ok", "Ad deleted"); loadData();
    } catch { showNotice("err", "Delete failed"); }
  };

  const slotAds = Array.from({ length: TOTAL_SLOTS }, (_, i) => ads.find((a) => a.slot === i + 1)).filter(Boolean) as Ad[];

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard…</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"><Plus size={18} /> New Ad</button>
      </div>

      {notice && (<div className={`p-3 rounded-lg text-sm ${notice.type === "ok" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>{notice.msg}</div>)}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ label: "Palettes", value: stats.totalPalettes ?? stats.overview?.palettes ?? 0 }, { label: "Active Ads", value: stats.activeAds ?? stats.ads?.verifiedAds ?? 0 }, { label: "Impressions", value: stats.totalImpressions ?? 0 }, { label: "Clicks", value: stats.totalClicks ?? 0 }].map((s) => (<div key={s.label} className="rounded-xl border p-4 text-center"><div className="text-2xl font-bold">{Number(s.value ?? 0).toLocaleString()}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>))}
        </div>
      )}

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Advertisement Slots</h2>
          <button onClick={() => setPreviewOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted"><Play size={14} /> Preview ads</button>
        </div>
        <p className="text-sm text-muted-foreground">Each slot holds one ad. Delete an ad to remove its file. Ads expire automatically after 30 days.</p>
        {storage && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Storage used</span>
              <span>{(storage.usedBytes / 1048576).toFixed(1)} MB / {(storage.limitBytes / 1048576).toFixed(0)} MB</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all ${storage.usedBytes / storage.limitBytes > 0.9 ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${Math.min(100, (storage.usedBytes / storage.limitBytes) * 100)}%` }} />
            </div>
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
            const ad = slotAds.find((a) => a.slot === i + 1);
            return (<div key={i} className="rounded-lg border border-dashed p-3 min-h-[160px] flex flex-col items-center justify-center text-center gap-2">
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">Slot {i + 1}</span>
              {ad ? (<>
                {ad.mediaType?.toLowerCase() === "image" ? <img src={ad.mediaUrl} alt={ad.title} className="w-full h-24 object-cover rounded" /> : <video src={ad.mediaUrl} className="w-full h-24 object-cover rounded bg-black" preload="metadata" controls playsInline muted />}
                <div className="text-sm font-medium truncate w-full">{ad.title}</div>
                <div className="text-xs text-muted-foreground">{ad.durationSeconds}s &middot; {ad.impressions} views{!ad.active && " · paused"}</div>
                <div className="flex gap-1"><button onClick={() => handleEdit(ad)} className="p-1.5 rounded hover:bg-muted"><Edit2 size={14} /></button><button onClick={() => handleDelete(ad)} className="p-1.5 rounded hover:bg-red-100 text-red-600"><Trash2 size={14} /></button></div>
              </>) : <span className="text-xs text-muted-foreground">Empty</span>}
            </div>);
          })}
        </div>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="rounded-xl border p-5 space-y-4">
            <div className="flex items-center justify-between"><h2 className="font-semibold text-lg">{editingId ? "Edit Ad" : "Create Ad"}</h2><button onClick={resetForm} className="p-1 hover:bg-muted rounded"><X size={18} /></button></div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 bg-transparent" />
                <input required placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border px-3 py-2 bg-transparent" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div><label className="text-xs text-muted-foreground">Slot</label><select value={form.slot} onChange={(e) => setForm({ ...form, slot: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2 bg-transparent">{[1,2,3].map((s) => <option key={s} value={s}>Slot {s}</option>)}</select></div>
                <div><label className="text-xs text-muted-foreground">Duration (10-120s)</label><input type="number" min={10} max={120} value={form.durationSeconds} onChange={(e) => setForm({ ...form, durationSeconds: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2 bg-transparent" /></div>
                <div><label className="text-xs text-muted-foreground">Click Link (optional)</label><input type="text" placeholder="https://example.com" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} className="w-full rounded-lg border px-3 py-2 bg-transparent" /></div>
              </div>
              <div>
              <label className="text-xs text-muted-foreground block mb-1">Media — external URL only on the live site (serverless hosting deletes uploaded files)</label>
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted disabled:opacity-50">
                  <Upload size={16} /> {uploading ? "Uploading…" : "Upload"}
                </button>
                <input type="text" placeholder="…or paste image/video URL: https://…" value={/^https?:\/\//i.test(form.mediaUrl) ? form.mediaUrl : ""} onChange={(e) => setMediaUrlInput(e.target.value)} className="flex-1 min-w-0 rounded-lg border px-3 py-2 bg-transparent" />
                {form.mediaUrl && <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">{form.mediaType?.toLowerCase() === "video" ? <Eye size={16} /> : <ImageIcon size={16} />}<span className="truncate max-w-[200px]">{form.mediaUrl.split("/").pop()}</span></div>}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Tip: upload a free image to Imgur / Catbox / Cloudinary, then paste its direct link here — this is the reliable way on the live site.</p>
            </div>              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Active</label>
              <div className="flex gap-2"><button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90">{editingId ? "Update" : "Create"}</button><button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border hover:bg-muted">Cancel</button></div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr><th className="text-left p-3">Slot</th><th className="text-left p-3">Title</th><th className="text-left p-3">Duration</th><th className="text-left p-3">Views</th><th className="text-left p-3">Clicks</th><th className="text-left p-3">Expires</th><th className="text-left p-3">Actions</th></tr></thead>
          <tbody>
            {ads.map((ad) => (<tr key={ad.id} className="border-t"><td className="p-3">{ad.slot}</td><td className="p-3 font-medium">{ad.title}</td><td className="p-3">{ad.durationSeconds}s</td><td className="p-3">{ad.impressions}</td><td className="p-3">{ad.clicks}</td><td className="p-3 text-xs">{ad.permanent ? "Never" : ad.expiresAt ? new Date(ad.expiresAt).toLocaleDateString() : "—"}</td><td className="p-3 flex gap-1"><button onClick={() => setPreviewOpen(true)} title="Preview as visitor" className="p-1.5 rounded hover:bg-muted"><Eye size={14} /></button><button onClick={() => handleEdit(ad)} className="p-1.5 rounded hover:bg-muted"><Edit2 size={14} /></button><button onClick={() => handleDelete(ad)} className="p-1.5 rounded hover:bg-red-100 text-red-600"><Trash2 size={14} /></button></td></tr>))}
            {ads.length === 0 && (<tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No ads yet.</td></tr>)}
          </tbody>
        </table>
      </div>

      <AdModal open={previewOpen} onClose={() => setPreviewOpen(false)} onComplete={() => {}} />
    </div>
  );
}