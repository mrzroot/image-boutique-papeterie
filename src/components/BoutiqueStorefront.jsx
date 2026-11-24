import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Sparkles,
  Printer,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  ShoppingBag,
  Eye,
} from "lucide-react";
import { CATEGORIES, PRODUCTS } from "../data/catalog";
import { formatPrice, formatNumber } from "../utils/pricing";

export default function BoutiqueStorefront({
  t,
  lang,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  wishlist,
  wishlistOnly,
  onToggleWishlistOnly,
  onToggleWishlist,
  onAddToBag,
  onQuickView,
  onEnterServices,
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [activePinIdx, setActivePinIdx] = useState(0);
  const [cardVariants, setCardVariants] = useState({});
  const isRtl = lang === "fa";

  const slides = t.heroSlides;
  const activeSlide = slides[slideIdx] || slides[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const ArrowForward = isRtl ? ArrowLeft : ArrowRight;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  // Resolve active product in Shop-the-Desk interactive lookbook
  const pins = t.lookbook?.pins || [];
  const activePin = pins[activePinIdx] || pins[0];
  const activePinProduct =
    PRODUCTS.find((p) => p.id === activePin?.id) || PRODUCTS[0];

  // Filtered & sorted products
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = PRODUCTS.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory)
      return false;
    if (wishlistOnly && !wishlist.includes(p.id)) return false;
    if (!normalizedQuery) return true;
    const loc = p[lang];
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
      ? PRODUCTS.length
      : PRODUCTS.filter((p) => p.category === catId).length;

  const badgeStyle = (badge) => {
    if (badge === "new")
      return "bg-[#BF3927] text-white border border-[#E7D19F]/30";
    if (badge === "limited")
      return "bg-[#123126] text-[#F3E4BD] border border-[#C8A258]/50";
    return "bg-white/95 text-[#14201A] border border-[#DFD6C3]";
  };

  return (
    <main className="paper-grain animate-page-in">
      {/* 1. Cinematic Luxury Boutique Hero Carousel */}
      <section className="mx-auto max-w-7xl px-4 pt-5 pb-7 sm:px-6 lg:pt-7">
        <div className="relative overflow-hidden rounded-[30px] border border-[#D8CBB3] bg-[#F1EBE0] shadow-atelier">
          <div className="grid items-stretch md:grid-cols-12 md:h-[430px] lg:h-[480px]">
            {/* Editorial Copy Side */}
            <div className="min-w-0 flex flex-col justify-between p-6 sm:p-8 md:col-span-6 lg:p-11 relative">
              <div className="space-y-3 lg:space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#B89352]/45 bg-white/85 px-3 py-1 text-[10px] lg:text-[11px] font-semibold tracking-wider text-[#1B4636] shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#BF3927]" />
                  <span>{activeSlide.eyebrow}</span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-[38px] font-bold leading-[1.28] text-[#14201A]">
                  {activeSlide.title}
                </h1>

                <p className="max-w-xl text-xs sm:text-sm lg:text-base leading-relaxed text-[#4C5850] line-clamp-3">
                  {activeSlide.desc}
                </p>
              </div>

              <div className="mt-6 space-y-4 lg:space-y-5">
                <div className="flex flex-wrap items-center gap-2.5 lg:gap-3">
                  <a
                    href="#catalog"
                    className="inline-flex items-center gap-2 rounded-full bg-[#14201A] px-5 lg:px-7 py-3 text-xs lg:text-sm font-semibold text-[#FAF6EE] shadow-md transition duration-300 hover:bg-[#1B4636] hover:-translate-y-0.5"
                  >
                    <span>{activeSlide.ctaPrimary}</span>
                    <ArrowForward className="h-4 w-4 text-[#E7D19F]" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onEnterServices()}
                    className="inline-flex items-center gap-2 rounded-full border border-[#1B4636]/35 bg-white/85 px-4 lg:px-5 py-3 text-xs lg:text-sm font-semibold text-[#1B4636] transition duration-300 hover:bg-[#1B4636] hover:text-white cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>{activeSlide.ctaSecondary}</span>
                  </button>
                </div>

                {/* Slide Controls + Animated Progress Bar */}
                <div className="space-y-2.5 border-t border-[#DFD6C3] pt-3.5">
                  <div className="h-[2px] w-full overflow-hidden rounded-full bg-[#DFD6C3]">
                    <div
                      key={slideIdx}
                      className="h-full w-full bg-gradient-to-r from-[#B89352] via-[#1B4636] to-[#B89352] animate-slide-progress"
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
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === slideIdx
                              ? "w-8 bg-[#1B4636]"
                              : "w-2 bg-[#C8C0B2] hover:bg-[#1B4636]/50"
                          }`}
                        />
                      ))}
                      <span className="ms-2 font-latin-ui text-xs font-semibold text-[#58655C]">
                        0{slideIdx + 1} / 0{slides.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setSlideIdx(
                            (prev) => (prev - 1 + slides.length) % slides.length
                          )
                        }
                        aria-label="Previous slide"
                        className="inline-flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-full border border-[#D4C9B4] bg-white text-[#14201A] transition hover:border-[#1B4636] cursor-pointer"
                      >
                        <PrevIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSlideIdx((prev) => (prev + 1) % slides.length)
                        }
                        aria-label="Next slide"
                        className="inline-flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-full border border-[#D4C9B4] bg-white text-[#14201A] transition hover:border-[#1B4636] cursor-pointer"
                      >
                        <NextIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Uniform Locked-Height Photography Stage (identical box across all 3 slides) */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] md:aspect-auto md:h-full md:col-span-6 overflow-hidden bg-[#E9E1D2]">
              <img
                key={activeSlide.image}
                src={activeSlide.image}
                alt={activeSlide.title}
                className="h-full w-full object-cover object-center animate-ken-burns"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              <div className="absolute bottom-4 start-4 inline-flex items-center gap-2 rounded-full border border-[#E7D19F]/60 bg-[#123126]/90 px-3.5 py-1 text-xs font-bold text-[#F3E4BD] shadow-lg backdrop-blur-md">
                <span>✦</span>
                <span>{activeSlide.badge}</span>
              </div>
              <div className="hidden sm:block absolute top-4 end-4 rounded-full border border-white/40 bg-[#FAF6EE]/85 px-3 py-1 font-latin-ui text-[10px] font-bold tracking-[0.2em] text-[#14201A] backdrop-blur-md">
                LA BOUTIQUE PAPETERIE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Whisper-Quiet Editorial Atelier Marquee */}
      <div className="marquee-wrap overflow-hidden border-y border-[#E2D9C6] bg-[#F3ECE0] py-2.5 text-[11px] font-semibold tracking-[0.18em] text-[#1B4636]">
        <div className="animate-marquee items-center gap-8" dir="ltr">
          {[...t.marqueeItems, ...t.marqueeItems, ...t.marqueeItems].map(
            (item, idx) => (
              <span key={idx} className="inline-flex items-center gap-8 shrink-0">
                <span>{item}</span>
                <span className="text-[#B89352]">◆</span>
              </span>
            )
          )}
        </div>
      </div>

      {/* 2. Botanical Forest-Green 3-Column Value Strip */}
      <section className="bg-[#1B4636] text-[#FAF6EE]">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/15 px-4 py-6 sm:px-6 md:grid-cols-3 md:divide-y-0 md:divide-x rtl:md:divide-x-reverse">
          {t.valueStrip.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 py-3 md:px-6 md:py-1 first:md:ps-0 last:md:pe-0"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7D19F]/30 bg-white/10 text-[#E7D19F]">
                {i === 0 ? (
                  <Layers className="h-4 w-4" />
                ) : i === 1 ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#D7E3DC]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Visual Curated Collections Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#14201A]">
              {t.categoriesTitle}
            </h2>
            <p className="mt-1 text-sm text-[#58655C]">
              {t.categoriesSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <a
                key={cat.id}
                href="#catalog"
                onClick={() => onSelectCategory(cat.id)}
                className={`group overflow-hidden rounded-[22px] border p-2.5 transition duration-300 ${
                  active
                    ? "border-[#1B4636] bg-[#1B4636] text-white shadow-lg -translate-y-0.5"
                    : "border-[#E2D9C6] bg-white hover:border-[#B89352] hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <div className="aspect-square overflow-hidden rounded-2xl bg-[#EFE8DA]">
                  <img
                    src={cat.image}
                    alt={t.categoryNames[cat.id]}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-1 px-1">
                  <span className="text-xs font-bold leading-snug">
                    {t.categoryNames[cat.id]}
                  </span>
                  <span
                    className={`font-latin-ui text-[11px] font-semibold ${
                      active ? "text-[#E7D19F]" : "text-[#8E968F]"
                    }`}
                  >
                    {formatNumber(countByCategory(cat.id), lang)}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* 4. Interactive "Shop the Desk" Flat-Lay Lookbook */}
      {t.lookbook && activePinProduct && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <div className="rounded-[32px] border border-[#DFD6C3] bg-white p-5 sm:p-8 shadow-atelier">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-latin-ui text-[11px] font-bold tracking-[0.2em] text-[#B89352]">
                  {t.lookbook.eyebrow}
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[#14201A]">
                  {t.lookbook.title}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#58655C]">
                  {t.lookbook.desc}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pins.map((pin, idx) => (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => setActivePinIdx(idx)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                      activePinIdx === idx
                        ? "bg-[#14201A] text-[#E7D19F]"
                        : "bg-[#F1EBE0] text-[#4C5850] hover:bg-[#E5DCC9]"
                    }`}
                  >
                    0{idx + 1} · {pin.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid items-center gap-6 md:grid-cols-12">
              {/* Interactive Photo with Physical LTR Hotspot Coordinates */}
              <div className="relative overflow-hidden rounded-[24px] border border-[#E2D9C6] bg-[#F1EBE0] md:col-span-7 lg:col-span-8">
                <img
                  src="./images/hero-boutique.jpg"
                  alt={t.lookbook.title}
                  className="aspect-video w-full object-cover"
                />
                {/* Physical coordinate overlay fixed to dir="ltr" so photo pixels stay aligned in RTL & LTR */}
                <div className="absolute inset-0" dir="ltr">
                  {pins.map((pin, idx) => {
                    const selected = activePinIdx === idx;
                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => setActivePinIdx(idx)}
                        aria-label={pin.label}
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        className="group absolute -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center cursor-pointer"
                      >
                        <span
                          className={`absolute h-7 w-7 rounded-full animate-hotspot-ring ${
                            selected ? "bg-[#BF3927]" : "bg-[#E7D19F]"
                          }`}
                        />
                        <span
                          className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white font-latin-ui text-[10px] font-bold shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                            selected
                              ? "bg-[#BF3927] text-white scale-115"
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

              {/* Active Highlighted Desk Item Card */}
              <div className="flex flex-col justify-between rounded-[24px] border border-[#E2D9C6] bg-[#FAF6EE] p-5 sm:p-6 md:col-span-5 lg:col-span-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-[#B89352] font-latin-ui">
                    <span>0{activePinIdx + 1} / {activePinProduct.sku}</span>
                    <span className="rounded-full bg-[#1B4636]/10 px-2.5 py-0.5 text-[#1B4636]">
                      {t.categoryNames[activePinProduct.category]}
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-[#DFD6C3] bg-white">
                    <img
                      src={activePinProduct.image}
                      alt={activePinProduct[lang].title}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#14201A]">
                      {activePinProduct[lang].title}
                    </h3>
                    <p className="mt-1 text-xs text-[#58655C]">
                      {activePinProduct[lang].subtitle}
                    </p>
                  </div>

                  <p className="text-xs leading-relaxed text-[#4C5850]">
                    {activePinProduct[lang].description}
                  </p>
                </div>

                <div className="space-y-3 border-t border-[#E2D9C6] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#1B4636]">
                      {formatPrice(activePinProduct.price, lang)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuickView(activePinProduct)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#14201A] underline underline-offset-4 hover:text-[#1B4636] cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{t.quickView}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddToBag(activePinProduct, 0, 1)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#14201A] py-3 text-xs sm:text-sm font-semibold text-[#FAF6EE] transition hover:bg-[#1B4636] cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4 text-[#E7D19F]" />
                    <span>{t.addToBag}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Interactive Boutique Product Catalog */}
      <section
        id="catalog"
        className="mx-auto max-w-7xl px-4 pb-16 pt-2 sm:px-6"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#E2D9C6] pb-5">
          <div>
            <p className="font-latin-ui text-[11px] font-bold tracking-[0.2em] text-[#1B4636]">
              {t.catalogEyebrow}
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[#14201A]">
              {t.catalogTitle}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleWishlistOnly}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                wishlistOnly
                  ? "border-[#BF3927] bg-[#BF3927] text-white"
                  : "border-[#D4C9B4] bg-white text-[#2A3730] hover:border-[#1B4636]"
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${wishlistOnly ? "fill-current" : ""}`}
              />
              <span>{t.wishlist}</span>
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4C9B4] bg-white px-3.5 py-2 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#58655C]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-medium text-[#14201A] outline-none cursor-pointer"
              >
                <option value="featured">{t.sortOptions.featured}</option>
                <option value="newest">{t.sortOptions.newest}</option>
                <option value="priceAsc">{t.sortOptions.priceAsc}</option>
                <option value="priceDesc">{t.sortOptions.priceDesc}</option>
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
                    className={`flex shrink-0 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition cursor-pointer ${
                      isSelected
                        ? "border-[#14201A] bg-[#14201A] text-[#FAF6EE] shadow-md"
                        : "border-[#E2D9C6] bg-white text-[#2A3730] hover:border-[#B89352]"
                    }`}
                  >
                    <span>{t.categoryNames[cat.id]}</span>
                    <span
                      className={`font-latin-ui rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isSelected
                          ? "bg-white/15 text-[#E7D19F]"
                          : "bg-[#F1EBE0] text-[#58655C]"
                      }`}
                    >
                      {formatNumber(countByCategory(cat.id), lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* 3-Column Luxury Product Cards */}
          <div className="min-w-0 md:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-[#E2D9C6] bg-white p-12 text-center space-y-4">
                <p className="text-sm text-[#58655C]">{t.noProductsFound}</p>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory("all");
                    if (wishlistOnly) onToggleWishlistOnly();
                  }}
                  className="rounded-full bg-[#1B4636] px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
                >
                  {t.clearFilters}
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const loc = product[lang];
                  const isWished = wishlist.includes(product.id);
                  const activeVariantIdx = cardVariants[product.id] || 0;
                  return (
                    <article
                      key={product.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-[26px] border border-[#E2D9C6] bg-white p-3.5 transition duration-300 hover:-translate-y-1 hover:border-[#B89352] hover:shadow-atelier"
                    >
                      <div>
                        <div className="relative aspect-square overflow-hidden rounded-[20px] bg-[#F1EBE0]">
                          <img
                            src={product.image}
                            alt={loc.title}
                            onClick={() => onQuickView(product)}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105 cursor-pointer"
                          />

                          {product.badge && (
                            <span
                              className={`absolute top-3 start-3 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-xs ${badgeStyle(
                                product.badge
                              )}`}
                            >
                              {t.badges[product.badge]}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => onToggleWishlist(product.id)}
                            aria-label="Wishlist"
                            className={`absolute top-3 end-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-xs transition cursor-pointer ${
                              isWished
                                ? "text-[#BF3927]"
                                : "text-[#58655C] hover:text-[#BF3927]"
                            }`}
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                isWished ? "fill-current" : ""
                              }`}
                            />
                          </button>

                          {/* Desktop Hover Frosted Quick-View Bar */}
                          <button
                            type="button"
                            onClick={() => onQuickView(product)}
                            className="hidden lg:flex absolute inset-x-3 bottom-3 translate-y-2 opacity-0 items-center justify-center gap-1.5 rounded-full border border-white/40 bg-[#FAF6EE]/90 py-2 text-[11px] font-bold text-[#14201A] backdrop-blur-md shadow-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#1B4636]" />
                            <span>{t.quickView}</span>
                          </button>
                        </div>

                        <div className="px-1 pt-3.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-[#8E968F] font-latin-ui">
                            <span>{product.sku}</span>
                            <div className="flex items-center gap-1.5">
                              {product.swatches.map((hex, sIdx) => (
                                <button
                                  key={hex}
                                  type="button"
                                  title={loc.variants[sIdx]}
                                  onClick={() =>
                                    setCardVariants((prev) => ({
                                      ...prev,
                                      [product.id]: sIdx,
                                    }))
                                  }
                                  className={`h-3 w-3 rounded-full border transition cursor-pointer ${
                                    activeVariantIdx === sIdx
                                      ? "scale-125 border-[#14201A] ring-1 ring-[#B89352]"
                                      : "border-black/15 opacity-75 hover:opacity-100"
                                  }`}
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                          </div>

                          <h3
                            onClick={() => onQuickView(product)}
                            className="text-sm sm:text-[15px] font-bold text-[#14201A] leading-snug hover:text-[#1B4636] cursor-pointer"
                          >
                            {loc.title}
                          </h3>
                          <p className="text-xs text-[#58655C] line-clamp-1">
                            {loc.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#F1EBE0] px-1 pt-3">
                        <span className="text-sm font-bold text-[#1B4636]">
                          {formatPrice(product.price, lang)}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onQuickView(product)}
                            className="lg:hidden rounded-full border border-[#DFD6C3] px-2.5 py-1.5 text-[11px] font-semibold text-[#2A3730] cursor-pointer"
                          >
                            {t.quickView}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onAddToBag(product, activeVariantIdx, 1)
                            }
                            className="inline-flex items-center gap-1 rounded-full bg-[#BF3927] px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#A62E1E] cursor-pointer shadow-2xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>{t.addToBag}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Editorial Heritage Story Section */}
      <section id="heritage" className="border-y border-[#E2D9C6] bg-[#F1EBE0]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="overflow-hidden rounded-[26px] border border-[#D4C9B4] bg-white p-2.5 shadow-atelier">
              <img
                src="./images/cat-decorative-paper.jpg"
                alt={t.storyTitle}
                className="aspect-[4/3] md:aspect-square w-full max-h-[380px] rounded-[18px] object-cover"
              />
            </div>
          </div>

          <div className="space-y-4 md:col-span-7 md:ps-6">
            <p className="font-latin-ui text-xs font-bold tracking-[0.22em] text-[#B89352]">
              {t.storyEyebrow}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-snug text-[#14201A]">
              {t.storyTitle}
            </h2>
            <p className="text-sm sm:text-base leading-loose text-[#424E47]">
              {t.storyBody}
            </p>
            <div className="flex flex-wrap gap-3 pt-2 text-xs font-semibold text-[#1B4636]">
              <span className="rounded-full bg-white px-4 py-2 border border-[#DFD6C3] shadow-2xs">
                Rossi 1931 · Firenze Style
              </span>
              <span className="rounded-full bg-white px-4 py-2 border border-[#DFD6C3] shadow-2xs">
                Swiss Precision Deskware
              </span>
              <span className="rounded-full bg-white px-4 py-2 border border-[#DFD6C3] shadow-2xs">
                La Boutique Papeterie
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Architectural Services Portal Gateway ("مدخل بخش خدماتی") */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="overflow-hidden rounded-[32px] border border-[#C8A258]/40 bg-[#123126] text-[#FAF6EE] shadow-atelier">
          <div className="grid items-stretch md:grid-cols-12">
            <div className="space-y-5 p-7 sm:p-10 md:col-span-7 lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E7D19F]/30 bg-white/10 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-foil">
                <Printer className="h-3.5 w-3.5 text-[#E7D19F]" />
                <span>{t.gatewayEyebrow}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold leading-snug text-white">
                {t.gatewayTitle}
              </h2>

              <p className="text-sm sm:text-base leading-relaxed text-[#CFD8D2]">
                {t.gatewayDesc}
              </p>

              <div className="flex flex-wrap gap-2">
                {t.gatewayChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[#E7D19F]/25 bg-white/5 px-3.5 py-1.5 text-xs text-[#F3EFE6]"
                  >
                    ✦ {chip}
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onEnterServices()}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#BF3927] px-7 py-4 text-sm font-bold text-white shadow-lg transition duration-300 hover:bg-[#D54431] hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>{t.gatewayButton}</span>
                  <ArrowForward className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative aspect-[16/10] md:aspect-auto md:h-full md:col-span-5 overflow-hidden">
              <img
                src="./images/atelier-services.jpg"
                alt={t.gatewayTitle}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#123126]/35 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
