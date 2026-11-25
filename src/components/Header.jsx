import { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  ChevronDown,
  Menu,
  X,
  Phone,
  ArrowUpRight,
  Sun,
  Moon,
  Store,
} from "lucide-react";
import { CATEGORIES, PRODUCTS } from "../data/catalog";
import { formatPrice } from "../utils/pricing";

function BrandCrest() {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className="h-7 w-7 text-[var(--accent-pine)] transition-transform duration-500 group-hover:scale-105"
    >
      <circle
        cx="18"
        cy="18"
        r="16.5"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeDasharray="2 2"
      />
      <circle cx="18" cy="18" r="13.5" stroke="var(--accent-gold)" strokeWidth="1" />
      <path
        d="M18 8.5L23 19.5L18 27L13 19.5L18 8.5Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M18 15.5V27" stroke="var(--accent-gold)" strokeWidth="1.2" />
      <circle cx="18" cy="15.5" r="1.4" fill="var(--accent-crimson)" />
    </svg>
  );
}

export default function Header({
  t,
  lang,
  theme,
  onToggleTheme,
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
    <header
      className="sticky top-0 z-40 border-b border-[var(--border-subtle)] backdrop-blur-md transition-colors"
      style={{ backgroundColor: "var(--header-bg)" }}
    >
      {/* Top Announcement & Utility Bar */}
      <div
        className="text-[#FAF6EE] text-xs border-b border-[var(--accent-gold)]/25"
        style={{ backgroundColor: "var(--topbar-bg)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="tel:09353834393"
              className="hidden items-center gap-1.5 text-[#D8E5DD] hover:text-white sm:inline-flex font-latin-ui transition"
              dir="ltr"
            >
              <Phone className="h-3.5 w-3.5 text-[#D6B36A]" aria-hidden="true" />
              <span>0935-383-4393</span>
            </a>
            <span className="hidden text-white/20 sm:inline" aria-hidden="true">|</span>
            <p className="truncate max-w-[50vw] sm:max-w-none text-[#F2EFE8]">
              {t.announcement}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Obsidian Black / Light Boutique Theme Switcher */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              className="inline-flex items-center gap-1.5 rounded-[3px] border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#FAF6EE] transition hover:bg-white/20"
            >
              {theme === "light" ? (
                <>
                  <Moon className="h-3 w-3 text-[#E7D19F]" aria-hidden="true" />
                  <span>{t.themeDark}</span>
                </>
              ) : (
                <>
                  <Sun className="h-3 w-3 text-[#E7D19F]" aria-hidden="true" />
                  <span>{t.themeLight}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onToggleLang}
              aria-label="Toggle Language"
              className="inline-flex items-center gap-1 rounded-[3px] border border-[#D6B36A]/50 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white transition hover:bg-[#D6B36A] hover:text-[#123126] font-latin-ui"
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

      {/* Main Storefront Navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Desktop Storefront Links */}
        <nav
          aria-label={lang === "fa" ? "منوی اصلی" : "Primary"}
          className="hidden md:flex items-center gap-4 lg:gap-5 text-xs lg:text-sm font-medium text-[var(--ink-main)]"
        >
          <button
            type="button"
            onClick={() => onNavigate("store")}
            className={`transition hover:text-[var(--accent-gold)] whitespace-nowrap ${
              view === "store" ? "font-bold text-[var(--accent-pine)]" : ""
            }`}
          >
            {t.nav.home}
          </button>

          <button
            type="button"
            onClick={() => onNavigate("store", "favorites")}
            className="hidden lg:inline-block transition hover:text-[var(--accent-gold)] whitespace-nowrap"
          >
            {t.nav.newArrivals}
          </button>

          {/* Collections Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCollectionsOpen(true)}
            onMouseLeave={() => setCollectionsOpen(false)}
          >
            <button
              type="button"
              aria-expanded={collectionsOpen}
              onClick={() => setCollectionsOpen((o) => !o)}
              className="inline-flex items-center gap-1 transition hover:text-[var(--accent-gold)] whitespace-nowrap"
            >
              <span>{t.nav.collections}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </button>
            {collectionsOpen && (
              <div className="absolute start-0 top-full pt-2.5 w-72 z-50">
                <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-atelier">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-[3px] px-3 py-2 text-start text-sm text-[var(--ink-main)] transition hover:bg-[var(--bg-soft)] group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image}
                          alt={t.categoryNames[cat.id]}
                          width="36"
                          height="36"
                          className="h-9 w-9 rounded-[3px] object-cover border border-[var(--border-subtle)]"
                        />
                        <span className="font-medium">
                          {t.categoryNames[cat.id]}
                        </span>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[var(--ink-sub)] opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate("store", "heritage")}
            className="hidden xl:inline-block transition hover:text-[var(--accent-gold)] whitespace-nowrap"
          >
            {t.nav.story}
          </button>

          {/* Separated Services Portal Trigger */}
          <span className="text-[var(--border-strong)]" aria-hidden="true">|</span>
          <button
            type="button"
            onClick={() => onNavigate("services")}
            className={`inline-flex items-center gap-1 text-xs font-semibold transition whitespace-nowrap ${
              view === "services"
                ? "text-[var(--accent-crimson)] underline underline-offset-4"
                : "text-[var(--ink-sub)] hover:text-[var(--accent-gold)]"
            }`}
          >
            <span>{t.nav.servicesPortal}</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </nav>

        {/* Mobile Menu Button (< 768px only) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-main)] md:hidden"
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {/* Center Brand Crest */}
        <button
          type="button"
          onClick={() => onNavigate("store")}
          className="flex items-center gap-2 text-center group shrink-0"
        >
          <div className="hidden lg:block">
            <BrandCrest />
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <span className="font-latin-ui text-xs sm:text-sm lg:text-base font-bold tracking-[0.18em] lg:tracking-[0.24em] text-[var(--ink-main)] group-hover:text-[var(--accent-gold)] transition">
              {t.brandEn}
            </span>
            <span className="font-editorial italic text-[11px] sm:text-xs lg:text-[13px] text-[var(--accent-pine)] tracking-wide">
              La Boutique Papeterie
            </span>
          </div>
        </button>

        {/* End Side Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search"
            aria-expanded={searchOpen}
            className={`inline-flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-[3px] border transition ${
              searchOpen
                ? "border-[var(--accent-pine)] bg-[var(--accent-pine)] text-white"
                : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-main)] hover:border-[var(--accent-gold)]"
            }`}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleWishlistFilter();
              onNavigate("store", "catalog");
            }}
            aria-label={t.wishlist}
            className={`relative hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-[3px] border transition ${
              wishlistOnly
                ? "border-[var(--accent-crimson)] bg-[var(--accent-crimson)]/15 text-[var(--accent-crimson)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-main)] hover:border-[var(--accent-gold)]"
            }`}
          >
            <Heart
              aria-hidden="true"
              className={`h-4 w-4 ${wishlistOnly ? "fill-current" : ""}`}
            />
            {wishlistCount > 0 && (
              <span className="tabular-nums absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-pine)] px-1 text-[10px] font-bold text-white font-latin-ui">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenBag}
            aria-label={t.bag}
            className="relative inline-flex h-11 sm:h-10 items-center gap-2 rounded-[3px] border border-[var(--accent-gold)]/45 bg-[var(--accent-deep)] px-3.5 text-xs sm:text-sm font-semibold text-[#FAF6EE] transition hover:bg-[var(--accent-pine)]"
          >
            <ShoppingBag className="h-4 w-4 text-[#E7D19F]" aria-hidden="true" />
            <span className="hidden sm:inline">{t.bag}</span>
            {cartCount > 0 && (
              <span className="tabular-nums inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-crimson)] px-1.5 text-[11px] font-bold text-white font-latin-ui">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Spotlight Search Drawer */}
      {searchOpen && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-soft)] px-4 py-4 sm:px-6 animate-page-in">
          <div className="mx-auto max-w-3xl space-y-3">
            <div className="flex items-center gap-2.5 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5">
              <Search className="h-4 w-4 text-[var(--accent-pine)]" aria-hidden="true" />
              <label htmlFor="boutique-search" className="sr-only">
                {t.searchPlaceholder}
              </label>
              <input
                id="boutique-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (view !== "store") onNavigate("store", "catalog");
                }}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent text-sm text-[var(--ink-main)] placeholder:text-[var(--ink-sub)]"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label={lang === "fa" ? "پاک کردن جستجو" : "Clear search"}
                  className="text-xs text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {t.searchTags?.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onSearchChange(tag);
                    onNavigate("store", "catalog");
                  }}
                  className="rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--ink-main)] transition hover:border-[var(--accent-gold)]"
                >
                  {tag}
                </button>
              ))}
            </div>

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
                    className="flex items-center gap-3 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 text-start transition hover:border-[var(--accent-gold)]"
                  >
                    <img
                      src={prod.image}
                      alt={prod[lang].title}
                      width="48"
                      height="48"
                      className="h-12 w-12 rounded-[3px] object-cover bg-[var(--bg-soft)]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-[var(--ink-main)]">
                        {prod[lang].title}
                      </p>
                      <p className="tabular-nums text-[11px] font-semibold text-[var(--accent-gold)]">
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
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-page)] px-4 py-4 md:hidden space-y-3 animate-page-in">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate("store");
              }}
              className={`inline-flex items-center gap-1.5 rounded-[3px] px-3 py-3 text-sm font-semibold text-start ${
                view === "store"
                  ? "bg-[var(--accent-pine)] text-white"
                  : "bg-[var(--bg-soft)] text-[var(--ink-main)]"
              }`}
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              <span>{t.nav.home}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate("services");
              }}
              className={`rounded-[3px] px-3 py-3 text-sm font-semibold text-start ${
                view === "services"
                  ? "bg-[var(--accent-crimson)] text-white"
                  : "bg-[var(--bg-soft)] text-[var(--ink-main)] border border-[var(--border-subtle)]"
              }`}
            >
              {t.nav.servicesPortal}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className="rounded-[3px] bg-[var(--bg-surface)] px-3 py-2.5 text-xs text-start text-[var(--ink-main)] border border-[var(--border-subtle)]"
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
