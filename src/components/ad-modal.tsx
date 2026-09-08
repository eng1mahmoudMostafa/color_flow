"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, SkipForward, Volume2, VolumeX } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  message?: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  linkUrl?: string | null;
  durationSeconds: number;
  slot: number;
}

interface AdModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Phase = "loading" | "playing" | "verifying" | "done" | "error";

const YOUR_AD: Ad = {
  id: "your-ad",
  title: "هل تريد وضع إعلانك هنا؟",
  message: "تواصل واتساب: +20 113 027 8851",
  mediaUrl: "",
  mediaType: "IMAGE",
  linkUrl: "https://wa.me/201130278851?text=" + encodeURIComponent("مرحباً، أرغب في وضع إعلاني على موقع ColorFlow"),
  durationSeconds: 15,
  slot: 0,
};

function normalize(raw: unknown): Ad[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .filter((a): a is Record<string, unknown> => Boolean(a) && typeof a === "object")
    .map((a) => ({
      id: typeof a.id === "string" ? a.id : "ad",
      title: typeof a.title === "string" ? a.title : "Advertisement",
      message: typeof a.message === "string" ? a.message : "",
      mediaUrl: typeof a.mediaUrl === "string" ? a.mediaUrl : "",
      mediaType: a.mediaType === "VIDEO" || a.mediaType === "video" ? ("VIDEO" as const) : ("IMAGE" as const),
      linkUrl: typeof a.linkUrl === "string" && a.linkUrl ? a.linkUrl : null,
      durationSeconds: typeof a.durationSeconds === "number" && a.durationSeconds >= 1 ? Math.round(a.durationSeconds) : 15,
      slot: typeof a.slot === "number" ? a.slot : 1,
    }))
    .filter((a) => a.mediaUrl);
}

