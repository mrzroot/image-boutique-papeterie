import { useState } from "react";
import { Gift, Plus, ExternalLink } from "lucide-react";
import { BUNDLES, SOCIAL_GALLERY, PRODUCTS } from "../data/catalog";
import { formatPrice } from "../utils/pricing";
import Reveal from "./Reveal";

const GIFT_AMOUNTS = [500000, 1000000, 2000000, 5000000];

const CARD_FINISHES = {
  pine: {
    bg: "#123126",
    text: "#F3E4BD",
    border: "#D6B36A",
    accent: "#E7D19F",
  },
  ivory: {
    bg: "#F7F3EB",
    text: "#14201A",
    border: "#A68243",
    accent: "#183E30",
  },
  obsidian: {
    bg: "#0D0E0D",
    text: "#F4EFE6",
    border: "#D6B36A",
    accent: "#D6B36A",
  },
};

export default function BoutiqueExtras({
  t,
  lang,
  onAddBundle,
  onAddGiftCard,
  onQuickView,
}) {
  const [cardAmount, setCardAmount] = useState(1000000);
  const [cardDesign, setCardDesign] = useState("pine");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  const finish = CARD_FINISHES[cardDesign] || CARD_FINISHES.pine;

  const handleGiftCardSubmit = (e) => {
    e.preventDefault();
    onAddGiftCard({
      amount: cardAmount,
      design: cardDesign,
      recipient: recipient.trim(),
      message: message.trim(),
    });
  };

  return (
    <div className="space-y-14 pb-12">
      {/* 1. Curated Gift Coffrets ("COFFRETS & LOTS") */}
      <section id="coffrets" className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <p className="font-latin-ui text-[11px] font-bold tracking-[0.2em] text-[var(--accent-gold)]">
                {t.bundles.eyebrow}
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[var(--ink-main)]">
                {t.bundles.title}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[var(--ink-sub)]">
                {t.bundles.subtitle}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {BUNDLES.map((bundle) => {
              const loc = bundle[lang];
              return (
                <article
                  key={bundle.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--accent-gold)]"
                >
                  <div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-[var(--bg-soft)]">
                      <img
                        src={bundle.image}
                        alt={loc.title}
                        loading="lazy"
                        decoding="async"
                        width="600"
                        height="450"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                      <span className="absolute top-2.5 start-2.5 rounded-[2px] bg-[var(--accent-crimson)] px-2.5 py-1 text-[10px] font-bold text-white">
                        {t.bundles.saveLabel}
                      </span>
                    </div>

                    <div className="pt-4 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold tracking-wider text-[var(--ink-sub)]">
                        <span className="font-latin-ui">{bundle.sku}</span>
                        <span className="text-[var(--accent-gold)]">{loc.tag}</span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--ink-main)]">
                        {loc.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-[var(--ink-sub)]">
                        {loc.items}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-[var(--border-subtle)] pt-3.5">
                    <div className="tabular-nums flex items-center justify-between gap-2">
                      <span className="text-base font-bold text-[var(--accent-pine)]">
                        {formatPrice(bundle.price, lang)}
                      </span>
                      <span className="text-xs line-through text-[var(--ink-sub)]">
                        {formatPrice(bundle.originalPrice, lang)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddBundle(bundle)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-[3px] bg-[var(--accent-deep)] border border-[var(--accent-gold)]/40 py-2.5 text-xs font-bold text-[#FAF6EE] transition hover:bg-[var(--accent-pine)]"
                    >
                      <Plus className="h-3.5 w-3.5 text-[#E7D19F]" aria-hidden="true" />
                      <span>{t.bundles.addBundleBtn}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* 2. Interactive Digital Gift Card ("CARTE-CADEAU") */}
      <section id="gift-card" className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="grid items-center gap-8 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-10 lg:grid-cols-12">
            {/* Live Metallic-Foil Card Preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div
                className="relative flex aspect-[16/10] w-full max-w-md flex-col justify-between overflow-hidden rounded-[6px] border p-6 shadow-xl transition-colors duration-300"
                style={{
                  backgroundColor: finish.bg,
                  color: finish.text,
                  borderColor: `${finish.border}88`,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-3 rounded-[3px] border"
                  style={{ borderColor: `${finish.border}45` }}
                />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-latin-ui text-xs font-bold tracking-[0.22em]">
                      IMAGE BOUTIQUE
                    </p>
                    <p className="font-editorial italic text-xs opacity-85">
                      La Boutique Papeterie
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-[2px] px-2.5 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: `${finish.border}22`,
                      color: finish.accent,
                    }}
                  >
                    <Gift className="h-3 w-3" aria-hidden="true" />
                    <span>{t.giftCard.cardBadge}</span>
                  </span>
                </div>

                <div className="relative z-10 my-auto py-2 text-center space-y-1">
                  {recipient.trim() && (
                    <p className="text-xs font-semibold opacity-90">
                      {recipient.trim()}
                    </p>
                  )}
                  <p className="tabular-nums text-2xl sm:text-3xl font-bold tracking-tight">
                    {formatPrice(cardAmount, lang)}
                  </p>
                  {message.trim() && (
                    <p className="text-[11px] opacity-80 line-clamp-1">
                      «{message.trim()}»
                    </p>
                  )}
                </div>

                <div className="relative z-10 flex items-center justify-between text-[10px] font-latin-ui opacity-75">
                  <span>E-GIFT · INSTANT CODE</span>
                  <span>VALID 12 MONTHS</span>
                </div>
              </div>
            </div>

            {/* Gift Card Configurator Form */}
            <form
              onSubmit={handleGiftCardSubmit}
              className="space-y-5 lg:col-span-7"
            >
              <div>
                <p className="font-latin-ui text-[11px] font-bold tracking-[0.2em] text-[var(--accent-gold)]">
                  {t.giftCard.eyebrow}
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[var(--ink-main)]">
                  {t.giftCard.title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[var(--ink-sub)]">
                  {t.giftCard.desc}
                </p>
              </div>

              <div>
                <span className="mb-2 block text-xs font-bold text-[var(--ink-main)]">
                  {t.giftCard.amountLabel}
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {GIFT_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCardAmount(amt)}
                      className={`tabular-nums rounded-[3px] border px-3 py-2.5 text-xs font-bold transition ${
                        cardAmount === amt
                          ? "border-[var(--accent-pine)] bg-[var(--accent-pine)] text-white"
                          : "border-[var(--border-subtle)] bg-[var(--bg-soft)] text-[var(--ink-main)] hover:border-[var(--accent-gold)]"
                      }`}
                    >
                      {formatPrice(amt, lang)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-xs font-bold text-[var(--ink-main)]">
                  {t.giftCard.designLabel}
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(CARD_FINISHES).map((key) => {
                    const selected = cardDesign === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCardDesign(key)}
                        className={`inline-flex items-center gap-2 rounded-[3px] border px-3.5 py-2 text-xs font-semibold transition ${
                          selected
                            ? "border-[var(--accent-gold)] bg-[var(--accent-deep)] text-[#FAF6EE]"
                            : "border-[var(--border-strong)] bg-[var(--bg-soft)] text-[var(--ink-main)]"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-white/40"
                          style={{ backgroundColor: CARD_FINISHES[key].bg }}
                        />
                        <span>{t.giftCard.designs[key]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="giftcard-recipient"
                    className="mb-1.5 block text-xs font-bold text-[var(--ink-main)]"
                  >
                    {t.giftCard.recipientLabel}
                  </label>
                  <input
                    id="giftcard-recipient"
                    type="text"
                    maxLength={40}
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={t.giftCard.recipientPlaceholder}
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-soft)] px-4 py-2.5 text-xs sm:text-sm text-[var(--ink-main)] placeholder:text-[var(--ink-sub)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="giftcard-message"
                    className="mb-1.5 block text-xs font-bold text-[var(--ink-main)]"
                  >
                    {t.giftCard.messageLabel}
                  </label>
                  <input
                    id="giftcard-message"
                    type="text"
                    maxLength={60}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.giftCard.messagePlaceholder}
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-soft)] px-4 py-2.5 text-xs sm:text-sm text-[var(--ink-main)] placeholder:text-[var(--ink-sub)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-[3px] bg-[var(--accent-crimson)] px-7 py-3.5 text-xs sm:text-sm font-bold text-white transition hover:opacity-90"
              >
                <Gift className="h-4 w-4" aria-hidden="true" />
                <span>{t.giftCard.addCardBtn}</span>
              </button>
            </form>
          </div>
        </Reveal>
      </section>

      {/* 3. Studio Gallery Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="font-latin-ui text-[11px] font-bold tracking-[0.22em] text-[var(--accent-gold)]">
                {t.socialSection.eyebrow}
              </p>
              <h2 className="mt-1 text-xl sm:text-2xl font-bold text-[var(--ink-main)]">
                {t.socialSection.title}
              </h2>
            </div>
            <p className="text-xs text-[var(--ink-sub)]">
              {t.socialSection.hint}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {SOCIAL_GALLERY.map((tile) => {
              const targetProduct =
                PRODUCTS.find((p) => p.id === tile.productId) || PRODUCTS[0];
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => onQuickView(targetProduct, 0)}
                  className="group relative aspect-square overflow-hidden rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-soft)]"
                >
                  <img
                    src={tile.image}
                    alt={targetProduct[lang].title}
                    loading="lazy"
                    decoding="async"
                    width="300"
                    height="300"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 p-2 text-center text-white opacity-0 transition duration-200 group-hover:opacity-100">
                    <ExternalLink className="h-4 w-4 text-[#E7D19F]" aria-hidden="true" />
                    <span className="text-[11px] font-bold line-clamp-2">
                      {targetProduct[lang].title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
