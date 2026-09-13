export interface Gradient {
  slug: string;
  name: string;
  css: string; // full `background` value
  stops: string[]; // hex stops (display + contrast)
}

/**
 * Curated CSS gradients — static, code-based (no DB needed).
 * Copying a gradient's CSS follows the same 24-hour copy-access rule.
 */
export const GRADIENTS: Gradient[] = [
  { slug: "midnight-aurora", name: "Midnight Aurora", css: "linear-gradient(135deg, #0F172A 0%, #3B82F6 50%, #A855F7 100%)", stops: ["#0F172A", "#3B82F6", "#A855F7"] },
  { slug: "sunset-blush", name: "Sunset Blush", css: "linear-gradient(135deg, #F97316 0%, #EC4899 60%, #8B5CF6 100%)", stops: ["#F97316", "#EC4899", "#8B5CF6"] },
  { slug: "ocean-depth", name: "Ocean Depth", css: "linear-gradient(180deg, #0EA5E9 0%, #0369A1 55%, #082F49 100%)", stops: ["#0EA5E9", "#0369A1", "#082F49"] },
  { slug: "emerald-fresh", name: "Emerald Fresh", css: "linear-gradient(135deg, #34D399 0%, #059669 60%, #064E3B 100%)", stops: ["#34D399", "#059669", "#064E3B"] },
  { slug: "royal-luxury", name: "Royal Luxury", css: "linear-gradient(135deg, #F59E0B 0%, #B45309 45%, #1E1B4B 100%)", stops: ["#F59E0B", "#B45309", "#1E1B4B"] },
  { slug: "peach-cream", name: "Peach Cream", css: "linear-gradient(135deg, #FED7AA 0%, #FCA5A5 55%, #FDE68A 100%)", stops: ["#FED7AA", "#FCA5A5", "#FDE68A"] },
  { slug: "cyber-neon", name: "Cyber Neon", css: "linear-gradient(135deg, #020617 0%, #7C3AED 55%, #22D3EE 100%)", stops: ["#020617", "#7C3AED", "#22D3EE"] },
  { slug: "rose-dawn", name: "Rose Dawn", css: "linear-gradient(135deg, #FDA4AF 0%, #FB7185 50%, #C026D3 100%)", stops: ["#FDA4AF", "#FB7185", "#C026D3"] },
  { slug: "arctic-mist", name: "Arctic Mist", css: "linear-gradient(160deg, #F8FAFC 0%, #CBD5E1 55%, #94A3B8 100%)", stops: ["#F8FAFC", "#CBD5E1", "#94A3B8"] },
  { slug: "deep-space", name: "Deep Space", css: "linear-gradient(135deg, #020617 0%, #1E1B4B 55%, #312E81 100%)", stops: ["#020617", "#1E1B4B", "#312E81"] },
  { slug: "mint-lagoon", name: "Mint Lagoon", css: "linear-gradient(135deg, #CCFBF1 0%, #2DD4BF 55%, #0F766E 100%)", stops: ["#CCFBF1", "#2DD4BF", "#0F766E"] },
  { slug: "golden-hour", name: "Golden Hour", css: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 55%, #DC2626 100%)", stops: ["#FDE68A", "#F59E0B", "#DC2626"] },
];

export const getGradientBySlug = (slug: string) => GRADIENTS.find((g) => g.slug === slug);
