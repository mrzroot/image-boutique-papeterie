import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Store, LayoutGrid, Printer, ShoppingBag, ArrowUp } from "lucide-react";
import { TRANSLATIONS } from "./data/translations";
import {
  buildDefaultSiteContent,
  mergeSiteContent,
  CMS_DRAFT_KEY,
} from "./utils/cmsStore";
import Header from "./components/Header";
import BoutiqueStorefront from "./components/BoutiqueStorefront";
import ServicesPortal from "./components/ServicesPortal";
import ProductModal from "./components/ProductModal";
import ProductPage from "./components/ProductPage";
import OrderBagDrawer from "./components/OrderBagDrawer";
import Footer from "./components/Footer";

const AdminDashboard = lazy(() => import("./components/AdminDashboard"));

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function productIdFromHash() {
  const m = window.location.hash.match(/^#\/product\/([\w-]+)/);
  return m ? m[1] : null;
}

function viewFromHash() {
  const h = window.location.hash;
  if (productIdFromHash()) return "product";
  if (h === "#/services") return "services";
  if (h === "#/admin") return "admin";
  return "store";
}

export default function App() {
  const [lang, setLang] = useState(() => readStorage("ib_lang", "fa"));
  const [theme, setTheme] = useState(() => readStorage("ib_theme", "light"));
  const [view, setView] = useState(viewFromHash);
  const [productRoute, setProductRoute] = useState(() => ({ id: productIdFromHash(), variantIdx: 0 }));
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [wishlist, setWishlist] = useState(() => readStorage("ib_wish", []));
  const [bagItems, setBagItems] = useState(() => readStorage("ib_bag", []));
  const [orderHistory, setOrderHistory] = useState(() =>
    readStorage("ib_orders", [])
  );
  const [bagOpen, setBagOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [publishedBaseline, setPublishedBaseline] = useState(() =>
    buildDefaultSiteContent()
  );
  const [cmsContent, setCmsContent] = useState(() => {
    const base = buildDefaultSiteContent();
    const draft = readStorage(CMS_DRAFT_KEY, null);
    return draft ? mergeSiteContent(base, draft) : base;
  });
  const [hasLocalDraft, setHasLocalDraft] = useState(() =>
    Boolean(readStorage(CMS_DRAFT_KEY, null))
  );

  // Load live published site-content.json on startup and merge below any local admin draft
  useEffect(() => {
    let active = true;
    fetch(`./data/site-content.json?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((remote) => {
        if (!active || !remote) return;
        const mergedRemote = mergeSiteContent(buildDefaultSiteContent(), remote);
        setPublishedBaseline(mergedRemote);
        const draft = readStorage(CMS_DRAFT_KEY, null);
        setCmsContent(draft ? mergeSiteContent(mergedRemote, draft) : mergedRemote);
      })
      .catch(() => {
        // Offline or baseline mode
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 520);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.title =
      lang === "fa"
        ? "ایمیج بوتیک | Image Boutique · La Boutique Papeterie"
        : "Image Boutique | La Boutique Papeterie · Fine Stationery & Print Atelier";
    try {
      localStorage.setItem("ib_lang", JSON.stringify(lang));
    } catch {
      // Ignore storage quota errors
    }
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("ib_theme", JSON.stringify(theme));
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("ib_wish", JSON.stringify(wishlist));
    } catch {
      // Ignore storage errors
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem("ib_bag", JSON.stringify(bagItems));
    } catch {
      // Ignore storage errors
    }
  }, [bagItems]);

  useEffect(() => {
    try {
      localStorage.setItem("ib_orders", JSON.stringify(orderHistory));
    } catch {
      // Ignore storage errors
    }
  }, [orderHistory]);

  const handleUpdateContent = useCallback((updater) => {
    setCmsContent((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(CMS_DRAFT_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota warnings
      }
      setHasLocalDraft(true);
      return next;
    });
  }, []);

  const handleDiscardDraft = useCallback(
    (resetToFactory = false) => {
      try {
        localStorage.removeItem(CMS_DRAFT_KEY);
      } catch {
        // Ignore storage errors
      }
      setHasLocalDraft(false);
      setCmsContent(resetToFactory ? buildDefaultSiteContent() : publishedBaseline);
    },
    [publishedBaseline]
  );

  const handlePublished = useCallback((publishedObj) => {
    try {
      localStorage.removeItem(CMS_DRAFT_KEY);
    } catch {
      // Ignore storage errors
    }
    setHasLocalDraft(false);
    setPublishedBaseline(publishedObj);
    setCmsContent(publishedObj);
  }, []);

  const handleOpenQuickView = (product, variantIdx = 0) => {
    setActiveProduct(product);
    setActiveVariantIdx(variantIdx);
  };

  useEffect(() => {
    const handleHashChange = () => {
      setView(viewFromHash());
      const id = productIdFromHash();
      if (id) setProductRoute((prev) => (prev.id === id ? prev : { id, variantIdx: 0 }));
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2600);
  }, []);

  const handleNavigate = useCallback((targetView, scrollId) => {
    const nextHash =
      targetView === "services"
        ? "#/services"
        : targetView === "admin"
        ? "#/admin"
        : "#/";
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
    setView(targetView);
    setTimeout(() => {
      if (scrollId) {
        document.getElementById(scrollId)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 60);
  }, []);

  const handleOpenProduct = useCallback((product, variantIdx = 0) => {
    const nextHash = `#/product/${product.id}`;
    if (window.location.hash !== nextHash) window.history.pushState(null, "", nextHash);
    setActiveProduct(null);
    setProductRoute({ id: product.id, variantIdx });
    setView("product");
    window.scrollTo({ top: 0 });
  }, []);

  const handleToggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddProductToBag = (product, variantIdx = 0, qty = 1) => {
    const key = `${product.id}::${variantIdx}`;
    const loc = product[lang] || product.fa;
    const variants = loc.variants || [];
    const variant = variants[variantIdx] || variants[0] || "";
    setBagItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...prev,
        {
          key,
          kind: "product",
          productId: product.id,
          variantIdx,
          title: loc.title,
          meta: variant ? `${product.sku} · ${variant}` : product.sku,
          unitPrice: product.price,
          qty,
          image: product.variantImages?.[variantIdx] || product.image,
        },
      ];
    });
    showToast(
      lang === "fa"
        ? `«${loc.title}» به سبد سفارش اضافه شد.`
        : `Added "${loc.title}" to order bag.`
    );
  };

  const handleAddServiceJob = (job) => {
    setBagItems((prev) => [...prev, job]);
    showToast(t.orderSummary.jobAddedToast);
  };

  const handleAddBundle = (bundle) => {
    const key = `bundle::${bundle.id}`;
    const loc = bundle[lang] || bundle.fa;
    setBagItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          key,
          kind: "bundle",
          bundleId: bundle.id,
          title: loc.title,
          meta: `${bundle.sku} · ${loc.items}`,
          unitPrice: bundle.price,
          qty: 1,
          image: bundle.image,
        },
      ];
    });
    showToast(
      lang === "fa"
        ? `«${loc.title}» به سبد سفارش اضافه شد.`
        : `Added "${loc.title}" to order bag.`
    );
  };

  const handleAddGiftCard = ({ amount, design, recipient, message }) => {
    const key = `gc-${Date.now()}`;
    const finishLabel = t.giftCard.designs[design] || design;
    setBagItems((prev) => [
      ...prev,
      {
        key,
        kind: "giftcard",
        spec: { amount, design, recipient, message },
        title: `${t.giftCard.cardBadge} (${amount})`,
        meta: finishLabel,
        unitPrice: amount,
        qty: 1,
        image: "./images/cat-gift-packaging.jpg",
      },
    ]);
    showToast(
      lang === "fa"
        ? "کارت هدیه دیجیتال به سبد خرید اضافه شد."
        : "Digital gift card added to order bag."
    );
  };

  const handleUpdateQty = (key, nextQty) => {
    if (nextQty <= 0) {
      setBagItems((prev) => prev.filter((item) => item.key !== key));
      return;
    }
    setBagItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, qty: nextQty } : item))
    );
  };

  const handleRemoveItem = (key) => {
    setBagItems((prev) => prev.filter((item) => item.key !== key));
  };

  const totalBagCount = bagItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="min-h-screen overflow-x-clip flex flex-col bg-[var(--bg-page)] text-[var(--ink-main)] pb-20 md:pb-0">
      <Header
        t={t}
        lang={lang}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === "light" ? "dark" : "light"))
        }
        onToggleLang={() => setLang((prev) => (prev === "fa" ? "en" : "fa"))}
        view={view}
        onNavigate={handleNavigate}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalBagCount}
        wishlistCount={wishlist.length}
        onOpenBag={() => setBagOpen(true)}
        onToggleWishlistFilter={() => setWishlistOnly((w) => !w)}
        wishlistOnly={wishlistOnly}
        onQuickView={handleOpenQuickView}
        products={cmsContent.products}
        announcement={cmsContent.announcement?.[lang]}
        contactPhone={cmsContent.contact?.phone}
        hasLocalDraft={hasLocalDraft}
      />

      <div className="flex-1">
        {view === "store" ? (
          <BoutiqueStorefront
            t={t}
            lang={lang}
            products={cmsContent.products}
            bundles={cmsContent.bundles}
            socialGallery={cmsContent.socialGallery}
            heroSlides={cmsContent.heroSlides}
            valueStrip={cmsContent.valueStrip}
            story={cmsContent.story}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            wishlist={wishlist}
            wishlistOnly={wishlistOnly}
            onToggleWishlistOnly={() => setWishlistOnly((w) => !w)}
            onToggleWishlist={handleToggleWishlist}
            onAddToBag={handleAddProductToBag}
            onAddBundle={handleAddBundle}
            onAddGiftCard={handleAddGiftCard}
            onQuickView={handleOpenQuickView}
            onEnterServices={() => handleNavigate("services")}
            onOpenProduct={handleOpenProduct}
            shipping={cmsContent.shipping}
            contact={cmsContent.contact}
          />
        ) : view === "product" ? (
          <ProductPage
            product={cmsContent.products.find((p) => p.id === productRoute.id && p.visible !== false)}
            products={cmsContent.products}
            initialVariantIdx={productRoute.variantIdx}
            lang={lang}
            t={t}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToBag={handleAddProductToBag}
            onQuickView={handleOpenQuickView}
            onOpenProduct={handleOpenProduct}
            onBack={() => handleNavigate("store", "catalog")}
          />
        ) : view === "services" ? (
          <ServicesPortal
            t={t}
            lang={lang}
            pricingOverrides={cmsContent.pricing}
            servicesList={cmsContent.servicesList}
            tieredPriceRows={cmsContent.tieredPriceRows}
            servicesFaq={cmsContent.servicesFaq}
            onBackToStore={() => handleNavigate("store")}
            onAddServiceJob={handleAddServiceJob}
          />
        ) : (
          <Suspense
            fallback={
              <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-[var(--ink-sub)]">
                {lang === "fa" ? "در حال بارگذاری پنل مدیریت..." : "Loading Admin Dashboard..."}
              </div>
            }
          >
            <AdminDashboard
              lang={lang}
              t={t}
              cmsContent={cmsContent}
              hasLocalDraft={hasLocalDraft}
              onUpdateContent={handleUpdateContent}
              onDiscardDraft={handleDiscardDraft}
              onPublished={handlePublished}
              orderHistory={orderHistory}
              onUpdateOrders={setOrderHistory}
              onNavigate={handleNavigate}
              showToast={showToast}
            />
          </Suspense>
        )}
      </div>

      <Footer
        t={t}
        lang={lang}
        contact={cmsContent.contact}
        onNavigate={handleNavigate}
        onSelectCategory={setSelectedCategory}
      />

      {/* Flush Mobile Bottom Navigation (< 768px phones only) */}
      <nav
        aria-label={lang === "fa" ? "ناوبری موبایل" : "Mobile navigation"}
        className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-main)] md:hidden"
      >
        <button
          type="button"
          onClick={() => handleNavigate("store")}
          className={`flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold ${
            view === "store" ? "text-[var(--accent-pine)] font-bold" : "text-[var(--ink-sub)]"
          }`}
        >
          <Store className="h-4 w-4" aria-hidden="true" />
          <span>{lang === "fa" ? "فروشگاه" : "Boutique"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate("store", "catalog")}
          className="flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold text-[var(--ink-sub)]"
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          <span>{lang === "fa" ? "دسته‌ها" : "Catalog"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate("services")}
          className={`flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold ${
            view === "services" ? "text-[var(--accent-crimson)] font-bold" : "text-[var(--ink-sub)]"
          }`}
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span>{lang === "fa" ? "بخش خدماتی" : "Services"}</span>
        </button>

        <button
          type="button"
          onClick={() => setBagOpen(true)}
          className="relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold text-[var(--ink-main)]"
        >
          <ShoppingBag className="h-4 w-4 text-[var(--accent-gold)]" aria-hidden="true" />
          <span>{lang === "fa" ? "سبد خرید" : "Bag"}</span>
          {totalBagCount > 0 && (
            <span className="tabular-nums absolute top-1.5 end-4 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-crimson)] px-1 text-[9px] font-bold text-white font-latin-ui">
              {totalBagCount}
            </span>
          )}
        </button>
      </nav>

      {/* Quick View Modal */}
      {activeProduct && (
        <ProductModal
          product={activeProduct}
          initialVariantIdx={activeVariantIdx}
          lang={lang}
          t={t}
          isWishlisted={wishlist.includes(activeProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          onAddToBag={handleAddProductToBag}
          onClose={() => setActiveProduct(null)}
          onOpenProduct={handleOpenProduct}
        />
      )}

      {/* Unified Order Bag Drawer */}
      <OrderBagDrawer
        isOpen={bagOpen}
        onClose={() => setBagOpen(false)}
        items={bagItems}
        products={cmsContent.products}
        bundles={cmsContent.bundles}
        promoCodes={cmsContent.promoCodes}
        shipping={cmsContent.shipping}
        contact={cmsContent.contact}
        orderHistory={orderHistory}
        onSaveOrder={(order) => setOrderHistory((prev) => [order, ...prev])}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearBag={() => setBagItems([])}
        onNavigate={handleNavigate}
        lang={lang}
        t={t}
      />

      {/* Compact Back-to-Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="fixed bottom-18 end-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-[3px] border border-[var(--accent-gold)]/50 bg-[var(--accent-deep)] text-[#E7D19F] shadow-md transition hover:bg-[var(--accent-pine)] md:bottom-5 md:end-5"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {/* Toast Feedback */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-18 left-1/2 z-50 -translate-x-1/2 rounded-[4px] bg-[#14201A] px-5 py-2.5 text-xs font-semibold text-white shadow-xl border border-[#C8A258]/45 md:bottom-6"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
