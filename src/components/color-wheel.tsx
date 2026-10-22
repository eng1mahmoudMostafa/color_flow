'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Palette as PaletteIcon,
  Copy,
  Check,
  Hospital,
  Gamepad2,
  Cpu,
  Leaf,
  Tablet,
  Flame,
  Zap,
  CreditCard,
  GraduationCap,
  Briefcase,
  Crown,
  Heart,
  Star,
  Save,
  ShoppingCart,
  BookOpen,
  Smartphone,
  MonitorSmartphone,
} from 'lucide-react';
import { useLang, useDict } from '@/components/providers';
import { COLOR_WHEEL } from '@/lib/i18n';
import { useAccess } from '@/components/access-provider';
import { useToast } from '@/components/toast';
import { TryColorsModal } from '@/components/try-colors-modal';
import { copyToClipboard } from '@/lib/utils';

type CategoryKey =
  | 'CLASSIC'
  | 'MINIMAL'
  | 'DARK'
  | 'LIGHT'
  | 'LUXURY'
  | 'NATURE'
  | 'OCEAN'
  | 'SUNSET'
  | 'PASTEL'
  | 'NEON'
  | 'TECHNOLOGY'
  | 'GAMING'
  | 'BUSINESS'
  | 'ECOMMERCE'
  | 'PORTFOLIO'
  | 'FINANCE'
  | 'MEDICAL'
  | 'EDUCATION';

interface CategoryMeta {
  key: CategoryKey;
  label: string;
  baseColor: string;
  icon: React.ElementType;
  hint: string;
}

