import assert from "node:assert/strict";
import { calculatePrintQuote, getVolumeDiscountRate, formatPrice } from "./pricing.js";

// Verify tiered discount boundaries
assert.equal(getVolumeDiscountRate(99), 0);
assert.equal(getVolumeDiscountRate(100), 0.1);
assert.equal(getVolumeDiscountRate(500), 0.2);
assert.equal(getVolumeDiscountRate(1000), 0.3);

// Verify single-sided vs double-sided sheet calculation
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

console.log("All pricing and formatting assertions passed.");
