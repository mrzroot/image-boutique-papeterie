import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { formatPrice, formatNumber } from "../utils/pricing";
import ProductMedia from "./ProductMedia";
import { ProductRail } from "./StorefrontSections";

export default function ProductPage({
  product,
  products,
  initialVariantIdx = 0,
  lang,
  t,
  wishlist,
  onToggleWishlist,
  onAddToBag,
  onQuickView,
  onOpenProduct,
  onBack,
}) {
  const [variantIdx, setVariantIdx] = useState(initialVariantIdx);
  const [qty, setQty] = useState(1);
  const P = t.productPage;
  const BackIcon = lang === "fa" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    setVariantIdx(initialVariantIdx);
    setQty(1);
  }, [product?.id, initialVariantIdx]);

  useEffect(() => {
    if (!product) return;
    const loc = product[lang] || product.fa;
    const prev = document.title;
    document.title = `${loc.title} | ${t.brandMain}`;
    return () => {
      document.title = prev;
    };
  }, [product, lang, t.brandMain]);

  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-[var(--ink-sub)]">{P.notFound}</p>
        <button type="button" onClick={onBack} className="btn-quiet mt-6">
          <BackIcon className="h-4 w-4" aria-hidden="true" />
          <span>{P.back}</span>
        </button>
      </main>
    );
  }

  const loc = product[lang] || product.fa;
  const variants = loc.variants || [];
  const inStock = product.inStock !== false;
  const isWished = wishlist.includes(product.id);
  const related = products
    .filter((p) => p.visible !== false && p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.visible !== false && p.id !== product.id && p.category !== product.category))
    .slice(0, 4);
  const specs = product.specs3d?.[lang] || product.specs3d?.fa;

  return (
    <main className="animate-page-in">
      <nav aria-label={lang === "fa" ? "مسیر صفحه" : "Breadcrumb"} className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-sub)]">
          <li>
            <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 hover:text-[var(--ink-main)]">
              <BackIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {P.back}
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{t.categoryNames[product.category]}</li>
        </ol>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:gap-12">
        <div className="mx-auto w-full max-w-[600px] lg:col-span-6">
          <ProductMedia product={product} variantIdx={variantIdx} lang={lang} />
        </div>

        <div className="lg:col-span-6 lg:sticky lg:top-28 lg:self-start">
          <h1 className="text-3xl sm:text-[2.5rem] font-bold leading-[1.35] text-[var(--ink-main)]">{loc.title}</h1>
          <p className="mt-2 text-[15px] text-[var(--ink-sub)]">{loc.subtitle}</p>

          <p className="tabular-nums mt-6 text-2xl font-semibold text-[var(--accent-pine)]">{formatPrice(product.price * qty, lang)}</p>
          {qty > 1 && (
            <p className="tabular-nums mt-1 text-xs text-[var(--ink-sub)]">
              {formatPrice(product.price, lang)} × {formatNumber(qty, lang)}
            </p>
          )}

          {variants.length > 0 && (
            <fieldset className="mt-7">
              <legend className="text-sm text-[var(--ink-sub)]">
                {t.modal.selectVariant}: <span className="font-semibold text-[var(--ink-main)]">{variants[variantIdx]}</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {variants.map((v, idx) => (
                  <button
                    key={v + idx}
                    type="button"
                    aria-pressed={variantIdx === idx}
                    onClick={() => setVariantIdx(idx)}
                    className={`variant-pill ${variantIdx === idx ? "is-on" : ""}`}
                  >
                    {product.swatches?.[idx] && <span className="swatch" style={{ backgroundColor: product.swatches[idx] }} aria-hidden="true" />}
                    <span>{v}</span>
                    {variantIdx === idx && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="qty-stepper" role="group" aria-label={P.quantity}>
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={lang === "fa" ? "کم کردن تعداد" : "Decrease quantity"} disabled={qty <= 1}>
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <output className="tabular-nums" aria-live="polite">{formatNumber(qty, lang)}</output>
              <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label={lang === "fa" ? "افزایش تعداد" : "Increase quantity"} disabled={qty >= 99}>
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              disabled={!inStock}
              onClick={() => onAddToBag(product, variantIdx, qty)}
              className="btn-primary flex-1"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span>{inStock ? t.addToBag : P.outOfStock}</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleWishlist(product.id)}
              aria-pressed={isWished}
              aria-label={`${t.wishlist}: ${loc.title}`}
              className={`icon-btn ${isWished ? "text-[var(--accent-crimson)]" : ""}`}
            >
              <Heart className={`h-4 w-4 ${isWished ? "fill-current" : ""}`} aria-hidden="true" />
            </button>
          </div>
          <p className={`mt-3 text-xs ${inStock ? "text-[var(--accent-pine)]" : "text-[var(--accent-crimson)]"}`}>
            {inStock ? P.inStock : P.outOfStock}
          </p>

          <dl className="spec-list mt-8">
            <div>
              <dt>{P.details}</dt>
              <dd>{loc.description}</dd>
            </div>
            {specs && (
              <div>
                <dt>{P.specs}</dt>
                <dd>{specs}</dd>
              </div>
            )}
            {loc.origin && (
              <div>
                <dt>{P.origin}</dt>
                <dd>{loc.origin}</dd>
              </div>
            )}
            <div>
              <dt>{P.sku}</dt>
              <dd className="tabular-nums"><bdi dir="ltr">{product.sku}</bdi></dd>
            </div>
          </dl>
        </div>
      </section>

      <ProductRail
        id="related"
        tone="surface"
        title={P.related}
        products={related}
        cardProps={{ lang, t, wishlist, onToggleWishlist, onAddToBag, onQuickView, onOpenProduct }}
      />
    </main>
  );
}