const CATEGORIES: CategoryMeta[] = [
  { key: 'MEDICAL', label: 'medical', baseColor: '#3B82F6', icon: Hospital, hint: 'hospitals & clinics' },
  { key: 'GAMING', label: 'gaming', baseColor: '#EF4444', icon: Gamepad2, hint: 'shooters & action games' },
  { key: 'TECHNOLOGY', label: 'technology', baseColor: '#8B5CF6', icon: Cpu, hint: 'software & SaaS' },
  { key: 'NATURE', label: 'nature', baseColor: '#10B981', icon: Leaf, hint: 'eco & organic brands' },
  { key: 'OCEAN', label: 'ocean', baseColor: '#06B6D4', icon: Tablet, hint: 'travel & water brands' },
  { key: 'SUNSET', label: 'sunset', baseColor: '#F59E0B', icon: Flame, hint: 'warm & energetic' },
  { key: 'NEON', label: 'neon', baseColor: '#EC4899', icon: Zap, hint: 'nightlife & cyberpunk' },
  { key: 'FINANCE', label: 'finance', baseColor: '#1E40AF', icon: CreditCard, hint: 'banks & fintech' },
  { key: 'EDUCATION', label: 'education', baseColor: '#84CC16', icon: GraduationCap, hint: 'schools & courses' },
  { key: 'BUSINESS', label: 'business', baseColor: '#2563EB', icon: Briefcase, hint: 'corporate & office' },
  { key: 'LUXURY', label: 'luxury', baseColor: '#D97706', icon: Crown, hint: 'premium & fashion' },
  { key: 'CLASSIC', label: 'classic', baseColor: '#374151', icon: PaletteIcon, hint: 'timeless & formal' },
  { key: 'MINIMAL', label: 'minimal', baseColor: '#6B7280', icon: Heart, hint: 'clean & simple' },
  { key: 'LIGHT', label: 'light', baseColor: '#F3F4F6', icon: Star, hint: 'airy & soft' },
  { key: 'DARK', label: 'dark', baseColor: '#111827', icon: Save, hint: 'dark mode UI' },
  { key: 'ECOMMERCE', label: 'ecommerce', baseColor: '#EF4444', icon: ShoppingCart, hint: 'online stores' },
  { key: 'PORTFOLIO', label: 'portfolio', baseColor: '#7C3AED', icon: BookOpen, hint: 'creative & art' },
  { key: 'PASTEL', label: 'pastel', baseColor: '#A78BFA', icon: Smartphone, hint: 'soft & friendly' },
];

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const s2 = s / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s2;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const R = Math.round((r + m) * 255);
  const G = Math.round((g + m) * 255);
  const B = Math.round((b + m) * 255);
  return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function suggestPalette(hex: string, categoryKey: CategoryKey): string[] {
  const [h, s, l] = hexToHsl(hex);
  const harmonies: Record<CategoryKey, number[]> = {
    MEDICAL: [0, 40, 100, 140, 200],
    GAMING: [0, 180, 60, 300, 0],
    TECHNOLOGY: [0, 260, 200, 280, 0],
    NATURE: [0, 120, 160, 80, 0],
    OCEAN: [0, 180, 220, 140, 0],
    SUNSET: [0, 30, 60, 10, 0],
    NEON: [0, 320, 40, 280, 0],
    FINANCE: [0, 220, 260, 200, 0],
    EDUCATION: [0, 90, 140, 40, 0],
    BUSINESS: [0, 220, 260, 200, 0],
    LUXURY: [0, 40, 300, 20, 0],
    CLASSIC: [0, 0, 0, 0, 0],
    MINIMAL: [0, 0, 0, 0, 0],
    LIGHT: [0, 0, 0, 0, 0],
    DARK: [0, 0, 0, 0, 0],
    ECOMMERCE: [0, 340, 60, 10, 0],
    PORTFOLIO: [0, 280, 320, 240, 0],
    PASTEL: [0, 60, 120, 180, 0],
  };
  const offsets = harmonies[categoryKey] ?? [0, 60, 120, 180, 240];
  return offsets.map((off) => {
    const newH = (h + off) % 360;
    let newS = s;
    let newL = l;
    if (categoryKey === 'PASTEL') {
      newS = Math.max(40, Math.min(70, s));
      newL = Math.max(75, Math.min(90, l));
    }
    if (categoryKey === 'LIGHT') {
      newL = Math.max(80, Math.min(95, l));
      newS = Math.min(40, s);
    }
    if (categoryKey === 'DARK') {
      newL = Math.max(10, Math.min(35, l));
      newS = Math.min(60, s);
    }
    if (categoryKey === 'CLASSIC' || categoryKey === 'MINIMAL') {
      newS = Math.min(20, s);
    }
    return hslToHex(newH, newS, newL);
  });
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export function ColorWheel() {
  const lang = useLang();
  const t = COLOR_WHEEL[lang];
  const isRtl = lang === 'ar';
  const { requestCopy } = useAccess();
  const { push } = useToast();
  const common = useDict().common;

  const [selectedHue, setSelectedHue] = useState(210);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('MEDICAL');
  const [copied, setCopied] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const baseColor = hslToHex(selectedHue, 70, 50);
  const palette = useMemo(() => suggestPalette(baseColor, selectedCategory), [baseColor, selectedCategory]);
  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.key === selectedCategory),
    [selectedCategory]
  );

  /**
   * Copying is gated by the rewarded ad: requestCopy() re-checks access with
   * the server and opens the ad modal when locked. The clipboard write only
   * happens once access is granted — and it is replayed automatically right
   * after the ad finishes, so the visitor never has to click twice.
   */
  const handleCopy = useCallback(
    async (text: string) => {
      const perform = async () => {
        const success = await copyToClipboard(text);
        if (!success) {
          push(common.clipboardError, 'error');
          return;
        }
        setCopied(text);
        window.setTimeout(() => setCopied(null), 1500);
        push(`${text} ${common.copied.toLowerCase()}`, 'success');
      };

      const allowed = await requestCopy(() => void perform());
      if (!allowed) {
        push(common.adLock, 'info');
        return;
      }
      await perform();
    },
    [requestCopy, push, common.adLock, common.clipboardError, common.copied]
  );

  const pointerPosition = useMemo(() => {
    const rad = ((selectedHue - 90) * Math.PI) / 180;
    return { x: Math.cos(rad), y: Math.sin(rad) };
  }, [selectedHue]);

  const handleWheelPointer = useCallback(
    (clientX: number, clientY: number, containerRect: DOMRect) => {
      const cx = containerRect.left + containerRect.width / 2;
      const cy = containerRect.top + containerRect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      angle = (angle + 90 + 360) % 360;
      setSelectedHue(Math.round(angle));
    },
    []
  );

  const handleWheelDown = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      handleWheelPointer(e.clientX, e.clientY, rect);
    },
    [handleWheelPointer]
  );

  const handleWheelMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      handleWheelPointer(e.clientX, e.clientY, rect);
    },
    [handleWheelPointer]
  );

  return (
    <section className="w-full border-t border-line pt-16 pb-24 sm:pt-20 sm:pb-32 lg:pb-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-3.5 py-1.5 text-xs font-medium text-ink-soft mb-4">
            <PaletteIcon className="h-3.5 w-3.5 text-brand-500" aria-hidden />
            {t.title}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-ink">{t.title}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-base leading-relaxed text-ink-soft sm:text-lg">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-3 space-y-2">
            <p className="text-sm font-semibold text-ink-soft uppercase tracking-wider">{t.pickCategory}</p>
            <div className="mt-2 space-y-1.5">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${isActive ? 'border-brand-500 bg-brand-50/60 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shadow-[0_0_20px_rgba(59,109,246,0.25)]' : 'border-line bg-surface text-ink-soft hover:border-brand-200 hover:text-ink hover:bg-surface-raised dark:border-line/50 dark:text-ink-soft dark:bg-surface dark:hover:bg-surface-raised'}`}
                  >
                    <cat.icon className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-ink-soft'}`} aria-hidden />
                    <span>{t.category(cat.key)}</span>
                    <span className="ml-auto text-xs text-ink-faint">{cat.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            <div
              className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full border border-line bg-surface shadow-lifted overflow-hidden"
              onMouseDown={handleWheelDown}
              onMouseMove={handleWheelMove}
              onTouchStart={(e: React.TouchEvent) => {
                const touch = e.touches[0];
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                handleWheelPointer(touch.clientX, touch.clientY, rect);
              }}
              onTouchMove={(e: React.TouchEvent) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                handleWheelPointer(touch.clientX, touch.clientY, rect);
              }}
              style={{ background: `conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000)` }}
            >
              <div className="absolute inset-2 rounded-full bg-surface border border-line z-10" />
              <div
                className="absolute inset-0 rounded-full z-5 opacity-40"
                style={{ background: `radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(0,0,0,0.35) 70%)` }}
                aria-hidden
              />
              <motion.div
                animate={{ x: pointerPosition.x * 38, y: pointerPosition.y * 38 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lifted border-2 border-brand-500 z-20 cursor-pointer transition-transform active:scale-95"
                style={{ boxShadow: `0 0 24px ${baseColor}` }}
              >
                <div className="absolute inset-0 rounded-full" style={{ background: baseColor }} />
                <div className="absolute inset-1 rounded-full bg-white opacity-60" />
              </motion.div>
              {[...Array(12)].map((_, i) => {
                const angle = i * 30;
                const rad = ((angle - 90) * Math.PI) / 180;
                const x1 = Math.cos(rad) * 30;
                const y1 = Math.sin(rad) * 30;
                const x2 = Math.cos(rad) * 38;
                const y2 = Math.sin(rad) * 38;
                return (
                  <line
                    key={i}
                    x1={50 + x1}
                    y1={50 + y1}
                    x2={50 + x2}
                    y2={50 + y2}
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden
                  />
                );
              })}
              <svg className="absolute inset-0 w-full h-full" aria-hidden />
            </div>
            <p className="mt-6 sm:mt-8 text-sm text-ink-faint text-center">{t.pickColor} • {baseColor}</p>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <div className="relative group">
              <div className="aspect-video rounded-2xl border border-line bg-surface shadow-soft overflow-hidden">
                <div className="h-full w-full" style={{ background: baseColor }} />
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-4">
                {[
                  ['HEX', baseColor],
                  ['RGB', hexToRgb(baseColor)],
                  ['HSL', `hsl(${selectedHue}, 70%, 50%)`],
                ].map(([label, value]) => (
                  <button
                    key={label}
                    onClick={() => handleCopy(value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${copied === value ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'border-line bg-surface text-ink-soft hover:border-brand-400 hover:text-ink hover:bg-surface-raised dark:border-line/50 dark:text-ink-soft dark:hover:bg-surface dark:hover:text-ink'}`}
                  >
                    {copied === value ? (
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                    )}
                    <span className="hidden sm:inline">{label}</span>
                    <span className="font-mono text-xs">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">{t.suggestPalette}</h3>
                <span className="text-xs text-ink-faint">
                  {activeCategory ? t.category(activeCategory.key).toUpperCase() : ''}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {palette.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedHue(hexToHsl(color)[0])}
                    className={`aspect-square rounded-xl border border-line shadow-sm transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-brand-400/60 cursor-pointer`}
                    style={{ background: color }}
                    aria-label={color}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-600 text-white shadow-soft transition hover:bg-brand-700 active:scale-[0.98]"
                >
                  <MonitorSmartphone className="h-4 w-4" aria-hidden />
                  {t.preview}
                </button>
                <button
                  onClick={() => handleCopy(palette.join(', '))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-line bg-surface text-ink transition hover:bg-surface-raised hover:text-brand-600 dark:hover:text-brand-400"
                >
                  <PaletteIcon className="h-4 w-4" aria-hidden />
                  {t.tryPalette}
                </button>
              </div>
              <p className="text-[11px] text-ink-faint text-end">{t.copyNote}</p>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 lg:hidden flex flex-wrap justify-center gap-2">
            <p className="mr-3 mb-2 text-xs font-semibold text-ink-soft uppercase tracking-wider">
              {t.pickCategory}
            </p>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${isActive ? 'border-brand-500 bg-brand-50/60 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shadow-[0_0_12px_rgba(59,109,246,0.25)]' : 'border-line bg-surface text-ink-soft hover:border-brand-200 hover:text-ink hover:bg-surface-raised dark:border-line/50 dark:text-ink-soft dark:hover:bg-surface dark:hover:text-ink'}`}
                >
                  {t.category(cat.key)}
                </button>
              );
            })}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 px-4 py-3 rounded-lg border border-dashed border-line/50 bg-surface-raised/30 text-xs text-ink-faint text-center">
              Direction: {isRtl ? 'RTL (العربية)' : 'LTR (English)'} &nbsp;|&nbsp; Hue: {selectedHue}\u00B0
            </div>
          )}
        </div>
      </div>

      {previewOpen && (
        <TryColorsModal
          palette={{
            name: activeCategory ? t.category(activeCategory.key) : t.title,
            category: activeCategory ? t.category(activeCategory.key) : undefined,
            colors: [baseColor, ...palette],
          }}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </section>
  );
}