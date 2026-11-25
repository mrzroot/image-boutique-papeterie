import { useState } from "react";
import { Plus, Search, Eye, EyeOff, Copy, Trash2, Pencil } from "lucide-react";
import { CATEGORIES } from "../../data/catalog";
import { formatPrice } from "../../utils/pricing";
import { cls, useAdmin, ImgPreview, Tag, photoIssue } from "./ui";

export default function ProductsPanel({ products, onEdit, onNew, onUpdateContent }) {
  const { s, t, lang, broken, notify } = useAdmin();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const q = query.trim().toLowerCase();
  const filtered = products.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (status === "visible" && p.visible === false) return false;
    if (status === "hidden" && p.visible !== false) return false;
    if (status === "outOfStock" && p.inStock !== false) return false;
    if (status === "needsPhoto" && !photoIssue(p, broken)) return false;
    if (!q) return true;
    return [p.fa?.title, p.en?.title, p.sku, p.id].some((v) => v?.toLowerCase().includes(q));
  });

  const titleOf = (p) => (p[lang] || p.fa)?.title || p.sku;
  const update = (fn) => onUpdateContent((prev) => ({ ...prev, products: fn(prev.products) }));

  return (
    <section className="space-y-4">
      <div className={`${cls.card} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={cls.h2}>{s.navProducts}</h2>
          <button type="button" onClick={onNew} className={cls.btnPrimary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{s.addProduct}</span>
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="relative block min-w-0">
            <span className="sr-only">{s.searchProducts}</span>
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-sub)]" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={s.searchProducts} className={`${cls.input} ps-9`} />
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={cls.input} aria-label={s.category}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {t.categoryNames[c.id]}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={cls.input} aria-label={s.statusFilter}>
            {["all", "visible", "hidden", "outOfStock", "needsPhoto"].map((k) => (
              <option key={k} value={k}>
                {s[`filter_${k}`]}
              </option>
            ))}
          </select>
        </div>
        <p className={`${cls.hint} tabular-nums`}>
          {s.showingCount.replace("{n}", filtered.length).replace("{total}", products.length)}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className={`${cls.card} text-center text-sm text-[var(--ink-sub)]`}>{s.noMatches}</p>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)] rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          {filtered.map((prod) => {
            const issue = photoIssue(prod, broken);
            const spin = prod.spinImages?.length || 0;
            return (
              <li key={prod.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 px-3 py-3 sm:flex sm:px-4">
                <ImgPreview src={prod.image} className="h-14 w-14" />
                <div className="min-w-0 flex-1 space-y-1">
                  <button type="button" onClick={() => onEdit(prod)} className="block max-w-full truncate text-start text-sm font-bold text-[var(--ink-main)] hover:underline">
                    {titleOf(prod)}
                  </button>
                  <p className="text-xs text-[var(--ink-sub)]">
                    <span dir="ltr">{prod.sku}</span> · {t.categoryNames[prod.category] || prod.category} ·{" "}
                    <span className="tabular-nums font-semibold text-[var(--accent-pine)]">{formatPrice(prod.price, lang)}</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {prod.visible === false && <Tag tone="crimson">{s.hidden}</Tag>}
                    {prod.inStock === false && <Tag tone="gold">{s.outOfStock}</Tag>}
                    {issue && <Tag tone="crimson">{s[`issue_${issue}`]}</Tag>}
                    {prod.gallery?.length > 0 && <Tag>{s.galleryCount.replace("{n}", prod.gallery.length)}</Tag>}
                    {spin > 0 && <Tag tone={spin >= 8 ? "pine" : "neutral"}>360° {spin}/8</Tag>}
                    {prod.model3dUrl && <Tag tone="pine">GLB</Tag>}
                  </div>
                </div>
                <div className="col-span-2 flex shrink-0 items-center justify-end gap-1 sm:ms-auto">
                  <button
                    type="button"
                    title={prod.visible === false ? s.show : s.hide}
                    aria-label={prod.visible === false ? s.show : s.hide}
                    onClick={() => {
                      update((list) => list.map((p) => (p.id === prod.id ? { ...p, visible: p.visible === false } : p)));
                      notify(prod.visible === false ? s.toastShown : s.toastHidden);
                    }}
                    className={cls.icon}
                  >
                    {prod.visible === false ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    title={s.duplicate}
                    aria-label={s.duplicate}
                    onClick={() => {
                      const copy = JSON.parse(JSON.stringify(prod));
                      copy.id = `${prod.id}-${Date.now().toString(36).slice(-4)}`;
                      copy.sku = `${prod.sku}-COPY`;
                      update((list) => [copy, ...list]);
                      notify(s.toastDuplicated);
                    }}
                    className={cls.icon}
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => onEdit(prod)} className={cls.btnPrimary}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{s.edit}</span>
                  </button>
                  <button
                    type="button"
                    title={s.delete}
                    aria-label={`${s.delete}: ${titleOf(prod)}`}
                    onClick={() => {
                      if (!window.confirm(s.confirmDeleteProduct.replace("{name}", titleOf(prod)))) return;
                      update((list) => list.filter((p) => p.id !== prod.id));
                      notify(s.toastDeleted);
                    }}
                    className={cls.iconDanger}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
