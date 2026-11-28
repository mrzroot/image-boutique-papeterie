import { Plus } from "lucide-react";
import { formatNumber } from "../../utils/pricing";
import { cls, useAdmin, Card, JumpNav, TextField, NumberInput, LocFields, RowControls } from "./ui";

export default function ServicesPanel({ cmsContent, onUpdateContent }) {
  const { s, t, lang, notify } = useAdmin();
  const pricing = cmsContent.pricing || {};
  const servicesList = cmsContent.servicesList || [];
  const tieredRows = cmsContent.tieredPriceRows || [];
  const faqList = cmsContent.servicesFaq || [];

  const patchItem = (key, idx, fn) =>
    onUpdateContent((prev) => ({ ...prev, [key]: prev[key].map((x, i) => (i === idx ? fn(x) : x)) }));
  const patchPricing = (group, idx, field) => (val) =>
    onUpdateContent((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [group]: prev.pricing[group].map((x, i) => (i === idx ? { ...x, [field]: val } : x)) },
    }));

  const rateGroups = [
    ["printTypes", "baseRate", s.basePrintRates, t.printTypeNames],
    ["paperStocks", "extraPerSheet", s.paperExtras, t.paperStockNames],
    ["bindings", "flatFee", s.bindingFees, t.bindingNames],
  ];
  const numCell = "w-28 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-2 py-1.5 text-end text-sm";
  // Catalog rows store discountRate as a fraction (0.1); the table edits it as a percent
  const hasDiscount = tieredRows.some((r) => typeof r.discountRate === "number");

  return (
    <section className="space-y-4">
      <div className={`${cls.card} space-y-2`}>
        <h2 className={cls.h2}>{s.navServices}</h2>
        <p className={cls.hint}>{s.autosaveHint}</p>
        <JumpNav
          label={s.navServices}
          items={[
            ["sv-rates", s.printRates],
            ["sv-cards", s.serviceCards],
            ["sv-tiers", s.tieredTable],
            ["sv-faq", s.faq],
          ]}
        />
      </div>

      <Card id="sv-rates" title={s.printRates}>
        <p className={cls.hint}>{s.ratesHint}</p>
        <div className="grid gap-3 md:grid-cols-3">
          {rateGroups.map(([group, field, title, names]) => (
            <div key={group} className={`${cls.sub} space-y-2`}>
              <h3 className={cls.h3}>{title}</h3>
              {(pricing[group] || []).map((row, idx) => (
                <label key={row.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{names?.[row.id] || row.id}</span>
                  <NumberInput min={0} value={row[field]} onChange={patchPricing(group, idx, field)} className={numCell} />
                </label>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <Card id="sv-cards" title={s.serviceCards}>
        {servicesList.map((srv, idx) => (
          <div key={srv.id || idx} className="space-y-3 border-t border-[var(--border-subtle)] pt-4 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h3 className={cls.h3}>
                <span className="text-[var(--accent-gold-ink)]">{/^\d+$/.test(srv.code) ? formatNumber(Number(srv.code), lang) : srv.code}</span> ·{" "}
                {(srv[lang] || srv.fa)?.title}
              </h3>
              <div className="w-40">
                <TextField
                  label={s.startingPrice}
                  type="number"
                  min={0}
                  value={srv.startingPrice}
                  onChange={(v) => patchItem("servicesList", idx, (x) => ({ ...x, startingPrice: v }))}
                />
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {["fa", "en"].map((l) => (
                <LocFields
                  key={l}
                  l={l}
                  value={srv[l]}
                  fields={[["title", s.fTitle], ["desc", s.fDescription, true], ["unit", s.fUnit]]}
                  onChange={(field, val) => patchItem("servicesList", idx, (x) => ({ ...x, [l]: { ...x[l], [field]: val } }))}
                />
              ))}
            </div>
          </div>
        ))}
      </Card>

      <Card id="sv-tiers" title={s.tieredTable}>
        <p className={cls.hint}>{s.tiersSyncHint}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-start text-xs text-[var(--ink-sub)]">
                <th className="p-1.5 text-start font-semibold">{s.tier} ({s.persian})</th>
                <th className="p-1.5 text-start font-semibold">{s.tier} ({s.english})</th>
                <th className="p-1.5 text-start font-semibold">{s.bwA4}</th>
                <th className="p-1.5 text-start font-semibold">{s.colorA4}</th>
                {hasDiscount && <th className="p-1.5 text-start font-semibold">{s.discountPercent}</th>}
              </tr>
            </thead>
            <tbody>
              {tieredRows.map((row, idx) => (
                <tr key={idx} className="border-t border-[var(--border-subtle)]">
                  {["fa", "en"].map((l) => (
                    <td key={l} className="p-1.5">
                      <input
                        dir={l === "fa" ? "rtl" : "ltr"}
                        aria-label={`${s.tier} ${idx + 1} (${l === "fa" ? s.persian : s.english})`}
                        value={row.tier?.[l] || ""}
                        onChange={(e) => patchItem("tieredPriceRows", idx, (r) => ({ ...r, tier: { ...r.tier, [l]: e.target.value } }))}
                        className={cls.input}
                      />
                    </td>
                  ))}
                  {["bwA4", "colorA4"].map((field) => (
                    <td key={field} className="p-1.5">
                      <NumberInput
                        min={0}
                        aria-label={`${s[field]} ${formatNumber(idx + 1, lang)}`}
                        value={row[field]}
                        onChange={(v) => patchItem("tieredPriceRows", idx, (r) => ({ ...r, [field]: v }))}
                        className={numCell}
                      />
                    </td>
                  ))}
                  {hasDiscount && (
                    <td className="p-1.5">
                      <NumberInput
                        min={0}
                        max={100}
                        aria-label={`${s.discountPercent} ${formatNumber(idx + 1, lang)}`}
                        value={Math.round((row.discountRate || 0) * 10000) / 100}
                        onChange={(v) => patchItem("tieredPriceRows", idx, (r) => ({ ...r, discountRate: v / 100 }))}
                        className={numCell}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        id="sv-faq"
        title={s.faq}
        actions={
          <button
            type="button"
            className={cls.btnPrimary}
            onClick={() => {
              onUpdateContent((prev) => ({
                ...prev,
                servicesFaq: [...prev.servicesFaq, { fa: { q: "پرسش جدید", a: "پاسخ پرسش جدید" }, en: { q: "New question", a: "Answer" } }],
              }));
              notify(s.toastAdded);
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{s.addQuestion}</span>
          </button>
        }
      >
        {faqList.map((item, idx) => (
          <div key={idx} className="space-y-3 border-t border-[var(--border-subtle)] pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={`${cls.h3} min-w-0 truncate`}>
                {formatNumber(idx + 1, lang)}. {(item[lang] || item.fa)?.q}
              </h3>
              <RowControls
                index={idx}
                length={faqList.length}
                onDelete={() => {
                  if (!window.confirm(s.confirmDeleteItem.replace("{name}", item.fa?.q || `#${idx + 1}`))) return;
                  onUpdateContent((prev) => ({ ...prev, servicesFaq: prev.servicesFaq.filter((_, i) => i !== idx) }));
                  notify(s.toastDeleted);
                }}
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {["fa", "en"].map((l) => (
                <LocFields
                  key={l}
                  l={l}
                  value={item[l]}
                  fields={[["q", s.fQuestion], ["a", s.fAnswer, true]]}
                  onChange={(field, val) => patchItem("servicesFaq", idx, (x) => ({ ...x, [l]: { ...x[l], [field]: val } }))}
                />
              ))}
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}
