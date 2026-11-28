import { useState, useEffect, useCallback, useMemo } from "react";
import { Lock, Unlock, LayoutDashboard, Package, ShoppingBag, FileText, Printer, Images, UploadCloud, Store, Plus } from "lucide-react";
import { STUDIO_IMAGE_PRESETS } from "../data/catalog";
import { formatPrice, formatNumber } from "../utils/pricing";
import { CMS_GH_KEY, hashPasscode, normalizeProduct } from "../utils/cmsStore";
import { ADMIN_STRINGS } from "./admin/strings";
import { AdminCtx, cls, Card, photoIssue } from "./admin/ui";
import ProductsPanel from "./admin/ProductsPanel";
import ProductEditor from "./admin/ProductEditor";
import SiteContentPanel from "./admin/SiteContentPanel";
import ServicesPanel from "./admin/ServicesPanel";
import OrdersPanel from "./admin/OrdersPanel";
import MediaPanel from "./admin/MediaPanel";
import PublishPanel from "./admin/PublishPanel";

const ADMIN_SESSION_KEY = "ib_admin_unlocked_v1";
// The GitHub token lives only in this tab's sessionStorage, never in localStorage or published JSON
const GH_TOKEN_SESSION_KEY = "ib_cms_gh_token_v1";

function cloneObj(o) {
  return JSON.parse(JSON.stringify(o));
}

