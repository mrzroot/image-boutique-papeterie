import { useState, useEffect } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  Gift,
  Tag,
  Truck,
  Copy,
  Check,
  History,
  Printer,
  Store,
  Mail,
  MessageSquare,
} from "lucide-react";
import { formatPrice, formatNumber } from "../utils/pricing";

function resolveBagDisplay(item, lang, t, products = [], bundles = []) {
  if (item.kind === "product" && item.productId) {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      const loc = prod[lang] || prod.fa;
      const variants = loc.variants || [];
      const variant = variants[item.variantIdx || 0] || variants[0] || "";
      return {
        title: loc.title,
        meta: variant ? `${prod.sku} · ${variant}` : prod.sku,
        image: prod.variantImages?.[item.variantIdx || 0] || prod.image,
      };
    }
  }
  if (item.kind === "bundle" && item.bundleId) {
    const bundle = bundles.find((b) => b.id === item.bundleId);
    if (bundle) {
      const loc = bundle[lang] || bundle.fa;
      return { title: loc.title, meta: `${bundle.sku} · ${loc.items}` };
    }
  }
  if (item.kind === "giftcard" && item.spec) {
    const finishLabel = t.giftCard.designs[item.spec.design] || item.spec.design;
    const parts = [
      finishLabel,
      item.spec.recipient ? item.spec.recipient : null,
      item.spec.message ? `«${item.spec.message}»` : null,
    ].filter(Boolean);
    return {
      title: `${t.giftCard.cardBadge} (${formatPrice(item.unitPrice, lang)})`,
      meta: parts.join(" · "),
    };
  }
  if (item.kind === "service" && item.spec) {
    const s = item.spec;
    const typeName = t.printTypeNames[s.printType] || item.title;
    const stockName = t.paperStockNames[s.paperStock];
    const bindingName = t.bindingNames[s.binding];
    const parts = [
      s.size,
      `${formatNumber(s.pages, lang)} ${lang === "fa" ? "صفحه" : "p"} × ${formatNumber(s.copies, lang)} ${lang === "fa" ? "نسخه" : "copies"}`,
      stockName,
      bindingName,
      s.customTitle ? s.customTitle : null,
      s.fileName ? s.fileName : null,
    ].filter(Boolean);
    return { title: `${typeName} (${s.size})`, meta: parts.join(" · ") };
  }
  return { title: item.title, meta: item.meta };
}

