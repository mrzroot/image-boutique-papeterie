import { Plus, Trash2 } from "lucide-react";
import { CATEGORIES, MODEL_TYPES } from "../../data/catalog";
import { formatPrice } from "../../utils/pricing";
import { cls, useAdmin, Card, JumpNav, TextField, LocFields, ImgPreview, ImageField, ImageListField, Tag } from "./ui";

const SPIN_MIN = 8;

export default function ProductEditor({ product: p, isNew, dirty, onChange, onSave, onCancel }) {
  const { s, t, lang, notify } = useAdmin();
  const set = (patch) => onChange((prev) => ({ ...prev, ...patch }));
  // ImageListField may pass an updater fn(prevList) after async uploads
  const setList = (key) => (v) => onChange((prev) => ({ ...prev, [key]: typeof v === "function" ? v(prev[key]) : v }));
  // The main photo IS the first variant's photo (the storefront shows variantImages[0] first); `image` mirrors it
  const mainImage = p.variantImages?.[0] || p.image;
  const setVariantImage = (vIdx, val) =>
    onChange((prev) => {
      const next = [...(prev.variantImages || [])];
      next[vIdx] = val;
      return vIdx === 0 ? { ...prev, image: val, variantImages: next } : { ...prev, variantImages: next };
    });
  const setLoc = (l, key, val) => onChange((prev) => ({ ...prev, [l]: { ...prev[l], [key]: val } }));
  const variants = p.fa.variants || [];
  const spinCount = (p.spinImages || []).filter((x) => x?.trim()).length;
  const modelUrl = p.model3dUrl || "";
  const modelExtOk = !modelUrl.trim() || /\.(glb|gltf)([?#].*)?$/i.test(modelUrl.trim());
  // Only site-relative paths or https URLs (no javascript:, data:, http: or protocol-relative //host)
  const modelUrlOk = !modelUrl.trim() || /^(\.\/|\/(?!\/)|https:\/\/)/i.test(modelUrl.trim());

  const copyFields = (l) => [
    ["title", s.fTitle, false, l === "fa"],
    ["subtitle", s.fSubtitle],
    ["origin", s.fOrigin],
    ["description", s.fDescription, true],
  ];

  const removeVariant = (vIdx) =>
    onChange((prev) => ({
      ...prev,
      swatches: (prev.swatches || []).filter((_, i) => i !== vIdx),
      variantImages: (prev.variantImages || []).filter((_, i) => i !== vIdx),
      fa: { ...prev.fa, variants: prev.fa.variants.filter((_, i) => i !== vIdx) },
      en: { ...prev.en, variants: (prev.en.variants || []).filter((_, i) => i !== vIdx) },
    }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!modelUrlOk) {
          notify(s.model3dUrlInvalid);
          document.getElementById("pe-model-url")?.focus();
          return;
        }
        onSave();
      }}
      className="space-y-4"
    >
      <div className={`${cls.card} space-y-3`}>
        <div className="flex items-center gap-3">
          <ImgPreview src={mainImage} className="h-12 w-12" />
          <div className="min-w-0 flex-1">
            <p className={cls.hint}>{isNew ? s.newProduct : s.editProduct}</p>
            <h2 className={`${cls.h2} truncate`}>{p[lang]?.title || p.fa.title || p.sku}</h2>
          </div>
        </div>
        <JumpNav
          label={s.formSections}
          items={[
            ["pe-basics", s.gBasics],
            ["pe-pricing", s.gPricing],
            ["pe-variants", s.gVariants],
            ["pe-media", s.gMedia],
            ["pe-visibility", s.gVisibility],
          ]}
        />
      </div>

      <Card id="pe-basics" title={s.gBasics}>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="SKU" dir="ltr" required value={p.sku} onChange={(v) => set({ sku: v })} />
          <label className="block min-w-0">
            <span className={cls.label}>{s.category}</span>
            <select value={p.category} onChange={(e) => set({ category: e.target.value })} className={cls.input}>
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <option key={c.id} value={c.id}>
                  {t.categoryNames[c.id]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <LocFields l="fa" value={p.fa} fields={copyFields("fa")} onChange={(k, v) => setLoc("fa", k, v)} />
          <LocFields l="en" value={p.en} fields={copyFields("en")} onChange={(k, v) => setLoc("en", k, v)} />
        </div>
        <p className={cls.hint}>{s.enFallbackHint}</p>
      </Card>

      <Card id="pe-pricing" title={s.gPricing}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <TextField label={s.priceToman} type="number" min={0} required value={p.price} onChange={(v) => set({ price: v })} />
            <p className={`${cls.hint} mt-1 tabular-nums`}>{formatPrice(p.price, lang)}</p>
          </div>
          <label className="inline-flex items-center gap-2 self-start pt-6 text-sm font-semibold">
            <input type="checkbox" className="h-4 w-4" checked={p.inStock !== false} onChange={(e) => set({ inStock: e.target.checked })} />
            <span>{s.inStock}</span>
          </label>
        </div>
      </Card>

      <Card
        id="pe-variants"
        title={s.gVariants}
        actions={
          <button
            type="button"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                swatches: [...(prev.swatches || []), "#1F4E3D"],
                variantImages: [...(prev.variantImages || []), prev.image],
                fa: { ...prev.fa, variants: [...(prev.fa.variants || []), "مدل جدید"] },
                en: { ...prev.en, variants: [...(prev.en.variants || []), "New Variant"] },
              }))
            }
            className={cls.btnPrimary}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{s.addVariant}</span>
          </button>
        }
      >
        <p className={cls.hint}>{s.variantsHint}</p>
        <ol className="space-y-2">
          {variants.map((vName, vIdx) => (
            <li key={vIdx} className={`${cls.sub} grid gap-3 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start`}>
              <label className="block">
                <span className={cls.label}>{s.swatch}</span>
                <input
                  type="color"
                  value={p.swatches?.[vIdx] || "#1F4E3D"}
                  onChange={(e) =>
                    onChange((prev) => {
                      const next = [...(prev.swatches || [])];
                      next[vIdx] = e.target.value;
                      return { ...prev, swatches: next };
                    })
                  }
                  className="h-9 w-12 cursor-pointer rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)]"
                />
              </label>
              <div className="grid min-w-0 gap-2 sm:grid-cols-2 md:grid-cols-1">
                <TextField
                  label={s.variantNameFa}
                  dir="rtl"
                  value={vName}
                  onChange={(v) =>
                    onChange((prev) => {
                      const next = [...prev.fa.variants];
                      next[vIdx] = v;
                      return { ...prev, fa: { ...prev.fa, variants: next } };
                    })
                  }
                />
                <TextField
                  label={s.variantNameEn}
                  dir="ltr"
                  value={p.en.variants?.[vIdx]}
                  onChange={(v) =>
                    onChange((prev) => {
                      const next = [...(prev.en.variants || [])];
                      next[vIdx] = v;
                      return { ...prev, en: { ...prev.en, variants: next } };
                    })
                  }
                />
              </div>
              <ImageField
                compact
                label={s.variantImage}
                value={p.variantImages?.[vIdx] || p.image}
                onChange={(val) => setVariantImage(vIdx, val)}
              />
              {variants.length > 1 && (
                <button type="button" onClick={() => removeVariant(vIdx)} className={`${cls.iconDanger} md:mt-5`} aria-label={s.removeVariant}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ol>
      </Card>

      <Card id="pe-media" title={s.gMedia}>
        <div className="space-y-1">
          <ImageField label={s.mainImage} value={mainImage} onChange={(val) => setVariantImage(0, val)} />
          <p className={cls.hint}>{s.mainImageHint}</p>
        </div>
        <ImageListField label={s.gallery} hint={s.galleryHint} value={p.gallery} onChange={setList("gallery")} />
        <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
          <ImageListField label={s.spinImages} hint={s.spinHint} value={p.spinImages} onChange={setList("spinImages")} />
          {spinCount > 0 && (
            <Tag tone={spinCount >= SPIN_MIN ? "pine" : "gold"}>
              {spinCount >= SPIN_MIN ? s.spinReady : s.spinNotReady.replace("{n}", spinCount).replace("{min}", SPIN_MIN)}
            </Tag>
          )}
        </div>
        <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
          <TextField
            id="pe-model-url"
            label={s.model3dUrl}
            dir="ltr"
            placeholder="./models/product.glb"
            value={modelUrl}
            aria-invalid={!modelUrlOk || undefined}
            onChange={(v) => set({ model3dUrl: v })}
          />
          <p className={cls.hint}>{s.model3dHint}</p>
          {!modelUrlOk ? (
            <p className="text-xs font-semibold text-[var(--accent-crimson)]">{s.model3dUrlInvalid}</p>
          ) : (
            !modelExtOk && <p className="text-xs font-semibold text-[var(--accent-crimson)]">{s.model3dExtWarn}</p>
          )}
        </div>
        <div className="grid gap-3 border-t border-[var(--border-subtle)] pt-4 sm:grid-cols-3">
          <label className="block min-w-0">
            <span className={cls.label}>{s.modelType}</span>
            <select value={p.modelType || "framed-box"} onChange={(e) => set({ modelType: e.target.value })} className={cls.input}>
              {MODEL_TYPES.map((m) => (
                <option key={m.id} value={m.id}>
                  {lang === "fa" ? m.labelFa : m.labelEn}
                </option>
              ))}
            </select>
          </label>
          <TextField label={s.specs3dFa} dir="rtl" value={p.specs3d?.fa} onChange={(v) => set({ specs3d: { ...(p.specs3d || {}), fa: v } })} />
          <TextField label={s.specs3dEn} dir="ltr" value={p.specs3d?.en} onChange={(v) => set({ specs3d: { ...(p.specs3d || {}), en: v } })} />
        </div>
      </Card>

      <Card id="pe-visibility" title={s.gVisibility}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="inline-flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" className="h-4 w-4" checked={p.visible !== false} onChange={(e) => set({ visible: e.target.checked })} />
            <span>{s.visibleInStore}</span>
          </label>
          <label className="block min-w-0">
            <span className={cls.label}>{s.badge}</span>
            <select value={p.badge || ""} onChange={(e) => set({ badge: e.target.value || null })} className={cls.input}>
              <option value="">{s.noBadge}</option>
              <option value="new">{t.badges.new}</option>
              <option value="bestseller">{t.badges.bestseller}</option>
              <option value="limited">{t.badges.limited}</option>
            </select>
          </label>
        </div>
      </Card>

      {/* pe-16 leaves room for the storefront's floating back-to-top button */}
      <div className="sticky bottom-14 z-20 flex flex-wrap items-center justify-between gap-2 rounded-[4px] border border-[var(--border-strong)] bg-[var(--bg-surface)] py-3 ps-4 pe-16 md:bottom-2">
        <span role="status" className={`inline-flex items-center gap-2 text-xs font-semibold ${dirty ? "text-[var(--accent-crimson)]" : "text-[var(--ink-sub)]"}`}>
          {dirty && <span className="h-2 w-2 rounded-full bg-[var(--accent-crimson)]" aria-hidden="true" />}
          {dirty ? s.unsavedChanges : s.noChanges}
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className={cls.btn}>
            {s.cancel}
          </button>
          <button type="submit" className={cls.btnPrimary}>
            {isNew ? s.createProduct : s.saveProduct}
          </button>
        </div>
      </div>
    </form>
  );
}
