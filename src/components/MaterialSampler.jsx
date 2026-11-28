import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import "./materialSampler.css";

const MaterialStage = lazy(() =>
  import("./ProductMedia3D")
    .then((module) => ({ default: module.PhotoStage3D }))
    .catch(() => ({ default: UnavailableStage }))
);

function UnavailableStage({ onFail }) {
  useEffect(() => onFail(true), [onFail]);
  return null;
}

const trays = [
  { id: "notebooks", fa: "دفتر و کاغذ", en: "Notebook & paper", color: "#c9a976", backing: "#1e493d" },
  { id: "pens", fa: "قلم و مرکب", en: "Pen & ink", color: "#d1b384", backing: "#412d26" },
  { id: "packaging", fa: "بسته‌بندی هدیه", en: "Gift packaging", color: "#ddbaa0", backing: "#5b343b" },
];

export default function MaterialSampler({ products, lang, onOpenProduct }) {
  const [activeCategory, setActiveCategory] = useState(trays[0].id);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showDepth, setShowDepth] = useState(false);
  const [depthUnavailable, setDepthUnavailable] = useState(false);
  const isPersian = lang === "fa";
  const available = trays.flatMap((tray) => {
    const product = products.find((item) => item.category === tray.id && item.image);
    return product ? [{ ...tray, product }] : [];
  });
  const active = available.find((tray) => tray.id === activeCategory) || available[0];
  if (!active) return null;

  const { product } = active;
  const details = product[lang] || product.fa;
  const variant = product.variantImages?.[selectedVariant] ? selectedVariant : 0;
  const picture = product.variantImages?.[variant] || product.image;
  const sampleLabel = details.variants?.[variant];
  const Arrow = isPersian ? ArrowUpLeft : ArrowUpRight;

  return (
    <section
      className="material-sampler"
      style={{ "--sample-color": active.color, "--sample-backing": active.backing }}
      aria-labelledby="material-sampler-title"
    >
      <div className="material-sampler__image" data-depth={showDepth && !depthUnavailable}>
        <div className="material-sampler__paper material-sampler__paper--back" aria-hidden="true" />
        <div className="material-sampler__paper material-sampler__paper--front" aria-hidden="true" />
        {showDepth && !depthUnavailable ? (
          <div className="material-sampler__depth">
            <Suspense fallback={<p role="status">{isPersian ? "در حال آماده‌سازی نما…" : "Preparing the view…"}</p>}>
              <MaterialStage
                key={picture}
                src={picture}
                lang={lang}
                onFail={setDepthUnavailable}
                heightClass="h-64 sm:h-72"
              />
            </Suspense>
          </div>
        ) : (
          <figure key={picture}>
            <img
              src={picture}
              alt={sampleLabel ? details.title + " · " + sampleLabel : details.title}
              width="600"
              height="600"
              loading="lazy"
              decoding="async"
            />
          </figure>
        )}
      </div>
      <div className="material-sampler__copy">
        <h2 id="material-sampler-title">{isPersian ? "نمونه‌ها را از نزدیک ببینید" : "The material sampler"}</h2>
        <div className="material-sampler__controls" role="group" aria-label={isPersian ? "نوع محصول" : "Product type"}>
          {available.map((tray) => (
            <button
              key={tray.id}
              type="button"
              aria-pressed={active.id === tray.id}
              onClick={() => {
                setActiveCategory(tray.id);
                setSelectedVariant(0);
              }}
            >
              {tray[lang] || tray.fa}
            </button>
          ))}
        </div>
        <p aria-live="polite"><strong>{details.title}</strong>{sampleLabel && <span>{sampleLabel}</span>}</p>
        <button
          type="button"
          className="material-sampler__toggle"
          aria-pressed={showDepth && !depthUnavailable}
          onClick={() => {
            // after a failure the click dismisses the note; the failed stage is cached, so retrying would only fail again
            if (depthUnavailable) {
              setDepthUnavailable(false);
              setShowDepth(false);
            } else {
              setShowDepth(!showDepth);
            }
          }}
        >
          {isPersian ? "نمایش سه‌بعدی عکس محصول" : "Show the product photo in 3D"}
        </button>
        {showDepth && (
          <p className="material-sampler__note" role="status">
            {depthUnavailable
              ? (isPersian ? "نمای سه‌بعدی در دسترس نیست. عکس محصول نمایش داده می‌شود." : "The 3D view is unavailable. The product photo is shown.")
              : (isPersian ? "عکس همین طرح روی یک صفحهٔ سه‌بعدی نمایش داده می‌شود." : "The selected variant’s photo appears on a 3D panel.")}
          </p>
        )}
        {product.variantImages?.length > 1 && (
          <div className="material-sampler__variants" role="group" aria-label={isPersian ? "رنگ یا طرح" : "Color or finish"}>
            {product.variantImages.map((image, index) => (
              image && <button
                key={index}
                type="button"
                aria-pressed={variant === index}
                style={{ "--sample-swatch": product.swatches?.[index] || active.color }}
                onClick={() => setSelectedVariant(index)}
              >
                {details.variants?.[index] || new Intl.NumberFormat(lang).format(index + 1)}
              </button>
            ))}
          </div>
        )}
        <a href={`#/product/${product.id}`} onClick={(event) => {
          if (!onOpenProduct || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onOpenProduct(product, variant);
        }}>
          {isPersian ? "مشاهدهٔ محصول" : "View product"}
          <Arrow size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
