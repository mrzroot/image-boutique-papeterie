/**
 * Pure formatting and print quote pricing helpers shared across storefront & services portal.
 */

export function formatPrice(amount, lang) {
  const num = Math.round(Number(amount) || 0);
  if (lang === "fa") {
    return `${new Intl.NumberFormat("fa-IR").format(num)} تومان`;
  }
  return `${new Intl.NumberFormat("en-US").format(num)} Toman`;
}

export function formatNumber(num, lang) {
  return new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US").format(
    Number(num) || 0
  );
}

export const PRINT_TYPES = [
  { id: "bw", baseRate: 1800, colorMultiplier: 1 },
  { id: "color", baseRate: 5200, colorMultiplier: 1 },
  { id: "plot", baseRate: 28000, colorMultiplier: 1 },
  { id: "sticker", baseRate: 24000, colorMultiplier: 1 },
];

export const PAPER_SIZES = [
  { id: "A5", multiplier: 0.7 },
  { id: "A4", multiplier: 1 },
  { id: "A3", multiplier: 1.9 },
  { id: "B5", multiplier: 0.85 },
];

export const PAPER_STOCKS = [
  { id: "tahrir80", extraPerSheet: 0 },
  { id: "tahrir100", extraPerSheet: 450 },
  { id: "glossy135", extraPerSheet: 1400 },
  { id: "cotton240", extraPerSheet: 4200 },
  { id: "kraft", extraPerSheet: 2800 },
];

export const BINDING_OPTIONS = [
  { id: "none", flatFee: 0 },
  { id: "saddle", flatFee: 18000 },
  { id: "spiral", flatFee: 45000 },
  { id: "perfect", flatFee: 85000 },
  { id: "hardcover", flatFee: 260000 },
];

export function getVolumeDiscountRate(totalSheets) {
  if (totalSheets >= 1000) return 0.3;
  if (totalSheets >= 500) return 0.2;
  if (totalSheets >= 100) return 0.1;
  return 0;
}

export function calculatePrintQuote({
  printType = "color",
  size = "A4",
  sides = "double",
  paperStock = "tahrir100",
  binding = "spiral",
  pages = 40,
  copies = 2,
}) {
  const safePages = Math.max(1, Math.min(5000, Number(pages) || 1));
  const safeCopies = Math.max(1, Math.min(2000, Number(copies) || 1));

  const typeCfg = PRINT_TYPES.find((t) => t.id === printType) || PRINT_TYPES[1];
  const sizeCfg = PAPER_SIZES.find((s) => s.id === size) || PAPER_SIZES[1];
  const stockCfg =
    PAPER_STOCKS.find((p) => p.id === paperStock) || PAPER_STOCKS[0];
  const bindingCfg =
    BINDING_OPTIONS.find((b) => b.id === binding) || BINDING_OPTIONS[0];

  const isDouble = sides === "double" && printType !== "plot" && printType !== "sticker";
  const physicalSheetsPerCopy = isDouble ? Math.ceil(safePages / 2) : safePages;
  const totalImpressions = safePages * safeCopies;
  const totalSheets = physicalSheetsPerCopy * safeCopies;

  const sideFactor = isDouble ? 0.92 : 1;
  const impressionCost =
    totalImpressions * typeCfg.baseRate * sizeCfg.multiplier * sideFactor;
  const stockCost = totalSheets * stockCfg.extraPerSheet * sizeCfg.multiplier;
  const bindingCost = safeCopies * bindingCfg.flatFee;

  const rawSubtotal = impressionCost + stockCost + bindingCost;
  const discountRate = getVolumeDiscountRate(totalImpressions);
  const discountAmount = Math.round(rawSubtotal * discountRate);
  const total = Math.max(25000, Math.round(rawSubtotal - discountAmount));
  const perCopy = Math.round(total / safeCopies);

  return {
    totalImpressions,
    totalSheets,
    discountRate,
    discountAmount,
    bindingCost,
    perCopy,
    total,
    turnaroundHours: totalImpressions > 600 || binding === "hardcover" ? 24 : 4,
  };
}
