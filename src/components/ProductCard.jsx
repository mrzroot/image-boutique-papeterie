import { useState } from "react";
import { Heart, Plus, Eye } from "lucide-react";
import { formatPrice } from "../utils/pricing";

// One card for every product grid (favorites, new arrivals, catalog, related).
export default function ProductCard({
  product,
  lang,
  t,
  isWished,
  onToggleWishlist,
  onAddToBag,
  onQuickView,
  onOpenProduct,
  showSubtitle = true,
}) {
  const [variantIdx, setVariantIdx] = useState(0);
  const loc = product[lang] || product.fa;
  const variants = loc.variants || [];
  const image = product.variantImages?.[variantIdx] || product.image;
  const inStock = product.inStock !== false;
  const quickLabel = lang === "fa" ? "مشاهده سریع" : "Quick view";

  return (
    <article className="product-card group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-[3px] bg-[var(--bg-soft)]">
        <a
          href={`#/product/${product.id}`}
          onClick={(e) => {
            if (!onOpenProduct) return;
            e.preventDefault();
            onOpenProduct(product, variantIdx);
          }}
          className="block h-full w-full"
          aria-label={loc.title}
        >
          <img
            key={image}
            src={image}
            alt={variants[variantIdx] ? `${loc.title} · ${variants[variantIdx]}` : loc.title}
            loading="lazy"
            decoding="async"
            width="600"
            height="600"
            className="product-card__img h-full w-full object-contain"
          />
        </a>

        {(product.badge === "new" || product.badge === "limited") && (
          <span
            className={`pointer-events-none absolute top-3 start-3 rounded-[2px] px-2 py-0.5 text-xs font-semibold ${
              product.badge === "new"
                ? "bg-[var(--accent-crimson)] text-white"
                : "bg-[var(--accent-deep)] text-[#F3E4BD]"
            }`}
          >
            {t.badges[product.badge]}
          </span>
        )}

        <div className="absolute top-2.5 end-2.5 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            aria-label={`${t.wishlist}: ${loc.title}`}
            aria-pressed={isWished}
            className={`icon-chip ${isWished ? "text-[var(--accent-crimson)]" : "text-[var(--ink-sub)] hover:text-[var(--accent-crimson)]"}`}
          >
            <Heart aria-hidden="true" className={`h-4 w-4 ${isWished ? "fill-current" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => onQuickView(product, variantIdx)}
            aria-label={`${quickLabel}: ${loc.title}`}
            title={quickLabel}
            className="icon-chip product-card__reveal text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
          >
            <Eye aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <a
          href={`#/product/${product.id}`}
          onClick={(e) => {
            if (!onOpenProduct) return;
            e.preventDefault();
            onOpenProduct(product, variantIdx);
          }}
          className="text-sm sm:text-[15px] font-semibold leading-snug text-[var(--ink-main)] hover:text-[var(--accent-pine)]"
        >
          {loc.title}
        </a>
        <span className="tabular-nums shrink-0 whitespace-nowrap text-sm font-semibold text-[var(--accent-pine)]">
          {formatPrice(product.price, lang)}
        </span>
      </div>
      {showSubtitle && (
        <p className="mt-1 text-xs text-[var(--ink-sub)] line-clamp-1">{loc.subtitle}</p>
      )}

      <div className="mt-3 flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-h-5 min-w-0 items-center gap-2">
          {product.swatches?.length > 1 && (
            <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label={t.modal?.selectVariant || "Variant"}>
              {product.swatches.map((hex, idx) => (
                <button
                  key={hex + idx}
                  type="button"
                  aria-pressed={variantIdx === idx}
                  aria-label={variants[idx] || hex}
                  title={variants[idx] || hex}
                  onClick={() => setVariantIdx(idx)}
                  className={`swatch ${variantIdx === idx ? "swatch--on" : ""}`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          )}
          <span className="truncate text-xs text-[var(--ink-sub)]">{variants[variantIdx]}</span>
        </div>

        <button
          type="button"
          disabled={!inStock}
          onClick={() => onAddToBag(product, variantIdx, 1)}
          className="btn-quiet shrink-0"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{inStock ? t.addToBag : lang === "fa" ? "ناموجود" : "Sold out"}</span>
        </button>
      </div>
    </article>
  );
}
