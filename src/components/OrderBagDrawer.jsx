import { useState } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Printer,
  CheckCircle2,
  Store,
  Gift,
  Truck,
  Copy,
  Check,
  Tag,
  History,
} from "lucide-react";
import { formatPrice, formatNumber } from "../utils/pricing";
import { PRODUCTS, BUNDLES } from "../data/catalog";

function resolveBagDisplay(item, lang, t) {
  if (item.kind === "product" && item.productId) {
    const prod = PRODUCTS.find((p) => p.id === item.productId);
    if (prod) {
      const loc = prod[lang];
      const variant = loc.variants[item.variantIdx || 0] || loc.variants[0];
      return {
        title: loc.title,
        meta: `${prod.sku} · ${variant}`,
        image: prod.variantImages?.[item.variantIdx || 0] || prod.image,
      };
    }
  }
  if (item.kind === "bundle" && item.bundleId) {
    const bundle = BUNDLES.find((b) => b.id === item.bundleId);
    if (bundle) {
      const loc = bundle[lang];
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
      s.customTitle ? `✦ ${s.customTitle}` : null,
      s.fileName ? `📎 ${s.fileName}` : null,
    ].filter(Boolean);
    return { title: `${typeName} (${s.size})`, meta: parts.join(" · ") };
  }
  return { title: item.title, meta: item.meta };
}

