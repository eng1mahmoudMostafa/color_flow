import type { Metadata } from "next";
import { DICT, getLang } from "@/lib/i18n";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `About ${SITE_NAME}`,
  description: `Learn about ${SITE_NAME}, a free color palette and harmony generator for designers and developers.`,
};

export default async function AboutPage() {
  const lang = await getLang();
  const t = DICT[lang].footer;
  const isRtl = lang === "ar";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8" dir={isRtl ? "rtl" : "ltr"}>
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t.aboutLink}</h1>
        <p className="mt-2 text-sm text-ink-faint">
          {SITE_NAME} — أداة ألوان مجانية للمصممين والمطورين
        </p>
      </header>

      <article className="space-y-8 prose prose-sm dark:prose-invert max-w-none">
        <section>
          <h2 className="text-xl font-bold tracking-tight mb-3">عن موقع ColorFlow</h2>
          <p className="mb-3 leading-relaxed text-ink-soft">
            ColorFlow منصة مجانية لاستعراض وتوليد باليتات الألوان(diverse) وتناغم الألوان، موجهة للمصممين والمطورين الذين يبحثون عن إلهام لوني سريع ودقيق لمشاريعهم.
          </p>
          <p className="mb-3 leading-relaxed text-ink-soft">
            يوفر الموقع أكثر من 10,000 باليتة مصفاة حسب الفئات، مع مولّد تناغم لوني يدعم الأنماط الأحادية والمتجاورة والمتكاملة والثلاثية والرباعية، بالإضافة إلى قيم RGB/HSL/CMYK ودرجات التباين وفق معيار WCAG 2.1.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight mb-3">ماذا يقدم الموقع؟</h2>
          <ul className="ml-5 space-y-2 list-disc text-ink-soft">
            <li>تصفح باليتات الألوان حسب الفئة (طبيعي، محايد، محيط، صحراوي، إلخ).</li>
            <li>توليد تناغم لوني فوري مع preview مباشر.</li>
            <li>عرض تفاصيل كل لون: HEX, RGB, HSL, CMYK.</li>
            <li>درجة تباين WCAG 2.1 لكل باليتة.</li>
            <li>تدرجات CSSجاهزة للاستخدام.</li>
            <li>نسخ أكواد الألوان بعد مشاهدة إعلان قصير (24 ساعة صلاحية).</li>
            <li>حفظ باليتات المفضلة محلياً في المتصفح.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight mb-3">فريق العمل</h2>
          <p className="mb-3 leading-relaxed text-ink-soft">
            الموقع由 تطوير وتصميم <strong>البشمهندس محمود مصطفى</strong>، ويهدف إلى توفير أداة لونية مجانية وسهلة الاستخدام لكل من يهتم بالتصميم والتطوير.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight mb-3">لماذا ColorFlow؟</h2>
          <p className="mb-3 leading-relaxed text-ink-soft">
            لأن اختيار الألوان الصحيحة يؤثر على تجربة المستخدم وعلامة商ارية لمشروعك. ColorFlow يساعدك على اتخاذ قرارات لونية مبنية على أساس علمي وسريع، دون تعقيد.
          </p>
        </section>
      </article>

      <div className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 border-t border-line text-xs text-ink-faint">
        <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700">
          <span className="rtl-arrow">←</span> Back to home
        </Link>
      </div>
    </div>
  );
}
