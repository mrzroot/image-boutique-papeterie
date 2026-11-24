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

  useEffect(() => {
    setSelectedVariantIdx(initialVariantIdx);
    setQty(1);
  }, [product.id, initialVariantIdx]);

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
        className="animate-modal-in relative grid w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#DFD7C5] bg-[#FAF6EE] shadow-2xl md:grid-cols-2"
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

        <div className="relative bg-[#EFE8DA] p-6 flex items-center justify-center">
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
            <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-widest text-[#58655C] font-latin-ui">
              <span>{product.sku}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1B4636]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#1B4636]">
                <CheckCircle2 className="h-3 w-3" />
                <span>{lang === "fa" ? "موجود · ارسال فوری" : "In Stock"}</span>
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#14201A] leading-snug">
                {localized.title}
              </h3>
              <p className="mt-1 text-sm text-[#1B4636] font-medium">
                {localized.subtitle}
              </p>
            </div>

            <p className="text-xs text-[#58655C]">{localized.origin}</p>
            <p className="text-sm leading-relaxed text-[#2D3832]">
              {localized.description}
            </p>

            {/* Variant Picker */}
            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold text-[#58655C]">
                {t.modal.selectVariant}:{" "}
                <span className="text-[#14201A] font-bold">{selectedVariant}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {localized.variants.map((variant, idx) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                      selectedVariantIdx === idx
                        ? "border-[#1B4636] bg-[#1B4636] text-white shadow-xs"
                        : "border-[#D8CFBE] bg-white text-[#2A3730] hover:border-[#1B4636]"
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

          <div className="mt-6 border-t border-[#E5DEC9] pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#1B4636]">
                {formatPrice(product.price * qty, lang)}
              </span>

              <div className="inline-flex items-center rounded-full border border-[#D8CFBE] bg-white px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-1 text-[#14201A] hover:text-[#1B4636] cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="p-1 text-[#14201A] hover:text-[#1B4636] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#14201A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B4636] cursor-pointer"
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
                    : "border-[#D8CFBE] bg-white text-[#14201A] hover:border-[#BF3927]"
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
