/**
 * Lightweight i18n — English (default) + Arabic for the main UI surfaces.
 * Language is stored in a `lang` cookie; the layout reads it server-side to
 * set <html lang/dir>. Full coverage of marketing surfaces + navigation;
 * data-driven pages (palettes, colors) stay English by design since names
 * and color codes are technical values.
 */
export type Lang = "en" | "ar";

export const DICT = {
  en: {
    nav: { explore: "Explore", generator: "Generator", favorites: "Favorites", gradients: "Gradients" },
    hero: {
      badge: "10,000+ palettes · 17 curated categories",
      title1: "Colors that",
      titleAccent: "flow",
      title2: "into your designs",
      subtitle:
        "Explore 10,000+ palettes, generate perfect harmonies, and copy any color code. Copying is free after watching one 30-second ad — unlocked for 24 hours.",
      exploreBtn: "Explore palettes",
      generatorBtn: "Try the generator",
      unlocked: "Copy unlocked · 24h",
      adNote: "One 30s ad · unlock",
    },
    home: {
      trending: "Trending now",
      trendingSub: "The palettes designers are loving this week.",
      featured: "Editor's picks",
      featuredSub: "Hand-selected by our curation team.",
      categories: "Browse by category",
      gradients: "CSS gradients",
      gradientsSub: "Ready-to-use gradients with copyable CSS code.",
      viewAll: "View all →",
      allGradients: "All gradients →",
      palettes: "palettes",
    },
    footer: {
      about:
        "10,000+ color palettes and a harmony generator for designers and developers — try any palette live on the site, and unlock color copying with a quick 30-second ad.",
      rights: "All palettes are free to use in your projects.",
    },
  },
  ar: {
    nav: { explore: "استكشف", generator: "المولّد", favorites: "المفضلة", gradients: "تدرجات" },
    hero: {
      badge: "أكثر من 10,000 باليتة · 17 تصنيفاً منسّقاً",
      title1: "ألوان",
      titleAccent: "تتناغم",
      title2: "مع تصميماتك",
      subtitle:
        "استكشف أكثر من 10,000 باليتة، ولّد تدرجات لونية متناسقة، وانسخ أي كود لون. النسخ مجاني بعد مشاهدة إعلان واحد مدته 30 ثانية — ويبقى مفتوحاً لمدة 24 ساعة.",
      exploreBtn: "استكشف الباليتات",
      generatorBtn: "جرّب المولّد",
      unlocked: "النسخ مفتوح · 24 ساعة",
      adNote: "إعلان واحد 30 ثانية · فتح النسخ",
    },
    home: {
      trending: "الأكثر رواجاً الآن",
      trendingSub: "الباليتات التي تحبّها مجتمعة المصممين هذا الأسبوع.",
      featured: "اختيارات المحررين",
      featuredSub: "منتقاة يدوياً من فريق التنسيق لدينا.",
      categories: "تصفّح حسب التصنيف",
      gradients: "تدرجات CSS",
      gradientsSub: "تدرجات جاهزة الاستخدام مع كود CSS قابل للنسخ.",
      viewAll: "عرض الكل ←",
      allGradients: "كل التدرجات ←",
      palettes: "باليتة",
    },
    footer: {
      about:
        "أكثر من 10,000 باليتة ألوان ومولّد تدرجات للمصممين والمطورين — جرّب أي باليتة مباشرة على الموقع، وافتح نسخ الألوان بإعلان سريع مدته 30 ثانية.",
      rights: "جميع الباليتات مجانية للاستخدام في مشاريعك.",
    },
  },
} as const;

export type Dict = (typeof DICT)["en"];

/** Read the UI language from the async cookies() API (Next 15). */
export async function getLang(): Promise<Lang> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return store.get("lang")?.value === "ar" ? "ar" : "en";
}

export const isRtl = (lang: Lang) => lang === "ar";
