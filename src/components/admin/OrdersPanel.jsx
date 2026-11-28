import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { formatPrice, formatNumber } from "../../utils/pricing";
import { cls, useAdmin, Card, TextField } from "./ui";

const STATUSES = ["pending", "preparing", "shipped", "delivered"];

export function downloadJson(data, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  // Firefox needs the anchor in the document; revoking right away can cancel the download
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function OrdersPanel({ cmsContent, orderHistory, onUpdateOrders, onUpdateContent }) {
  const { s, lang, notify } = useAdmin();
  const [statusFilter, setStatusFilter] = useState("all");
  const [newPromo, setNewPromo] = useState({ code: "", percent: 15 });
  const promoCodes = cmsContent.promoCodes || [];
  const orders = orderHistory.map((ord, idx) => ({ ord, idx })).filter(({ ord }) => statusFilter === "all" || (ord.status || "pending") === statusFilter);

  const addPromo = () => {
    const code = newPromo.code.trim().toUpperCase();
    const percent = Number(newPromo.percent);
    if (!code) return notify(s.errPromoCode);
    if (!(percent >= 1 && percent <= 90)) return notify(s.errPromoPercent);
    if (promoCodes.some((p) => p.code === code)) return notify(s.errPromoDuplicate);
    onUpdateContent((prev) => ({ ...prev, promoCodes: [...prev.promoCodes, { code, percent, active: true }] }));
    setNewPromo({ code: "", percent: 15 });
    notify(s.toastAdded);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-12">
      <Card
        className="lg:col-span-7"
        title={s.navOrders}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={cls.selectSm} aria-label={s.statusFilter}>
              <option value="all">{s.filter_all}</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {s[`order_${st}`]}
                </option>
              ))}
            </select>
            {orderHistory.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  downloadJson(orderHistory, "image-boutique-orders.json");
                  notify(s.toastExported);
                }}
                className={cls.btn}
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{s.exportJson}</span>
              </button>
            )}
          </div>
        }
      >
        <p className={cls.hint}>{s.ordersHint}</p>
        {orders.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--ink-sub)]">{orderHistory.length ? s.noMatches : s.noOrders}</p>
        ) : (
          <ul className="space-y-2.5">
            {orders.map(({ ord, idx }) => (
              <li key={ord.refId + idx} className={`${cls.sub} space-y-2 text-sm`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-[var(--accent-pine)]" dir="ltr">
                    {ord.refId}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[var(--ink-sub)]">{ord.createdAt}</span>
                    <select
                      value={ord.status || "pending"}
                      aria-label={s.orderStatus}
                      onChange={(e) => {
                        const status = e.target.value;
                        onUpdateOrders((prev) => prev.map((o, i) => (i === idx ? { ...o, status } : o)));
                        notify(s.toastStatus.replace("{status}", s[`order_${status}`]));
                      }}
                      className={cls.selectSm}
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {s[`order_${st}`]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="font-semibold">
                  {ord.customerName} · <span dir="ltr">{ord.customerPhone}</span>
                </p>
                {ord.deliveryMethod && <p className="text-xs text-[var(--ink-sub)]">{ord.deliveryMethod}</p>}
                {Array.isArray(ord.items) && ord.items.length > 0 && (
                  <ul className="space-y-0.5 border-t border-[var(--border-subtle)] pt-1.5 text-xs text-[var(--ink-body)]">
                    {ord.items.map((line, lIdx) => (
                      <li key={lIdx}>
                        {formatNumber(line.qty, lang)}× {line.title}
                        {line.meta ? ` (${line.meta})` : ""}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex justify-between border-t border-[var(--border-subtle)] pt-1.5 font-bold text-[var(--accent-pine)]">
                  <span>{s.total}</span>
                  <span className="tabular-nums">{formatPrice(ord.total, lang)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="space-y-4 lg:col-span-5">
        <Card title={s.promoCodes}>
          <div className="grid grid-cols-[minmax(0,1fr)_5rem_auto] items-end gap-2">
            <TextField label={s.code} dir="ltr" placeholder="SPRING15" value={newPromo.code} onChange={(v) => setNewPromo((p) => ({ ...p, code: v }))} />
            <TextField label="%" type="number" min={0} max={90} value={newPromo.percent} onChange={(v) => setNewPromo((p) => ({ ...p, percent: v }))} />
            <button type="button" onClick={addPromo} className={cls.btnPrimary}>
              {s.add}
            </button>
          </div>
          <ul className="space-y-1.5">
            {promoCodes.map((pc, idx) => (
              <li key={pc.code + idx} className={`${cls.sub} flex items-center justify-between gap-2 py-2 text-sm`}>
                <span className="font-bold">
                  <span dir="ltr">{pc.code}</span> ({formatNumber(pc.percent, lang)}{lang === "fa" ? "٪" : "%"})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-pressed={pc.active !== false}
                    onClick={() => {
                      onUpdateContent((prev) => ({
                        ...prev,
                        promoCodes: prev.promoCodes.map((x, i) => (i === idx ? { ...x, active: x.active === false } : x)),
                      }));
                      notify(pc.active !== false ? s.toastPaused : s.toastActivated);
                    }}
                    className={`rounded-[3px] border px-2 py-1 text-xs font-semibold ${
                      pc.active !== false ? "border-[var(--accent-pine)] text-[var(--accent-pine)]" : "border-[var(--border-strong)] text-[var(--ink-sub)]"
                    }`}
                  >
                    {pc.active !== false ? s.active : s.paused}
                  </button>
                  <button
                    type="button"
                    aria-label={`${s.delete}: ${pc.code}`}
                    onClick={() => {
                      if (!window.confirm(s.confirmDeleteItem.replace("{name}", pc.code))) return;
                      onUpdateContent((prev) => ({ ...prev, promoCodes: prev.promoCodes.filter((_, i) => i !== idx) }));
                      notify(s.toastDeleted);
                    }}
                    className={cls.iconDanger}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={s.shipping}>
          {[
            ["freeThreshold", s.freeThreshold],
            ["fee", s.shippingFee],
            ["giftWrapPrice", s.giftWrap],
          ].map(([key, label]) => (
            <TextField
              key={key}
              label={label}
              type="number"
              min={0}
              value={cmsContent.shipping?.[key] ?? 0}
              onChange={(v) => onUpdateContent((prev) => ({ ...prev, shipping: { ...prev.shipping, [key]: v } }))}
            />
          ))}
        </Card>
      </div>
    </section>
  );
}
