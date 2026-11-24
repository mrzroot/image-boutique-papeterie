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
  Clock,
  Receipt,
  Sparkles,
  Award,
  Type,
  Palette,
} from "lucide-react";
import {
  SERVICES_LIST,
  TIERED_PRICE_ROWS,
  SERVICES_FAQ,
} from "../data/catalog";
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

  const quote = calculatePrintQuote(config);
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
      customTitle.trim() ? `✦ ${customTitle.trim()}` : null,
      uploadedFile ? `📎 ${uploadedFile.name}` : null,
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
            className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-surface)] px-4 py-1.5 text-xs font-bold text-[var(--accent-pine)] border border-[var(--border-strong)] shadow-2xs transition hover:bg-[var(--accent-pine)] hover:text-white cursor-pointer"
          >
            <BackArrow className="h-3.5 w-3.5" />
            <span>{t.backToStorefront}</span>
          </button>
          <span className="font-latin-ui text-[11px] font-semibold tracking-wider text-[var(--ink-sub)]">
            IMAGE BOUTIQUE · PRINT & BINDERY PORTAL
          </span>
        </div>
      </div>

      {/* Atelier Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6">
        <div className="overflow-hidden rounded-[32px] border border-[#C8A258]/40 bg-[#123126] text-[#FAF6EE] shadow-atelier">
          <div className="grid items-stretch md:grid-cols-12">
            <div className="space-y-4 p-7 sm:p-9 md:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E7D19F]/30 bg-white/10 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-foil">
                ✦ {t.servicesHeroEyebrow}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug text-white">
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
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 4-Column Trust Bar */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.trustBar.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3.5 shadow-2xs"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-soft)] text-[#1B4636]">
                {idx === 0 ? (
                  <Clock className="h-4 w-4" />
                ) : idx === 1 ? (
                  <Receipt className="h-4 w-4" />
                ) : idx === 2 ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <Award className="h-4 w-4" />
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-[var(--ink-main)]">
                  {item.title}
                </h3>
                <p className="text-[11px] text-[var(--ink-sub)]">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instant Print Quote Calculator + Live Mockup Preview */}
      <section
        id="quote-calculator"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <div className="mb-6">
          <p className="font-latin-ui text-[11px] font-bold tracking-[0.2em] text-[#BF3927]">
            {t.calcEyebrow}
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[var(--ink-main)]">
            {t.calcTitle}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-12 items-start">
          {/* Configurator Form */}
          <div className="min-w-0 space-y-6 rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm md:col-span-7 lg:col-span-8">
            {/* Print Type */}
            <div>
              <label className="mb-2.5 block text-xs font-bold text-[var(--ink-main)]">
                {t.calcLabels.printType}
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {PRINT_TYPES.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => handlePrintTypeChange(pt.id)}
                    className={`rounded-2xl border px-3 py-3 text-start text-xs font-semibold transition cursor-pointer ${
                      config.printType === pt.id
                        ? "border-[#1B4636] bg-[#1B4636] text-white shadow-sm"
                        : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--ink-main)] hover:border-[#B89352]"
                    }`}
                  >
                    {t.printTypeNames[pt.id]}
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Sides */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-xs font-bold text-[var(--ink-main)]">
                  {t.calcLabels.size}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PAPER_SIZES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, size: s.id }))
                      }
                      className={`font-latin-ui rounded-full border py-2 text-center text-xs font-bold transition cursor-pointer ${
                        config.size === s.id
                          ? "border-[#14201A] bg-[#14201A] text-[#E7D19F] shadow-xs"
                          : "border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--ink-main)] hover:border-[#B89352]"
                      }`}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2.5 block text-xs font-bold text-[var(--ink-main)]">
                  {t.calcLabels.sides}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["single", "double"].map((side) => (
                    <button
                      key={side}
                      type="button"
                      disabled={duplexDisabled && side === "double"}
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, sides: side }))
                      }
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        config.sides === side &&
                        !(duplexDisabled && side === "double")
                          ? "border-[#1B4636] bg-[#1B4636] text-white"
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
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-[var(--ink-main)]">
                  {t.calcLabels.paperStock}
                </label>
                <select
                  value={config.paperStock}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      paperStock: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-4 py-3 text-sm font-medium text-[var(--ink-main)] outline-none focus:border-[#1B4636]"
                >
                  {PAPER_STOCKS.map((st) => (
                    <option key={st.id} value={st.id}>
                      {t.paperStockNames[st.id]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-[var(--ink-main)]">
                  {t.calcLabels.binding}
                </label>
                <select
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
                  className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-4 py-3 text-sm font-medium text-[var(--ink-main)] outline-none focus:border-[#1B4636] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {BINDING_OPTIONS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {t.bindingNames[b.id]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cover Color Theme Picker (syncs live with 3D Mockup) */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[var(--ink-main)]">
                <Palette className="h-3.5 w-3.5 text-[#B89352]" />
                <span>{t.calcLabels.coverThemeLabel}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {COVER_THEMES.map((theme) => {
                  const selected = coverTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setCoverTheme(theme.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        selected
                          ? "border-[#14201A] bg-[#14201A] text-white shadow-xs"
                          : "border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--ink-main)] hover:border-[#B89352]"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-white/40 shadow-2xs"
                        style={{ backgroundColor: theme.bg }}
                      />
                      <span>{lang === "fa" ? theme.labelFa : theme.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pages & Copies Steppers */}
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { field: "pages", label: t.calcLabels.pages, max: 5000 },
                { field: "copies", label: t.calcLabels.copies, max: 2000 },
              ].map(({ field, label, max }) => (
                <div key={field}>
                  <label className="mb-2 block text-xs font-bold text-[var(--ink-main)]">
                    {label}
                  </label>
                  <div className="flex items-center justify-between rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-page)] p-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          [field]: Math.max(1, prev[field] - 1),
                        }))
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--ink-main)] shadow-2xs hover:bg-[#1B4636] hover:text-white cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
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
                      className="w-24 bg-transparent text-center font-latin-ui text-base font-bold text-[var(--ink-main)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          [field]: Math.min(max, prev[field] + 1),
                        }))
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--ink-main)] shadow-2xs hover:bg-[#1B4636] hover:text-white cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Foil / Cover Title Live Input */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[var(--ink-main)]">
                <Type className="h-3.5 w-3.5 text-[#B89352]" />
                <span>{t.calcLabels.monogramTitle}</span>
              </label>
              <input
                type="text"
                maxLength={42}
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={t.calcLabels.monogramPlaceholder}
                className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-page)] px-4 py-3 text-sm text-[var(--ink-main)] outline-none focus:border-[#B89352] placeholder:text-[#8E968F]"
              />
            </div>

            {/* File Attachment Dropzone */}
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--ink-main)]">
                {t.calcLabels.uploadTitle}
              </label>
              {uploadedFile ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#1B4636]/35 bg-[#1B4636]/5 px-4 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {uploadedFile.previewUrl ? (
                      <img
                        src={uploadedFile.previewUrl}
                        alt={uploadedFile.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover border border-[var(--border-strong)]"
                      />
                    ) : (
                      <FileText className="h-5 w-5 shrink-0 text-[#1B4636]" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--ink-main)] font-latin-ui">
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
                    className="inline-flex items-center gap-1 rounded-full border border-[#BF3927]/30 px-3 py-1 text-xs font-semibold text-[#BF3927] hover:bg-[#BF3927] hover:text-white cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t.calcLabels.removeFile}</span>
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D3C9B6] bg-[var(--bg-page)] px-4 py-6 text-center transition hover:border-[#1B4636] hover:bg-[#F5EFE3]">
                  <Upload className="h-6 w-6 text-[#1B4636]" />
                  <span className="text-xs font-bold text-[var(--ink-main)]">
                    {t.calcLabels.chooseFile}
                  </span>
                  <span className="text-[11px] text-[var(--ink-sub)]">
                    {t.calcLabels.uploadHint}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.ai,.zip"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Sticky Dark Order Summary + Live Bindery Preview */}
          <aside className="min-w-0 rounded-[28px] border border-[#C8A258]/35 bg-[#123126] p-6 sm:p-7 text-[#FAF6EE] shadow-atelier md:col-span-5 lg:col-span-4 md:sticky md:top-28 space-y-5">
            <div>
              <p className="font-latin-ui text-[10px] font-bold tracking-[0.22em] text-[#E7D19F]">
                {t.orderSummary.eyebrow}
              </p>
              <h3 className="mt-1 text-xl font-bold text-white">
                {t.orderSummary.title}
              </h3>
            </div>

            <Live3DPreview
              config={config}
              customTitle={customTitle}
              coverTheme={coverTheme}
              uploadedPreviewUrl={uploadedFile?.previewUrl}
              t={t}
            />

            <div className="space-y-3 border-y border-white/15 py-4 text-xs">
              <div className="flex justify-between text-[#D0D9D3]">
                <span>{t.orderSummary.impressions}</span>
                <span className="font-bold text-white">
                  {formatNumber(quote.totalImpressions, lang)}
                </span>
              </div>
              <div className="flex justify-between text-[#D0D9D3]">
                <span>{t.orderSummary.sheets}</span>
                <span className="font-bold text-white">
                  {formatNumber(quote.totalSheets, lang)}
                </span>
              </div>
              <div className="flex justify-between text-[#D0D9D3]">
                <span>{t.orderSummary.perCopy}</span>
                <span className="font-bold text-white">
                  {formatPrice(quote.perCopy, lang)}
                </span>
              </div>
              <div className="flex justify-between text-[#D0D9D3]">
                <span>{t.orderSummary.discount}</span>
                <span className="font-bold text-[#F2B8A8]">
                  {quote.discountRate > 0
                    ? lang === "fa"
                      ? `${formatNumber(
                          Math.round(quote.discountRate * 100),
                          lang
                        )}٪ (${formatPrice(quote.discountAmount, lang)} کسر)`
                      : `${Math.round(quote.discountRate * 100)}% (-${formatPrice(
                          quote.discountAmount,
                          lang
                        )})`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-[#D0D9D3]">
                <span>{t.orderSummary.turnaround}</span>
                <span className="font-bold text-[#9BD4B8]">
                  {t.orderSummary.approxPrefix}{" "}
                  {formatNumber(quote.turnaroundHours, lang)}{" "}
                  {t.orderSummary.hours}
                </span>
              </div>
            </div>

            {/* Volume Tier Progress Indicator */}
            {quote.totalImpressions < 1000 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-[11px]">
                {(() => {
                  const nextTarget =
                    quote.totalImpressions < 100
                      ? 100
                      : quote.totalImpressions < 500
                      ? 500
                      : 1000;
                  const nextRate =
                    nextTarget === 100 ? 10 : nextTarget === 500 ? 20 : 30;
                  const pct = Math.min(
                    100,
                    Math.round((quote.totalImpressions / nextTarget) * 100)
                  );
                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[#E7D19F]">
                        <span>
                          {lang === "fa"
                            ? `تا تخفیف ${formatNumber(nextRate, lang)}٪ پلکانی`
                            : `Toward ${nextRate}% volume tier`}
                        </span>
                        <span className="font-semibold">
                          {formatNumber(quote.totalImpressions, lang)} /{" "}
                          {formatNumber(nextTarget, lang)}
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#E7D19F] to-[#9BD4B8] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div>
              <p className="text-xs text-[#B7C3BC]">{t.orderSummary.total}</p>
              <p
                key={quote.total}
                className="mt-1 text-2xl sm:text-3xl font-bold text-white animate-price-pop"
              >
                {formatPrice(quote.total, lang)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddToBag}
              className="w-full rounded-full bg-[#BF3927] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#D54431] cursor-pointer"
            >
              {t.orderSummary.addJobBtn}
            </button>

            {justAdded && (
              <div className="flex items-center gap-2 rounded-2xl bg-[#1B4636] border border-white/15 px-3.5 py-2.5 text-xs font-medium text-white">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#9BD4B8]" />
                <span>{t.orderSummary.jobAddedToast}</span>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* 6 Numbered Services Catalog */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="font-latin-ui text-[11px] font-bold tracking-[0.2em] text-[#1B4636]">
            {t.servicesSectionEyebrow}
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[var(--ink-main)]">
            {t.servicesSectionTitle}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES_LIST.map((srv, idx) => {
            const loc = srv[lang];
            return (
              <Reveal key={srv.id} delayMs={idx * 60}>
                <div
                  onClick={() => applyServicePreset(srv.id)}
                  className="group flex h-full flex-col justify-between rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent-gold)] hover:shadow-atelier cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-latin-ui text-2xl font-bold text-[var(--accent-gold)]/55 group-hover:text-[var(--accent-crimson)] transition">
                        {srv.code}
                      </span>
                      <span className="rounded-full bg-[var(--bg-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--ink-main)]">
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
                  <p className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-[11px] font-semibold text-[var(--accent-pine)]">
                    {loc.unit} ↗
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Tiered Pricing & Wholesale KPIs */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-10">
        <div className="overflow-hidden rounded-[26px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-2xs">
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
              <tbody className="divide-y divide-[#F1EBE0]">
                {TIERED_PRICE_ROWS.map((row, idx) => (
                  <tr
                    key={idx}
                    className={row.best ? "bg-[#BF3927]/5 font-bold" : ""}
                  >
                    <td className="py-3.5 text-[var(--ink-main)]">{row.tier[lang]}</td>
                    <td className="py-3.5">{formatPrice(row.bwA4, lang)}</td>
                    <td className="py-3.5">{formatPrice(row.colorA4, lang)}</td>
                    <td className="py-3.5">
                      {row.best ? (
                        <span className="inline-flex rounded-full bg-[#BF3927] px-2.5 py-0.5 text-xs font-bold text-white">
                          BEST · {row.discount}
                        </span>
                      ) : (
                        <span className="text-[#1B4636] font-semibold">
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

        {/* Wholesale KPI Banner */}
        <div className="rounded-[28px] bg-[#1B4636] p-7 sm:p-10 text-[#FAF6EE]">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="space-y-3 lg:col-span-6">
              <p className="font-latin-ui text-[11px] font-bold tracking-[0.2em] text-[#E7D19F]">
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
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center"
                >
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[#D7E3DC]">
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
          {SERVICES_FAQ.map((item, idx) => {
            const isOpen = openFaqIdx === idx;
            const loc = item[lang];
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm font-bold text-[var(--ink-main)] cursor-pointer"
                >
                  <span>{loc.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#1B4636] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-[#F1EBE0] px-5 py-4 text-xs sm:text-sm leading-relaxed text-[#4C5850]">
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
