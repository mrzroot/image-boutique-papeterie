import {
  PRODUCTS,
  BUNDLES,
  SOCIAL_GALLERY,
  SERVICES_LIST,
  TIERED_PRICE_ROWS,
  SERVICES_FAQ,
} from "../data/catalog.js";
import { TRANSLATIONS } from "../data/translations.js";
import { PRINT_TYPES, PAPER_STOCKS, BINDING_OPTIONS } from "./pricing.js";

export const DEFAULT_ADMIN_PASSCODE = "1405";
export const CMS_DRAFT_KEY = "ib_cms_draft_v1";
export const CMS_GH_KEY = "ib_cms_gh_v1";

// Deterministic pure-JS SHA-256 fallback for environments without crypto.subtle (e.g. HTTP or tests)
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function sha256Sync(str) {
  const bytes = new TextEncoder().encode(String(str));
  const bitLen = bytes.length * 8;
  const withOne = bytes.length + 1;
  const padLen = (withOne + 8) % 64 === 0 ? 0 : 64 - ((withOne + 8) % 64);
  const padded = new Uint8Array(withOne + padLen + 8);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(padded.length - 4, bitLen >>> 0, false);

  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const W = new Uint32Array(64);
  const rotr = (v, n) => (v >>> n) | (v << (32 - n));

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) W[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + W[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return Array.from(H, (v) => v.toString(16).padStart(8, "0")).join("");
}

export async function hashPasscode(plain) {
  const input = String(plain ?? "");
  try {
    if (globalThis.crypto?.subtle) {
      const buf = await globalThis.crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(input)
      );
      return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    // Fall back to pure JS implementation
  }
  return sha256Sync(input);
}

const DEFAULT_PASSCODE_HASH = sha256Sync(DEFAULT_ADMIN_PASSCODE);

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function cleanStringList(list) {
  return Array.isArray(list)
    ? list.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim())
    : [];
}

// Single product shape used by defaults, saved drafts, imports and the admin editor.
// gallery / spinImages / model3dUrl are optional real-media fields read by the storefront viewer.
export function normalizeProduct(p) {
  return {
    ...p,
    visible: p.visible !== false,
    inStock: p.inStock !== false,
    gallery: cleanStringList(p.gallery),
    spinImages: cleanStringList(p.spinImages),
    model3dUrl: typeof p.model3dUrl === "string" ? p.model3dUrl.trim() : "",
  };
}

export function buildDefaultSiteContent() {
  return {
    version: 1,
    updatedAt: null,
    announcement: {
      fa: TRANSLATIONS.fa.announcement,
      en: TRANSLATIONS.en.announcement,
    },
    heroSlides: TRANSLATIONS.fa.heroSlides.map((faSlide, idx) => {
      const enSlide = TRANSLATIONS.en.heroSlides[idx] || faSlide;
      return {
        id: `slide-${idx + 1}`,
        image: faSlide.image,
        fa: {
          eyebrow: faSlide.eyebrow,
          title: faSlide.title,
          desc: faSlide.desc,
          ctaPrimary: faSlide.ctaPrimary,
        },
        en: {
          eyebrow: enSlide.eyebrow,
          title: enSlide.title,
          desc: enSlide.desc,
          ctaPrimary: enSlide.ctaPrimary,
        },
      };
    }),
    valueStrip: TRANSLATIONS.fa.valueStrip.map((faItem, idx) => {
      const enItem = TRANSLATIONS.en.valueStrip[idx] || faItem;
      return {
        fa: { title: faItem.title, desc: faItem.desc },
        en: { title: enItem.title, desc: enItem.desc },
      };
    }),
    story: {
      fa: {
        eyebrow: TRANSLATIONS.fa.storyEyebrow,
        title: TRANSLATIONS.fa.storyTitle,
        body: TRANSLATIONS.fa.storyBody,
      },
      en: {
        eyebrow: TRANSLATIONS.en.storyEyebrow,
        title: TRANSLATIONS.en.storyTitle,
        body: TRANSLATIONS.en.storyBody,
      },
    },
    products: clone(PRODUCTS).map(normalizeProduct),
    bundles: clone(BUNDLES),
    socialGallery: clone(SOCIAL_GALLERY),
    servicesList: clone(SERVICES_LIST),
    tieredPriceRows: clone(TIERED_PRICE_ROWS),
    servicesFaq: clone(SERVICES_FAQ),
    pricing: {
      printTypes: clone(PRINT_TYPES),
      paperStocks: clone(PAPER_STOCKS),
      bindings: clone(BINDING_OPTIONS),
    },
    promoCodes: [{ code: "BOUTIQUE10", percent: 10, active: true }],
    shipping: {
      freeThreshold: 2500000,
      fee: 95000,
      giftWrapPrice: 85000,
    },
    contact: {
      phone: "0935-383-4393",
      email: "atelier@imageboutique.ir",
      hoursFa: "شنبه تا پنج‌شنبه · ۱۰ الی ۲۱",
      hoursEn: "Sat - Thu · 10:00 - 21:00",
    },
    settings: {
      adminPasscodeHash: DEFAULT_PASSCODE_HASH,
    },
  };
}

