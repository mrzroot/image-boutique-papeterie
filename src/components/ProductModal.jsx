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
  Move3d,
  Image as ImageIcon,
} from "lucide-react";
import { formatPrice } from "../utils/pricing";
import Live3DPreview from "./Live3DPreview";

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
  const localized = product[lang];
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(initialVariantIdx);
  const [viewMode, setViewMode] = useState("photo");
  const [qty, setQty] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setSelectedVariantIdx(initialVariantIdx);
    setViewMode("photo");
    setQty(1);
  }, [product.id, initialVariantIdx]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const selectedVariant =
    localized.variants[selectedVariantIdx] || localized.variants[0];
  const selectedSwatchHex =
    product.swatches[selectedVariantIdx] || product.swatches[0];
  const activeImage =
    product.variantImages?.[selectedVariantIdx] || product.image;
  const supports3D = ["notebooks", "papers", "packaging"].includes(
    product.category
  );

  const handleAdd = () => {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={localized.title}
        className="animate-modal-in relative grid w-full max-w-3xl overflow-hidden rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-page)] shadow-2xl md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 end-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[3px] border border-[var(--border-subtle)] bg-white text-[#14201A] transition hover:bg-[#183E30] hover:text-white"
          >
            {copiedLink ? (
              <Check className="h-4 w-4 text-[#183E30]" aria-hidden="true" />
            ) : (
              <Share2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.modal.close}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[3px] border border-[var(--border-subtle)] bg-white text-[#14201A] transition hover:bg-[#14201A] hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="relative bg-[var(--bg-soft)] p-6 flex flex-col items-center justify-center gap-3">
          {supports3D && (
            <div className="inline-flex rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode("photo")}
                className={`inline-flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 transition ${
                  viewMode === "photo"
                    ? "bg-[var(--accent-pine)] text-white"
                    : "text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{lang === "fa" ? "عکس استودیو" : "Studio Photo"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={`inline-flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 transition ${
                  viewMode === "3d"
                    ? "bg-[var(--accent-pine)] text-white"
                    : "text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
                }`}
              >
                <Move3d className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{lang === "fa" ? "نمای ۳۶۰° واقعی" : "360° 3D View"}</span>
              </button>
            </div>
          )}

          {supports3D && viewMode === "3d" ? (
            <div className="w-full rounded-[4px] bg-[#123126] p-1 border border-[var(--border-subtle)]">
              <Live3DPreview
                compact
                config={{
                  printType: "color",
                  size: product.id === "nb-linen-forest" ? "A5" : "A4",
                  paperStock: "cotton240",
                  binding:
                    product.category === "notebooks" ? "hardcover" : "perfect",
                  pages: 180,
                }}
                customTitle={localized.title}
                customHex={selectedSwatchHex}
                t={t}
              />
            </div>
          ) : (
            <div className="relative w-full overflow-hidden rounded-[4px] border border-[var(--border-subtle)]">
              <img
                src={activeImage}
                alt={localized.title}
                width="480"
                height="480"
                className="aspect-square max-h-[360px] w-full object-cover"
              />
              {selectedSwatchHex && (
                <div className="absolute bottom-3 start-3 inline-flex items-center gap-2 rounded-[3px] border border-[var(--border-subtle)] bg-[#FAF6EE] px-3 py-1 text-[11px] font-bold text-[#14201A]">
                  <span
                    className="h-3 w-3 rounded-full border border-black/20"
                    style={{ backgroundColor: selectedSwatchHex }}
                  />
                  <span>{selectedVariant}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 pe-24 text-[11px] uppercase tracking-widest text-[var(--ink-sub)] font-latin-ui">
              <span>{product.sku}</span>
              <span className="inline-flex items-center gap-1 rounded-[2px] bg-[var(--accent-pine)]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--accent-pine)]">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                <span>{lang === "fa" ? "موجود · ارسال فوری" : "In Stock"}</span>
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink-main)] leading-snug">
                {localized.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--accent-pine)] font-medium">
                {localized.subtitle}
              </p>
            </div>

            <p className="text-xs text-[var(--ink-sub)]">{localized.origin}</p>

            <p className="text-sm leading-relaxed text-[var(--ink-body)]">
              {localized.description}
            </p>

            {/* Variant Picker */}
            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold text-[var(--ink-sub)]">
                {t.modal.selectVariant}:{" "}
                <span className="text-[var(--ink-main)] font-bold">{selectedVariant}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {localized.variants.map((variant, idx) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`inline-flex items-center gap-2 rounded-[3px] border px-3 py-1.5 text-xs font-medium transition ${
                      selectedVariantIdx === idx
                        ? "border-[var(--accent-pine)] bg-[var(--accent-pine)] text-white"
                        : "border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-main)] hover:border-[var(--accent-gold)]"
                    }`}
                  >
                    {product.swatches[idx] && (
                      <span
                        className="h-3 w-3 rounded-full border border-white/50"
                        style={{ backgroundColor: product.swatches[idx] }}
                      />
                    )}
                    <span>{variant}</span>
                    {selectedVariantIdx === idx && <Check className="h-3 w-3" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-[var(--border-subtle)] pt-5">
            <div className="flex items-center justify-between">
              <span className="tabular-nums text-xl font-bold text-[var(--accent-pine)]">
                {formatPrice(product.price * qty, lang)}
              </span>

              <div className="inline-flex items-center rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-2 text-[var(--ink-main)] hover:text-[var(--accent-crimson)]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="tabular-nums w-8 text-center text-sm font-semibold text-[var(--ink-main)]">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="p-2 text-[var(--ink-main)] hover:text-[var(--accent-pine)]"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleAdd}
                className="flex flex-1 items-center justify-center gap-2 rounded-[3px] bg-[var(--accent-crimson)] px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                <span>{t.addToBag}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-[3px] border transition ${
                  isWishlisted
                    ? "border-[var(--accent-crimson)] bg-[var(--accent-crimson)]/10 text-[var(--accent-crimson)]"
                    : "border-[var(--border-strong)] text-[var(--ink-sub)] hover:text-[var(--accent-crimson)]"
                }`}
                aria-label={t.wishlist}
              >
                <Heart
                  aria-hidden="true"
                  className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