export function AdModal({ open, onClose, onComplete }: AdModalProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [adSessionId, setAdSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [ads, setAds] = useState<Ad[]>([]);
  const [videoEnded, setVideoEnded] = useState(false);

  const allAds: Ad[] = [...ads, YOUR_AD];
  const currentAd: Ad | undefined = allAds[currentIndex];
  const hasNext = currentIndex < allAds.length - 1;
  const duration = Math.max(currentAd?.durationSeconds ?? 1, 1);

  // Reset per-ad playback state when the modal opens or the ad changes.
  useEffect(() => {
    setVideoEnded(false);
  }, [currentIndex, open]);

  // The countdown is only the MINIMUM required watch time. A video may be
  // longer than that — while it is still playing the user is free to keep
  // watching; the flow only advances when the video ends or the user skips.
  const mediaPlaying =
    phase === "playing" &&
    !!currentAd &&
    currentAd.mediaType === "VIDEO" &&
    !!currentAd.mediaUrl &&
    !videoEnded;

  // Fetch admin ads once per open, then reset and start.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPhase("loading");
    setError(null);
    setAdSessionId(null);
    setCurrentIndex(0);

    (async () => {
      let list: Ad[] = [];
      let sessionId: string | null = null;
      try {
        const [mediaRes, startRes] = await Promise.all([
          fetch("/api/ad/media", { cache: "no-store" }),
          fetch("/api/ad/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }),
        ]);
        const mediaJson = await mediaRes.json().catch(() => null);
        list = normalize(mediaJson?.data?.ads ?? mediaJson?.ads);
        const startJson = await startRes.json().catch(() => null);
        sessionId = startJson?.data?.adSessionId ?? null;
      } catch { /* serve YOUR_AD fallback */ }
      if (cancelled) return;
      setAds(list);
      setAdSessionId(sessionId);
      // Set the countdown BEFORE entering "playing" (same React batch) so the
      // remaining===0 advance guard below never fires spuriously.
      setRemaining(list[0]?.durationSeconds ?? YOUR_AD.durationSeconds);
      setPhase("playing");
    })();

    return () => { cancelled = true; };
  }, [open]);

  const verifyCompletion = useCallback(async () => {
    setPhase("verifying");
    try {
      const res = await fetch("/api/ad/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adSessionId }),
      });
      const json = await res.json().catch(() => null);
      if (json?.data?.unlocked) {
        setPhase("done");
        onComplete();
      } else {
        setError(json?.error?.message ?? (typeof json?.error === "string" ? json.error : null) ?? "Verification failed — please try again.");
        setPhase("error");
      }
    } catch {
      setError("Network error — please check your connection.");
      setPhase("error");
    }
  }, [adSessionId, onComplete]);

  // Countdown: only while playing.
  useEffect(() => {
    if (!open || phase !== "playing" || !currentAd) return;
    const t = setInterval(() => setRemaining((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [open, phase, currentIndex, currentAd]);

  // Advance / verify when an ad finishes. While a video is still playing the
  // user is never forced forward — they watch freely or press Skip.
  useEffect(() => {
    if (!open || phase !== "playing" || !currentAd || remaining > 0) return;
    if (mediaPlaying) return;
    if (hasNext) setCurrentIndex((i) => i + 1);
    else void verifyCompletion();
  }, [open, remaining, phase, currentAd, hasNext, verifyCompletion, mediaPlaying]);

  const handleSkip = () => {
    if (phase !== "playing") return;
    if (hasNext) setCurrentIndex((i) => i + 1);
    else if (remaining === 0 && mediaPlaying) setVideoEnded(true);
  };

  const handleAdClick = () => {
    if (!currentAd?.linkUrl) return;
    void fetch("/api/ad/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: currentAd.id }),
    }).catch(() => undefined);
    window.open(currentAd.linkUrl, "_blank", "noopener,noreferrer");
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        role="dialog" aria-modal="true" aria-label="Advertisement"
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {phase === "loading" ? "Loading…" : `Ad ${currentIndex + 1} / ${allAds.length}`}
              </span>
              {currentAd?.slot === 0 && (
                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">yours</span>
              )}
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-4">
            {currentAd && (
              <div className="space-y-3">
                {currentAd.mediaUrl ? (
                  <div
                    className={`relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 ${currentAd.linkUrl ? "cursor-pointer" : ""}`}
                    onClick={handleAdClick}
                  >
                    {currentAd.mediaType === "VIDEO" ? (
                      <video src={currentAd.mediaUrl} className="w-full h-48 object-contain bg-black" autoPlay muted={muted} playsInline onEnded={() => setVideoEnded(true)} onError={() => setVideoEnded(true)} />
                    ) : (
                      <img src={currentAd.mediaUrl} alt={currentAd.title} className="w-full h-48 object-contain" />
                    )}
                    {currentAd.linkUrl && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ) : (
                  <a href={currentAd.linkUrl || undefined} target="_blank" rel="noopener noreferrer" className="block p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700 text-center space-y-3 hover:shadow-lg transition-shadow">
                    <p className="text-lg font-bold text-green-800 dark:text-green-200">📢 {currentAd.title}</p>
                    <p className="text-sm text-green-600 dark:text-green-300">{currentAd.message}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      واتساب / WhatsApp
                    </div>
                  </a>
                )}
                {currentAd.mediaUrl && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{currentAd.title}</h3>
                    {currentAd.message && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{currentAd.message}</p>}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{phase === "playing" ? `${remaining}s` : "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                {currentAd?.mediaType === "VIDEO" && (
                  <button onClick={() => setMuted((m) => !m)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label={muted ? "Unmute" : "Mute"}>
                    {muted ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-gray-500" />}
                  </button>
                )}
                {phase === "playing" && remaining === 0 && (hasNext || mediaPlaying) && (
                  <button onClick={handleSkip} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <SkipForward className="w-4 h-4" /> {hasNext ? "Skip" : "Continue"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(100, Math.max(0, ((duration - remaining) / duration) * 100))}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {remaining === 0 && mediaPlaying && (
              <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                ✓ المدة المطلوبة اكتملت — أكمل مشاهدة الإعلان بحرية أو اضغط تخطي / Watch freely or skip
              </div>
            )}

            {phase === "loading" && <div className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">Preparing advertisement…</div>}
            {phase === "verifying" && <div className="mt-3 flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />Verifying...</div>}
            {phase === "done" && <div className="mt-3 text-center text-sm text-green-600 dark:text-green-400 font-medium">✓ Copying unlocked for 24 hours!</div>}
            {phase === "error" && (
              <div className="mt-3 space-y-2">
                <div className="text-center text-sm text-red-600 dark:text-red-400">{error}</div>
                <div className="text-center">
                  <button onClick={() => { setCurrentIndex(0); setRemaining(allAds[0]?.durationSeconds ?? 15); setPhase("playing"); }} className="px-4 py-1.5 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700">
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AdModal;