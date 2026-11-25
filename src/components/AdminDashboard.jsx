import { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  Gift,
  Printer,
  ShoppingBag,
  UploadCloud,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Store,
  Search,
} from "lucide-react";
import { CATEGORIES, MODEL_TYPES, STUDIO_IMAGE_PRESETS } from "../data/catalog";
import { formatPrice, formatNumber } from "../utils/pricing";
import {
  CMS_GH_KEY,
  hashPasscode,
  compressImageFile,
  publishSiteContentToGitHub,
  mergeSiteContent,
  buildDefaultSiteContent,
} from "../utils/cmsStore";

const ADMIN_SESSION_KEY = "ib_admin_unlocked_v1";

function cloneObj(o) {
  return JSON.parse(JSON.stringify(o));
}

function createEmptyProduct() {
  const uid = `prod-${Date.now().toString(36)}`;
  return {
    id: uid,
    sku: `IB-NEW-${Math.floor(100 + Math.random() * 899)}`,
    category: "notebooks",
    modelType: "framed-box",
    specs3d: { fa: "نسخه جدید بوتیک", en: "New Boutique Edition" },
    badge: "new",
    price: 750000,
    visible: true,
    inStock: true,
    image: STUDIO_IMAGE_PRESETS[0],
    variantImages: [STUDIO_IMAGE_PRESETS[0]],
    swatches: ["#1F4E3D"],
    fa: {
      title: "محصول جدید بوتیک",
      subtitle: "مشخصات کوتاه محصول",
      origin: "طراحی اختصاصی ایمیج بوتیک",
      description: "توضیحات کامل محصول جدید در ویترین ایمیج بوتیک.",
      variants: ["مدل استاندارد"],
    },
    en: {
      title: "New Boutique Item",
      subtitle: "Short product summary",
      origin: "Image Boutique Edition",
      description: "Full description for the new boutique product.",
      variants: ["Standard Edition"],
    },
  };
}

