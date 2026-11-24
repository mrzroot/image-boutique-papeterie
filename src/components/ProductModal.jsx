import { useState } from "react";
import { X, Heart, ShoppingBag, Plus, Minus, Check } from "lucide-react";
import { formatPrice } from "../utils/pricing";

export default function ProductModal({
  product,
  lang,
  t,
  isWishlisted,
  onToggleWishlist,
  onAddToBag,
  onClose,
}) {
  const localized = product[lang];
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const selectedVariant =
    localized.variants[selectedVariantIdx] || localized.variants[0];

  const handleAdd = () => {
    onAddToBag(product, selectedVariantIdx, qty);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative grid w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#DFD7C5] bg-[#FAF7F2] shadow-2xl md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.modal.close}
          className="absolute top-4 end-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#17211C] shadow-sm transition hover:bg-[#16221C] hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-[#EFEAE1] p-6 flex items-center justify-center">
          <img
            src={product.image}
            alt={localized.title}
            className="h-72 w-full rounded-2xl object-cover shadow-sm md:h-96"
          />
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-widest text-[#5B675F] font-latin-ui">
              <span>{product.sku}</span>
              {product.badge && (
                <span className="rounded-full bg-[#1F4E3D] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  {t.badges[product.badge]}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#16221C] leading-snug">
                {localized.title}
              </h3>
              <p className="mt-1 text-sm text-[#1F4E3D] font-medium">
                {localized.subtitle}
              </p>
            </div>

            <p className="text-xs text-[#5B675F]">{localized.origin}</p>
            <p className="text-sm leading-relaxed text-[#2D3832]">
              {localized.description}
            </p>

            {/* Variant Picker */}
            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold text-[#5B675F]">
                {t.modal.selectVariant}:{" "}
                <span className="text-[#16221C]">{selectedVariant}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {localized.variants.map((variant, idx) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                      selectedVariantIdx === idx
                        ? "border-[#1F4E3D] bg-[#1F4E3D] text-white"
                        : "border-[#D8CFBE] bg-white text-[#2A3730] hover:border-[#1F4E3D]"
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
              <span className="text-xl font-bold text-[#1F4E3D]">
                {formatPrice(product.price, lang)}
              </span>

              <div className="inline-flex items-center rounded-full border border-[#D8CFBE] bg-white px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-1 text-[#17211C] hover:text-[#1F4E3D] cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="p-1 text-[#17211C] hover:text-[#1F4E3D] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#16221C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F4E3D] cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{t.addToBag}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition cursor-pointer ${
                  isWishlisted
                    ? "border-[#C83E2B] bg-[#C83E2B]/10 text-[#C83E2B]"
                    : "border-[#D8CFBE] bg-white text-[#17211C] hover:border-[#C83E2B]"
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
