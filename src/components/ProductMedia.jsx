// Placeholder until the three-mode viewer branch (redesign/viewer-3d) is merged; replaced wholesale then.
export default function ProductMedia({ product, variantIdx = 0, lang }) {
  const loc = product[lang] || product.fa;
  const src = product.variantImages?.[variantIdx] || product.image;
  return (
    <div className="aspect-square overflow-hidden rounded-[3px] bg-[var(--bg-soft)]">
      <img src={src} alt={loc.title} width="900" height="900" className="h-full w-full object-contain" />
    </div>
  );
}
