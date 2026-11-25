import { useState } from "react";
import { cls, useAdmin, Card, ImgPreview, Tag, photoIssue } from "./ui";

// Every image path used anywhere in the content -> Set of human-readable places it is used
function collectImageRefs(c, s, lang) {
  const refs = new Map();
  const add = (src, where) => {
    if (typeof src !== "string" || !src.trim()) return;
    if (!refs.has(src)) refs.set(src, new Set());
    refs.get(src).add(where);
  };
  (c.products || []).forEach((p) => {
    const name = (p[lang] || p.fa)?.title || p.sku;
    [p.image, ...(p.variantImages || []), ...(p.gallery || []), ...(p.spinImages || [])].forEach((src) => add(src, name));
  });
  (c.heroSlides || []).forEach((sl, i) => add(sl.image, `${s.slide} ${i + 1}`));
  (c.bundles || []).forEach((b) => add(b.image, (b[lang] || b.fa)?.title || b.sku));
  (c.socialGallery || []).forEach((g) => add(g.image, s.socialGallery));
  return [...refs.entries()];
}

export default function MediaPanel({ cmsContent, onEditProduct }) {
  const { s, lang, broken } = useAdmin();
  const [onlyIssues, setOnlyIssues] = useState(false);
  const products = cmsContent.products || [];
  const rows = products.map((p) => ({ p, issue: photoIssue(p, broken) })).filter((r) => !onlyIssues || r.issue);
  const issueCount = products.filter((p) => photoIssue(p, broken)).length;
  const refs = collectImageRefs(cmsContent, s, lang);
  const brokenRefs = refs.filter(([src]) => broken.has(src)).length;

  return (
    <section className="space-y-4">
      <Card
        title={s.photoHealth}
        actions={
          <label className="inline-flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" className="h-4 w-4" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} />
            <span>{s.onlyIssues}</span>
          </label>
        }
      >
        <p className={cls.hint}>{s.photoHealthHint}</p>
        <p className="text-sm font-semibold">
          {issueCount ? (
            <span className="text-[var(--accent-crimson)]">{s.productsNeedPhotos.replace("{n}", issueCount)}</span>
          ) : (
            <span className="text-[var(--accent-pine)]">{s.allProductsHavePhotos}</span>
          )}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-xs text-[var(--ink-sub)]">
                <th className="p-2 text-start font-semibold">{s.product}</th>
                <th className="p-2 text-start font-semibold">{s.mainImage}</th>
                <th className="p-2 text-start font-semibold">{s.gallery}</th>
                <th className="p-2 text-start font-semibold">360°</th>
                <th className="p-2 text-start font-semibold">3D</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, issue }) => (
                <tr key={p.id} className="border-t border-[var(--border-subtle)] align-middle">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <ImgPreview src={p.image} className="h-10 w-10" />
                      <span className="min-w-0 font-semibold">{(p[lang] || p.fa)?.title}</span>
                    </div>
                  </td>
                  <td className="p-2">{issue ? <Tag tone="crimson">{s[`issue_${issue}`]}</Tag> : <Tag tone="pine">{s.ok}</Tag>}</td>
                  <td className="tabular-nums p-2">{p.gallery?.length || 0}</td>
                  <td className="tabular-nums p-2">
                    <Tag tone={(p.spinImages?.length || 0) >= 8 ? "pine" : "neutral"}>{p.spinImages?.length || 0}/8</Tag>
                  </td>
                  <td className="p-2">{p.model3dUrl ? <Tag tone="pine">GLB</Tag> : "—"}</td>
                  <td className="p-2 text-end">
                    <button type="button" onClick={() => onEditProduct(p)} className={cls.btn}>
                      {s.edit}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={`${s.allImages} (${refs.length})`}>
        <p className={cls.hint}>{s.allImagesHint}</p>
        {brokenRefs > 0 && <p className="text-sm font-semibold text-[var(--accent-crimson)]">{s.brokenCount.replace("{n}", brokenRefs)}</p>}
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {refs
            .filter(([src]) => !onlyIssues || broken.has(src))
            .map(([src, where]) => (
              <li key={src} className={`${cls.sub} flex items-start gap-2.5`}>
                <ImgPreview src={src} className="h-14 w-14" />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-xs font-semibold" dir="ltr" title={src.startsWith("data:") ? undefined : src}>
                    {src.startsWith("data:") ? s.uploadedImage : src}
                  </p>
                  <p className="line-clamp-2 text-xs text-[var(--ink-sub)]">{[...where].join(" · ")}</p>
                  {broken.has(src) && <Tag tone="crimson">{s.imgBroken}</Tag>}
                </div>
              </li>
            ))}
        </ul>
      </Card>
    </section>
  );
}
