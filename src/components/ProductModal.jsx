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
  Star,
} from "lucide-react";
import { formatPrice, formatNumber } from "../utils/pricing";

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
  const [qty, setQty] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [sessionReviews, setSessionReviews] = useState([]);

  useEffect(() => {
    setSelectedVariantIdx(initialVariantIdx);
    setQty(1);
    setReviewOpen(false);
  }, [product.id, initialVariantIdx]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewNote.trim()) return;
    setSessionReviews((prev) => [
      { id: Date.now(), name: reviewName.trim(), note: reviewNote.trim(), rating: reviewRating },
      ...prev,
    ]);
    setReviewName("");
    setReviewNote("");
    setReviewOpen(false);
  };

  const selectedVariant =
    localized.variants[selectedVariantIdx] || localized.variants[0];
  const selectedSwatchHex =
    product.swatches[selectedVariantIdx] || product.swatches[0];

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="animate-modal-in relative grid w-full max-w-3xl overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-page)] shadow-2xl md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 end-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#14201A] shadow-sm transition hover:bg-[#1B4636] hover:text-white cursor-pointer"
          >
            {copiedLink ? (
              <Check className="h-4 w-4 text-[#1B4636]" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.modal.close}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#14201A] shadow-sm transition hover:bg-[#14201A] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative bg-[var(--bg-soft)] p-6 flex items-center justify-center">
          <div className="relative w-full overflow-hidden rounded-2xl shadow-md">
            <img
              src={product.image}
              alt={localized.title}
              className="aspect-square max-h-[360px] w-full object-cover transition duration-500 hover:scale-105"
            />
            {selectedSwatchHex && (
              <div className="absolute bottom-3 start-3 inline-flex items-center gap-2 rounded-full bg-[#FAF6EE]/92 px-3 py-1 text-[11px] font-bold text-[#14201A] shadow-sm backdrop-blur-xs">
                <span
                  className="h-3 w-3 rounded-full border border-black/20"
                  style={{ backgroundColor: selectedSwatchHex }}
                />
                <span>{selectedVariant}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 pe-20 text-[11px] uppercase tracking-widest text-[var(--ink-sub)] font-latin-ui">
              <span>{product.sku}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-pine)]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--accent-pine)]">
                <CheckCircle2 className="h-3 w-3" />
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
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--accent-gold)]">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{formatNumber(product.rating || 4.9, lang)}</span>
                <span className="text-[var(--ink-sub)] font-normal">
                  ({formatNumber((product.reviewCount || 18) + sessionReviews.length, lang)}{" "}
                  {lang === "fa" ? "دیدگاه" : "reviews"})
                </span>
              </span>
              <button
                type="button"
                onClick={() => setReviewOpen((o) => !o)}
                className="text-[11px] font-semibold text-[var(--accent-pine)] underline underline-offset-4 cursor-pointer"
              >
                {lang === "fa" ? "ثبت دیدگاه سریع" : "Write a Review"}
              </button>
            </div>

            {reviewOpen && (
              <form
                onSubmit={handleReviewSubmit}
                className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-3 text-xs"
              >
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      className={`cursor-pointer ${
                        n <= reviewRating ? "text-[var(--accent-gold)]" : "text-[var(--border-strong)]"
                      }`}
                    >
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder={lang === "fa" ? "نام شما" : "Your name"}
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--ink-main)] outline-none"
                />
                <input
                  type="text"
                  required
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={lang === "fa" ? "نظر کوتاه درباره این محصول..." : "Short note about this item..."}
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--ink-main)] outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[var(--accent-pine)] px-3.5 py-1 text-[11px] font-bold text-white cursor-pointer"
                >
                  {lang === "fa" ? "ارسال دیدگاه" : "Post Review"}
                </button>
              </form>
            )}

            {sessionReviews.length > 0 && (
              <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {sessionReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] px-3 py-1.5 text-[11px]"
                  >
                    <span className="font-bold text-[var(--ink-main)]">{rev.name}: </span>
                    <span className="text-[var(--ink-body)]">{rev.note}</span>
                  </div>
                ))}
              </div>
            )}

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
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                      selectedVariantIdx === idx
                        ? "border-[var(--accent-pine)] bg-[var(--accent-pine)] text-white shadow-xs"
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
                    {selectedVariantIdx === idx && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--border-subtle)] pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[var(--accent-pine)]">
                {formatPrice(product.price * qty, lang)}
              </span>

              <div className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-1 text-[var(--ink-main)]">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-1 text-[var(--ink-main)] hover:text-[var(--accent-gold)] cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="p-1 text-[var(--ink-main)] hover:text-[var(--accent-gold)] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent-deep)] border border-[var(--accent-gold)]/35 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-pine)] cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 text-[#E7D19F]" />
                <span>{t.addToBag}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition cursor-pointer ${
                  isWishlisted
                    ? "border-[#BF3927] bg-[#BF3927]/10 text-[#BF3927]"
                    : "border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-main)] hover:border-[#BF3927]"
                }`}
              >
                <Heart
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
