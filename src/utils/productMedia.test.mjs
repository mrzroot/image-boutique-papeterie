import assert from "node:assert/strict";
import { getMediaModes, getSpinImages, MEDIA_STRINGS } from "./productMedia.js";
import { PRODUCTS } from "../data/catalog.js";

const photoOnly = { id: "p", image: "./images/a.jpg" };
const frames = (n) => Array.from({ length: n }, (_, i) => `./spin/${i}.jpg`);

// Every real catalog product today: photo + 3D presentation, no accurate 360° (no verified data yet).
for (const product of PRODUCTS) {
  assert.deepEqual(getMediaModes(product), ["photo", "presentation"], product.id);
}

assert.deepEqual(getMediaModes({}), ["photo"]);
assert.deepEqual(getMediaModes(photoOnly), ["photo", "presentation"]);
assert.deepEqual(getMediaModes({ ...photoOnly, model3dUrl: "./models/x.glb" }), ["photo", "presentation", "model"]);
assert.deepEqual(getMediaModes({ ...photoOnly, model3dUrl: "   " }), ["photo", "presentation"]);
// spin needs >= 8 real frames; blanks don't count
assert.deepEqual(getMediaModes({ ...photoOnly, spinImages: frames(7) }), ["photo", "presentation"]);
assert.deepEqual(getMediaModes({ ...photoOnly, spinImages: [...frames(7), ""] }), ["photo", "presentation"]);
assert.deepEqual(getMediaModes({ ...photoOnly, spinImages: frames(8) }), ["photo", "presentation", "spin"]);
// a real model wins over a spin sequence
assert.deepEqual(
  getMediaModes({ ...photoOnly, model3dUrl: "./m.glb", spinImages: frames(12) }),
  ["photo", "presentation", "model"]
);
assert.deepEqual(getSpinImages({ spinImages: "nope" }), []);

// fa/en dictionaries stay in sync
assert.deepEqual(Object.keys(MEDIA_STRINGS.fa).sort(), Object.keys(MEDIA_STRINGS.en).sort());

console.log("productMedia tests passed");
