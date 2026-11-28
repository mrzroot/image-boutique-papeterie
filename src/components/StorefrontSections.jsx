import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CATEGORIES } from "../data/catalog";
import { formatNumber, formatPrice } from "../utils/pricing";
import ProductCard from "./ProductCard";

export function SectionHead({ title, subtitle, action = null }) {
  return (
    <div className="section-head">
      <div className="min-w-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink-main)]">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-[var(--ink-sub)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Editorial category index: names as large type, one preview image that follows focus/hover. */
export function CategoryIndex({ t, lang, counts, onSelectCategory }) {
  const cats = CATEGORIES.filter((c) => c.id !== "all");
  const [active, setActive] = useState(cats[0]?.id);
  const activeCat = cats.find((c) => c.id === active) || cats[0];
  const Arrow = lang === "fa" ? ArrowLeft : ArrowRight;

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <SectionHead title={t.categoriesTitle} subtitle={t.categoriesSubtitle} />
      <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-center">
        <ol className="md:col-span-7 border-t border-[var(--border-subtle)]">
          {cats.map((cat) => (
            <li key={cat.id}>
              <a
                href="#/shop"
                onClick={() => onSelectCategory(cat.id)}
                onMouseEnter={() => setActive(cat.id)}
                onFocus={() => setActive(cat.id)}
                className={`category-row group ${active === cat.id ? "is-active" : ""}`}
              >
                <img src={cat.image} alt="" aria-hidden="true" loading="lazy" decoding="async" width="56" height="56" className="category-row__thumb md:hidden" />                <span className="category-row__name">{t.categoryNames[cat.id]}</span>
                <span className="tabular-nums ms-auto shrink-0 whitespace-nowrap text-xs text-[var(--ink-sub)]">
                  {formatNumber(counts(cat.id), lang)} {lang === "fa" ? "محصول" : "items"}
                </span>
                <Arrow className="category-row__arrow h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
        <div className="hidden md:block md:col-span-5">
          <div className="mx-auto aspect-[4/5] max-w-[360px] overflow-hidden rounded-[3px] bg-[var(--bg-soft)]">
            <img
              key={activeCat.image}
              src={activeCat.image}
              alt={t.categoryNames[activeCat.id]}
              loading="lazy"
              decoding="async"
              width="600"
              height="750"
              className="animate-page-in h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** A titled row of product cards (bestsellers, new arrivals, related). */
export function ProductRail({ id, title, subtitle, products, cardProps, columns = 4, tone = "page" }) {
  if (!products.length) return null;
  return (
    <section id={id} className={tone === "surface" ? "border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]" : ""}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead title={title} subtitle={subtitle} />
        <div className={`mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 ${columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} showSubtitle={false} {...cardProps} isWished={cardProps.wishlist.includes(p.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** CMS-driven studio gallery as an asymmetric mosaic (one lead image + supporting tiles). */
export function GalleryMosaic({ t, lang, tiles, products, onQuickView }) {
  const items = tiles
    .map((tile) => ({ tile, product: products.find((p) => p.id === tile.productId) }))
    .filter((x) => x.tile.image)
    .slice(0, 5);
  if (!items.length) return null;
  return (
    <section id="gallery" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <SectionHead title={t.socialSection.title} subtitle={t.socialSection.hint} />
      <div className="gallery-mosaic mt-8">
        {items.map(({ tile, product }, i) => {
          const label = product ? (product[lang] || product.fa).title : t.socialSection.title;
          return (
            <button
              key={tile.id || i}
              type="button"
              disabled={!product}
              onClick={() => product && onQuickView(product, 0)}
              className="gallery-mosaic__tile group"
              aria-label={label}
            >
              <img src={tile.image} alt={label} loading="lazy" decoding="async" width="600" height="600" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
              {product && <span className="gallery-mosaic__caption">{label}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Print atelier introduction: real atelier photo + what the atelier does + entry button. */
export function AtelierIntro({ t, lang, onEnterServices }) {
  const Arrow = lang === "fa" ? ArrowLeft : ArrowRight;
  return (
    <section id="atelier" className="bg-[var(--accent-deep)] text-[#F5EFE3]">
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-[240px] md:min-h-[420px]">
          <img src="./images/atelier-services.jpg" alt={t.atelierIntro.eyebrow} loading="lazy" decoding="async" width="1376" height="768" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex items-center">
          <div className="atelier-copy py-12 lg:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{t.gatewayTitle}</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#D7E3DC]">{t.gatewayDesc}</p>
            <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {t.atelierIntro.points.map((pt) => (
                <li key={pt} className="flex items-center gap-2 text-sm text-[#F5EFE3]">
                  <span className="h-px w-4 bg-[#E7D19F]" aria-hidden="true" />
                  {pt}
                </li>
              ))}
            </ul>
            <button type="button" onClick={onEnterServices} className="btn-on-dark mt-8">
              <span>{t.gatewayButton}</span>
              <Arrow className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Trust & service promises — only facts the shop already states (CMS value strip, shipping threshold, contact). */
export function TrustSection({ t, lang, values, shipping, contact }) {
  return (
    <section id="trust" className="border-t border-[var(--border-subtle)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHead title={t.trust.title} />
        <div className="trust-grid mt-8">
          {values.map((v, i) => {
            return (
              <div key={i} className="trust-item">
                <h3 className="text-[15px] font-semibold text-[var(--ink-main)]">{v.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--ink-sub)]">{v.desc}</p>
              </div>
            );
          })}
          {shipping?.freeThreshold > 0 && (
            <div className="trust-item">
              <h3 className="text-[15px] font-semibold text-[var(--ink-main)]">{t.trust.shippingTitle}</h3>
              <p className="tabular-nums mt-1 text-sm leading-relaxed text-[var(--ink-sub)]">
                {t.trust.shipping} {formatPrice(shipping.freeThreshold, lang)}
              </p>
            </div>
          )}
          {contact?.phone && (
            <div className="trust-item">
              <h3 className="text-[15px] font-semibold text-[var(--ink-main)]">{t.trust.contactTitle}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink-sub)]">
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} dir="ltr" className="tabular-nums underline-offset-4 hover:underline">
                  {contact.phone}
                </a>
                <br />
                {lang === "fa" ? contact.hoursFa : contact.hoursEn}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
