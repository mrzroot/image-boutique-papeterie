import assert from "node:assert/strict";
import { calculatePrintQuote, getVolumeDiscountRate, formatPrice } from "./pricing.js";
import {
  buildDefaultSiteContent,
  mergeSiteContent,
  hashPasscode,
  DEFAULT_ADMIN_PASSCODE,
} from "./cmsStore.js";

// Verify tiered discount boundaries
assert.equal(getVolumeDiscountRate(99), 0);
assert.equal(getVolumeDiscountRate(100), 0.1);
assert.equal(getVolumeDiscountRate(500), 0.2);
assert.equal(getVolumeDiscountRate(1000), 0.3);

// Verify single-sided vs double-sided sheet calculation, nextTier, and turnaroundHours
const duplex = calculatePrintQuote({
  printType: "bw",
  size: "A4",
  sides: "double",
  paperStock: "tahrir80",
  binding: "none",
  pages: 101,
  copies: 1,
});
assert.equal(duplex.totalSheets, 51);
assert.equal(duplex.discountRate, 0.1);
assert.equal(duplex.turnaroundHours, 4);
assert.deepEqual(duplex.nextTier, { minImpressions: 500, rate: 0.2 });

// Verify admin pricing overrides dynamically affect calculatePrintQuote
const overridden = calculatePrintQuote(
  {
    printType: "bw",
    size: "A4",
    sides: "single",
    paperStock: "tahrir80",
    binding: "none",
    pages: 10,
    copies: 10,
  },
  {
    printTypes: [{ id: "bw", baseRate: 3000 }],
    paperStocks: [{ id: "tahrir80", extraPerSheet: 500 }],
    bindings: [{ id: "none", flatFee: 0 }],
  }
);
assert.equal(overridden.total, Math.round((100 * 3000 + 100 * 500) * 0.9));

// Verify plot disables duplex splitting and applies minimum floor
const plot = calculatePrintQuote({
  printType: "plot",
  size: "A3",
  sides: "double",
  paperStock: "cotton240",
  binding: "none",
  pages: 2,
  copies: 1,
});
assert.equal(plot.totalSheets, 2);
assert.ok(plot.total >= 25000);

// Verify formatting in both languages
assert.ok(formatPrice(150000, "fa").includes("تومان"));
assert.equal(formatPrice(150000, "en"), "150,000 Toman");

// Verify CMS store defaults, merge, and passcode hashing
const baseCms = buildDefaultSiteContent();
assert.equal(baseCms.products.length, 12);
assert.ok(baseCms.products.every((p) => Boolean(p.modelType) && Boolean(p.specs3d?.fa)));
const merged = mergeSiteContent(baseCms, {
  version: 2,
  announcement: { fa: "اعلان جدید" },
});
assert.equal(merged.version, 2);
assert.equal(merged.announcement.fa, "اعلان جدید");
assert.equal(merged.products.length, 12);

// Verify product media fields survive normalisation (draft/import/published JSON round-trip)
assert.ok(baseCms.products.every((p) => Array.isArray(p.gallery) && Array.isArray(p.spinImages) && p.model3dUrl === ""));
const spin = Array.from({ length: 8 }, (_, i) => `./images/spin/a-${i}.jpg`);
const withMedia = mergeSiteContent(baseCms, {
  products: [
    {
      ...baseCms.products[0],
      gallery: ["./images/g1.jpg", "  ", 42, " https://cdn.example/g2.jpg "],
      spinImages: spin,
      model3dUrl: " ./models/notebook.glb ",
    },
    { id: "legacy-draft", sku: "OLD-1", fa: { title: "قدیمی" }, en: { title: "Old" } },
  ],
});
const roundTripped = mergeSiteContent(buildDefaultSiteContent(), JSON.parse(JSON.stringify(withMedia)));
assert.deepEqual(roundTripped.products[0].gallery, ["./images/g1.jpg", "https://cdn.example/g2.jpg"]);
assert.deepEqual(roundTripped.products[0].spinImages, spin);
assert.equal(roundTripped.products[0].model3dUrl, "./models/notebook.glb");
assert.deepEqual(roundTripped.products[1].gallery, []);
assert.equal(roundTripped.products[1].model3dUrl, "");
assert.equal(roundTripped.products[1].visible, true);

const hashedDefault = await hashPasscode(DEFAULT_ADMIN_PASSCODE);
assert.equal(hashedDefault, baseCms.settings.adminPasscodeHash);
assert.equal(hashedDefault.length, 64);

console.log("All pricing, CMS store, and formatting assertions passed.");
