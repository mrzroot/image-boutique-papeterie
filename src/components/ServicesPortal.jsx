import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ChevronDown,
  Type,
  Palette,
} from "lucide-react";
import {
  PRINT_TYPES,
  PAPER_SIZES,
  PAPER_STOCKS,
  BINDING_OPTIONS,
  calculatePrintQuote,
  formatPrice,
  formatNumber,
} from "../utils/pricing";
import Reveal from "./Reveal";
import Live3DPreview, { COVER_THEMES } from "./Live3DPreview";

export default function ServicesPortal({
  t,
  lang,
  pricingOverrides = null,
  servicesList = [],
  tieredPriceRows = [],
  servicesFaq = [],
  onBackToStore,
  onAddServiceJob,
}) {
  const isRtl = lang === "fa";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const [config, setConfig] = useState({
    printType: "color",
    size: "A4",
    sides: "double",
    paperStock: "tahrir100",
    binding: "spiral",
    pages: 48,
    copies: 5,
  });
  const [coverTheme, setCoverTheme] = useState("ivory");
  const [customTitle, setCustomTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const quote = calculatePrintQuote(config, pricingOverrides);
  const duplexDisabled =
    config.printType === "plot" || config.printType === "sticker";

  useEffect(() => {
    return () => {
      if (uploadedFile?.previewUrl) {
        URL.revokeObjectURL(uploadedFile.previewUrl);
      }
    };
  }, [uploadedFile]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadedFile?.previewUrl) URL.revokeObjectURL(uploadedFile.previewUrl);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const previewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null;
    setUploadedFile({
      name: file.name,
      previewUrl,
      sizeLabel:
        file.size > 1024 * 1024
          ? `${sizeMB} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`,
    });
  };

  const handlePrintTypeChange = (typeId) => {
    const isSheetOnly = typeId === "plot" || typeId === "sticker";
    setConfig((prev) => ({
      ...prev,
      printType: typeId,
      sides: isSheetOnly ? "single" : prev.sides,
      binding: isSheetOnly ? "none" : prev.binding,
    }));
  };

  const applyServicePreset = (serviceId) => {
    const presets = {
      "bw-digital": {
        printType: "bw",
        size: "A4",
        sides: "double",
        paperStock: "tahrir80",
        binding: "spiral",
      },
      "color-laser": {
        printType: "color",
        size: "A4",
        sides: "double",
        paperStock: "glossy135",
        binding: "saddle",
      },
      "binding-thesis": {
        printType: "bw",
        size: "A4",
        sides: "single",
        paperStock: "tahrir100",
        binding: "hardcover",
      },
      "arch-plot": {
        printType: "plot",
        size: "A3",
        sides: "single",
        paperStock: "cotton240",
        binding: "none",
      },
      "stickers-labels": {
        printType: "sticker",
        size: "A4",
        sides: "single",
        paperStock: "glossy135",
        binding: "none",
      },
      "corp-packaging": {
        printType: "color",
        size: "A4",
        sides: "single",
        paperStock: "kraft",
        binding: "hardcover",
      },
    };
    if (presets[serviceId]) {
      setConfig((prev) => ({ ...prev, ...presets[serviceId] }));
      if (serviceId === "binding-thesis") setCoverTheme("pine");
      else if (serviceId === "corp-packaging") setCoverTheme("kraft");
      else setCoverTheme("ivory");
      document
        .getElementById("quote-calculator")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAddToBag = () => {
    const typeName = t.printTypeNames[config.printType];
    const stockName = t.paperStockNames[config.paperStock];
    const bindingName = t.bindingNames[config.binding];
    const metaParts = [
      `${config.size}`,
      `${config.pages} ${lang === "fa" ? "صفحه" : "p"} × ${config.copies} ${
        lang === "fa" ? "نسخه" : "copies"
      }`,
      stockName,
      bindingName,
      customTitle.trim() ? customTitle.trim() : null,
      uploadedFile ? uploadedFile.name : null,
    ].filter(Boolean);

    onAddServiceJob({
      key: `svc-${Date.now()}`,
      kind: "service",
      spec: {
        ...config,
        customTitle: customTitle.trim() || null,
        fileName: uploadedFile?.name || null,
      },
      title: `${typeName} (${config.size})`,
      meta: metaParts.join(" · "),
      unitPrice: quote.total,
      qty: 1,
      image: "./images/atelier-services.jpg",
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 3000);
  };

  return (
    <main className="paper-grain animate-page-in">
      {/* Top Return Breadcrumb Strip */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-soft)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 rounded-[3px] bg-[var(--bg-surface)] px-4 py-2 text-xs font-bold text-[var(--accent-pine)] border border-[var(--border-strong)] transition hover:bg-[var(--accent-pine)] hover:text-white"
          >
            <BackArrow className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.backToStorefront}</span>
          </button>
          <span className="font-latin-ui text-xs font-semibold tracking-wider text-[var(--ink-sub)]">
            IMAGE BOUTIQUE · PRINT & BINDERY PORTAL
          </span>
        </div>
      </div>

      {/* Atelier Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6">
        <div className="overflow-hidden rounded-[4px] border border-[#C8A258]/40 bg-[#123126] text-[#FAF6EE]">
          <div className="grid items-stretch md:grid-cols-12">
            <div className="space-y-4 p-7 sm:p-9 md:col-span-7">
              <p className="eyebrow text-[#E7D19F]">
                {t.servicesHeroEyebrow}
              </p>
              <h1
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug text-white ${
                  isRtl ? "" : "font-editorial"
                }`}
              >
                {t.servicesHeroTitle}
              </h1>
              <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-[#CFD8D2]">
                {t.servicesHeroDesc}
              </p>
            </div>
            <div className="aspect-[16/10] md:aspect-auto md:h-full md:col-span-5 overflow-hidden">
              <img
                src="./images/atelier-services.jpg"
                alt={t.servicesHeroTitle}
                width="800"
                height="600"
                fetchPriority="high"
                decoding="sync"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Hairline 4-Column Atelier Specifications Strip */}
        <div className="mt-5 grid divide-y divide-[var(--border-subtle)] rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] sm:grid-cols-2 lg:grid-cols-4 lg:divide-y-0 lg:divide-x rtl:lg:divide-x-reverse">
          {t.trustBar.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 px-4 py-4">
              <span className="tabular-nums font-latin-ui text-xs font-bold text-[var(--accent-gold)]">
                0{idx + 1}
              </span>
              <div>
                <h2 className="text-xs font-bold text-[var(--ink-main)]">
                  {item.title}
                </h2>
                <p className="mt-0.5 text-xs text-[var(--ink-sub)]">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instant Print Quote Calculator + Live 3D Bindery Preview */}
      <section
        id="quote-calculator"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <div className="mb-6">
          <p className="eyebrow text-[var(--accent-crimson)]">
            {t.calcEyebrow}
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[var(--ink-main)]">
            {t.calcTitle}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-12 items-start">
          {/* Configurator Form */}
          <div className="min-w-0 space-y-4 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-6 md:col-span-7 lg:col-span-8">
            {/* Print Type */}
            <div>
              <span className="mb-2 block text-xs font-bold text-[var(--ink-main)]">
                {t.calcLabels.printType}
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PRINT_TYPES.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => handlePrintTypeChange(pt.id)}
                    className={`rounded-[3px] border px-2.5 py-2.5 text-start text-xs font-semibold transition ${
                      config.printType === pt.id
                        ? "border-[#183E30] bg-[#183E30] text-white"
                        : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--ink-main)] hover:border-[var(--accent-gold)]"
                    }`}
                  >
                    {t.printTypeNames[pt.id]}
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Sides */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-2 block text-xs font-bold text-[var(--ink-main)]">
                  {t.calcLabels.size}
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {PAPER_SIZES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, size: s.id }))
                      }
                      className={`font-latin-ui rounded-[3px] border py-1.5 text-center text-xs font-bold transition ${
                        config.size === s.id
                          ? "border-[#14201A] bg-[#14201A] text-[#E7D19F]"
                          : "border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--ink-main)] hover:border-[var(--accent-gold)]"
                      }`}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-xs font-bold text-[var(--ink-main)]">
                  {t.calcLabels.sides}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {["single", "double"].map((side) => (
                    <button
                      key={side}
                      type="button"
                      disabled={duplexDisabled && side === "double"}
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, sides: side }))
                      }
                      className={`rounded-[3px] border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
                        config.sides === side &&
                        !(duplexDisabled && side === "double")
                          ? "border-[#183E30] bg-[#183E30] text-white"
                          : "border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--ink-main)]"
                      }`}
                    >
                      {t.sideNames[side]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Paper Stock & Binding */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="calc-paper-stock"
                  className="mb-1.5 block text-xs font-bold text-[var(--ink-main)]"
                >
                  {t.calcLabels.paperStock}
                </label>
                <select
                  id="calc-paper-stock"
                  value={config.paperStock}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      paperStock: e.target.value,
                    }))
                  }
                  className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs sm:text-sm font-medium text-[var(--ink-main)]"
                >
                  {PAPER_STOCKS.map((st) => (
                    <option key={st.id} value={st.id} className="bg-[var(--bg-surface)] text-[var(--ink-main)]">
                      {t.paperStockNames[st.id]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="calc-binding"
                  className="mb-1.5 block text-xs font-bold text-[var(--ink-main)]"
                >
                  {t.calcLabels.binding}
                </label>
                <select
                  id="calc-binding"
                  disabled={duplexDisabled}
                  value={config.binding}
                  onChange={(e) => {
                    const nextBinding = e.target.value;
                    setConfig((prev) => ({
                      ...prev,
                      binding: nextBinding,
                    }));
                    if (nextBinding === "hardcover") setCoverTheme("pine");
                  }}
                  className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-xs sm:text-sm font-medium text-[var(--ink-main)] disabled:opacity-50"
                >
                  {BINDING_OPTIONS.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[var(--bg-surface)] text-[var(--ink-main)]">
                      {t.bindingNames[b.id]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cover Color Theme Picker */}
            <div>
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--ink-main)]">
                <Palette className="h-3.5 w-3.5 text-[var(--accent-gold)]" aria-hidden="true" />
                <span>{t.calcLabels.coverThemeLabel}</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COVER_THEMES.map((theme) => {
                  const selected = coverTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setCoverTheme(theme.id)}
                      className={`inline-flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1 text-xs font-semibold transition ${
                        selected
                          ? "border-[#14201A] bg-[#14201A] text-white"
                          : "border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--ink-main)] hover:border-[var(--accent-gold)]"
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-white/40"
                        style={{ backgroundColor: theme.bg }}
                      />
                      <span>{lang === "fa" ? theme.labelFa : theme.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pages & Copies Steppers */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { field: "pages", label: t.calcLabels.pages, max: 5000 },
                { field: "copies", label: t.calcLabels.copies, max: 2000 },
              ].map(({ field, label, max }) => (
                <div key={field}>
                  <label
                    htmlFor={`calc-${field}`}
                    className="mb-1.5 block text-xs font-bold text-[var(--ink-main)]"
                  >
                    {label}
                  </label>
                  <div className="flex items-center justify-between rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] p-1">
                    <button
                      type="button"
                      aria-label={`Decrease ${field}`}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          [field]: Math.max(1, prev[field] - 1),
                        }))
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[2px] bg-[var(--bg-surface)] text-[var(--ink-main)] hover:bg-[#183E30] hover:text-white"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <input
                      id={`calc-${field}`}
                      type="number"
                      min={1}
                      max={max}
                      value={config[field]}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          [field]: Math.max(
                            1,
                            Math.min(max, Number(e.target.value) || 1)
                          ),
                        }))
                      }
                      className="tabular-nums w-20 bg-transparent text-center font-latin-ui text-sm font-bold text-[var(--ink-main)]"
                    />
                    <button
                      type="button"
                      aria-label={`Increase ${field}`}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          [field]: Math.min(max, prev[field] + 1),
                        }))
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[2px] bg-[var(--bg-surface)] text-[var(--ink-main)] hover:bg-[#183E30] hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Foil / Cover Title Live Input */}
            <div>
              <label
                htmlFor="calc-monogram"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--ink-main)]"
              >
                <Type className="h-3.5 w-3.5 text-[var(--accent-gold)]" aria-hidden="true" />
                <span>{t.calcLabels.monogramTitle}</span>
              </label>
              <input
                id="calc-monogram"
                type="text"
                maxLength={42}
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={t.calcLabels.monogramPlaceholder}
                className="w-full rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3.5 py-2 text-xs sm:text-sm text-[var(--ink-main)] placeholder:text-[var(--ink-sub)]"
              />
            </div>

            {/* File Attachment Dropzone */}
            <div>
              <span className="mb-1.5 block text-xs font-bold text-[var(--ink-main)]">
                {t.calcLabels.uploadTitle}
              </span>
              {uploadedFile ? (
                <div className="flex items-center justify-between gap-3 rounded-[3px] border border-[var(--accent-pine)]/40 bg-[var(--bg-soft)] px-3.5 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {uploadedFile.previewUrl ? (
                      <img
                        src={uploadedFile.previewUrl}
                        alt={uploadedFile.name}
                        width="36"
                        height="36"
                        className="h-9 w-9 shrink-0 rounded-[2px] object-cover border border-[var(--border-strong)]"
                      />
                    ) : (
                      <FileText className="h-5 w-5 shrink-0 text-[var(--accent-pine)]" aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-sm font-bold text-[var(--ink-main)] font-latin-ui">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-[var(--ink-sub)] font-latin-ui">
                        {uploadedFile.sizeLabel}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="inline-flex items-center gap-1 rounded-[3px] border border-[var(--accent-crimson)]/40 px-2.5 py-1 text-xs font-semibold text-[var(--accent-crimson)] hover:bg-[var(--accent-crimson)] hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.calcLabels.removeFile}</span>
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[4px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-page)] px-4 py-4 text-center transition hover:border-[var(--accent-pine)] hover:bg-[var(--bg-soft)]">
                  <Upload className="h-5 w-5 text-[var(--accent-pine)]" aria-hidden="true" />
                  <span className="text-xs font-bold text-[var(--ink-main)]">
                    {t.calcLabels.chooseFile}
                  </span>
                  <span className="text-xs text-[var(--ink-sub)]">
                    {t.calcLabels.uploadHint}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.ai,.zip"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Sticky Dark Order Summary + Live Bindery 3D Preview */}
          <aside className="min-w-0 rounded-[4px] border border-[#C8A258]/40 bg-[#123126] p-4 sm:p-5 text-[#FAF6EE] md:col-span-5 lg:col-span-4 md:sticky md:top-[96px] md:max-h-[calc(100vh-112px)] md:overflow-y-auto space-y-3">
            <div>
              <p className="eyebrow text-[#E7D19F]">
                {t.orderSummary.eyebrow}
              </p>
              <h3 className="mt-0.5 text-lg font-bold text-white">
                {t.orderSummary.title}
              </h3>
            </div>

            <Live3DPreview
              mode="print"
              config={config}
              customTitle={customTitle}
              coverTheme={coverTheme}
              uploadedPreviewUrl={uploadedFile?.previewUrl}
              lang={lang}
              t={t}
            />

            <div className="space-y-1.5 border-y border-white/15 py-2.5 text-xs">
              <div className="flex justify-between text-[#D0D9D3]">
                <span>{t.orderSummary.impressions}</span>
                <span className="tabular-nums font-bold text-white">
                  {formatNumber(quote.totalImpressions, lang)}
                </span>
              </div>
              <div className="flex justify-between text-[#D0D9D3]">
                <span>{t.orderSummary.sheets}</span>
                <span className="tabular-nums font-bold text-white">
                  {formatNumber(quote.totalSheets, lang)}
                </span>
              </div>
              <div className="flex justify-between text-[#D0D9D3]">
                <span>{t.orderSummary.perCopy}</span>
                <span className="tabular-nums font-bold text-white">
                  {formatPrice(quote.perCopy, lang)}
                </span>
              </div>
              {quote.discountRate > 0 && (
                <div className="flex justify-between text-[#9BD4B8]">
                  <span>{t.orderSummary.discount}</span>
                  <span className="tabular-nums font-bold">
                    -{Math.round(quote.discountRate * 100)}% (-
                    {formatPrice(quote.discountAmount, lang)})
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#D0D9D3]">
                <span>{t.orderSummary.turnaround}</span>
                <span className="tabular-nums font-semibold text-[#E7D19F]">
                  {t.orderSummary.approxPrefix}{" "}
                  {formatNumber(quote.turnaroundHours, lang)} {t.orderSummary.hours}
                </span>
              </div>
            </div>

            {quote.nextTier && (
              <div className="rounded-[3px] bg-white/10 px-3 py-2 text-xs space-y-1">
                <div className="flex justify-between text-[#E7D19F]">
                  <span>
                    {lang === "fa"
                      ? `تا تخفیف ${Math.round(quote.nextTier.rate * 100)}٪ پلکانی`
                      : `Next ${Math.round(quote.nextTier.rate * 100)}% tier`}
                  </span>
                  <span className="tabular-nums font-bold font-latin-ui">
                    {formatNumber(quote.totalImpressions, lang)} /{" "}
                    {formatNumber(quote.nextTier.minImpressions, lang)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-[2px] bg-white/15">
                  <div
                    className="h-full bg-[#E7D19F] transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (quote.totalImpressions / quote.nextTier.minImpressions) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-[#D0D9D3]">
                {t.orderSummary.total}
              </p>
              <p className="tabular-nums mt-0.5 text-2xl font-bold text-white">
                {formatPrice(quote.total, lang)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddToBag}
              className="w-full rounded-[3px] bg-[var(--accent-crimson)] px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:opacity-90"
            >
              {t.orderSummary.addJobBtn}
            </button>

            {justAdded && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 rounded-[3px] bg-[#183E30] border border-white/20 px-3 py-2 text-xs font-medium text-white"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#9BD4B8]" aria-hidden="true" />
                <span>{t.orderSummary.jobAddedToast}</span>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* 6 Numbered Services Catalog (Semantic Buttons) */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="eyebrow text-[var(--accent-pine)]">
            {t.servicesSectionEyebrow}
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[var(--ink-main)]">
            {t.servicesSectionTitle}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicesList.map((srv, idx) => {
            const loc = srv[lang] || srv.fa;
            return (
              <Reveal key={srv.id} delayMs={idx * 50}>
                <button
                  type="button"
                  onClick={() => applyServicePreset(srv.id)}
                  className="group flex h-full w-full flex-col justify-between rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 text-start transition-colors hover:border-[var(--accent-gold)]"
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-latin-ui text-2xl font-bold text-[var(--accent-gold)] group-hover:text-[var(--accent-crimson)] transition">
                        {srv.code}
                      </span>
                      <span className="tabular-nums rounded-[2px] bg-[var(--bg-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ink-main)]">
                        {t.startingFrom} {formatPrice(srv.startingPrice, lang)}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-[var(--ink-main)]">
                      {loc.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--ink-sub)]">
                      {loc.desc}
                    </p>
                  </div>
                  <span className="mt-4 block w-full border-t border-[var(--border-subtle)] pt-3 text-xs font-semibold text-[var(--accent-pine)]">
                    {loc.unit}
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Tiered Pricing & Atelier Specifications */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-10">
        <div className="overflow-hidden rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8">
          <h3 className="mb-5 text-xl font-bold text-[var(--ink-main)]">
            {t.priceTableTitle}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--ink-sub)]">
                  <th className="py-3 text-start font-semibold">
                    {t.priceTableCols.tier}
                  </th>
                  <th className="py-3 text-start font-semibold">
                    {t.priceTableCols.bw}
                  </th>
                  <th className="py-3 text-start font-semibold">
                    {t.priceTableCols.color}
                  </th>
                  <th className="py-3 text-start font-semibold">
                    {t.priceTableCols.discount}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {tieredPriceRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={row.best ? "bg-[var(--accent-crimson)]/10 font-bold" : ""}
                  >
                    <td className="py-3.5 text-[var(--ink-main)]">{row.tier[lang]}</td>
                    <td className="tabular-nums py-3.5 text-[var(--ink-main)]">{formatPrice(row.bwA4, lang)}</td>
                    <td className="tabular-nums py-3.5 text-[var(--ink-main)]">{formatPrice(row.colorA4, lang)}</td>
                    <td className="tabular-nums py-3.5">
                      {row.best ? (
                        <span className="inline-flex rounded-[2px] bg-[var(--accent-crimson)] px-2.5 py-0.5 text-xs font-bold text-white">
                          {row.discount}
                        </span>
                      ) : (
                        <span className="text-[var(--accent-pine)] font-semibold">
                          {row.discount}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Corporate & Atelier Specs Band */}
        <div className="rounded-[4px] border border-[#C8A258]/35 bg-[#123126] p-7 sm:p-10 text-[#FAF6EE]">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="space-y-3 lg:col-span-6">
              <p className="eyebrow text-[#E7D19F]">
                {t.wholesaleEyebrow}
              </p>
              <h3 className="text-2xl font-bold text-white">
                {t.wholesaleTitle}
              </h3>
              <p className="text-sm leading-relaxed text-[#D7E3DC]">
                {t.wholesaleDesc}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-6">
              {t.kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className="rounded-[3px] border border-white/15 bg-white/10 p-4 text-center"
                >
                  <p className="tabular-nums text-lg sm:text-xl font-bold text-white">
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-[#D7E3DC]">
                    {kpi.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services FAQ Accordion */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-4 sm:px-6">
        <h2 className="mb-6 text-center text-2xl font-bold text-[var(--ink-main)]">
          {t.faqTitle}
        </h2>
        <div className="space-y-3">
          {servicesFaq.map((item, idx) => {
            const isOpen = openFaqIdx === idx;
            const loc = item[lang] || item.fa;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm font-bold text-[var(--ink-main)]"
                >
                  <span>{loc.q}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-[var(--accent-pine)] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-[var(--border-subtle)] px-5 py-4 text-xs sm:text-sm leading-relaxed text-[var(--ink-body)]">
                    {loc.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