export function mergeSiteContent(base, override) {
  if (!override || typeof override !== "object") return base;
  const next = clone(base);

  if (override.version) next.version = override.version;
  if (override.updatedAt !== undefined) next.updatedAt = override.updatedAt;
  if (override.announcement && typeof override.announcement === "object") {
    next.announcement = { ...next.announcement, ...override.announcement };
  }
  if (Array.isArray(override.heroSlides) && override.heroSlides.length > 0) {
    next.heroSlides = override.heroSlides;
  }
  if (Array.isArray(override.valueStrip) && override.valueStrip.length > 0) {
    next.valueStrip = override.valueStrip;
  }
  if (override.story && typeof override.story === "object") {
    next.story = {
      fa: { ...next.story.fa, ...(override.story.fa || {}) },
      en: { ...next.story.en, ...(override.story.en || {}) },
    };
  }
  if (Array.isArray(override.products)) {
    next.products = override.products.map(normalizeProduct);
  }
  if (Array.isArray(override.bundles)) next.bundles = override.bundles;
  if (Array.isArray(override.socialGallery)) next.socialGallery = override.socialGallery;
  if (Array.isArray(override.servicesList)) next.servicesList = override.servicesList;
  if (Array.isArray(override.tieredPriceRows)) next.tieredPriceRows = override.tieredPriceRows;
  if (Array.isArray(override.servicesFaq)) next.servicesFaq = override.servicesFaq;
  if (override.pricing && typeof override.pricing === "object") {
    next.pricing = {
      printTypes: Array.isArray(override.pricing.printTypes)
        ? override.pricing.printTypes
        : next.pricing.printTypes,
      paperStocks: Array.isArray(override.pricing.paperStocks)
        ? override.pricing.paperStocks
        : next.pricing.paperStocks,
      bindings: Array.isArray(override.pricing.bindings)
        ? override.pricing.bindings
        : next.pricing.bindings,
    };
  }
  if (Array.isArray(override.promoCodes)) next.promoCodes = override.promoCodes;
  if (override.shipping && typeof override.shipping === "object") {
    next.shipping = { ...next.shipping, ...override.shipping };
  }
  if (override.contact && typeof override.contact === "object") {
    next.contact = { ...next.contact, ...override.contact };
  }
  if (override.settings && typeof override.settings === "object") {
    next.settings = { ...next.settings, ...override.settings };
  }

  return next;
}

export async function compressImageFile(file, maxDim = 900, quality = 0.84) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Invalid image"));
    el.src = dataUrl;
  });

  const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FAF6EE";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(bin);
}

function collectDataUrls(node, out = new Set()) {
  if (typeof node === "string") {
    if (node.startsWith("data:image/")) out.add(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectDataUrls(item, out);
  } else if (node && typeof node === "object") {
    for (const val of Object.values(node)) collectDataUrls(val, out);
  }
  return out;
}

function replaceStrings(node, map) {
  if (typeof node === "string") return map.get(node) ?? node;
  if (Array.isArray(node)) return node.map((item) => replaceStrings(item, map));
  if (node && typeof node === "object") {
    const copy = {};
    for (const [k, v] of Object.entries(node)) {
      copy[k] = replaceStrings(v, map);
    }
    return copy;
  }
  return node;
}

async function githubRequest(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `GitHub API ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) msg = `${res.status}: ${data.message}`;
    } catch {
      // Ignore parse failure
    }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function getRepoFileSha(owner, repo, path, branch, token) {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
    const data = await githubRequest(url, token);
    return data.sha || null;
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function publishSiteContentToGitHub({
  token,
  owner,
  repo,
  branch = "main",
  content,
  onProgress,
}) {
  if (!token?.trim()) throw new Error("GitHub token is required");
  if (!owner?.trim() || !repo?.trim()) throw new Error("Repository owner and name are required");

  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const cleanBranch = (branch || "main").trim();
  const cleanToken = token.trim();

  const dataUrls = Array.from(collectDataUrls(content));
  const urlMap = new Map();
  let uploadedImages = 0;

  for (let i = 0; i < dataUrls.length; i++) {
    const dataUrl = dataUrls[i];
    onProgress?.({ stage: "image", current: i + 1, total: dataUrls.length });
    const base64Part = dataUrl.split(",")[1];
    if (!base64Part) continue;
    const digest = sha256Sync(base64Part).slice(0, 12);
    const repoPath = `public/images/cms/img-${digest}.jpg`;
    const publicPath = `./images/cms/img-${digest}.jpg`;

    const existingSha = await getRepoFileSha(cleanOwner, cleanRepo, repoPath, cleanBranch, cleanToken);
    if (!existingSha) {
      await githubRequest(
        `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${repoPath}`,
        cleanToken,
        {
          method: "PUT",
          body: JSON.stringify({
            message: `cms: upload image ${digest}`,
            content: base64Part,
            branch: cleanBranch,
          }),
        }
      );
      uploadedImages += 1;
    }
    urlMap.set(dataUrl, publicPath);
  }

  onProgress?.({ stage: "json", current: 1, total: 1 });
  const publishedContent = replaceStrings(
    { ...content, updatedAt: new Date().toISOString() },
    urlMap
  );
  const jsonText = JSON.stringify(publishedContent, null, 2);
  const jsonPath = "public/data/site-content.json";
  const sha = await getRepoFileSha(cleanOwner, cleanRepo, jsonPath, cleanBranch, cleanToken);

  const putPayload = {
    message: `cms: publish site updates (${new Date().toISOString().slice(0, 16)})`,
    content: utf8ToBase64(jsonText),
    branch: cleanBranch,
  };
  if (sha) putPayload.sha = sha;

  const result = await githubRequest(
    `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${jsonPath}`,
    cleanToken,
    {
      method: "PUT",
      body: JSON.stringify(putPayload),
    }
  );

  return {
    commitUrl: result?.commit?.html_url || `https://github.com/${cleanOwner}/${cleanRepo}/commits/${cleanBranch}`,
    uploadedImages,
    publishedContent,
  };
}