function createEmptyProduct() {
  return {
    id: `prod-${Date.now().toString(36)}`,
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
    gallery: [],
    spinImages: [],
    model3dUrl: "",
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

function loadGhConfig() {
  let saved = {};
  let token = "";
  try {
    saved = JSON.parse(localStorage.getItem(CMS_GH_KEY) || "{}") || {};
  } catch {
    // Ignore corrupt config
  }
  try {
    // Older versions kept the token in localStorage; carry it into this session once, the save effect then drops it from disk
    token = sessionStorage.getItem(GH_TOKEN_SESSION_KEY) || saved.token || "";
  } catch {
    // Ignore storage errors
  }
  return {
    owner: saved.owner || "mrzroot",
    repo: saved.repo || "image-boutique-papeterie",
    branch: saved.branch || "main",
    token,
  };
}

const NAV = [
  ["overview", LayoutDashboard],
  ["products", Package],
  ["orders", ShoppingBag],
  ["content", FileText],
  ["services", Printer],
  ["media", Images],
  ["publish", UploadCloud],
];

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
  const s = ADMIN_STRINGS[lang] || ADMIN_STRINGS.fa;
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);
  const [section, setSection] = useState("overview");
  // { product, isNew, baseline } — kept here so switching sections never loses an edit in progress
  const [editing, setEditing] = useState(null);
  const [broken, setBroken] = useState(() => new Set());
  const [ghConfig, setGhConfig] = useState(loadGhConfig);

  const markBroken = useCallback((src) => setBroken((prev) => (prev.has(src) ? prev : new Set(prev).add(src))), []);
  const ctx = useMemo(() => ({ lang, s, t, broken, markBroken, notify: showToast }), [lang, s, t, broken, markBroken, showToast]);
  const dirty = Boolean(editing) && (editing.isNew || JSON.stringify(editing.product) !== editing.baseline);

  useEffect(() => {
    const { token, ...rest } = ghConfig;
    try {
      localStorage.setItem(CMS_GH_KEY, JSON.stringify(rest));
    } catch {
      // Ignore storage errors
    }
    try {
      if (token) sessionStorage.setItem(GH_TOKEN_SESSION_KEY, token);
      else sessionStorage.removeItem(GH_TOKEN_SESSION_KEY);
    } catch {
      // Ignore storage errors
    }
  }, [ghConfig]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const confirmLeaveEditor = () => !dirty || window.confirm(s.confirmDiscardEdits);

  const handleUnlock = async (e) => {
    e.preventDefault();
    const hashed = await hashPasscode(passInput.trim());
    if (hashed === cmsContent?.settings?.adminPasscodeHash) {
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
    if (!confirmLeaveEditor()) return;
    setEditing(null);
    setUnlocked(false);
    setGhConfig((c) => ({ ...c, token: "" }));
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // Ignore
    }
  };

  const openEditor = (prod, isNew = false) => {
    if (editing && !confirmLeaveEditor()) return;
    const product = cloneObj(normalizeProduct(prod));
    product.fa = product.fa || {};
    product.en = product.en || {};
    setEditing({ product, isNew, baseline: JSON.stringify(product) });
    setSection("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeEditor = () => {
    if (!confirmLeaveEditor()) return;
    setEditing(null);
  };

  const saveProduct = () => {
    const cleaned = normalizeProduct(cloneObj(editing.product));
    // Fill EN from FA when left blank so switching language never shows empty copy
    for (const key of ["title", "subtitle", "description", "origin"]) {
      if (!cleaned.en[key]?.trim()) cleaned.en[key] = cleaned.fa[key];
    }
    if (!cleaned.en.variants?.length) cleaned.en.variants = [...(cleaned.fa.variants || [])];
    cleaned.specs3d = { ...(cleaned.specs3d || {}) };
    if (!cleaned.specs3d.en?.trim()) cleaned.specs3d.en = cleaned.specs3d.fa || cleaned.sku;
    if (cleaned.variantImages?.[0] && !cleaned.image) cleaned.image = cleaned.variantImages[0];

    onUpdateContent((prev) => ({
      ...prev,
      products: editing.isNew ? [cleaned, ...prev.products] : prev.products.map((p) => (p.id === cleaned.id ? cleaned : p)),
    }));
    showToast(editing.isNew ? s.toastCreated : s.toastSaved);
    setEditing(null);
  };

  if (!unlocked) {
    return (
      <main className="mx-auto max-w-md px-4 py-14 sm:px-6 animate-page-in">
        <div className={`${cls.card} space-y-5`}>
          <h1 className="text-lg font-bold text-[var(--ink-main)]">{s.loginTitle}</h1>
          <p className="text-sm leading-relaxed text-[var(--ink-sub)]">{s.loginHelp}</p>
          <form onSubmit={handleUnlock} className="space-y-3">
            <label htmlFor="admin-passcode-input" className={cls.label}>
              {s.passcode}
            </label>
            <input
              id="admin-passcode-input"
              type="password"
              dir="ltr"
              required
              autoComplete="current-password"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              className={cls.input}
              autoFocus
            />
            {passError && (
              <p role="alert" className="text-sm font-semibold text-[var(--accent-crimson)]">
                {s.wrongPasscode}
              </p>
            )}
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-[3px] bg-[var(--accent-pine)] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90">
              <Unlock className="h-4 w-4" aria-hidden="true" />
              <span>{s.unlock}</span>
            </button>
          </form>
          <button type="button" onClick={() => onNavigate("store")} className="w-full text-center text-sm text-[var(--ink-sub)] hover:text-[var(--ink-main)]">
            {s.backToStore}
          </button>
        </div>
      </main>
    );
  }

  const products = cmsContent.products || [];
  const needPhotos = products.filter((p) => photoIssue(p, broken)).length;
  const totalRevenue = orderHistory.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const renderSection = () => {
    switch (section) {
      case "products":
        return editing ? (
          <ProductEditor
            product={editing.product}
            isNew={editing.isNew}
            dirty={dirty}
            onChange={(fn) => setEditing((e) => ({ ...e, product: fn(e.product) }))}
            onSave={saveProduct}
            onCancel={closeEditor}
          />
        ) : (
          <ProductsPanel products={products} onEdit={(p) => openEditor(p)} onNew={() => openEditor(createEmptyProduct(), true)} onUpdateContent={onUpdateContent} />
        );
      case "orders":
        return <OrdersPanel cmsContent={cmsContent} orderHistory={orderHistory} onUpdateOrders={onUpdateOrders} onUpdateContent={onUpdateContent} />;
      case "content":
        return <SiteContentPanel cmsContent={cmsContent} onUpdateContent={onUpdateContent} />;
      case "services":
        return <ServicesPanel cmsContent={cmsContent} onUpdateContent={onUpdateContent} />;
      case "media":
        return <MediaPanel cmsContent={cmsContent} onEditProduct={(p) => openEditor(p)} />;
      case "publish":
        return (
          <PublishPanel
            cmsContent={cmsContent}
            hasLocalDraft={hasLocalDraft}
            ghConfig={ghConfig}
            setGhConfig={setGhConfig}
            onPublished={onPublished}
            onUpdateContent={onUpdateContent}
            onDiscardDraft={onDiscardDraft}
          />
        );
      default:
        return (
          <section className="space-y-4">
            <Card
              title={s.quickActions}
              actions={
                <button type="button" onClick={() => openEditor(createEmptyProduct(), true)} className={cls.btnPrimary}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{s.addProduct}</span>
                </button>
              }
            >
              {/* Only what needs the owner's attention; nothing is listed when there is nothing to do */}
              <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
                {needPhotos > 0 && (
                  <li className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="text-sm text-[var(--ink-body)]">{s.kpiNeedPhotos}: {formatNumber(needPhotos, lang)}</span>
                    <button type="button" onClick={() => setSection("media")} className={cls.btn}>{s.navMedia}</button>
                  </li>
                )}
                {hasLocalDraft && (
                  <li className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="text-sm text-[var(--ink-body)]">{s.draftPending}</span>
                    <button type="button" onClick={() => setSection("publish")} className={cls.btn}>{s.navPublish}</button>
                  </li>
                )}
                {!needPhotos && !hasLocalDraft && <li className="py-3 text-sm text-[var(--ink-sub)]">{s.nothingToDo}</li>}
              </ul>
              <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                {[
                  [s.kpiActive, `${formatNumber(products.filter((p) => p.visible !== false).length, lang)} / ${formatNumber(products.length, lang)}`],
                  [s.kpiOrders, formatNumber(orderHistory.length, lang)],
                  [s.kpiVolume, formatPrice(totalRevenue, lang)],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-baseline gap-2">
                    <dt className="text-[var(--ink-sub)]">{label}</dt>
                    <dd className="tabular-nums font-semibold text-[var(--ink-main)]">{val}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <Card title={s.howItWorks}>
              <ol className="list-decimal max-w-prose space-y-1.5 ps-5 text-sm leading-relaxed text-[var(--ink-sub)]">
                <li>{s.how1}</li>
                <li>{s.how2}</li>
                <li>{s.how3}</li>
              </ol>
            </Card>
          </section>
        );
    }
  };

  return (
    <AdminCtx.Provider value={ctx}>
      <main className="mx-auto w-full max-w-7xl space-y-4 px-4 py-5 sm:px-6 animate-page-in">
        <header className={`${cls.card} flex flex-wrap items-center justify-between gap-3`}>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[var(--ink-main)]">{s.dashboardTitle}</h1>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-sub)]">
              <span className={`h-2 w-2 rounded-full ${hasLocalDraft ? "bg-[var(--accent-gold)]" : "bg-[var(--accent-pine)]"}`} aria-hidden="true" />
              {hasLocalDraft ? s.draftPendingShort : s.draftCleanShort}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => confirmLeaveEditor() && onNavigate("store")} className={cls.btn}>
              <Store className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{s.viewStore}</span>
            </button>
            <button type="button" onClick={handleLock} className={cls.btn} aria-label={s.lock} title={s.lock}>
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{s.lock}</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[12.5rem_minmax(0,1fr)]">
          <nav aria-label={s.sections} className="min-w-0 md:sticky md:top-36 md:self-start">
            <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
              {NAV.map(([id, Icon]) => {
                const active = section === id;
                const flag = (id === "products" && dirty) || (id === "publish" && hasLocalDraft) || (id === "media" && needPhotos > 0);
                return (
                  <li key={id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setSection(id)}
                      aria-current={active ? "page" : undefined}
                      className={`flex w-full items-center gap-2 rounded-[3px] border px-3 py-2 text-sm font-semibold ${
                        active
                          ? "border-[var(--accent-pine)] bg-[var(--accent-pine)] text-white"
                          : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-main)] hover:border-[var(--accent-gold)]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="whitespace-nowrap">{s[`nav_${id}`]}</span>
                      {flag && (
                        <span
                          className={`ms-auto h-2 w-2 shrink-0 rounded-full ${id === "products" || id === "media" ? "bg-[var(--accent-crimson)]" : "bg-[var(--accent-gold)]"}`}
                          aria-label={id === "products" ? s.unsavedChanges : id === "media" ? s.kpiNeedPhotos : s.draftPendingShort}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="min-w-0">{renderSection()}</div>
        </div>
      </main>
    </AdminCtx.Provider>
  );
}
