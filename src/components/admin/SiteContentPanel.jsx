import { Plus } from "lucide-react";
import { STUDIO_IMAGE_PRESETS } from "../../data/catalog";
import { cls, useAdmin, Card, JumpNav, TextField, LocFields, ImageField, RowControls, move } from "./ui";

export default function SiteContentPanel({ cmsContent, onUpdateContent }) {
  const { s, lang, notify } = useAdmin();
  const products = cmsContent.products || [];
  const heroSlides = cmsContent.heroSlides || [];
  const valueStrip = cmsContent.valueStrip || [];
  const bundles = cmsContent.bundles || [];
  const gallery = cmsContent.socialGallery || [];

  // Patch item idx of list `key` with fn(item)
  const patchItem = (key, idx, fn) =>
    onUpdateContent((prev) => ({ ...prev, [key]: prev[key].map((x, i) => (i === idx ? fn(x) : x)) }));
  const patchLoc = (key, idx, l) => (field, val) => patchItem(key, idx, (x) => ({ ...x, [l]: { ...x[l], [field]: val } }));
  const reorder = (key, idx) => (delta) => onUpdateContent((prev) => ({ ...prev, [key]: move(prev[key], idx, delta) }));
  const removeItem = (key, idx, name) => () => {
    if (!window.confirm(s.confirmDeleteItem.replace("{name}", name))) return;
    onUpdateContent((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));
    notify(s.toastDeleted);
  };
  const setContact = (field) => (val) => onUpdateContent((prev) => ({ ...prev, contact: { ...prev.contact, [field]: val } }));

  const slideFields = [
    ["eyebrow", s.fEyebrow],
    ["title", s.fTitle],
    ["desc", s.fDescription, true],
    ["ctaPrimary", s.fButton],
  ];
  const bundleFields = [
    ["title", s.fTitle],
    ["items", s.fItems, true],
    ["tag", s.fTag],
  ];

  return (
    <section className="space-y-4">
      <div className={`${cls.card} space-y-2`}>
        <h2 className={cls.h2}>{s.navContent}</h2>
        <p className={cls.hint}>{s.autosaveHint}</p>
        <JumpNav
          label={s.navContent}
          items={[
            ["sc-announcement", s.announcement],
            ["sc-hero", s.heroSlides],
            ["sc-values", s.valueStrip],
            ["sc-story", s.story],
            ["sc-bundles", s.bundles],
            ["sc-gallery", s.socialGallery],
            ["sc-contact", s.contact],
          ]}
        />
      </div>

      <Card id="sc-announcement" title={s.announcement}>
        <div className="grid gap-3 md:grid-cols-2">
          {["fa", "en"].map((l) => (
            <TextField
              key={l}
              label={l === "fa" ? s.persian : s.english}
              dir={l === "fa" ? "rtl" : "ltr"}
              value={cmsContent.announcement?.[l]}
              onChange={(v) => onUpdateContent((prev) => ({ ...prev, announcement: { ...prev.announcement, [l]: v } }))}
            />
          ))}
        </div>
      </Card>

      <Card
        id="sc-hero"
        title={s.heroSlides}
        actions={
          <button
            type="button"
            className={cls.btnPrimary}
            onClick={() => {
              onUpdateContent((prev) => ({
                ...prev,
                heroSlides: [
                  ...prev.heroSlides,
                  {
                    id: `slide-${Date.now()}`,
                    image: STUDIO_IMAGE_PRESETS[0],
                    fa: { eyebrow: "NEW COLLECTION", title: "عنوان بنر جدید", desc: "توضیح کوتاه بنر", ctaPrimary: "مشاهده محصولات" },
                    en: { eyebrow: "NEW COLLECTION", title: "New Banner Title", desc: "Short banner subtitle", ctaPrimary: "Shop Collection" },
                  },
                ],
              }));
              notify(s.toastAdded);
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{s.addSlide}</span>
          </button>
        }
      >
        {heroSlides.map((slide, idx) => (
          <div key={slide.id || idx} className="space-y-3 border-t border-[var(--border-subtle)] pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={cls.h3}>
                {s.slide} {idx + 1}
              </h3>
              <RowControls
                index={idx}
                length={heroSlides.length}
                onMove={reorder("heroSlides", idx)}
                onDelete={heroSlides.length > 1 ? removeItem("heroSlides", idx, `${s.slide} ${idx + 1}`) : undefined}
              />
            </div>
            <ImageField label={s.image} value={slide.image} onChange={(v) => patchItem("heroSlides", idx, (x) => ({ ...x, image: v }))} />
            <div className="grid gap-3 lg:grid-cols-2">
              <LocFields l="fa" value={slide.fa} fields={slideFields} onChange={patchLoc("heroSlides", idx, "fa")} />
              <LocFields l="en" value={slide.en} fields={slideFields} onChange={patchLoc("heroSlides", idx, "en")} />
            </div>
          </div>
        ))}
      </Card>

      <Card id="sc-values" title={s.valueStrip}>
        {valueStrip.map((item, idx) => (
          <div key={idx} className="grid gap-3 lg:grid-cols-2">
            <LocFields l="fa" value={item.fa} fields={[["title", s.fTitle], ["desc", s.fDescription]]} onChange={patchLoc("valueStrip", idx, "fa")} />
            <LocFields l="en" value={item.en} fields={[["title", s.fTitle], ["desc", s.fDescription]]} onChange={patchLoc("valueStrip", idx, "en")} />
          </div>
        ))}
      </Card>

      <Card id="sc-story" title={s.story}>
        <div className="grid gap-3 lg:grid-cols-2">
          {["fa", "en"].map((l) => (
            <LocFields
              key={l}
              l={l}
              value={cmsContent.story?.[l]}
              fields={[["eyebrow", s.fEyebrow], ["title", s.fTitle], ["body", s.fBody, true]]}
              onChange={(field, val) =>
                onUpdateContent((prev) => ({ ...prev, story: { ...prev.story, [l]: { ...prev.story?.[l], [field]: val } } }))
              }
            />
          ))}
        </div>
      </Card>

      <Card
        id="sc-bundles"
        title={s.bundles}
        actions={
          <button
            type="button"
            className={cls.btnPrimary}
            onClick={() => {
              onUpdateContent((prev) => ({
                ...prev,
                bundles: [
                  ...prev.bundles,
                  {
                    id: `bundle-${Date.now()}`,
                    sku: `IB-SET-0${prev.bundles.length + 1}`,
                    originalPrice: 2000000,
                    price: 1700000,
                    savePercent: 15,
                    image: STUDIO_IMAGE_PRESETS[0],
                    fa: { title: "پک هدیه جدید", items: "توضیح اقلام پک", tag: "پک ویژه" },
                    en: { title: "New Gift Coffret", items: "Bundle items", tag: "Special Set" },
                  },
                ],
              }));
              notify(s.toastAdded);
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{s.addBundle}</span>
          </button>
        }
      >
        {bundles.map((b, idx) => (
          <div key={b.id || idx} className="space-y-3 border-t border-[var(--border-subtle)] pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={`${cls.h3} truncate`}>{(b[lang] || b.fa)?.title || b.sku}</h3>
              <RowControls index={idx} length={bundles.length} onDelete={removeItem("bundles", idx, (b[lang] || b.fa)?.title || b.sku)} />
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <ImageField label={s.image} value={b.image} onChange={(v) => patchItem("bundles", idx, (x) => ({ ...x, image: v }))} />
              <div className="grid grid-cols-2 gap-2">
                <TextField label="SKU" dir="ltr" value={b.sku} onChange={(v) => patchItem("bundles", idx, (x) => ({ ...x, sku: v }))} />
                <TextField label={s.savePercent} type="number" value={b.savePercent} onChange={(v) => patchItem("bundles", idx, (x) => ({ ...x, savePercent: v }))} />
                <TextField label={s.priceToman} type="number" value={b.price} onChange={(v) => patchItem("bundles", idx, (x) => ({ ...x, price: v }))} />
                <TextField label={s.originalPrice} type="number" value={b.originalPrice} onChange={(v) => patchItem("bundles", idx, (x) => ({ ...x, originalPrice: v }))} />
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <LocFields l="fa" value={b.fa} fields={bundleFields} onChange={patchLoc("bundles", idx, "fa")} />
              <LocFields l="en" value={b.en} fields={bundleFields} onChange={patchLoc("bundles", idx, "en")} />
            </div>
          </div>
        ))}
      </Card>

      <Card id="sc-gallery" title={s.socialGallery}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {gallery.map((tile, idx) => (
            <div key={tile.id || idx} className={`${cls.sub} space-y-2`}>
              <ImageField compact value={tile.image} onChange={(v) => patchItem("socialGallery", idx, (x) => ({ ...x, image: v }))} />
              <label className="block">
                <span className={cls.label}>{s.linkedProduct}</span>
                <select
                  value={tile.productId}
                  onChange={(e) => patchItem("socialGallery", idx, (x) => ({ ...x, productId: e.target.value }))}
                  className={cls.input}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {(p[lang] || p.fa).title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card id="sc-contact" title={s.contact}>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label={s.phone} dir="ltr" value={cmsContent.contact?.phone} onChange={setContact("phone")} />
          <TextField label={s.email} dir="ltr" type="email" value={cmsContent.contact?.email} onChange={setContact("email")} />
          <TextField label={`${s.hours} (${s.persian})`} dir="rtl" value={cmsContent.contact?.hoursFa} onChange={setContact("hoursFa")} />
          <TextField label={`${s.hours} (${s.english})`} dir="ltr" value={cmsContent.contact?.hoursEn} onChange={setContact("hoursEn")} />
        </div>
      </Card>
    </section>
  );
}