function ImageField({ label, value, onChange, lang, compact = false }) {
  const [pickingPreset, setPickingPreset] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImageFile(file, 900, 0.84);
      onChange(compressed);
    } catch {
      // Ignore invalid image
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <span className="block text-[11px] font-bold text-[var(--ink-main)]">{label}</span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <img
          src={value || STUDIO_IMAGE_PRESETS[0]}
          alt=""
          className={`${
            compact ? "h-10 w-10" : "h-14 w-14"
          } shrink-0 rounded-[3px] border border-[var(--border-subtle)] object-cover bg-[var(--bg-soft)]`}
        />
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--ink-main)] hover:border-[var(--accent-gold)]">
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {busy
              ? lang === "fa"
                ? "در حال فشرده‌سازی..."
                : "Compressing..."
              : lang === "fa"
              ? "آپلود تصویر"
              : "Upload"}
          </span>
          <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
        </label>
        <button
          type="button"
          onClick={() => setPickingPreset((v) => !v)}
          className="rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
        >
          {lang === "fa" ? "گالری آماده" : "Studio Gallery"}
        </button>
      </div>
      <input
        type="text"
        dir="ltr"
        value={value?.startsWith("data:") ? "(Uploaded compressed image)" : value || ""}
        onChange={(e) => {
          if (!e.target.value.startsWith("(")) onChange(e.target.value);
        }}
        placeholder="./images/cat-notebooks.jpg"
        className="w-full rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-page)] px-2.5 py-1.5 text-[11px] font-latin-ui text-[var(--ink-main)]"
      />
      {pickingPreset && (
        <div className="grid grid-cols-6 gap-1.5 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-2 max-h-40 overflow-y-auto">
          {STUDIO_IMAGE_PRESETS.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                onChange(src);
                setPickingPreset(false);
              }}
              className={`aspect-square overflow-hidden rounded-[2px] border transition ${
                value === src
                  ? "border-[var(--accent-crimson)] ring-2 ring-[var(--accent-gold)]"
                  : "border-[var(--border-subtle)] hover:border-[var(--accent-gold)]"
              }`}
              title={src}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard({
  lang,
  t,
  cmsContent,
  hasLocalDraft,
  onUpdateContent,
  onDiscardDraft,
  onPublished,
  orderHistory = [],
  onUpdateOrders,
  onNavigate,
  showToast,
}) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);

  const [tab, setTab] = useState("overview");
  const [productQuery, setProductQuery] = useState("");
  const [productCatFilter, setProductCatFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // GitHub Live Publish Config (stored locally only)
  const [ghConfig, setGhConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(CMS_GH_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage error
    }
    return {
      owner: "mrzroot",
      repo: "image-boutique-papeterie",
      branch: "main",
      token: "",
    };
  });
  const [publishing, setPublishing] = useState(false);
  const [publishLog, setPublishLog] = useState("");
  const [publishResult, setPublishResult] = useState(null);
  const [publishError, setPublishError] = useState("");

  // Settings Passcode Update
  const [newPasscode, setNewPasscode] = useState("");
  const [newPromo, setNewPromo] = useState({ code: "", percent: 15 });

  useEffect(() => {
    try {
      localStorage.setItem(CMS_GH_KEY, JSON.stringify(ghConfig));
    } catch {
      // Ignore storage errors
    }
  }, [ghConfig]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    const hashed = await hashPasscode(passInput.trim());
    const target = cmsContent?.settings?.adminPasscodeHash;
    if (hashed === target) {
      setUnlocked(true);
      setPassError(false);
      setPassInput("");
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      } catch {
        // Ignore
      }
    } else {
      setPassError(true);
    }
  };

  const handleLock = () => {
    setUnlocked(false);
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // Ignore
    }
  };

  if (!unlocked) {
    return (
      <main className="mx-auto max-w-md px-4 py-14 sm:px-6 animate-page-in">
        <div className="rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-atelier space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[4px] bg-[var(--accent-deep)] text-[#E7D19F]">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-latin-ui text-[10px] font-bold tracking-[0.2em] text-[var(--accent-gold)]">
                IMAGE BOUTIQUE CMS
              </p>
              <h1 className="text-lg font-bold text-[var(--ink-main)]">
                {lang === "fa" ? "ورود به داشبورد مدیریت" : "Admin Dashboard Login"}
              </h1>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-[var(--ink-sub)]">
            {lang === "fa"
              ? "برای مدیریت محصولات، قیمت چاپ، بنرها، سفارش‌ها و انتشار مستقیم روی سایت زنده رمز مدیریت را وارد کنید. (رمز پیش‌فرض: 1405)"
              : "Enter your admin passcode to manage products, print rates, banners, orders, and live publishing. (Default passcode: 1405)"}
          </p>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <label
                htmlFor="admin-passcode-input"
                className="mb-1.5 block text-xs font-bold text-[var(--ink-main)]"
              >
                {lang === "fa" ? "رمز عبور مدیریت" : "Admin Passcode"}
              </label>
              <input
                id="admin-passcode-input"
                type="password"
                dir="ltr"
                required
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="1405"
                className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm font-latin-ui text-[var(--ink-main)]"
                autoFocus
              />
            </div>

            {passError && (
              <p className="text-xs font-semibold text-[var(--accent-crimson)]">
                {lang === "fa" ? "رمز عبور نادرست است." : "Incorrect passcode."}
              </p>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-[3px] bg-[var(--accent-pine)] px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:opacity-90"
            >
              <Unlock className="h-4 w-4" aria-hidden="true" />
              <span>{lang === "fa" ? "ورود به پنل مدیریت" : "Unlock Dashboard"}</span>
            </button>
          </form>

          <button
            type="button"
            onClick={() => onNavigate("store")}
            className="w-full text-center text-xs font-medium text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
          >
            {lang === "fa" ? "بازگشت به ویترین فروشگاه" : "Back to Storefront"}
          </button>
        </div>
      </main>
    );
  }

  const products = cmsContent.products || [];
  const bundles = cmsContent.bundles || [];
  const heroSlides = cmsContent.heroSlides || [];
  const servicesList = cmsContent.servicesList || [];
  const tieredRows = cmsContent.tieredPriceRows || [];
  const faqList = cmsContent.servicesFaq || [];
  const promoCodes = cmsContent.promoCodes || [];

  const visibleCount = products.filter((p) => p.visible !== false).length;
  const totalRevenue = orderHistory.reduce((s, o) => s + (Number(o.total) || 0), 0);

  const filteredAdminProducts = products.filter((p) => {
    if (productCatFilter !== "all" && p.category !== productCatFilter) return false;
    if (!productQuery.trim()) return true;
    const q = productQuery.trim().toLowerCase();
    return (
      p.fa?.title?.toLowerCase().includes(q) ||
      p.en?.title?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  });

  const saveProductForm = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    const cleaned = cloneObj(editingProduct);
    // Auto-fill EN fallback from FA if left blank so switching language never crashes
    if (!cleaned.en.title?.trim()) cleaned.en.title = cleaned.fa.title;
    if (!cleaned.en.subtitle?.trim()) cleaned.en.subtitle = cleaned.fa.subtitle;
    if (!cleaned.en.description?.trim()) cleaned.en.description = cleaned.fa.description;
    if (!cleaned.en.origin?.trim()) cleaned.en.origin = cleaned.fa.origin;
    if (!cleaned.en.variants?.length) cleaned.en.variants = [...(cleaned.fa.variants || [])];
    if (!cleaned.specs3d?.en?.trim()) cleaned.specs3d.en = cleaned.specs3d?.fa || cleaned.sku;
    if (cleaned.variantImages?.[0] && !cleaned.image) cleaned.image = cleaned.variantImages[0];

    onUpdateContent((prev) => {
      const nextProducts = isNewProduct
        ? [cleaned, ...prev.products]
        : prev.products.map((p) => (p.id === cleaned.id ? cleaned : p));
      return { ...prev, products: nextProducts };
    });
    setEditingProduct(null);
    setIsNewProduct(false);
    showToast(lang === "fa" ? "محصول در پیش‌نویس ذخیره شد." : "Product saved to draft.");
  };

  const handlePublishLive = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setPublishError("");
    setPublishResult(null);
    setPublishLog(lang === "fa" ? "در حال آماده‌سازی محتوا..." : "Preparing content...");
    try {
      const result = await publishSiteContentToGitHub({
        token: ghConfig.token,
        owner: ghConfig.owner,
        repo: ghConfig.repo,
        branch: ghConfig.branch || "main",
        content: cmsContent,
        onProgress: ({ stage, current, total }) => {
          if (stage === "image") {
            setPublishLog(
              lang === "fa"
                ? `در حال آپلود تصویر ${current} از ${total}...`
                : `Uploading image ${current} of ${total}...`
            );
          } else {
            setPublishLog(
              lang === "fa" ? "در حال ثبت فایل سایت روی GitHub..." : "Committing site-content.json..."
            );
          }
        },
      });
      setPublishResult(result);
      onPublished(result.publishedContent);
      showToast(
        lang === "fa"
          ? "انتشار با موفقیت ثبت شد! تا ~۱ دقیقه دیگر روی سایت زنده می‌نشیند."
          : "Published to GitHub! Live site updates within ~1 minute."
      );
    } catch (err) {
      setPublishError(err?.message || "Publish failed");
    } finally {
      setPublishing(false);
      setPublishLog("");
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(cmsContent, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `image-boutique-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const txt = await file.text();
      const parsed = JSON.parse(txt);
      const merged = mergeSiteContent(buildDefaultSiteContent(), parsed);
      onUpdateContent(merged);
      showToast(lang === "fa" ? "نسخه پشتیبان با موفقیت بارگذاری شد." : "Backup JSON imported.");
    } catch {
      showToast(lang === "fa" ? "فایل JSON معتبر نیست." : "Invalid JSON file.");
    }
  };

  const tabs = [
    { id: "overview", icon: LayoutDashboard, fa: "نمای کلی", en: "Overview" },
    { id: "products", icon: Package, fa: "محصولات", en: "Products" },
    { id: "hero", icon: ImageIcon, fa: "اسلایدر و متون", en: "Hero & Copy" },
    { id: "bundles", icon: Gift, fa: "پک هدیه و گالری", en: "Bundles & Gallery" },
    { id: "services", icon: Printer, fa: "تعرفه چاپ و خدمات", en: "Print & Rates" },
    { id: "orders", icon: ShoppingBag, fa: "سفارش‌ها و کد تخفیف", en: "Orders & Promos" },
    { id: "publish", icon: UploadCloud, fa: "تنظیمات و انتشار زنده", en: "Publish Live" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5 animate-page-in">
      {/* Top Admin Command Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-[#C8A258]/40 bg-[#123126] px-4 py-3.5 text-[#FAF6EE]">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-5 w-5 text-[#E7D19F]" aria-hidden="true" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">
              {lang === "fa" ? "داشبورد مدیریت محتوای ایمیج بوتیک" : "Image Boutique Site CMS"}
            </h1>
            <p className="text-[11px] text-[#CFD8D2]">
              {hasLocalDraft
                ? lang === "fa"
                  ? "تغییرات شما به‌صورت زنده در پیش‌نمایش فعال است (برای انتشار عمومی به تب «انتشار زنده» بروید)."
                  : "Local draft active in preview. Go to Publish Live to deploy publicly."
                : lang === "fa"
                ? "تمامی تغییرات با نسخه منتشرشده هماهنگ است."
                : "All changes synced with published baseline."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate("store")}
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
          >
            <Store className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{lang === "fa" ? "پیش‌نمایش فروشگاه" : "View Store"}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("publish")}
            className="inline-flex items-center gap-1.5 rounded-[3px] bg-[var(--accent-crimson)] px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-90"
          >
            <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{lang === "fa" ? "انتشار آنلاین" : "Publish"}</span>
          </button>
          <button
            type="button"
            onClick={handleLock}
            className="inline-flex items-center gap-1 rounded-[3px] border border-white/25 px-2.5 py-1.5 text-xs text-[#E7D19F] hover:bg-white/10"
            title={lang === "fa" ? "قفل کردن پنل" : "Lock admin"}
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border px-3.5 py-2 text-xs font-bold transition ${
                active
                  ? "border-[var(--accent-pine)] bg-[var(--accent-pine)] text-white"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-main)] hover:border-[var(--accent-gold)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{lang === "fa" ? item.fa : item.en}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {tab === "overview" && (
        <section className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: lang === "fa" ? "محصولات فعال ویترین" : "Active Products",
                val: `${formatNumber(visibleCount, lang)} / ${formatNumber(products.length, lang)}`,
              },
              {
                label: lang === "fa" ? "پک‌های هدیه" : "Gift Coffrets",
                val: formatNumber(bundles.length, lang),
              },
              {
                label: lang === "fa" ? "سفارش‌های ثبت‌شده" : "Recorded Orders",
                val: formatNumber(orderHistory.length, lang),
              },
              {
                label: lang === "fa" ? "مجموع مبلغ سفارش‌ها" : "Total Order Volume",
                val: formatPrice(totalRevenue, lang),
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-1"
              >
                <p className="text-[11px] font-semibold text-[var(--ink-sub)]">{kpi.label}</p>
                <p className="tabular-nums text-lg sm:text-xl font-bold text-[var(--ink-main)]">
                  {kpi.val}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-3">
              <h2 className="text-sm font-bold text-[var(--ink-main)]">
                {lang === "fa" ? "دسترسی سریع مدیریت" : "Quick Actions"}
              </h2>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTab("products");
                    setEditingProduct(createEmptyProduct());
                    setIsNewProduct(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[3px] bg-[var(--accent-crimson)] px-3 py-2.5 font-bold text-white"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{lang === "fa" ? "افزودن محصول جدید" : "Add New Product"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab("services")}
                  className="rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2.5 font-semibold text-[var(--ink-main)]"
                >
                  {lang === "fa" ? "ویرایش تعرفه چاپ" : "Edit Print Rates"}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("hero")}
                  className="rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2.5 font-semibold text-[var(--ink-main)]"
                >
                  {lang === "fa" ? "تغییر بنرهای صفحه اصلی" : "Edit Hero Banners"}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("publish")}
                  className="rounded-[3px] border border-[var(--accent-pine)] bg-[var(--accent-pine)]/10 px-3 py-2.5 font-bold text-[var(--accent-pine)]"
                >
                  {lang === "fa" ? "انتشار روی سایت زنده" : "Publish to Live Site"}
                </button>
              </div>
            </div>

            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-2.5 text-xs leading-relaxed text-[var(--ink-sub)]">
              <h2 className="text-sm font-bold text-[var(--ink-main)]">
                {lang === "fa" ? "نحوه کار ذخیره و انتشار" : "How Draft & Live Publishing Works"}
              </h2>
              <p>
                {lang === "fa"
                  ? "۱. هر تغییری که در تب‌های این پنل انجام دهید، بلافاصله در همین مرورگر ذخیره و روی فروشگاه پیش‌نمایش می‌شود."
                  : "1. Every change here saves immediately as a local preview draft in your browser."}
              </p>
              <p>
                {lang === "fa"
                  ? "۲. هر زمان آماده بودید که همه کاربران نسخه جدید را ببینند، از تب «تنظیمات و انتشار زنده» با یک کلیک روی GitHub Pages منتشر کنید."
                  : "2. Whenever ready for everyone to see your changes, use Publish Live to push directly to GitHub Pages."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: PRODUCTS CRUD */}
      {tab === "products" && (
        <section className="space-y-4">
          {editingProduct ? (
            <form
              onSubmit={saveProductForm}
              className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h2 className="text-base font-bold text-[var(--ink-main)]">
                  {isNewProduct
                    ? lang === "fa"
                      ? "افزودن محصول جدید"
                      : "Create New Product"
                    : lang === "fa"
                    ? `ویرایش: ${editingProduct.fa.title}`
                    : `Edit: ${editingProduct.en.title}`}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsNewProduct(false);
                  }}
                  className="rounded-[3px] border border-[var(--border-strong)] px-3 py-1.5 text-xs font-semibold"
                >
                  {lang === "fa" ? "انصراف" : "Cancel"}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-[11px] font-bold">SKU</label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={editingProduct.sku}
                    onChange={(e) =>
                      setEditingProduct((p) => ({ ...p, sku: e.target.value }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs font-latin-ui"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold">
                    {lang === "fa" ? "دسته‌بندی" : "Category"}
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct((p) => ({ ...p, category: e.target.value }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs"
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                      <option key={c.id} value={c.id}>
                        {t.categoryNames[c.id]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold">
                    {lang === "fa" ? "قیمت (تومان)" : "Price (Toman)"}
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    min={1000}
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        price: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs font-latin-ui"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold">
                    {lang === "fa" ? "برچسب" : "Badge"}
                  </label>
                  <select
                    value={editingProduct.badge || ""}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        badge: e.target.value || null,
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs"
                  >
                    <option value="">{lang === "fa" ? "بدون برچسب" : "None"}</option>
                    <option value="new">{t.badges.new}</option>
                    <option value="bestseller">{t.badges.bestseller}</option>
                    <option value="limited">{t.badges.limited}</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5">
                  <p className="text-xs font-bold text-[var(--accent-pine)]">
                    {lang === "fa" ? "مشخصات فارسی" : "Persian Copy"}
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="عنوان محصول"
                    value={editingProduct.fa.title}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        fa: { ...p.fa, title: e.target.value },
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="زیرعنوان"
                    value={editingProduct.fa.subtitle}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        fa: { ...p.fa, subtitle: e.target.value },
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="اصالت / مشخصات ساخت"
                    value={editingProduct.fa.origin}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        fa: { ...p.fa, origin: e.target.value },
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs"
                  />
                  <textarea
                    rows={2}
                    placeholder="توضیحات کامل"
                    value={editingProduct.fa.description}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        fa: { ...p.fa, description: e.target.value },
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs"
                  />
                </div>

                <div className="space-y-3 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5">
                  <p className="text-xs font-bold text-[var(--accent-gold)]">
                    {lang === "fa"
                      ? "مشخصات انگلیسی (اختیاری - در صورت خالی بودن از فارسی کپی می‌شود)"
                      : "English Copy (Optional fallback)"}
                  </p>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="English Title"
                    value={editingProduct.en.title}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        en: { ...p.en, title: e.target.value },
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-latin-ui"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Subtitle"
                    value={editingProduct.en.subtitle}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        en: { ...p.en, subtitle: e.target.value },
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-latin-ui"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Origin"
                    value={editingProduct.en.origin}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        en: { ...p.en, origin: e.target.value },
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-latin-ui"
                  />
                  <textarea
                    rows={2}
                    dir="ltr"
                    placeholder="Description"
                    value={editingProduct.en.description}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        en: { ...p.en, description: e.target.value },
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-latin-ui"
                  />
                </div>
              </div>

              {/* 3D Model Type & Main Photo */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2.5 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5">
                  <label className="block text-xs font-bold">
                    {lang === "fa" ? "مدل سه‌بعدی ۳۶۰ درجه محصول" : "360° 3D Product Archetype"}
                  </label>
                  <select
                    value={editingProduct.modelType || "framed-box"}
                    onChange={(e) =>
                      setEditingProduct((p) => ({ ...p, modelType: e.target.value }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs"
                  >
                    {MODEL_TYPES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {lang === "fa" ? m.labelFa : m.labelEn}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="برچسب مشخصات در نمای ۳۶۰° (مثلاً: A5 · کتان ۱۲۰ گرم)"
                    value={editingProduct.specs3d?.fa || ""}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        specs3d: { ...(p.specs3d || {}), fa: e.target.value },
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs"
                  />
                  <div className="flex items-center gap-4 pt-1 text-xs">
                    <label className="inline-flex items-center gap-1.5 font-semibold">
                      <input
                        type="checkbox"
                        checked={editingProduct.visible !== false}
                        onChange={(e) =>
                          setEditingProduct((p) => ({ ...p, visible: e.target.checked }))
                        }
                      />
                      <span>{lang === "fa" ? "نمایش در فروشگاه" : "Visible"}</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 font-semibold">
                      <input
                        type="checkbox"
                        checked={editingProduct.inStock !== false}
                        onChange={(e) =>
                          setEditingProduct((p) => ({ ...p, inStock: e.target.checked }))
                        }
                      />
                      <span>{lang === "fa" ? "موجود" : "In Stock"}</span>
                    </label>
                  </div>
                </div>

                <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5">
                  <ImageField
                    label={lang === "fa" ? "تصویر اصلی محصول" : "Primary Product Photo"}
                    value={editingProduct.image}
                    lang={lang}
                    onChange={(val) =>
                      setEditingProduct((p) => {
                        const nextImgs = [...(p.variantImages || [])];
                        nextImgs[0] = val;
                        return { ...p, image: val, variantImages: nextImgs };
                      })
                    }
                  />
                </div>
              </div>

              {/* Variants / Swatches */}
              <div className="space-y-2.5 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">
                    {lang === "fa" ? "رنگ‌ها و مدل‌های محصول" : "Color Variants & Swatches"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct((p) => ({
                        ...p,
                        swatches: [...(p.swatches || []), "#1F4E3D"],
                        variantImages: [...(p.variantImages || []), p.image],
                        fa: {
                          ...p.fa,
                          variants: [...(p.fa.variants || []), "مدل جدید"],
                        },
                        en: {
                          ...p.en,
                          variants: [...(p.en.variants || []), "New Variant"],
                        },
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-[3px] bg-[var(--accent-pine)] px-2.5 py-1 text-[11px] font-bold text-white"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                    <span>{lang === "fa" ? "افزودن رنگ/مدل" : "Add Variant"}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(editingProduct.fa.variants || []).map((vName, vIdx) => (
                    <div
                      key={vIdx}
                      className="flex flex-wrap items-center gap-2 rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2"
                    >
                      <input
                        type="color"
                        value={editingProduct.swatches?.[vIdx] || "#1F4E3D"}
                        onChange={(e) =>
                          setEditingProduct((p) => {
                            const nextSw = [...(p.swatches || [])];
                            nextSw[vIdx] = e.target.value;
                            return { ...p, swatches: nextSw };
                          })
                        }
                        className="h-8 w-10 cursor-pointer rounded border border-[var(--border-subtle)]"
                      />
                      <input
                        type="text"
                        placeholder="نام رنگ/مدل (فارسی)"
                        value={vName}
                        onChange={(e) =>
                          setEditingProduct((p) => {
                            const nextFa = [...(p.fa.variants || [])];
                            nextFa[vIdx] = e.target.value;
                            return { ...p, fa: { ...p.fa, variants: nextFa } };
                          })
                        }
                        className="flex-1 min-w-[130px] rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="English variant"
                        value={editingProduct.en.variants?.[vIdx] || ""}
                        onChange={(e) =>
                          setEditingProduct((p) => {
                            const nextEn = [...(p.en.variants || [])];
                            nextEn[vIdx] = e.target.value;
                            return { ...p, en: { ...p.en, variants: nextEn } };
                          })
                        }
                        className="flex-1 min-w-[130px] rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-2.5 py-1.5 text-xs font-latin-ui"
                      />
                      <div className="w-full sm:w-auto">
                        <ImageField
                          compact
                          value={editingProduct.variantImages?.[vIdx] || editingProduct.image}
                          lang={lang}
                          onChange={(val) =>
                            setEditingProduct((p) => {
                              const nextImgs = [...(p.variantImages || [])];
                              nextImgs[vIdx] = val;
                              return { ...p, variantImages: nextImgs };
                            })
                          }
                        />
                      </div>
                      {(editingProduct.fa.variants || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct((p) => ({
                              ...p,
                              swatches: (p.swatches || []).filter((_, i) => i !== vIdx),
                              variantImages: (p.variantImages || []).filter((_, i) => i !== vIdx),
                              fa: {
                                ...p.fa,
                                variants: p.fa.variants.filter((_, i) => i !== vIdx),
                              },
                              en: {
                                ...p.en,
                                variants: (p.en.variants || []).filter((_, i) => i !== vIdx),
                              },
                            }))
                          }
                          className="p-1.5 text-[var(--accent-crimson)]"
                          aria-label="Remove variant"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="rounded-[3px] bg-[var(--accent-pine)] px-6 py-2.5 text-xs sm:text-sm font-bold text-white"
                >
                  {lang === "fa" ? "ذخیره محصول در پیش‌نویس" : "Save Product"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="flex items-center gap-2 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 flex-1 max-w-xs">
                    <Search className="h-3.5 w-3.5 text-[var(--ink-sub)]" aria-hidden="true" />
                    <input
                      type="text"
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      placeholder={lang === "fa" ? "جستجو در محصولات..." : "Search products..."}
                      className="w-full bg-transparent text-xs"
                    />
                  </div>
                  <select
                    value={productCatFilter}
                    onChange={(e) => setProductCatFilter(e.target.value)}
                    className="rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {t.categoryNames[c.id]}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(createEmptyProduct());
                    setIsNewProduct(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-[3px] bg-[var(--accent-crimson)] px-4 py-2 text-xs font-bold text-white"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{lang === "fa" ? "محصول جدید" : "Add Product"}</span>
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {filteredAdminProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className={`flex items-center justify-between gap-3 rounded-[4px] border bg-[var(--bg-surface)] p-3 ${
                      prod.visible === false
                        ? "border-[var(--accent-crimson)]/40 opacity-70"
                        : "border-[var(--border-subtle)]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.image}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-[3px] object-cover border border-[var(--border-subtle)]"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-xs sm:text-sm font-bold text-[var(--ink-main)]">
                          {(prod[lang] || prod.fa).title}
                        </p>
                        <p className="text-[11px] text-[var(--ink-sub)] font-latin-ui">
                          {prod.sku} · {prod.modelType || "framed-box"}
                        </p>
                        <p className="tabular-nums text-xs font-bold text-[var(--accent-pine)]">
                          {formatPrice(prod.price, lang)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title={lang === "fa" ? "نمایش/مخفی" : "Toggle visibility"}
                        onClick={() =>
                          onUpdateContent((prev) => ({
                            ...prev,
                            products: prev.products.map((p) =>
                              p.id === prod.id ? { ...p, visible: p.visible === false } : p
                            ),
                          }))
                        }
                        className="rounded-[3px] border border-[var(--border-subtle)] p-1.5 text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
                      >
                        {prod.visible === false ? (
                          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </button>
                      <button
                        type="button"
                        title={lang === "fa" ? "کپی محصول" : "Duplicate"}
                        onClick={() => {
                          const copy = cloneObj(prod);
                          copy.id = `${prod.id}-${Date.now().toString(36).slice(-4)}`;
                          copy.sku = `${prod.sku}-COPY`;
                          onUpdateContent((prev) => ({
                            ...prev,
                            products: [copy, ...prev.products],
                          }));
                          showToast(lang === "fa" ? "کپی محصول ساخته شد." : "Product duplicated.");
                        }}
                        className="rounded-[3px] border border-[var(--border-subtle)] p-1.5 text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
                      >
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(cloneObj(prod));
                          setIsNewProduct(false);
                        }}
                        className="rounded-[3px] bg-[var(--accent-pine)] px-2.5 py-1.5 text-[11px] font-bold text-white"
                      >
                        {lang === "fa" ? "ویرایش" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateContent((prev) => ({
                            ...prev,
                            products: prev.products.filter((p) => p.id !== prod.id),
                          }))
                        }
                        aria-label="Delete product"
                        className="rounded-[3px] border border-[var(--accent-crimson)]/40 p-1.5 text-[var(--accent-crimson)] hover:bg-[var(--accent-crimson)] hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* TAB 3: HERO SLIDES & SITE COPY */}
      {tab === "hero" && (
        <section className="space-y-5">
          {/* Announcement Bar */}
          <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
            <h2 className="text-sm font-bold">
              {lang === "fa" ? "متن نوار اطلاع‌رسانی بالای سایت" : "Top Announcement Bar"}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={cmsContent.announcement?.fa || ""}
                onChange={(e) =>
                  onUpdateContent((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, fa: e.target.value },
                  }))
                }
                placeholder="متن فارسی"
                className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs"
              />
              <input
                type="text"
                dir="ltr"
                value={cmsContent.announcement?.en || ""}
                onChange={(e) =>
                  onUpdateContent((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, en: e.target.value },
                  }))
                }
                placeholder="English announcement"
                className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs font-latin-ui"
              />
            </div>
          </div>

          {/* Hero Slides */}
          <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">
                {lang === "fa" ? "اسلایدر صفحه اصلی" : "Homepage Hero Slides"}
              </h2>
              <button
                type="button"
                onClick={() =>
                  onUpdateContent((prev) => ({
                    ...prev,
                    heroSlides: [
                      ...prev.heroSlides,
                      {
                        id: `slide-${Date.now()}`,
                        image: STUDIO_IMAGE_PRESETS[0],
                        fa: {
                          eyebrow: "NEW COLLECTION",
                          title: "عنوان بنر جدید",
                          desc: "توضیح کوتاه بنر",
                          ctaPrimary: "مشاهده محصولات",
                        },
                        en: {
                          eyebrow: "NEW COLLECTION",
                          title: "New Banner Title",
                          desc: "Short banner subtitle",
                          ctaPrimary: "Shop Collection",
                        },
                      },
                    ],
                  }))
                }
                className="inline-flex items-center gap-1 rounded-[3px] bg-[var(--accent-pine)] px-3 py-1.5 text-xs font-bold text-white"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{lang === "fa" ? "اسلاید جدید" : "Add Slide"}</span>
              </button>
            </div>

            {heroSlides.map((slide, sIdx) => (
              <div
                key={slide.id || sIdx}
                className="grid gap-3 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5 md:grid-cols-12"
              >
                <div className="md:col-span-4">
                  <ImageField
                    label={`${lang === "fa" ? "تصویر اسلاید" : "Slide Image"} #${sIdx + 1}`}
                    value={slide.image}
                    lang={lang}
                    onChange={(val) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        heroSlides: prev.heroSlides.map((s, i) =>
                          i === sIdx ? { ...s, image: val } : s
                        ),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-7">
                  <input
                    type="text"
                    value={slide.fa?.title || ""}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        heroSlides: prev.heroSlides.map((s, i) =>
                          i === sIdx ? { ...s, fa: { ...s.fa, title: e.target.value } } : s
                        ),
                      }))
                    }
                    placeholder="تیتر فارسی"
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={slide.fa?.desc || ""}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        heroSlides: prev.heroSlides.map((s, i) =>
                          i === sIdx ? { ...s, fa: { ...s.fa, desc: e.target.value } } : s
                        ),
                      }))
                    }
                    placeholder="توضیح فارسی"
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={slide.fa?.ctaPrimary || ""}
                      onChange={(e) =>
                        onUpdateContent((prev) => ({
                          ...prev,
                          heroSlides: prev.heroSlides.map((s, i) =>
                            i === sIdx
                              ? { ...s, fa: { ...s.fa, ctaPrimary: e.target.value } }
                              : s
                          ),
                        }))
                      }
                      placeholder="متن دکمه فارسی"
                      className="rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={slide.en?.title || ""}
                      onChange={(e) =>
                        onUpdateContent((prev) => ({
                          ...prev,
                          heroSlides: prev.heroSlides.map((s, i) =>
                            i === sIdx ? { ...s, en: { ...s.en, title: e.target.value } } : s
                          ),
                        }))
                      }
                      placeholder="English Title"
                      className="rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-latin-ui"
                    />
                  </div>
                </div>
                <div className="flex md:flex-col items-center justify-end gap-1.5 md:col-span-1">
                  <button
                    type="button"
                    disabled={sIdx === 0}
                    onClick={() =>
                      onUpdateContent((prev) => {
                        const arr = [...prev.heroSlides];
                        [arr[sIdx - 1], arr[sIdx]] = [arr[sIdx], arr[sIdx - 1]];
                        return { ...prev, heroSlides: arr };
                      })
                    }
                    className="rounded border border-[var(--border-subtle)] p-1.5 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={sIdx === heroSlides.length - 1}
                    onClick={() =>
                      onUpdateContent((prev) => {
                        const arr = [...prev.heroSlides];
                        [arr[sIdx + 1], arr[sIdx]] = [arr[sIdx], arr[sIdx + 1]];
                        return { ...prev, heroSlides: arr };
                      })
                    }
                    className="rounded border border-[var(--border-subtle)] p-1.5 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  {heroSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateContent((prev) => ({
                          ...prev,
                          heroSlides: prev.heroSlides.filter((_, i) => i !== sIdx),
                        }))
                      }
                      className="rounded border border-[var(--accent-crimson)]/40 p-1.5 text-[var(--accent-crimson)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Heritage Story */}
          <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
            <h2 className="text-sm font-bold">
              {lang === "fa" ? "بخش معرفی و داستان برند" : "Brand Heritage Story"}
            </h2>
            <input
              type="text"
              value={cmsContent.story?.fa?.title || ""}
              onChange={(e) =>
                onUpdateContent((prev) => ({
                  ...prev,
                  story: { ...prev.story, fa: { ...prev.story.fa, title: e.target.value } },
                }))
              }
              className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs font-bold"
            />
            <textarea
              rows={3}
              value={cmsContent.story?.fa?.body || ""}
              onChange={(e) =>
                onUpdateContent((prev) => ({
                  ...prev,
                  story: { ...prev.story, fa: { ...prev.story.fa, body: e.target.value } },
                }))
              }
              className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs"
            />
          </div>
        </section>
      )}

      {/* TAB 4: BUNDLES & GALLERY */}
      {tab === "bundles" && (
        <section className="space-y-5">
          <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">
                {lang === "fa" ? "پک‌های هدیه اقتصادی" : "Curated Gift Coffrets"}
              </h2>
              <button
                type="button"
                onClick={() =>
                  onUpdateContent((prev) => ({
                    ...prev,
                    bundles: [
                      ...prev.bundles,
                      {
                        id: `bundle-${Date.now()}`,
                        sku: `IB-SET-0${prev.bundles.length + 1}`,
                        originalPrice: 2000000,
                        price: 1700000,
                        savePercent: 15,
                        image: STUDIO_IMAGE_PRESETS[0],
                        fa: { title: "پک هدیه جدید", items: "توضیح اقلام پک", tag: "پک ویژه" },
                        en: { title: "New Gift Coffret", items: "Bundle items", tag: "Special Set" },
                      },
                    ],
                  }))
                }
                className="inline-flex items-center gap-1 rounded-[3px] bg-[var(--accent-pine)] px-3 py-1.5 text-xs font-bold text-white"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{lang === "fa" ? "پک جدید" : "Add Bundle"}</span>
              </button>
            </div>

            {bundles.map((b, idx) => (
              <div
                key={b.id}
                className="grid gap-3 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5 md:grid-cols-12"
              >
                <div className="md:col-span-4">
                  <ImageField
                    value={b.image}
                    lang={lang}
                    onChange={(val) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        bundles: prev.bundles.map((x, i) => (i === idx ? { ...x, image: val } : x)),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-7">
                  <input
                    type="text"
                    value={b.fa?.title || ""}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        bundles: prev.bundles.map((x, i) =>
                          i === idx ? { ...x, fa: { ...x.fa, title: e.target.value } } : x
                        ),
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={b.fa?.items || ""}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        bundles: prev.bundles.map((x, i) =>
                          i === idx ? { ...x, fa: { ...x.fa, items: e.target.value } } : x
                        ),
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      dir="ltr"
                      value={b.price}
                      onChange={(e) =>
                        onUpdateContent((prev) => ({
                          ...prev,
                          bundles: prev.bundles.map((x, i) =>
                            i === idx ? { ...x, price: Number(e.target.value) || 0 } : x
                          ),
                        }))
                      }
                      className="rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-latin-ui"
                    />
                    <input
                      type="number"
                      dir="ltr"
                      value={b.originalPrice}
                      onChange={(e) =>
                        onUpdateContent((prev) => ({
                          ...prev,
                          bundles: prev.bundles.map((x, i) =>
                            i === idx
                              ? { ...x, originalPrice: Number(e.target.value) || 0 }
                              : x
                          ),
                        }))
                      }
                      className="rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-latin-ui"
                    />
                  </div>
                </div>
                <div className="flex items-start justify-end md:col-span-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        bundles: prev.bundles.filter((_, i) => i !== idx),
                      }))
                    }
                    className="rounded border border-[var(--accent-crimson)]/40 p-1.5 text-[var(--accent-crimson)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Studio Gallery */}
          <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
            <h2 className="text-sm font-bold">
              {lang === "fa" ? "کاشی‌های گالری الهام" : "Studio Gallery Tiles"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(cmsContent.socialGallery || []).map((tile, idx) => (
                <div
                  key={tile.id}
                  className="space-y-2 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3"
                >
                  <ImageField
                    compact
                    value={tile.image}
                    lang={lang}
                    onChange={(val) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        socialGallery: prev.socialGallery.map((g, i) =>
                          i === idx ? { ...g, image: val } : g
                        ),
                      }))
                    }
                  />
                  <select
                    value={tile.productId}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        socialGallery: prev.socialGallery.map((g, i) =>
                          i === idx ? { ...g, productId: e.target.value } : g
                        ),
                      }))
                    }
                    className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {(p[lang] || p.fa).title}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: PRINT SERVICES & RATES */}
      {tab === "services" && (
        <section className="space-y-5">
          {/* Live Calculator Base Rates */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2.5">
              <h2 className="text-xs font-bold text-[var(--accent-pine)]">
                {lang === "fa" ? "نرخ پایه چاپ (تومان)" : "Base Print Rates"}
              </h2>
              {(cmsContent.pricing?.printTypes || []).map((pt, idx) => (
                <div key={pt.id} className="flex items-center justify-between gap-2 text-xs">
                  <span>{t.printTypeNames[pt.id]}</span>
                  <input
                    type="number"
                    dir="ltr"
                    value={pt.baseRate}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          printTypes: prev.pricing.printTypes.map((x, i) =>
                            i === idx ? { ...x, baseRate: Number(e.target.value) || 0 } : x
                          ),
                        },
                      }))
                    }
                    className="w-24 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-2 py-1 text-end font-latin-ui"
                  />
                </div>
              ))}
            </div>

            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2.5">
              <h2 className="text-xs font-bold text-[var(--accent-pine)]">
                {lang === "fa" ? "ما‌به‌تفاوت کاغذ (هر شیت)" : "Paper Stock Extras"}
              </h2>
              {(cmsContent.pricing?.paperStocks || []).map((st, idx) => (
                <div key={st.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate">{t.paperStockNames[st.id]}</span>
                  <input
                    type="number"
                    dir="ltr"
                    value={st.extraPerSheet}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          paperStocks: prev.pricing.paperStocks.map((x, i) =>
                            i === idx
                              ? { ...x, extraPerSheet: Number(e.target.value) || 0 }
                              : x
                          ),
                        },
                      }))
                    }
                    className="w-24 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-2 py-1 text-end font-latin-ui"
                  />
                </div>
              ))}
            </div>

            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2.5">
              <h2 className="text-xs font-bold text-[var(--accent-pine)]">
                {lang === "fa" ? "هزینه صحافی (هر جلد)" : "Binding Flat Fees"}
              </h2>
              {(cmsContent.pricing?.bindings || []).map((b, idx) => (
                <div key={b.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate">{t.bindingNames[b.id]}</span>
                  <input
                    type="number"
                    dir="ltr"
                    value={b.flatFee}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        pricing: {
                          ...prev.pricing,
                          bindings: prev.pricing.bindings.map((x, i) =>
                            i === idx ? { ...x, flatFee: Number(e.target.value) || 0 } : x
                          ),
                        },
                      }))
                    }
                    className="w-24 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-2 py-1 text-end font-latin-ui"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 6 Services & Tiered Rate Rows */}
          <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
            <h2 className="text-sm font-bold">
              {lang === "fa" ? "کارت‌های سرویس بخش خدماتی" : "Service Cards"}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {servicesList.map((srv, idx) => (
                <div
                  key={srv.id}
                  className="space-y-2 rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-latin-ui text-xs font-bold text-[var(--accent-gold)]">
                      {srv.code}
                    </span>
                    <input
                      type="number"
                      dir="ltr"
                      value={srv.startingPrice}
                      onChange={(e) =>
                        onUpdateContent((prev) => ({
                          ...prev,
                          servicesList: prev.servicesList.map((x, i) =>
                            i === idx
                              ? { ...x, startingPrice: Number(e.target.value) || 0 }
                              : x
                          ),
                        }))
                      }
                      className="w-28 rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-1 text-xs font-latin-ui"
                    />
                  </div>
                  <input
                    type="text"
                    value={srv.fa?.title || ""}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        servicesList: prev.servicesList.map((x, i) =>
                          i === idx ? { ...x, fa: { ...x.fa, title: e.target.value } } : x
                        ),
                      }))
                    }
                    className="w-full rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={srv.fa?.desc || ""}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        servicesList: prev.servicesList.map((x, i) =>
                          i === idx ? { ...x, fa: { ...x.fa, desc: e.target.value } } : x
                        ),
                      }))
                    }
                    className="w-full rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tiered Table & FAQ */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2.5">
              <h2 className="text-sm font-bold">
                {lang === "fa" ? "جدول تعرفه پلکانی A4" : "Tiered A4 Rate Table"}
              </h2>
              {tieredRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center text-xs rounded border border-[var(--border-subtle)] bg-[var(--bg-page)] p-2"
                >
                  <input
                    type="text"
                    value={row.tier?.fa || ""}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        tieredPriceRows: prev.tieredPriceRows.map((r, i) =>
                          i === idx ? { ...r, tier: { ...r.tier, fa: e.target.value } } : r
                        ),
                      }))
                    }
                    className="col-span-6 rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-1"
                  />
                  <input
                    type="number"
                    dir="ltr"
                    value={row.bwA4}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        tieredPriceRows: prev.tieredPriceRows.map((r, i) =>
                          i === idx ? { ...r, bwA4: Number(e.target.value) || 0 } : r
                        ),
                      }))
                    }
                    className="col-span-3 rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-1 font-latin-ui"
                  />
                  <input
                    type="number"
                    dir="ltr"
                    value={row.colorA4}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        tieredPriceRows: prev.tieredPriceRows.map((r, i) =>
                          i === idx ? { ...r, colorA4: Number(e.target.value) || 0 } : r
                        ),
                      }))
                    }
                    className="col-span-3 rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-1 font-latin-ui"
                  />
                </div>
              ))}
            </div>

            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">
                  {lang === "fa" ? "پرسش‌های متداول" : "Services FAQ"}
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateContent((prev) => ({
                      ...prev,
                      servicesFaq: [
                        ...prev.servicesFaq,
                        {
                          fa: { q: "پرسش جدید", a: "پاسخ پرسش جدید" },
                          en: { q: "New question", a: "Answer" },
                        },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1 rounded bg-[var(--accent-pine)] px-2.5 py-1 text-[11px] font-bold text-white"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  <span>{lang === "fa" ? "افزودن" : "Add"}</span>
                </button>
              </div>
              {faqList.map((item, idx) => (
                <div
                  key={idx}
                  className="space-y-1.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-page)] p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.fa?.q || ""}
                      onChange={(e) =>
                        onUpdateContent((prev) => ({
                          ...prev,
                          servicesFaq: prev.servicesFaq.map((f, i) =>
                            i === idx ? { ...f, fa: { ...f.fa, q: e.target.value } } : f
                          ),
                        }))
                      }
                      className="flex-1 rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-1 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateContent((prev) => ({
                          ...prev,
                          servicesFaq: prev.servicesFaq.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-[var(--accent-crimson)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={item.fa?.a || ""}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        servicesFaq: prev.servicesFaq.map((f, i) =>
                          i === idx ? { ...f, fa: { ...f.fa, a: e.target.value } } : f
                        ),
                      }))
                    }
                    className="w-full rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-1 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 6: ORDERS & PROMO CODES */}
      {tab === "orders" && (
        <section className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-3 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">
                {lang === "fa" ? "مدیریت سفارش‌های ثبت‌شده" : "Customer Orders"}
              </h2>
              {orderHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(orderHistory, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "image-boutique-orders.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-1 rounded border border-[var(--border-strong)] px-2.5 py-1 text-[11px] font-semibold"
                >
                  <Download className="h-3 w-3" aria-hidden="true" />
                  <span>{lang === "fa" ? "خروجی JSON" : "Export JSON"}</span>
                </button>
              )}
            </div>

            {orderHistory.length === 0 ? (
              <p className="py-10 text-center text-xs text-[var(--ink-sub)]">
                {lang === "fa"
                  ? "هنوز سفارشی روی این مرورگر ثبت نشده است."
                  : "No orders recorded on this browser yet."}
              </p>
            ) : (
              <div className="space-y-2.5">
                {orderHistory.map((ord, idx) => (
                  <div
                    key={ord.refId + idx}
                    className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-latin-ui font-bold text-[var(--accent-pine)]" dir="ltr">
                        {ord.refId}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[var(--ink-sub)]">{ord.createdAt}</span>
                        <select
                          value={ord.status || "pending"}
                          onChange={(e) =>
                            onUpdateOrders((prev) =>
                              prev.map((o, i) =>
                                i === idx ? { ...o, status: e.target.value } : o
                              )
                            )
                          }
                          className="rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-0.5 text-[11px] font-semibold"
                        >
                          <option value="pending">{lang === "fa" ? "در انتظار" : "Pending"}</option>
                          <option value="preparing">
                            {lang === "fa" ? "در حال آماده‌سازی" : "Preparing"}
                          </option>
                          <option value="shipped">{lang === "fa" ? "ارسال‌شده" : "Shipped"}</option>
                          <option value="delivered">{lang === "fa" ? "تحویل‌شده" : "Delivered"}</option>
                        </select>
                      </div>
                    </div>
                    <p className="font-bold text-[var(--ink-main)]">
                      {ord.customerName} · <span dir="ltr">{ord.customerPhone}</span>
                    </p>
                    {ord.deliveryMethod && (
                      <p className="text-[11px] text-[var(--ink-sub)]">{ord.deliveryMethod}</p>
                    )}
                    {Array.isArray(ord.items) && ord.items.length > 0 && (
                      <ul className="space-y-0.5 border-t border-[var(--border-subtle)] pt-1.5 text-[11px] text-[var(--ink-body)]">
                        {ord.items.map((line, lIdx) => (
                          <li key={lIdx}>
                            {line.qty}x {line.title} ({line.meta})
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex justify-between border-t border-[var(--border-subtle)] pt-1.5 font-bold text-[var(--accent-pine)]">
                      <span>{lang === "fa" ? "مبلغ کل" : "Total"}</span>
                      <span className="tabular-nums">{formatPrice(ord.total, lang)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 lg:col-span-5">
            {/* Promo Codes */}
            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
              <h2 className="text-sm font-bold">
                {lang === "fa" ? "کدهای تخفیف سبد خرید" : "Promo Codes"}
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  dir="ltr"
                  placeholder="SPRING15"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo((p) => ({ ...p, code: e.target.value }))}
                  className="flex-1 rounded border border-[var(--border-strong)] bg-[var(--bg-page)] px-2.5 py-1.5 text-xs font-latin-ui uppercase"
                />
                <input
                  type="number"
                  dir="ltr"
                  min={1}
                  max={90}
                  value={newPromo.percent}
                  onChange={(e) =>
                    setNewPromo((p) => ({ ...p, percent: Number(e.target.value) || 10 }))
                  }
                  className="w-16 rounded border border-[var(--border-strong)] bg-[var(--bg-page)] px-2 py-1.5 text-xs font-latin-ui"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newPromo.code.trim()) return;
                    onUpdateContent((prev) => ({
                      ...prev,
                      promoCodes: [
                        ...prev.promoCodes,
                        {
                          code: newPromo.code.trim().toUpperCase(),
                          percent: newPromo.percent,
                          active: true,
                        },
                      ],
                    }));
                    setNewPromo({ code: "", percent: 15 });
                  }}
                  className="rounded bg-[var(--accent-pine)] px-3 py-1.5 text-xs font-bold text-white"
                >
                  {lang === "fa" ? "افزودن" : "Add"}
                </button>
              </div>
              <div className="space-y-1.5">
                {promoCodes.map((pc, idx) => (
                  <div
                    key={pc.code + idx}
                    className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs"
                  >
                    <span className="font-latin-ui font-bold">{pc.code} ({pc.percent}%)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateContent((prev) => ({
                            ...prev,
                            promoCodes: prev.promoCodes.map((x, i) =>
                              i === idx ? { ...x, active: x.active === false } : x
                            ),
                          }))
                        }
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          pc.active !== false
                            ? "bg-[var(--accent-pine)]/15 text-[var(--accent-pine)]"
                            : "bg-black/10 text-[var(--ink-sub)]"
                        }`}
                      >
                        {pc.active !== false
                          ? lang === "fa"
                            ? "فعال"
                            : "Active"
                          : lang === "fa"
                          ? "غیرفعال"
                          : "Paused"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateContent((prev) => ({
                            ...prev,
                            promoCodes: prev.promoCodes.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-[var(--accent-crimson)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Gift Wrap Fees */}
            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2.5 text-xs">
              <h2 className="text-sm font-bold">
                {lang === "fa" ? "هزینه ارسال و کادوپیچی" : "Shipping & Gift Wrap"}
              </h2>
              {[
                { key: "freeThreshold", labelFa: "سقف ارسال رایگان", labelEn: "Free Shipping Threshold" },
                { key: "fee", labelFa: "هزینه پایه ارسال", labelEn: "Base Shipping Fee" },
                { key: "giftWrapPrice", labelFa: "هزینه بسته‌بندی کادویی", labelEn: "Gift Wrap Price" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-2">
                  <span>{lang === "fa" ? item.labelFa : item.labelEn}</span>
                  <input
                    type="number"
                    dir="ltr"
                    value={cmsContent.shipping?.[item.key] ?? 0}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        shipping: {
                          ...prev.shipping,
                          [item.key]: Number(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-28 rounded border border-[var(--border-strong)] bg-[var(--bg-page)] px-2.5 py-1 text-end font-latin-ui"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 7: SETTINGS & LIVE PUBLISH */}
      {tab === "publish" && (
        <section className="grid gap-5 lg:grid-cols-12">
          {/* Direct One-Click Publish to GitHub Pages */}
          <form
            onSubmit={handlePublishLive}
            className="space-y-4 rounded-[4px] border border-[#C8A258]/50 bg-[var(--bg-surface)] p-5 lg:col-span-7"
          >
            <div className="flex items-center gap-2.5">
              <UploadCloud className="h-5 w-5 text-[var(--accent-crimson)]" aria-hidden="true" />
              <div>
                <h2 className="text-base font-bold text-[var(--ink-main)]">
                  {lang === "fa"
                    ? "انتشار مستقیم تغییرات روی سایت زنده (GitHub Pages)"
                    : "One-Click Publish to Live GitHub Pages"}
                </h2>
                <p className="text-[11px] text-[var(--ink-sub)]">
                  {lang === "fa"
                    ? "تصاویر آپلودشده و تنظیمات جدید مستقیماً به مخزن سایت ارسال و به‌صورت خودکار بیلد و منتشر می‌شوند."
                    : "Uploads images and commits public/data/site-content.json so GitHub Actions deploys automatically."}
                </p>
              </div>
            </div>

            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3.5 text-[11px] space-y-1 text-[var(--ink-sub)]">
              <p className="font-bold text-[var(--ink-main)]">
                {lang === "fa"
                  ? "راهنمای دریافت توکن انتشار (فقط یک‌بار):"
                  : "Quick 3-Step Token Guide:"}
              </p>
              <p>
                {lang === "fa"
                  ? "۱. در GitHub به Settings -> Developer settings -> Personal access tokens -> Fine-grained tokens بروید."
                  : "1. Go to GitHub Settings -> Developer settings -> Fine-grained tokens."}
              </p>
              <p>
                {lang === "fa"
                  ? "۲. دسترسی Contents (Read and write) را فقط برای مخزن image-boutique-papeterie انتخاب کنید."
                  : "2. Grant Contents (Read & Write) permission on image-boutique-papeterie."}
              </p>
              <p>
                {lang === "fa"
                  ? "۳. توکن را اینجا وارد کنید (فقط در همین مرورگر ذخیره می‌شود)."
                  : "3. Paste the token below (saved locally in your browser only)."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold">Owner</label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={ghConfig.owner}
                  onChange={(e) => setGhConfig((c) => ({ ...c, owner: e.target.value }))}
                  className="w-full rounded border border-[var(--border-strong)] bg-[var(--bg-page)] px-2.5 py-1.5 text-xs font-latin-ui"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold">Repository</label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={ghConfig.repo}
                  onChange={(e) => setGhConfig((c) => ({ ...c, repo: e.target.value }))}
                  className="w-full rounded border border-[var(--border-strong)] bg-[var(--bg-page)] px-2.5 py-1.5 text-xs font-latin-ui"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold">Branch</label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={ghConfig.branch}
                  onChange={(e) => setGhConfig((c) => ({ ...c, branch: e.target.value }))}
                  className="w-full rounded border border-[var(--border-strong)] bg-[var(--bg-page)] px-2.5 py-1.5 text-xs font-latin-ui"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold">
                GitHub Personal Access Token (PAT)
              </label>
              <input
                type="password"
                dir="ltr"
                required
                placeholder="github_pat_..."
                value={ghConfig.token}
                onChange={(e) => setGhConfig((c) => ({ ...c, token: e.target.value }))}
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs font-latin-ui"
              />
            </div>

            {publishLog && (
              <p className="text-xs font-semibold text-[var(--accent-pine)]">{publishLog}</p>
            )}
            {publishError && (
              <div className="flex items-center gap-2 rounded bg-[var(--accent-crimson)]/10 p-3 text-xs font-semibold text-[var(--accent-crimson)]">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{publishError}</span>
              </div>
            )}
            {publishResult && (
              <div className="flex items-center justify-between gap-2 rounded bg-[var(--accent-pine)]/15 p-3 text-xs font-semibold text-[var(--accent-pine)]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {lang === "fa"
                      ? `انتشار انجام شد (${publishResult.uploadedImages} تصویر جدید)`
                      : `Published (${publishResult.uploadedImages} images uploaded)`}
                  </span>
                </span>
                <a
                  href={publishResult.commitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline font-latin-ui"
                >
                  <span>Commit</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={publishing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-[3px] bg-[var(--accent-crimson)] px-5 py-3 text-xs sm:text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <UploadCloud className="h-4 w-4" aria-hidden="true" />
              <span>
                {publishing
                  ? lang === "fa"
                    ? "در حال انتشار..."
                    : "Publishing..."
                  : lang === "fa"
                  ? "انتشار مستقیم روی سایت زنده"
                  : "Publish Changes to Live Site"}
              </span>
            </button>
          </form>

          {/* Contact Settings, Passcode & Backup */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2.5 text-xs">
              <h2 className="text-sm font-bold">
                {lang === "fa" ? "اطلاعات تماس فروشگاه" : "Studio Contact Info"}
              </h2>
              <input
                type="text"
                dir="ltr"
                value={cmsContent.contact?.phone || ""}
                onChange={(e) =>
                  onUpdateContent((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value },
                  }))
                }
                placeholder="Phone"
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-1.5 font-latin-ui"
              />
              <input
                type="email"
                dir="ltr"
                value={cmsContent.contact?.email || ""}
                onChange={(e) =>
                  onUpdateContent((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value },
                  }))
                }
                placeholder="Email"
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-1.5 font-latin-ui"
              />
              <input
                type="text"
                value={cmsContent.contact?.hoursFa || ""}
                onChange={(e) =>
                  onUpdateContent((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, hoursFa: e.target.value },
                  }))
                }
                placeholder="ساعات کاری"
                className="w-full rounded border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-1.5"
              />
            </div>

            {/* Passcode Update */}
            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2.5 text-xs">
              <h2 className="flex items-center gap-1.5 text-sm font-bold">
                <KeyRound className="h-4 w-4 text-[var(--accent-gold)]" aria-hidden="true" />
                <span>{lang === "fa" ? "تغییر رمز ورود داشبورد" : "Change Admin Passcode"}</span>
              </h2>
              <div className="flex gap-2">
                <input
                  type="password"
                  dir="ltr"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder={lang === "fa" ? "رمز جدید..." : "New passcode..."}
                  className="flex-1 rounded border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-1.5 font-latin-ui"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (newPasscode.trim().length < 4) return;
                    const h = await hashPasscode(newPasscode.trim());
                    onUpdateContent((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, adminPasscodeHash: h },
                    }));
                    setNewPasscode("");
                    showToast(
                      lang === "fa"
                        ? "رمز جدید در پیش‌نویس ذخیره شد."
                        : "Admin passcode updated in draft."
                    );
                  }}
                  className="rounded bg-[var(--accent-pine)] px-3 py-1.5 font-bold text-white"
                >
                  {lang === "fa" ? "ذخیره رمز" : "Update"}
                </button>
              </div>
            </div>

            {/* Export / Import / Reset */}
            <div className="rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2.5 text-xs">
              <h2 className="text-sm font-bold">
                {lang === "fa" ? "پشتیبان‌گیری و بازنشانی" : "Backup & Reset"}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center justify-center gap-1.5 rounded border border-[var(--border-strong)] bg-[var(--bg-page)] py-2 font-semibold"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{lang === "fa" ? "خروجی JSON" : "Export JSON"}</span>
                </button>
                <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded border border-[var(--border-strong)] bg-[var(--bg-page)] py-2 font-semibold">
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{lang === "fa" ? "ورود JSON" : "Import JSON"}</span>
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleImportJson}
                    className="sr-only"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onDiscardDraft(false);
                    showToast(lang === "fa" ? "پیش‌نویس محلی لغو شد." : "Draft discarded.");
                  }}
                  className="inline-flex items-center justify-center gap-1 rounded border border-[var(--border-subtle)] py-2 text-[11px] font-semibold text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  <span>{lang === "fa" ? "لغو تغییرات محلی" : "Discard Draft"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDiscardDraft(true);
                    showToast(
                      lang === "fa" ? "محتوا به نسخه اولیه بازگشت." : "Reset to defaults."
                    );
                  }}
                  className="rounded border border-[var(--accent-crimson)]/40 py-2 text-[11px] font-semibold text-[var(--accent-crimson)]"
                >
                  {lang === "fa" ? "بازگشت به تنظیمات پایه" : "Factory Defaults"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
