import { useState, useEffect } from "react";
import {
  X,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { formatPrice } from "../utils/pricing";
import ProductMedia from "./ProductMedia";

export default function ProductModal({
  product,
  initialVariantIdx = 0,
  lang,
  t,
  isWishlisted,
  onToggleWishlist,
  onAddToBag,
  onClose,
}) {
  const localized = product[lang] || product.fa;
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(initialVariantIdx);
  const [qty, setQty] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setSelectedVariantIdx(initialVariantIdx);
    setQty(1);
  }, [product.id, initialVariantIdx]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const variants = localized.variants || [];
  const selectedVariant = variants[selectedVariantIdx] || variants[0] || "";
  const inStock = product.inStock !== false;

  const handleAdd = () => {
    if (!inStock) return;
    onAddToBag(product, selectedVariantIdx, qty);
    onClose();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}#/?item=${product.sku}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard restricted
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={localized.title}
        className="animate-modal-in relative grid w-full max-w-2xl lg:max-w-[760px] max-h-[88vh] overflow-y-auto rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] shadow-2xl md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 end-3 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[3px] border border-[var(--border-subtle)] bg-white text-[#14201A] transition hover:bg-[#183E30] hover:text-white"
          >
            {copiedLink ? (
              <Check className="h-3.5 w-3.5 text-[#183E30]" aria-hidden="true" />
            ) : (
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.modal.close}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[3px] border border-[var(--border-subtle)] bg-white text-[#14201A] transition hover:bg-[#14201A] hover:text-white"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Media Column: real photo, 3D presentation of it, accurate 360° only when real data exists */}
        {/* On one-column (mobile) layout the mode tabs keep clear of the share/close buttons */}
        <div className="relative bg-[var(--bg-soft)] p-4 sm:p-5 [&_[role=radiogroup]]:me-20 md:[&_[role=radiogroup]]:me-0">
          <ProductMedia product={product} variantIdx={selectedVariantIdx} lang={lang} compact />
        </div>

        {/* Details Column */}
        <div className="flex flex-col justify-between p-4 sm:p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 pe-20 text-xs uppercase tracking-widest text-[var(--ink-sub)] font-latin-ui">
              <span>{product.sku}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-[2px] px-2 py-0.5 text-[11px] font-semibold ${
                  inStock
                    ? "bg-[var(--accent-pine)]/15 text-[var(--accent-pine)]"
                    : "bg-[var(--accent-crimson)]/15 text-[var(--accent-crimson)]"
                }`}
              >
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                <span>
                  {inStock
                    ? lang === "fa"
                      ? "موجود · ارسال فوری"
                      : "In Stock"
                    : lang === "fa"
                    ? "ناموجود"
                    : "Out of Stock"}
                </span>
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--ink-main)] leading-snug">
                {localized.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[var(--accent-pine)] font-medium">
                {localized.subtitle}
              </p>
            </div>

            {localized.origin && (
              <p className="text-xs text-[var(--ink-sub)]">{localized.origin}</p>
            )}

            <p className="text-xs sm:text-sm leading-relaxed text-[var(--ink-body)]">
              {localized.description}
            </p>

            {/* Variant Picker */}
            {variants.length > 0 && (
              <div className="pt-1">
                <p className="mb-1.5 text-xs font-semibold text-[var(--ink-sub)]">
                  {t.modal.selectVariant}:{" "}
                  <span className="text-[var(--ink-main)] font-bold">{selectedVariant}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map((variant, idx) => (
                    <button
                      key={variant + idx}
                      type="button"
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`inline-flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1 text-xs font-medium transition ${
                        selectedVariantIdx === idx
                          ? "border-[var(--accent-pine)] bg-[var(--accent-pine)] text-white"
                          : "border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-main)] hover:border-[var(--accent-gold)]"
                      }`}
                    >
                      {product.swatches?.[idx] && (
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-white/50"
                          style={{ backgroundColor: product.swatches[idx] }}
                        />
                      )}
                      <span>{variant}</span>
                      {selectedVariantIdx === idx && <Check className="h-3 w-3" aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3 border-t border-[var(--border-subtle)] pt-4">
            <div className="flex items-center justify-between">
              <span className="tabular-nums text-lg font-bold text-[var(--accent-pine)]">
                {formatPrice(product.price * qty, lang)}
              </span>

              <div className="inline-flex items-center rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] p-0.5">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-1.5 text-[var(--ink-main)] hover:text-[var(--accent-crimson)]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="tabular-nums w-7 text-center text-xs sm:text-sm font-semibold text-[var(--ink-main)]">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="p-1.5 text-[var(--ink-main)] hover:text-[var(--accent-pine)]"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!inStock}
                onClick={handleAdd}
                className="flex flex-1 items-center justify-center gap-2 rounded-[3px] bg-[var(--accent-crimson)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-45"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                <span>
                  {inStock
                    ? t.addToBag
                    : lang === "fa"
                    ? "ناموجود"
                    : "Out of Stock"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-[3px] border transition ${
                  isWishlisted
                    ? "border-[var(--accent-crimson)] bg-[var(--accent-crimson)]/10 text-[var(--accent-crimson)]"
                    : "border-[var(--border-strong)] text-[var(--ink-sub)] hover:text-[var(--accent-crimson)]"
                }`}
                aria-label={t.wishlist}
              >
                <Heart
                  aria-hidden="true"
                  className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
