import { useState, useEffect, useCallback } from "react";
import { Store, LayoutGrid, Printer, ShoppingBag } from "lucide-react";
import { TRANSLATIONS } from "./data/translations";
import Header from "./components/Header";
import BoutiqueStorefront from "./components/BoutiqueStorefront";
import ServicesPortal from "./components/ServicesPortal";
import ProductModal from "./components/ProductModal";
import OrderBagDrawer from "./components/OrderBagDrawer";
import Footer from "./components/Footer";

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [lang, setLang] = useState(() => readStorage("ib_lang", "fa"));
  const [theme, setTheme] = useState(() => readStorage("ib_theme", "light"));
  const [view, setView] = useState(() =>
    window.location.hash === "#/services" ? "services" : "store"
  );
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

  const t = TRANSLATIONS[lang];

  // Sync HTML dir, lang, theme, and title
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.title =
      lang === "fa"
        ? "ایمیج بوتیک | Image Boutique — La Boutique Papeterie"
        : "Image Boutique | La Boutique Papeterie — Fine Stationery & Print Atelier";
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

  const handleOpenQuickView = (product, variantIdx = 0) => {
    setActiveProduct(product);
    setActiveVariantIdx(variantIdx);
  };

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash === "#/services" ? "services" : "store");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2600);
  }, []);

  const handleNavigate = useCallback((targetView, scrollId) => {
    const nextHash = targetView === "services" ? "#/services" : "#/";
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

  const handleToggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddProductToBag = (product, variantIdx = 0, qty = 1) => {
    const key = `${product.id}::${variantIdx}`;
    const loc = product[lang];
    const variant = loc.variants[variantIdx] || loc.variants[0];
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
          meta: `${product.sku} · ${variant}`,
          unitPrice: product.price,
          qty,
          image: product.image,
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
      />

      <div className="flex-1">
        {view === "store" ? (
          <BoutiqueStorefront
            t={t}
            lang={lang}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            wishlist={wishlist}
            wishlistOnly={wishlistOnly}
            onToggleWishlistOnly={() => setWishlistOnly((w) => !w)}
            onToggleWishlist={handleToggleWishlist}
            onAddToBag={handleAddProductToBag}
            onQuickView={handleOpenQuickView}
            onEnterServices={() => handleNavigate("services")}
          />
        ) : (
          <ServicesPortal
            t={t}
            lang={lang}
            onBackToStore={() => handleNavigate("store")}
            onAddServiceJob={handleAddServiceJob}
          />
        )}
      </div>

      <Footer
        t={t}
        lang={lang}
        onNavigate={handleNavigate}
        onSelectCategory={setSelectedCategory}
      />

      {/* Floating Glassmorphic Mobile Navigation Dock (< 768px phones only) */}
      <div className="fixed bottom-3 inset-x-3 z-40 grid grid-cols-4 rounded-full border border-[var(--accent-gold)]/35 bg-[#123126]/92 py-1 text-[#FAF6EE] shadow-2xl backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={() => handleNavigate("store")}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-semibold ${
            view === "store" ? "text-[#E7D19F]" : "text-[#CFD8D2]"
          }`}
        >
          <Store className="h-4 w-4" />
          <span>{lang === "fa" ? "فروشگاه" : "Boutique"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate("store", "catalog")}
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-semibold text-[#CFD8D2]"
        >
          <LayoutGrid className="h-4 w-4" />
          <span>{lang === "fa" ? "دسته‌ها" : "Catalog"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate("services")}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-semibold ${
            view === "services" ? "text-[#F2B8A8]" : "text-[#CFD8D2]"
          }`}
        >
          <Printer className="h-4 w-4" />
          <span>{lang === "fa" ? "بخش خدماتی" : "Services"}</span>
        </button>

        <button
          type="button"
          onClick={() => setBagOpen(true)}
          className="relative flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-semibold text-[#FAF6EE]"
        >
          <ShoppingBag className="h-4 w-4 text-[#E7D19F]" />
          <span>{lang === "fa" ? "سبد خرید" : "Bag"}</span>
          {totalBagCount > 0 && (
            <span className="absolute top-1 end-4 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#BF3927] px-1 text-[9px] font-bold text-white font-latin-ui">
              {totalBagCount}
            </span>
          )}
        </button>
      </div>

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
        />
      )}

      {/* Unified Order Bag Drawer */}
      <OrderBagDrawer
        isOpen={bagOpen}
        onClose={() => setBagOpen(false)}
        items={bagItems}
        orderHistory={orderHistory}
        onSaveOrder={(order) => setOrderHistory((prev) => [order, ...prev])}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearBag={() => setBagItems([])}
        onNavigate={handleNavigate}
        lang={lang}
        t={t}
      />

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#14201A] px-5 py-2.5 text-xs font-semibold text-white shadow-xl border border-[#C8A258]/40 md:bottom-6">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
