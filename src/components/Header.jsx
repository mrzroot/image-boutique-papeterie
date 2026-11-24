import { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  Printer,
  ChevronDown,
  Menu,
  X,
  Phone,
  Sparkles,
  Store,
  ArrowUpRight,
} from "lucide-react";
import { CATEGORIES, PRODUCTS } from "../data/catalog";
import { formatPrice } from "../utils/pricing";

function BrandCrest() {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className="h-7 w-7 text-[#1B4636] transition-transform duration-500 group-hover:scale-105"
    >
      <circle
        cx="18"
        cy="18"
        r="16.5"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeDasharray="2 2"
      />
      <circle cx="18" cy="18" r="13.5" stroke="#B89352" strokeWidth="1" />
      <path
        d="M18 8.5L23 19.5L18 27L13 19.5L18 8.5Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M18 15.5V27" stroke="#B89352" strokeWidth="1.2" />
      <circle cx="18" cy="15.5" r="1.4" fill="#BF3927" />
    </svg>
  );
}

export default function Header({
  t,
  lang,
  onToggleLang,
  view,
  onNavigate,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  wishlistCount,
  onOpenBag,
  onToggleWishlistFilter,
  wishlistOnly,
  onQuickView,
}) {
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close search spotlight on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleCategoryClick = (catId) => {
    setCollectionsOpen(false);
    setMobileMenuOpen(false);
    onSelectCategory(catId);
    onNavigate("store", "catalog");
  };

  const quickMatches = searchQuery.trim()
    ? PRODUCTS.filter((p) => {
        const q = searchQuery.trim().toLowerCase();
        const loc = p[lang];
        return (
          loc.title.toLowerCase().includes(q) ||
          loc.subtitle.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
        );
      }).slice(0, 4)
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2D9C6] bg-[#FAF6EE]/92 backdrop-blur-xl transition-shadow">
      {/* Top Botanical Announcement & Utility Bar */}
      <div className="bg-[#123126] text-[#FAF6EE] text-xs border-b border-[#B89352]/25">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="tel:09353834393"
              className="hidden items-center gap-1.5 text-[#D8E5DD] hover:text-white sm:inline-flex font-latin-ui transition"
              dir="ltr"
            >
              <Phone className="h-3.5 w-3.5 text-[#C8A258]" />
              <span>0935-383-4393</span>
            </a>
            <span className="hidden text-[#4E7A66] sm:inline">|</span>
            <p className="truncate max-w-[55vw] sm:max-w-none text-[#F2EFE8]">
              {t.announcement}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() =>
                onNavigate(view === "store" ? "services" : "store")
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-[#FAF6EE] transition hover:bg-white/20 cursor-pointer"
            >
              {view === "store" ? (
                <>
                  <Printer className="h-3 w-3 text-[#F2B8A8]" />
                  <span className="hidden sm:inline">
                    {t.switchToServicesTop}
                  </span>
                  <span className="sm:hidden">
                    {lang === "fa" ? "خدمات چاپ" : "Services"}
                  </span>
                </>
              ) : (
                <>
                  <Store className="h-3 w-3 text-[#9BD4B8]" />
                  <span>{t.switchToStoreTop}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onToggleLang}
              aria-label="Toggle Language"
              className="inline-flex items-center gap-1 rounded-full border border-[#C8A258]/50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-white transition hover:bg-[#C8A258] hover:text-[#123126] cursor-pointer font-latin-ui"
            >
              <span
                className={
                  lang === "fa" ? "underline underline-offset-4" : "opacity-65"
                }
              >
                FA
              </span>
              <span className="opacity-40">/</span>
              <span
                className={
                  lang === "en" ? "underline underline-offset-4" : "opacity-65"
                }
              >
                EN
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Boutique Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Desktop & Laptop Nav (starts at md: 768px for scaled Windows displays) */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-5 text-xs lg:text-sm font-medium text-[#2A3730]">
          {/* Sleek Luxury Segmented Store / Services Switcher */}
          <div className="inline-flex items-center rounded-full border border-[#DFD6C3] bg-[#F1EBE0] p-0.5 lg:p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => onNavigate("store")}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold transition-all cursor-pointer ${
                view === "store"
                  ? "bg-[#14201A] text-[#FAF6EE] shadow-sm"
                  : "text-[#58655C] hover:text-[#14201A]"
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>{t.nav.home}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("services")}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 lg:px-3.5 py-1.5 text-[11px] lg:text-xs font-bold transition-all cursor-pointer ${
                view === "services"
                  ? "bg-[#BF3927] text-white shadow-sm"
                  : "text-[#1B4636] hover:bg-white/60"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.nav.servicesPortal}</span>
            </button>
          </div>

          {/* Collections Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCollectionsOpen(true)}
            onMouseLeave={() => setCollectionsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setCollectionsOpen((o) => !o)}
              className="inline-flex items-center gap-1 cursor-pointer transition hover:text-[#1B4636] whitespace-nowrap"
            >
              <span>{t.nav.collections}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
            {collectionsOpen && (
              <div className="absolute start-0 top-full pt-2.5 w-72 z-50">
                <div className="rounded-[22px] border border-[#DFD6C3] bg-[#FAF6EE] p-2.5 shadow-atelier">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-start text-sm text-[#14201A] transition hover:bg-[#EFE8DA] cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image}
                          alt={t.categoryNames[cat.id]}
                          className="h-9 w-9 rounded-lg object-cover border border-[#DFD6C3]"
                        />
                        <span className="font-medium">
                          {t.categoryNames[cat.id]}
                        </span>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[#8E968F] opacity-0 transition group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate("store", "heritage")}
            className="hidden xl:inline-block cursor-pointer transition hover:text-[#1B4636] whitespace-nowrap"
          >
            {t.nav.story}
          </button>
        </nav>

        {/* Mobile Menu Button (< 768px only) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DFD6C3] bg-white/70 text-[#14201A] md:hidden cursor-pointer"
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Center Luxury Brand Crest */}
        <button
          type="button"
          onClick={() => onNavigate("store")}
          className="flex items-center gap-2 text-center cursor-pointer group shrink-0"
        >
          <div className="hidden lg:block">
            <BrandCrest />
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <span className="font-latin-ui text-xs sm:text-sm lg:text-base font-bold tracking-[0.18em] lg:tracking-[0.24em] text-[#14201A] group-hover:text-[#1B4636] transition">
              {t.brandEn}
            </span>
            <span className="font-editorial italic text-[11px] sm:text-xs lg:text-[13px] text-[#1B4636] tracking-wide">
              La Boutique Papeterie
            </span>
          </div>
        </button>

        {/* End Side Actions: Search, Wishlist, Order Bag */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition cursor-pointer ${
              searchOpen
                ? "border-[#1B4636] bg-[#1B4636] text-white"
                : "border-[#DFD6C3] bg-white/75 text-[#14201A] hover:border-[#1B4636]"
            }`}
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleWishlistFilter();
              onNavigate("store", "catalog");
            }}
            aria-label={t.wishlist}
            className={`relative hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border transition cursor-pointer ${
              wishlistOnly
                ? "border-[#BF3927] bg-[#BF3927]/10 text-[#BF3927]"
                : "border-[#DFD6C3] bg-white/75 text-[#14201A] hover:border-[#1B4636]"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${wishlistOnly ? "fill-current" : ""}`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1B4636] px-1 text-[10px] font-bold text-white font-latin-ui">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenBag}
            className="relative inline-flex items-center gap-2 rounded-full bg-[#14201A] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#FAF6EE] shadow-sm transition hover:bg-[#1B4636] cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4 text-[#E7D19F]" />
            <span className="hidden sm:inline">{t.bag}</span>
            {cartCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#BF3927] px-1.5 text-[11px] font-bold text-white font-latin-ui">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Spotlight Search Drawer */}
      {searchOpen && (
        <div className="border-t border-[#E2D9C6] bg-[#F5EFE3]/95 backdrop-blur-md px-4 py-4 sm:px-6 animate-page-in">
          <div className="mx-auto max-w-3xl space-y-3">
            <div className="flex items-center gap-2.5 rounded-full border border-[#D4C9B4] bg-white px-4 py-2.5 shadow-2xs">
              <Search className="h-4 w-4 text-[#1B4636]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (view !== "store") onNavigate("store", "catalog");
                }}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent text-sm text-[#14201A] outline-none placeholder:text-[#8E968F]"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="text-xs text-[#58655C] hover:text-[#14201A] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Trending Tag Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {t.searchTags?.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onSearchChange(tag);
                    onNavigate("store", "catalog");
                  }}
                  className="rounded-full border border-[#DFD6C3] bg-white/80 px-3 py-1 text-[11px] font-medium text-[#2A3730] transition hover:border-[#1B4636] hover:bg-white cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Instant Visual Results Preview */}
            {quickMatches.length > 0 && (
              <div className="grid gap-2 pt-1 sm:grid-cols-2">
                {quickMatches.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      onQuickView(prod);
                    }}
                    className="flex items-center gap-3 rounded-2xl border border-[#E2D9C6] bg-white p-2 text-start transition hover:border-[#1B4636] cursor-pointer"
                  >
                    <img
                      src={prod.image}
                      alt={prod[lang].title}
                      className="h-12 w-12 rounded-xl object-cover bg-[#F1EBE0]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-[#14201A]">
                        {prod[lang].title}
                      </p>
                      <p className="text-[11px] font-semibold text-[#1B4636]">
                        {formatPrice(prod.price, lang)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E2D9C6] bg-[#FAF6EE] px-4 py-4 md:hidden space-y-3 animate-page-in">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate("store");
              }}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold text-start cursor-pointer ${
                view === "store"
                  ? "bg-[#1B4636] text-white"
                  : "bg-[#EFE8DA] text-[#14201A]"
              }`}
            >
              {t.nav.home}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate("services");
              }}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold text-start cursor-pointer ${
                view === "services"
                  ? "bg-[#BF3927] text-white"
                  : "bg-[#EFE8DA] text-[#1B4636] border border-[#1B4636]/30"
              }`}
            >
              {t.nav.servicesPortal}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2D9C6]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className="rounded-lg bg-white px-3 py-2 text-xs text-start text-[#2A3730] border border-[#E2D9C6] cursor-pointer"
              >
                {t.categoryNames[cat.id]}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
