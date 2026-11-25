import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  SlidersHorizontal,
  ShoppingBag,
  Pause,
  Play,
} from "lucide-react";
import { CATEGORIES } from "../data/catalog";
import { formatPrice, formatNumber } from "../utils/pricing";
import Reveal from "./Reveal";
import ProductCard from "./ProductCard";
import { CategoryIndex, ProductRail, GalleryMosaic, AtelierIntro, TrustSection } from "./StorefrontSections";
import BoutiqueExtras from "./BoutiqueExtras";

export default function BoutiqueStorefront({
  t,
  lang,
  products = [],
  bundles = [],
  socialGallery = [],
  heroSlides = [],
  valueStrip = [],
  story = null,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  wishlist,
  wishlistOnly,
  onToggleWishlistOnly,
  onToggleWishlist,
  onAddToBag,
  onAddBundle,
  onAddGiftCard,
  onQuickView,
  onEnterServices,
  onOpenProduct,
  shipping,
  contact,
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [activePinIdx, setActivePinIdx] = useState(0);
  const isRtl = lang === "fa";

  const slides = heroSlides.length
    ? heroSlides.map((s) => ({
        image: s.image,
        ...(s[lang] || s.fa || {}),
      }))
    : t.heroSlides;
  const safeSlideIdx = slideIdx < slides.length ? slideIdx : 0;
  const activeSlide = slides[safeSlideIdx] || slides[0];

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const ArrowForward = isRtl ? ArrowLeft : ArrowRight;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const visibleProducts = products.filter((p) => p.visible !== false);
  const bestsellers = visibleProducts.filter((p) => p.badge === "bestseller");
  const favorites = (bestsellers.length >= 4 ? bestsellers : visibleProducts).slice(0, 4);

  const newArrivals = visibleProducts.filter((p) => p.badge === "new").slice(0, 4);
  const cardProps = { lang, t, wishlist, onToggleWishlist, onAddToBag, onQuickView, onOpenProduct };

  const pins = t.lookbook?.pins || [];
  const activePin = pins[activePinIdx] || pins[0];
  const activePinProduct =
    visibleProducts.find((p) => p.id === activePin?.id) || visibleProducts[0];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = visibleProducts.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory)
      return false;
    if (wishlistOnly && !wishlist.includes(p.id)) return false;
    if (!normalizedQuery) return true;
    const loc = p[lang] || p.fa;
    return (
      loc.title.toLowerCase().includes(normalizedQuery) ||
      loc.subtitle.toLowerCase().includes(normalizedQuery) ||
      loc.description.toLowerCase().includes(normalizedQuery) ||
      p.sku.toLowerCase().includes(normalizedQuery)
    );
  }).sort((a, b) => {
    if (sortBy === "priceAsc") return a.price - b.price;
    if (sortBy === "priceDesc") return b.price - a.price;
    if (sortBy === "newest")
      return (b.badge === "new" ? 1 : 0) - (a.badge === "new" ? 1 : 0);
    return 0;
  });

  const countByCategory = (catId) =>
    catId === "all"
      ? visibleProducts.length
      : visibleProducts.filter((p) => p.category === catId).length;

  const activeValueStrip = valueStrip.length
    ? valueStrip.map((v) => v[lang] || v.fa || v)
    : t.valueStrip;

  const activeStory = story?.[lang] || story?.fa || {
    eyebrow: t.storyEyebrow,
    title: t.storyTitle,
    body: t.storyBody,
  };

  const badgeStyle = (badge) => {
    if (badge === "new") return "bg-[var(--accent-crimson)] text-white";
    if (badge === "limited")
      return "bg-[#123126] text-[#F3E4BD] border border-[#D6B36A]/50";
    return "bg-[var(--bg-surface)] text-[var(--ink-main)] border border-[var(--border-subtle)]";
  };

  return (
    <main className="paper-grain animate-page-in">
      {/* 1. Compact Full-Bleed Editorial Storefront Hero */}
      <section className="paper-studio-hero border-b border-[var(--border-subtle)] bg-[var(--bg-soft)]">
        <div className="paper-studio-shell grid items-stretch md:grid-cols-12">
          {/* Editorial Copy Pane */}
          <div className="paper-studio-copy min-w-0 flex flex-col justify-center gap-5 px-4 py-6 sm:px-6 md:col-span-6 md:py-7 lg:py-8">
            <div className="space-y-2.5">
              <p className="eyebrow text-[var(--accent-gold)]">
                {activeSlide.eyebrow}
              </p>

              <h1
                className={`text-xl sm:text-2xl lg:text-[32px] font-bold leading-[1.28] text-[var(--ink-main)] ${
                  isRtl ? "" : "font-editorial"
                }`}
              >
                {activeSlide.title}
              </h1>

              <p className="max-w-lg text-xs sm:text-sm lg:text-[15px] leading-relaxed text-[var(--ink-sub)]">
                {activeSlide.desc}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 rounded-[3px] bg-[var(--accent-crimson)] px-5 py-2.5 text-xs lg:text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <span>{activeSlide.ctaPrimary}</span>
                  <ArrowForward className="h-4 w-4" aria-hidden="true" />
                </a>

                <a
                  href="#favorites"
                  className="text-xs lg:text-sm font-semibold text-[var(--ink-main)] underline underline-offset-4 transition hover:text-[var(--accent-gold)] py-1.5"
                >
                  {t.nav.newArrivals}
                </a>
              </div>

              {/* Slide Progress & Play/Pause Controls */}
              <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
                <div className="h-[2px] w-full overflow-hidden bg-[var(--border-subtle)]">
                  <div
                    key={`${safeSlideIdx}-${isPaused}`}
                    className={`h-full w-full bg-[var(--accent-pine)] ${
                      isPaused ? "opacity-35" : "animate-slide-progress"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSlideIdx(idx)}
                        aria-label={`Slide ${idx + 1}`}
                        className={`h-2 rounded-[2px] transition-all ${
                          idx === safeSlideIdx
                            ? "w-8 bg-[var(--accent-pine)]"
                            : "w-2 bg-[var(--border-strong)] hover:opacity-80"
                        }`}
                      />
                    ))}
                    <span className="tabular-nums ms-2 font-latin-ui text-xs font-semibold text-[var(--ink-sub)]">
                      0{safeSlideIdx + 1} / 0{slides.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsPaused((p) => !p)}
                      aria-label={isPaused ? "Play slides" : "Pause slides"}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-main)] transition hover:border-[var(--accent-gold)]"
                    >
                      {isPaused ? (
                        <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSlideIdx(
                          (prev) => (prev - 1 + slides.length) % slides.length
                        )
                      }
                      aria-label="Previous slide"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-main)] transition hover:border-[var(--accent-gold)]"
                    >
                      <PrevIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSlideIdx((prev) => (prev + 1) % slides.length)
                      }
                      aria-label="Next slide"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-main)] transition hover:border-[var(--accent-gold)]"
                    >
                      <NextIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Bleed Hero Photograph */}
          <div className="paper-studio-photo relative aspect-[16/10] sm:aspect-[16/9] md:aspect-auto md:h-full md:col-span-6 overflow-hidden bg-[var(--bg-muted)]">
            <img
              key={activeSlide.image}
              src={activeSlide.image}
              alt={activeSlide.title}
              width="1376"
              height="768"
              fetchPriority="high"
              decoding="sync"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 2. Category index */}
      <CategoryIndex t={t} lang={lang} counts={countByCategory} onSelectCategory={onSelectCategory} />

      {/* 3. Bestsellers & new arrivals */}
      <ProductRail id="favorites" eyebrow={t.favoritesEyebrow} title={t.favoritesTitle} subtitle={t.favoritesSubtitle} products={favorites} cardProps={cardProps} />
      <ProductRail id="new-arrivals" tone="surface" eyebrow={t.newArrivals.eyebrow} title={t.newArrivals.title} subtitle={t.newArrivals.subtitle} products={newArrivals} cardProps={cardProps} columns={newArrivals.length === 3 ? 3 : 4} />

      {/* 5. Interactive "Shop the Desk" Editorial Lookbook Band */}
      {t.lookbook && activePinProduct && (
        <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-[var(--accent-gold)]">
                    {t.lookbook.eyebrow}
                  </p>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[var(--ink-main)]">
                    {t.lookbook.title}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-[var(--ink-sub)]">
                    {t.lookbook.desc}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pins.map((pin, idx) => (
                    <button
                      key={pin.id}
                      type="button"
                      onClick={() => setActivePinIdx(idx)}
                      className={`rounded-[3px] px-3 py-1.5 text-xs font-bold transition ${
                        activePinIdx === idx
                          ? "bg-[var(--accent-deep)] text-[#E7D19F] border border-[var(--accent-gold)]/45"
                          : "bg-[var(--bg-soft)] text-[var(--ink-sub)] border border-[var(--border-subtle)] hover:text-[var(--ink-main)]"
                      }`}
                    >
                      0{idx + 1} · {pin.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid items-center gap-6 md:grid-cols-12">
                <div className="relative overflow-hidden rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-soft)] md:col-span-7 lg:col-span-8">
                  <img
                    src="./images/hero-boutique.jpg"
                    alt={t.lookbook.title}
                    loading="lazy"
                    decoding="async"
                    width="900"
                    height="506"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute inset-0" dir="ltr">
                    {pins.map((pin, idx) => {
                      const selected = activePinIdx === idx;
                      return (
                        <button
                          key={pin.id}
                          type="button"
                          onClick={() => setActivePinIdx(idx)}
                          aria-label={pin.label}
                          aria-pressed={selected}
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          className="group absolute -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center"
                        >
                          <span
                            className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white font-latin-ui text-[11px] font-bold shadow-md transition-transform group-hover:scale-110 ${
                              selected
                                ? "bg-[var(--accent-crimson)] text-white scale-110"
                                : "bg-[#123126] text-[#F3E4BD]"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Desk Item Card */}
                <div
                  key={activePinProduct.id}
                  className="animate-modal-in flex flex-col justify-between rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-5 sm:p-6 md:col-span-5 lg:col-span-4 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold tracking-wider text-[var(--accent-gold)] font-latin-ui">
                      <span>
                        0{activePinIdx + 1} / {activePinProduct.sku}
                      </span>
                      <span className="rounded-[2px] bg-[var(--accent-pine)]/15 px-2.5 py-0.5 text-[var(--accent-pine)]">
                        {t.categoryNames[activePinProduct.category]}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onQuickView(activePinProduct, 0)}
                      aria-label={activePinProduct[lang].title}
                      className="block w-full overflow-hidden rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                    >
                      <img
                        src={activePinProduct.image}
                        alt={activePinProduct[lang].title}
                        loading="lazy"
                        decoding="async"
                        width="400"
                        height="300"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </button>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[var(--ink-main)]">
                        {activePinProduct[lang].title}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--ink-sub)]">
                        {activePinProduct[lang].subtitle}
                      </p>
                    </div>

                    <p className="text-xs leading-relaxed text-[var(--ink-body)]">
                      {activePinProduct[lang].description}
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="tabular-nums text-lg font-bold text-[var(--accent-pine)]">
                        {formatPrice(activePinProduct.price, lang)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onQuickView(activePinProduct, 0)}
                        className="text-xs font-semibold text-[var(--ink-main)] underline underline-offset-4 hover:text-[var(--accent-gold)]"
                      >
                        {t.quickView}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddToBag(activePinProduct, 0, 1)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-[3px] bg-[var(--accent-deep)] border border-[var(--accent-gold)]/40 py-3 text-xs sm:text-sm font-semibold text-[#FAF6EE] transition hover:bg-[var(--accent-pine)]"
                    >
                      <ShoppingBag className="h-4 w-4 text-[#E7D19F]" aria-hidden="true" />
                      <span>{t.addToBag}</span>
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 6. Interactive Boutique Product Catalog */}
      <section
        id="catalog"
        className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
          <div>
            <p className="eyebrow text-[var(--accent-gold)]">
              {t.catalogEyebrow}
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[var(--ink-main)]">
              {t.catalogTitle}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleWishlistOnly}
              className={`inline-flex h-10 items-center gap-1.5 rounded-[3px] border px-3.5 text-xs font-semibold transition ${
                wishlistOnly
                  ? "border-[var(--accent-crimson)] bg-[var(--accent-crimson)] text-white"
                  : "border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-main)] hover:border-[var(--accent-gold)]"
              }`}
            >
              <Heart
                aria-hidden="true"
                className={`h-3.5 w-3.5 ${wishlistOnly ? "fill-current" : ""}`}
              />
              <span>{t.wishlist}</span>
            </button>

            <div className="inline-flex h-10 items-center gap-2 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--ink-sub)]" aria-hidden="true" />
              <label htmlFor="catalog-sort" className="sr-only">
                Sort
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-medium text-[var(--ink-main)]"
              >
                <option value="featured" className="bg-[var(--bg-surface)] text-[var(--ink-main)]">{t.sortOptions.featured}</option>
                <option value="newest" className="bg-[var(--bg-surface)] text-[var(--ink-main)]">{t.sortOptions.newest}</option>
                <option value="priceAsc" className="bg-[var(--bg-surface)] text-[var(--ink-main)]">{t.sortOptions.priceAsc}</option>
                <option value="priceDesc" className="bg-[var(--bg-surface)] text-[var(--ink-main)]">{t.sortOptions.priceDesc}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          {/* Category Sidebar */}
          <aside className="min-w-0 md:col-span-3">
            <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:sticky md:top-28 md:pb-0">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex shrink-0 items-center justify-between gap-3 border-b-2 px-1 py-3 text-sm transition md:border-b md:py-3.5 ${
                      isSelected
                        ? "border-[var(--accent-pine)] font-semibold text-[var(--accent-pine)]"
                        : "border-[var(--border-subtle)] text-[var(--ink-body)] hover:text-[var(--accent-pine)]"
                    }`}
                  >
                    <span className="truncate">{t.categoryNames[cat.id]}</span>
                    <span
                      className={"tabular-nums text-xs text-[var(--ink-sub)]"}
                    >
                      {formatNumber(countByCategory(cat.id), lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="min-w-0 md:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center space-y-4">
                <p className="text-sm text-[var(--ink-sub)]">
                  {t.noProductsFound}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory("all");
                    if (wishlistOnly) onToggleWishlistOnly();
                  }}
                  className="rounded-[3px] bg-[var(--accent-pine)] px-5 py-2.5 text-xs font-semibold text-white"
                >
                  {t.clearFilters}
                </button>
              </div>
            ) : (
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} {...cardProps} isWished={wishlist.includes(product.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6B. Gift Coffrets, Digital Gift Card & Studio Gallery */}
      <BoutiqueExtras
        t={t}
        lang={lang}
        products={visibleProducts}
        bundles={bundles}
        socialGallery={socialGallery}
        onAddBundle={onAddBundle}
        onAddGiftCard={onAddGiftCard}
        onQuickView={onQuickView}
      />

      <GalleryMosaic t={t} lang={lang} tiles={socialGallery} products={visibleProducts} onQuickView={onQuickView} />

      <AtelierIntro t={t} lang={lang} onEnterServices={onEnterServices} />

      {/* 7. Editorial Heritage Story Section */}
      <section
        id="heritage"
        className="border-y border-[var(--border-subtle)] bg-[var(--bg-soft)]"
      >
        <Reveal>
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="overflow-hidden">
                <img
                  src="./images/cat-decorative-paper.jpg"
                  alt={activeStory.title}
                  loading="lazy"
                  decoding="async"
                  width="500"
                  height="500"
                  className="aspect-[4/3] md:aspect-square w-full max-h-[380px] rounded-[2px] object-cover"
                />
              </div>
            </div>

            <div className="space-y-4 md:col-span-7 md:ps-6">
              <p className="eyebrow text-[var(--accent-gold)]">
                {activeStory.eyebrow}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug text-[var(--ink-main)]">
                {activeStory.title}
              </h2>
              <p className="text-sm sm:text-base leading-loose text-[var(--ink-body)]">
                {activeStory.body}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <TrustSection t={t} lang={lang} values={activeValueStrip} shipping={shipping} contact={contact} />
    </main>
  );
}