export default function OrderBagDrawer({
  isOpen,
  onClose,
  items,
  orderHistory,
  onSaveOrder,
  onUpdateQty,
  onRemoveItem,
  onClearBag,
  onNavigate,
  lang,
  t,
}) {
  const [tab, setTab] = useState("bag");
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState(0);
  const [notes, setNotes] = useState("");
  const [confirmedRef, setConfirmedRef] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!isOpen) return null;

  const itemsSubtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.qty,
    0
  );
  const promoDiscount = promoApplied ? Math.round(itemsSubtotal * 0.1) : 0;
  const giftPrice = giftWrap && items.length > 0 ? t.bagDrawer.giftWrapPrice : 0;
  const beforeShipping = Math.max(0, itemsSubtotal - promoDiscount + giftPrice);

  const threshold = t.bagDrawer.freeShippingThreshold || 2500000;
  const isPickup = deliveryMethod === 2;
  const shippingCost =
    items.length === 0 || isPickup || beforeShipping >= threshold
      ? 0
      : t.bagDrawer.shippingFee || 95000;
  const grandTotal = beforeShipping + shippingCost;

  const remaining = Math.max(0, threshold - beforeShipping);
  const shippingProgress = Math.min(
    100,
    Math.round((beforeShipping / threshold) * 100)
  );

  const handlePromoApply = (e) => {
    e.preventDefault();
    if (promoInput.trim().toUpperCase() === "BOUTIQUE10") {
      setPromoApplied(true);
      setPromoError(false);
    } else {
      setPromoApplied(false);
      setPromoError(true);
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const refId = `IB-1405-${randomNum}`;
    onSaveOrder?.({
      refId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      itemCount: items.reduce((acc, i) => acc + i.qty, 0),
      total: grandTotal,
      createdAt: new Date().toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US"),
    });
    setConfirmedRef(refId);
    onClearBag();
    setGiftWrap(false);
    setPromoApplied(false);
    setPromoInput("");
    setCheckoutMode(false);
  };

  const resetAndClose = () => {
    setConfirmedRef(null);
    setCheckoutMode(false);
    setCopiedRef(false);
    onClose();
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
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      onClick={resetAndClose}
    >
      <aside
        className="animate-drawer-in flex h-full w-full max-w-md flex-col bg-[var(--bg-page)] text-[var(--ink-main)] shadow-2xl border-s border-[var(--border-subtle)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + Bag / History Tabs */}
        <div className="border-b border-[var(--border-subtle)] px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-[var(--accent-pine)]" />
              <h2 className="text-base font-bold text-[var(--ink-main)]">
                {t.bagDrawer.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--ink-main)] hover:bg-[var(--bg-soft)] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[var(--bg-soft)] p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTab("bag")}
              className={`rounded-full py-1.5 transition cursor-pointer ${
                tab === "bag"
                  ? "bg-[var(--accent-deep)] text-white shadow-2xs border border-[var(--accent-gold)]/30"
                  : "text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
              }`}
            >
              {t.bagDrawer.bagTab} ({formatNumber(items.reduce((a, b) => a + b.qty, 0), lang)})
            </button>
            <button
              type="button"
              onClick={() => setTab("history")}
              className={`inline-flex items-center justify-center gap-1.5 rounded-full py-1.5 transition cursor-pointer ${
                tab === "history"
                  ? "bg-[var(--accent-deep)] text-white shadow-2xs border border-[var(--accent-gold)]/30"
                  : "text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
              }`}
            >
              <History className="h-3.5 w-3.5" />
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
                <History className="h-8 w-8 text-[#B89352]" />
                <p>{t.bagDrawer.noHistory}</p>
              </div>
            ) : (
              orderHistory.map((ord) => (
                <div
                  key={ord.refId}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-latin-ui text-xs font-bold tracking-wider text-[#1B4636]"
                      dir="ltr"
                    >
                      {ord.refId}
                    </span>
                    <span className="text-[11px] text-[var(--ink-sub)]">
                      {ord.createdAt}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--ink-main)]">
                    {ord.customerName} · {formatNumber(ord.itemCount, lang)}{" "}
                    {lang === "fa" ? "قلم" : "items"}
                  </p>
                  <div className="flex items-center justify-between border-t border-[#F1EBE0] pt-2 text-xs">
                    <span className="text-[#1B4636] font-bold">
                      {formatPrice(ord.total, lang)}
                    </span>
                    <span className="rounded-full bg-[#1B4636]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#1B4636]">
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
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4636]">
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {remaining === 0
                      ? t.bagDrawer.freeShippingUnlocked
                      : `${formatPrice(remaining, lang)} ${t.bagDrawer.freeShippingRemaining}`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DFD6C3]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1B4636] to-[#B89352] transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {confirmedRef ? (
                <div className="rounded-3xl border border-[#1B4636]/25 bg-[var(--bg-surface)] p-6 text-center space-y-4 shadow-sm animate-modal-in">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4636]/10 text-[#1B4636]">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--ink-main)]">
                    {t.bagDrawer.orderConfirmedTitle}
                  </h3>
                  <p className="text-sm text-[var(--ink-sub)] leading-relaxed">
                    {t.bagDrawer.orderConfirmedDesc}
                  </p>
                  <div className="flex items-center justify-between rounded-2xl bg-[var(--bg-soft)] px-4 py-3">
                    <div className="text-start">
                      <p className="text-[11px] text-[var(--ink-sub)]">
                        {t.bagDrawer.trackingCode}
                      </p>
                      <p
                        className="mt-0.5 font-latin-ui text-lg font-bold tracking-widest text-[#1B4636]"
                        dir="ltr"
                      >
                        {confirmedRef}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={copyTrackingId}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--ink-main)] hover:border-[#1B4636] cursor-pointer"
                      aria-label="Copy"
                    >
                      {copiedRef ? (
                        <Check className="h-4 w-4 text-[#1B4636]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="w-full rounded-full bg-[#14201A] py-3 text-sm font-semibold text-white hover:bg-[#1B4636] cursor-pointer"
                  >
                    {t.bagDrawer.newOrder}
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-5 py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFE8DA] text-[#1B4636]">
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                  <p className="text-sm text-[var(--ink-sub)]">{t.bagDrawer.empty}</p>
                  <div className="flex flex-col gap-2.5 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigate("store", "catalog");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1B4636] px-5 py-2.5 text-sm font-medium text-white cursor-pointer"
                    >
                      <Store className="h-4 w-4" />
                      <span>{t.bagDrawer.exploreBoutique}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigate("services");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1B4636] px-5 py-2.5 text-sm font-medium text-[#1B4636] cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      <span>{t.bagDrawer.exploreServices}</span>
                    </button>
                  </div>
                </div>
              ) : checkoutMode ? (
                <form onSubmit={handleConfirm} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--ink-main)]">
                      {t.bagDrawer.nameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[#1B4636]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--ink-main)]">
                      {t.bagDrawer.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      placeholder="09353834393"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[#1B4636] font-latin-ui"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--ink-main)]">
                      {t.bagDrawer.deliveryLabel}
                    </label>
                    <div className="space-y-2">
                      {t.bagDrawer.deliveryOptions.map((opt, idx) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDeliveryMethod(idx)}
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-start text-xs font-medium transition cursor-pointer ${
                            deliveryMethod === idx
                              ? "border-[#1B4636] bg-[#1B4636]/10 text-[#1B4636]"
                              : "border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-main)]"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--ink-main)]">
                      {t.bagDrawer.notesLabel}
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm outline-none focus:border-[#1B4636]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutMode(false)}
                      className="rounded-full border border-[var(--border-strong)] px-4 py-3 text-xs font-semibold text-[var(--ink-main)] cursor-pointer"
                    >
                      {lang === "fa" ? "بازگشت" : "Back"}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-full bg-[#BF3927] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#A62E1E] cursor-pointer"
                    >
                      {t.bagDrawer.confirmOrder}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3.5">
                  {items.map((item) => {
                    const display = resolveBagDisplay(item, lang, t);
                    return (
                      <div
                        key={item.key}
                        className="flex gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 shadow-2xs"
                      >
                        <img
                          src={display.image || item.image}
                          alt={display.title}
                          className="h-20 w-20 shrink-0 rounded-xl object-cover bg-[#EFE8DA]"
                        />
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  item.kind === "service"
                                    ? "bg-[#BF3927]/10 text-[#BF3927]"
                                    : "bg-[#1B4636]/10 text-[#1B4636]"
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
                                onClick={() => onRemoveItem(item.key)}
                                className="text-[#8E968F] hover:text-[#BF3927] cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
                            <span className="text-xs font-bold text-[var(--accent-pine)]">
                              {formatPrice(item.unitPrice * item.qty, lang)}
                            </span>
                            {item.kind !== "service" && (
                              <div className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-page)] px-1.5 py-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateQty(item.key, item.qty - 1)
                                  }
                                  className="p-1 cursor-pointer"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold">
                                  {item.qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateQty(item.key, item.qty + 1)
                                  }
                                  className="p-1 cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
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
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-start transition cursor-pointer ${
                      giftWrap
                        ? "border-[#B89352] bg-[#F3ECE0]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[#B89352]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          giftWrap
                            ? "bg-[#1B4636] text-[#E7D19F]"
                            : "bg-[var(--bg-soft)] text-[#1B4636]"
                        }`}
                      >
                        <Gift className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--ink-main)]">
                          {t.bagDrawer.giftWrapTitle}
                        </p>
                        <p className="text-[11px] font-semibold text-[#1B4636]">
                          +{formatPrice(t.bagDrawer.giftWrapPrice, lang)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        giftWrap
                          ? "border-[#1B4636] bg-[#1B4636] text-white"
                          : "border-[#C8C0B2]"
                      }`}
                    >
                      {giftWrap && <Check className="h-3 w-3" />}
                    </span>
                  </button>

                  {/* Live Promo Code Form */}
                  <form onSubmit={handlePromoApply} className="space-y-1.5">
                    <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5">
                      <Tag className="h-3.5 w-3.5 text-[#B89352]" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder={t.bagDrawer.promoPlaceholder}
                        className="flex-1 bg-transparent text-xs text-[var(--ink-main)] outline-none placeholder:text-[#8E968F]"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-[#1B4636] px-3 py-1 text-[11px] font-bold text-white cursor-pointer"
                      >
                        {t.bagDrawer.promoApply}
                      </button>
                    </div>
                    {promoApplied && (
                      <p className="text-[11px] font-semibold text-[#1B4636] px-1">
                        ✓ {t.bagDrawer.promoApplied} (-{formatPrice(promoDiscount, lang)})
                      </p>
                    )}
                    {promoError && (
                      <p className="text-[11px] text-[#BF3927] px-1">
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
                  <span className="font-semibold text-[#1B4636]">
                    {shippingCost === 0
                      ? t.bagDrawer.shippingFree
                      : formatPrice(shippingCost, lang)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--ink-sub)]">{t.bagDrawer.subtotal}</span>
                  <span className="text-lg font-bold text-[var(--ink-main)]">
                    {formatPrice(grandTotal, lang)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutMode(true)}
                  className="w-full rounded-full bg-[#14201A] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1B4636] cursor-pointer"
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
