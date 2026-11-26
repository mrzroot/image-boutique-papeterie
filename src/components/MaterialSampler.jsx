import { useState } from "react";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import "./materialSampler.css";

const trays = [
  { id: "notebooks", fa: "دفتر و کاغذ", en: "Notebook & paper", color: "#c9a976", backing: "#1e493d" },
  { id: "pens", fa: "قلم و مرکب", en: "Pen & ink", color: "#d1b384", backing: "#412d26" },
  { id: "packaging", fa: "بسته‌بندی هدیه", en: "Gift packaging", color: "#ddbaa0", backing: "#5b343b" },
];

export default function MaterialSampler({ products, lang, onOpenProduct }) {
  const [activeCategory, setActiveCategory] = useState(trays[0].id);
  const [selectedVariant, setSelectedVariant] = useState(0);
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
      <div className="material-sampler__image">
        <div className="material-sampler__paper material-sampler__paper--back" aria-hidden="true" />
        <div className="material-sampler__paper material-sampler__paper--front" aria-hidden="true" />
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