export default function OrderBagDrawer({
  isOpen,
  onClose,
  items,
  products = [],
  bundles = [],
  promoCodes = [],
  shipping = null,
  orderHistory,
  onSaveOrder,
  onUpdateQty,
  onRemoveItem,
  onClearBag,
  onNavigate,
  lang,
  t,
  contact,
}) {
  const [tab, setTab] = useState("bag");
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState(0);
  const [notes, setNotes] = useState("");
  const [confirmedRef, setConfirmedRef] = useState(null);
  const [confirmedSummary, setConfirmedSummary] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);

  const resetAndClose = () => {
    setConfirmedRef(null);
    setCheckoutMode(false);
    setCopiedRef(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") resetAndClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!isOpen) return null;

  const itemsSubtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.qty,
    0
  );
  const promoDiscount = appliedPromo
    ? Math.round((itemsSubtotal * Number(appliedPromo.percent || 0)) / 100)
    : 0;
  const giftWrapPrice = shipping?.giftWrapPrice ?? t.bagDrawer.giftWrapPrice;
  const giftPrice = giftWrap && items.length > 0 ? giftWrapPrice : 0;
  const beforeShipping = Math.max(0, itemsSubtotal - promoDiscount + giftPrice);

  const threshold = shipping?.freeThreshold ?? t.bagDrawer.freeShippingThreshold ?? 2500000;
  const isPickup = deliveryMethod === 2;
  const baseShippingFee = shipping?.fee ?? t.bagDrawer.shippingFee ?? 95000;
  const shippingCost =
    items.length === 0 || isPickup || beforeShipping >= threshold
      ? 0
      : baseShippingFee;
  const grandTotal = beforeShipping + shippingCost;

  const remaining = Math.max(0, threshold - beforeShipping);
  const shippingProgress = Math.min(
    100,
    Math.round((beforeShipping / threshold) * 100)
  );

  const handlePromoApply = (e) => {
    e.preventDefault();
    const codeUpper = promoInput.trim().toUpperCase();
    const match = promoCodes.find(
      (p) => p.active !== false && String(p.code || "").trim().toUpperCase() === codeUpper
    );
    if (match) {
      setAppliedPromo(match);
      setPromoError(false);
    } else {
      setAppliedPromo(null);
      setPromoError(true);
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const refId = `IB-1405-${randomNum}`;
    const lineSummaries = items.map((item) => {
      const disp = resolveBagDisplay(item, lang, t, products, bundles);
      return {
        title: disp.title,
        meta: disp.meta,
        qty: item.qty,
        unitPrice: item.unitPrice,
      };
    });
    onSaveOrder?.({
      refId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryMethod: t.bagDrawer.deliveryOptions[deliveryMethod] || "",
      notes: notes.trim(),
      giftWrap,
      promoCode: appliedPromo?.code || null,
      items: lineSummaries,
      itemCount: items.reduce((acc, i) => acc + i.qty, 0),
      total: grandTotal,
      status: "pending",
      createdAt: new Date().toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US"),
    });
    // No backend: the order is kept on this device and the customer sends this summary to the shop.
    const B = t.bagDrawer;
    setConfirmedSummary(
      [
        `${B.summaryHeading} — ${refId}`,
        `${B.nameLabel}: ${customerName.trim()}`,
        `${B.phoneLabel}: ${customerPhone.trim()}`,
        `${B.deliveryLabel}: ${B.deliveryOptions[deliveryMethod] || ""}`,
        "",
        ...lineSummaries.map((l) => `• ${l.title}${l.meta ? ` (${l.meta})` : ""} × ${l.qty} — ${formatPrice(l.unitPrice * l.qty, lang)}`),
        "",
        `${B.subtotal}: ${formatPrice(grandTotal, lang)}`,
        notes.trim() ? `${B.notesLabel}: ${notes.trim()}` : "",
      ].filter((line, i, arr) => line !== "" || arr[i - 1] !== "").join("\n")
    );
    setConfirmedRef(refId);
    onClearBag();
    setGiftWrap(false);
    setAppliedPromo(null);
    setPromoInput("");
    setCheckoutMode(false);
  };

  const copyTrackingId = async () => {
    if (!confirmedRef) return;
    try {
      await navigator.clipboard.writeText(confirmedRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/55"
      onClick={resetAndClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.bagDrawer.title}
        className="animate-drawer-in flex h-full w-full max-w-md flex-col bg-[var(--bg-page)] text-[var(--ink-main)] shadow-2xl border-s border-[var(--border-subtle)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + Bag / History Tabs */}
        <div className="border-b border-[var(--border-subtle)] px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-[var(--accent-pine)]" aria-hidden="true" />
              <h2 className="text-base font-bold text-[var(--ink-main)]">
                {t.bagDrawer.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              aria-label={t.modal.close}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[3px] border border-[var(--border-subtle)] text-[var(--ink-main)] hover:bg-[var(--bg-soft)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 rounded-[3px] bg-[var(--bg-soft)] p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTab("bag")}
              className={`rounded-[2px] py-2 transition ${
                tab === "bag"
                  ? "bg-[var(--accent-deep)] text-white border border-[var(--accent-gold)]/35"
                  : "text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
              }`}
            >
              {t.bagDrawer.bagTab} ({formatNumber(items.reduce((a, b) => a + b.qty, 0), lang)})
            </button>
            <button
              type="button"
              onClick={() => setTab("history")}
              className={`inline-flex items-center justify-center gap-1.5 rounded-[2px] py-2 transition ${
                tab === "history"
                  ? "bg-[var(--accent-deep)] text-white border border-[var(--accent-gold)]/35"
                  : "text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
              }`}
            >
              <History className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {t.bagDrawer.ordersHistoryTab} ({formatNumber(orderHistory?.length || 0, lang)})
              </span>
            </button>
          </div>
        </div>

        {tab === "history" ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {!orderHistory?.length ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-[var(--ink-sub)] py-12 space-y-2">
                <History className="h-8 w-8 text-[var(--accent-gold)]" aria-hidden="true" />
                <p>{t.bagDrawer.noHistory}</p>
              </div>
            ) : (
              orderHistory.map((ord) => (
                <div
                  key={ord.refId}
                  className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-latin-ui text-xs font-bold tracking-wider text-[var(--accent-pine)]"
                      dir="ltr"
                    >
                      {ord.refId}
                    </span>
                    <span className="text-xs text-[var(--ink-sub)]">
                      {ord.createdAt}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--ink-main)]">
                    {ord.customerName} · {formatNumber(ord.itemCount, lang)}{" "}
                    {lang === "fa" ? "قلم" : "items"}
                  </p>
                  <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2 text-xs">
                    <span className="tabular-nums text-[var(--accent-pine)] font-bold">
                      {formatPrice(ord.total, lang)}
                    </span>
                    <span className="rounded-[2px] bg-[var(--accent-pine)]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent-pine)]">
                      {lang === "fa" ? "ثبت‌شده" : "Confirmed"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Complimentary Shipping Progress Bar */}
            {items.length > 0 && !confirmedRef && (
              <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-soft)] px-5 py-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-pine)]">
                  <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    {remaining === 0
                      ? t.bagDrawer.freeShippingUnlocked
                      : `${formatPrice(remaining, lang)} ${t.bagDrawer.freeShippingRemaining}`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-[2px] bg-[var(--border-strong)]">
                  <div
                    className="h-full bg-[var(--accent-pine)] transition-all duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {confirmedRef ? (
                <div className="rounded-[4px] border border-[var(--accent-pine)]/35 bg-[var(--bg-surface)] p-6 text-center space-y-4 animate-modal-in">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[4px] bg-[var(--accent-pine)]/15 text-[var(--accent-pine)]">
                    <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--ink-main)]">
                    {t.bagDrawer.orderConfirmedTitle}
                  </h3>
                  <p className="text-sm text-[var(--ink-sub)] leading-relaxed">
                    {t.bagDrawer.orderConfirmedDesc}
                  </p>
                  <div className="flex items-center justify-between rounded-[3px] bg-[var(--bg-soft)] px-4 py-3">
                    <div className="text-start">
                      <p className="text-xs text-[var(--ink-sub)]">
                        {t.bagDrawer.trackingCode}
                      </p>
                      <p
                        className="mt-0.5 font-latin-ui text-lg font-bold tracking-widest text-[var(--accent-pine)]"
                        dir="ltr"
                      >
                        {confirmedRef}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={copyTrackingId}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[3px] bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--ink-main)] hover:border-[var(--accent-pine)]"
                      aria-label="Copy"
                    >
                      {copiedRef ? (
                        <Check className="h-4 w-4 text-[var(--accent-pine)]" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {contact?.email && (
                      <a
                        className="btn-primary"
                        href={`mailto:${contact.email}?subject=${encodeURIComponent(`${t.bagDrawer.summaryHeading} — ${confirmedRef}`)}&body=${encodeURIComponent(confirmedSummary)}`}
                      >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        <span>{t.bagDrawer.sendByEmail}</span>
                      </a>
                    )}
                    {contact?.phone && (
                      <a
                        className="btn-quiet !min-h-12"
                        href={`sms:${contact.phone.replace(/[^d+]/g, "")}?body=${encodeURIComponent(confirmedSummary)}`}
                      >
                        <MessageSquare className="h-4 w-4" aria-hidden="true" />
                        <span>{t.bagDrawer.sendBySms}</span>
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(confirmedSummary);
                        setCopiedRef(true);
                      } catch {
                        setCopiedRef(false);
                      }
                    }}
                    className="text-sm text-[var(--ink-sub)] underline underline-offset-4 hover:text-[var(--ink-main)]"
                  >
                    {copiedRef ? t.bagDrawer.summaryCopied : t.bagDrawer.copySummary}
                  </button>
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="block w-full py-2 text-sm font-semibold text-[var(--accent-pine)] hover:underline"
                  >
                    {t.bagDrawer.newOrder}
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-5 py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[4px] bg-[var(--bg-soft)] text-[var(--accent-pine)] border border-[var(--border-subtle)]">
                    <ShoppingBag className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-[var(--ink-sub)]">{t.bagDrawer.empty}</p>
                  <div className="flex flex-col gap-2.5 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigate("store", "catalog");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-[3px] bg-[var(--accent-pine)] px-5 py-2.5 text-sm font-medium text-white"
                    >
                      <Store className="h-4 w-4" aria-hidden="true" />
                      <span>{t.bagDrawer.exploreBoutique}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigate("services");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-[3px] border border-[var(--accent-pine)] px-5 py-2.5 text-sm font-medium text-[var(--accent-pine)]"
                    >
                      <Printer className="h-4 w-4" aria-hidden="true" />
                      <span>{t.bagDrawer.exploreServices}</span>
                    </button>
                  </div>
                </div>
              ) : checkoutMode ? (
                <form onSubmit={handleConfirm} className="space-y-4">
                  <div>
                    <label
                      htmlFor="checkout-name"
                      className="mb-1.5 block text-xs font-semibold text-[var(--ink-main)]"
                    >
                      {t.bagDrawer.nameLabel}
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--ink-main)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-phone"
                      className="mb-1.5 block text-xs font-semibold text-[var(--ink-main)]"
                    >
                      {t.bagDrawer.phoneLabel}
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      dir="ltr"
                      placeholder="09353834393"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--ink-main)] font-latin-ui"
                    />
                  </div>

                  <div>
                    <span className="mb-1.5 block text-xs font-semibold text-[var(--ink-main)]">
                      {t.bagDrawer.deliveryLabel}
                    </span>
                    <div className="space-y-2">
                      {t.bagDrawer.deliveryOptions.map((opt, idx) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDeliveryMethod(idx)}
                          className={`w-full rounded-[3px] border px-3.5 py-2.5 text-start text-xs font-medium transition ${
                            deliveryMethod === idx
                              ? "border-[var(--accent-pine)] bg-[var(--accent-pine)]/15 text-[var(--accent-pine)] font-bold"
                              : "border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-main)]"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-notes"
                      className="mb-1.5 block text-xs font-semibold text-[var(--ink-main)]"
                    >
                      {t.bagDrawer.notesLabel}
                    </label>
                    <textarea
                      id="checkout-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm text-[var(--ink-main)]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutMode(false)}
                      className="rounded-[3px] border border-[var(--border-strong)] px-4 py-3 text-xs font-semibold text-[var(--ink-main)]"
                    >
                      {lang === "fa" ? "بازگشت" : "Back"}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-[3px] bg-[var(--accent-crimson)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      {t.bagDrawer.confirmOrder}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3.5">
                  {items.map((item) => {
                    const display = resolveBagDisplay(item, lang, t, products, bundles);
                    return (
                      <div
                        key={item.key}
                        className="flex gap-3 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3"
                      >
                        <img
                          src={display.image || item.image}
                          alt={display.title}
                          width="80"
                          height="80"
                          className="h-20 w-20 shrink-0 rounded-[3px] object-cover bg-[var(--bg-soft)]"
                        />
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`inline-flex rounded-[2px] px-2 py-0.5 text-[11px] font-semibold ${
                                  item.kind === "service"
                                    ? "bg-[var(--accent-crimson)]/15 text-[var(--accent-crimson)]"
                                    : "bg-[var(--accent-pine)]/15 text-[var(--accent-pine)]"
                                }`}
                              >
                                {item.kind === "service"
                                  ? t.bagDrawer.printSpecTag
                                  : item.kind === "bundle"
                                  ? t.bagDrawer.bundleTag
                                  : item.kind === "giftcard"
                                  ? t.bagDrawer.giftCardTag
                                  : t.bagDrawer.productTag}
                              </span>
                              <button
                                type="button"
                                aria-label={lang === "fa" ? "حذف" : "Remove"}
                                onClick={() => onRemoveItem(item.key)}
                                className="text-[var(--ink-sub)] hover:text-[var(--accent-crimson)]"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                            <h4 className="mt-1 truncate text-sm font-bold text-[var(--ink-main)]">
                              {display.title}
                            </h4>
                            <p className="text-xs text-[var(--ink-sub)] line-clamp-2">
                              {display.meta}
                            </p>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="tabular-nums text-xs font-bold text-[var(--accent-pine)]">
                              {formatPrice(item.unitPrice * item.qty, lang)}
                            </span>
                            {item.kind !== "service" && (
                              <div className="inline-flex items-center rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-1 py-0.5">
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  onClick={() =>
                                    onUpdateQty(item.key, item.qty - 1)
                                  }
                                  className="p-1.5"
                                >
                                  <Minus className="h-3 w-3" aria-hidden="true" />
                                </button>
                                <span className="tabular-nums w-6 text-center text-xs font-semibold">
                                  {item.qty}
                                </span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  onClick={() =>
                                    onUpdateQty(item.key, item.qty + 1)
                                  }
                                  className="p-1.5"
                                >
                                  <Plus className="h-3 w-3" aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Optional Florentine Wax-Seal Gift Wrap Toggle */}
                  <button
                    type="button"
                    onClick={() => setGiftWrap((g) => !g)}
                    aria-pressed={giftWrap}
                    className={`flex w-full items-center justify-between gap-3 rounded-[4px] border p-3.5 text-start transition ${
                      giftWrap
                        ? "border-[var(--accent-gold)] bg-[var(--bg-soft)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-gold)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] ${
                          giftWrap
                            ? "bg-[var(--accent-pine)] text-[#E7D19F]"
                            : "bg-[var(--bg-soft)] text-[var(--accent-pine)]"
                        }`}
                      >
                        <Gift className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--ink-main)]">
                          {t.bagDrawer.giftWrapTitle}
                        </p>
                        <p className="tabular-nums text-xs font-semibold text-[var(--accent-pine)]">
                          +{formatPrice(giftWrapPrice, lang)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border ${
                        giftWrap
                          ? "border-[var(--accent-pine)] bg-[var(--accent-pine)] text-white"
                          : "border-[var(--border-strong)]"
                      }`}
                    >
                      {giftWrap && <Check className="h-3 w-3" aria-hidden="true" />}
                    </span>
                  </button>

                  {/* Live Promo Code Form */}
                  <form onSubmit={handlePromoApply} className="space-y-1.5">
                    <div className="flex items-center gap-2 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5">
                      <Tag className="h-3.5 w-3.5 text-[var(--accent-gold)]" aria-hidden="true" />
                      <label htmlFor="bag-promo-code" className="sr-only">
                        {t.bagDrawer.promoPlaceholder}
                      </label>
                      <input
                        id="bag-promo-code"
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder={t.bagDrawer.promoPlaceholder}
                        className="flex-1 bg-transparent text-xs text-[var(--ink-main)] placeholder:text-[var(--ink-sub)]"
                      />
                      <button
                        type="submit"
                        className="rounded-[2px] bg-[var(--accent-pine)] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        {t.bagDrawer.promoApply}
                      </button>
                    </div>
                    {appliedPromo && (
                      <p className="tabular-nums text-xs font-semibold text-[var(--accent-pine)] px-1">
                        ✓ {appliedPromo.code} ({appliedPromo.percent}%) (-{formatPrice(promoDiscount, lang)})
                      </p>
                    )}
                    {promoError && (
                      <p className="text-xs text-[var(--accent-crimson)] px-1">
                        {t.bagDrawer.promoInvalid}
                      </p>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && !checkoutMode && !confirmedRef && (
              <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[var(--ink-sub)]">
                  <span>{t.bagDrawer.shippingLabel}</span>
                  <span className="tabular-nums font-semibold text-[var(--accent-pine)]">
                    {shippingCost === 0
                      ? t.bagDrawer.shippingFree
                      : formatPrice(shippingCost, lang)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--ink-sub)]">{t.bagDrawer.subtotal}</span>
                  <span className="tabular-nums text-lg font-bold text-[var(--ink-main)]">
                    {formatPrice(grandTotal, lang)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutMode(true)}
                  className="w-full rounded-[3px] bg-[var(--accent-deep)] border border-[var(--accent-gold)]/35 py-3.5 text-sm font-semibold text-[#FAF6EE] transition hover:bg-[var(--accent-pine)]"
                >
                  {t.bagDrawer.checkoutBtn}
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
