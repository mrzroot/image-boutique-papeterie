import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export const COVER_THEMES = [
  { id: "pine", bg: "#1B4636", text: "#F3E4BD", border: "#C8A258", spine: "#133327", labelFa: "سبز بوتیک", labelEn: "Botanical Pine" },
  { id: "ivory", bg: "#FAF6EE", text: "#14201A", border: "#C8B89A", spine: "#E6DEC9", labelFa: "عاجی کتان", labelEn: "Cotton Ivory" },
  { id: "crimson", bg: "#7E261C", text: "#F6E9D2", border: "#D7B26E", spine: "#5E1A12", labelFa: "زرشکی فلورانس", labelEn: "Florentine Crimson" },
  { id: "charcoal", bg: "#1C2320", text: "#EAE4D6", border: "#B89352", spine: "#111614", labelFa: "ذغالی آتلیه", labelEn: "Atelier Charcoal" },
  { id: "kraft", bg: "#B58D5D", text: "#1F1810", border: "#8A663D", spine: "#967145", labelFa: "کرافت طبیعی", labelEn: "Natural Kraft" },
];

export function shiftHex(hex, amount) {
  const clean = String(hex || "").replace("#", "");
  if (clean.length !== 6) return "#1B4636";
  const num = parseInt(clean, 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function isLightHex(hex) {
  const clean = String(hex || "").replace("#", "");
  if (clean.length !== 6) return false;
  const num = parseInt(clean, 16);
  const r = num >> 16;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return 0.299 * r + 0.587 * g + 0.114 * b > 165;
}

export function createBumpTexture(paperStock = "cotton240") {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 128, 128);
  const step = paperStock === "glossy135" ? 16 : 3;
  for (let y = 0; y < 128; y += step) {
    for (let x = 0; x < 128; x += step) {
      const shade = ((x * 13 + y * 29) % 40) + 108;
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createPaperEdgeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4eedf";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 3) {
    ctx.fillStyle = i % 6 === 0 ? "rgba(30,24,18,0.11)" : "rgba(255,255,255,0.45)";
    ctx.fillRect(i, 0, 1, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createCoverTexture({ title, sizeLabel, bg, text, border, paperStock, isBack }) {
  const w = 512;
  const h = 724;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.035)";
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
  ctx.fillStyle = "rgba(0,0,0,0.035)";
  for (let x = 0; x < w; x += 4) ctx.fillRect(x, 0, 1, h);

  if (paperStock === "kraft") {
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(60,35,10,0.08)" : "rgba(255,245,225,0.06)";
      ctx.fillRect((i * 73) % w, (i * 137) % h, 2, 2);
    }
  }

  ctx.strokeStyle = border;
  ctx.globalAlpha = 0.65;
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, w - 60, h - 60);
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, w - 80, h - 80);
  ctx.globalAlpha = 1;

  ctx.fillStyle = text;
  ctx.textAlign = "center";

  if (isBack) {
    ctx.save();
    ctx.translate(w / 2, h / 2 - 20);
    ctx.strokeStyle = border;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(22, 0);
    ctx.lineTo(0, 24);
    ctx.lineTo(-22, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.font = "bold 20px Georgia, serif";
    ctx.fillText("IB", 0, 7);
    ctx.restore();

    ctx.globalAlpha = 0.65;
    ctx.font = "600 13px sans-serif";
    ctx.fillText("FIRENZE · GENEVE · TEHRAN", w / 2, h - 74);
    ctx.globalAlpha = 1;
  } else {
    ctx.globalAlpha = 0.78;
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`IMAGE BOUTIQUE  ·  ${sizeLabel}`, w / 2, 84);

    ctx.globalAlpha = 1;
    ctx.font = "bold 30px Vazirmatn, Inter, sans-serif";
    const words = String(title || "ATELIER EDITION").split(" ");
    const lines = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > w - 120 && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    const startY = h / 2 - ((lines.length - 1) * 40) / 2;
    lines.slice(0, 3).forEach((line, idx) => {
      ctx.fillText(line, w / 2, startY + idx * 42);
    });

    ctx.fillStyle = border;
    ctx.fillRect(w / 2 - 36, startY + lines.slice(0, 3).length * 42 + 12, 72, 2);

    ctx.fillStyle = text;
    ctx.globalAlpha = 0.8;
    ctx.font = "italic 18px Georgia, serif";
    ctx.fillText("La Boutique Papeterie", w / 2, h - 68);
    ctx.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createPlotTexture(sizeLabel, title, bg, text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 724;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 724);
  ctx.strokeStyle = text;
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = 1;
  for (let i = 32; i < 512; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 24); ctx.lineTo(i, 700); ctx.stroke();
  }
  for (let j = 32; j < 724; j += 32) {
    ctx.beginPath(); ctx.moveTo(24, j); ctx.lineTo(488, j); ctx.stroke();
  }
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 80, 416, 460);
  ctx.strokeRect(86, 120, 220, 220);
  ctx.beginPath();
  ctx.arc(320, 340, 95, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = text;
  ctx.textAlign = "center";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText(`ARCHITECTURAL PLOT · ${sizeLabel}`, 256, 612);
  ctx.font = "bold 24px Vazirmatn, sans-serif";
  ctx.fillText(title || "ATELIER EDITION", 256, 652);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFlorentinePatternTexture(baseHex, variantIdx) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext("2d");

  const bgPalette = [
    ["#1B4636", "#E7D19F", "#F5EFE3"],
    ["#184254", "#E7D19F", "#FAF6EE"],
    ["#8A2E22", "#E7D19F", "#F6EAD7"],
  ];
  const [bg, gold, cream] = bgPalette[variantIdx % bgPalette.length] || [baseHex || "#1B4636", "#E7D19F", "#FAF6EE"];

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 680);

  // Subtle marble or botanical tile damask
  for (let y = 40; y < 650; y += 76) {
    for (let x = 40; x < 480; x += 76) {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = gold;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.quadraticCurveTo(16, -8, 0, 24);
      ctx.quadraticCurveTo(-16, -8, 0, -24);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.quadraticCurveTo(-8, 16, 24, 0);
      ctx.quadraticCurveTo(-8, -16, -24, 0);
      ctx.stroke();

      ctx.fillStyle = cream;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Border frame
  ctx.strokeStyle = gold;
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, 476, 644);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(28, 28, 456, 624);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createLetterSheetTexture(paperHex, titleText) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = paperHex || "#FAF5EB";
  ctx.fillRect(0, 0, 512, 680);

  // Deckled edge grain
  ctx.strokeStyle = "rgba(166,130,67,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, 460, 628);

  ctx.fillStyle = "#A68243";
  ctx.textAlign = "center";
  ctx.font = "bold 16px Georgia, serif";
  ctx.fillText("IMAGE BOUTIQUE · FIRENZE", 256, 80);

  ctx.fillStyle = "rgba(20,32,26,0.12)";
  for (let y = 140; y < 560; y += 36) {
    ctx.fillRect(64, y, 384, 1.5);
  }
  ctx.fillStyle = "#183E30";
  ctx.font = "italic 14px Georgia, serif";
  ctx.fillText(titleText || "Pure Cotton Correspondence", 256, 622);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createStickerSheetTexture(accentHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 660;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#F7F3EB";
  ctx.fillRect(0, 0, 512, 660);

  ctx.strokeStyle = "#C8A258";
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 476, 624);

  ctx.fillStyle = "#14201A";
  ctx.textAlign = "center";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("BOTANICAL ATELIER · KISS-CUT FOLIO", 256, 56);

  const palette = [accentHex || "#1F4E3D", "#AE3322", "#C8A258", "#5E7F6B", "#D98A6C", "#2A4A58"];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const cx = 104 + col * 152;
      const cy = 140 + row * 124;
      const fill = palette[(row * 3 + col) % palette.length];
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#C9BFAA";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.ellipse(0, -6, 15, 25, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(10, 6, 12, 20, 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createWashiWrapTexture(mainHex, foilHex = "#E7D19F") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = mainHex || "#1F4E3D";
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = foilHex;
  ctx.lineWidth = 2;
  for (let x = 16; x < 512; x += 32) {
    ctx.beginPath();
    ctx.arc(x, 64, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = foilHex;
    ctx.beginPath();
    ctx.arc(x, 64, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = foilHex;
  ctx.fillRect(0, 10, 512, 3);
  ctx.fillRect(0, 115, 512, 3);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function createLinocutPlateTexture(inkHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#D4C6AF";
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = inkHex || "#1F4E3D";
  ctx.fillRect(36, 36, 440, 440);

  // Carved light botanical relief lines
  ctx.strokeStyle = "#F3E4BD";
  ctx.lineWidth = 5;
  ctx.strokeRect(56, 56, 400, 400);
  ctx.beginPath();
  ctx.moveTo(256, 410);
  ctx.quadraticCurveTo(246, 250, 256, 100);
  ctx.stroke();

  for (let i = 0; i < 5; i++) {
    const y = 140 + i * 52;
    ctx.beginPath();
    ctx.ellipse(196, y, 42, 14, -0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(316, y, 42, 14, 0.45, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCottonPadTopTexture(paperHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = paperHex || "#FAF7F2";
  ctx.fillRect(0, 0, 512, 680);
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(180,165,140,0.08)" : "rgba(255,255,255,0.25)";
    ctx.fillRect((i * 83) % 512, (i * 149) % 680, 2, 2);
  }
  ctx.strokeStyle = "#183E30";
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 448, 616);
  ctx.fillStyle = "#14201A";
  ctx.textAlign = "center";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("300 GSM · 100% COTTON · COLD PRESS", 256, 300);
  ctx.fillStyle = "#A68243";
  ctx.font = "italic 16px Georgia, serif";
  ctx.fillText("Image Boutique Fine Art Pad", 256, 340);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function addShadowDisc(group, yPos, radius, trackGeo, trackMat) {
  const shadowGeo = trackGeo(new THREE.CircleGeometry(radius, 36));
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = trackMat(
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 })
  );
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.set(0, yPos, 0);
  group.add(shadow);
}

/**
 * Shared Book / Notebook / Planner Builder
 */
function buildNotebookModel({
  group,
  title,
  sizeLabel = "A5",
  bg = "#1B4636",
  text = "#F3E4BD",
  border = "#C8A258",
  spineHex = "#133327",
  pages = 180,
  binding = "hardcover",
  paperStock = "cotton240",
  dualRibbon = true,
  uploadedPreviewUrl = null,
  trackGeo,
  trackMat,
  trackTex,
}) {
  const isSpiral = binding === "spiral";
  const isHardcover = binding === "hardcover";
  const isGlossy = paperStock === "glossy135";

  const bookW = sizeLabel === "A3" ? 1.58 : sizeLabel === "A5" ? 1.24 : 1.42;
  const bookH = sizeLabel === "A3" ? 2.1 : sizeLabel === "A5" ? 1.72 : 1.94;
  const rawPages = Math.max(10, Math.min(600, Number(pages) || 120));
  const blockDepth = binding === "none" ? 0.035 : 0.1 + (rawPages / 600) * 0.18;

  const bumpMap = trackTex(createBumpTexture(paperStock));
  const paperEdgeTex = trackTex(createPaperEdgeTexture());
  const frontTex = trackTex(
    createCoverTexture({ title, sizeLabel, bg, text, border, paperStock, isBack: false })
  );
  const backTex = trackTex(
    createCoverTexture({ title, sizeLabel, bg, text, border, paperStock, isBack: true })
  );

  const coverRough = isGlossy ? 0.2 : 0.72;
  const baseSideMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: bg,
      roughness: coverRough,
      metalness: 0.06,
      bumpMap,
      bumpScale: isGlossy ? 0.002 : 0.012,
    })
  );
  const frontPlaneMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: frontTex,
      roughness: coverRough,
      metalness: 0.05,
      bumpMap,
      bumpScale: isGlossy ? 0.002 : 0.01,
    })
  );
  const backPlaneMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: backTex,
      roughness: coverRough,
      metalness: 0.05,
      bumpMap,
      bumpScale: 0.01,
    })
  );

  if (uploadedPreviewUrl) {
    const loader = new THREE.TextureLoader();
    loader.load(uploadedPreviewUrl, (loadedTex) => {
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      trackTex(loadedTex);
      frontPlaneMat.map = loadedTex;
      frontPlaneMat.needsUpdate = true;
    });
  }

  const coverThick = isHardcover ? 0.032 : 0.016;
  const overhang = isHardcover ? 0.06 : 0.016;
  const boardGeo = trackGeo(new RoundedBoxGeometry(bookW, bookH, coverThick, 3, 0.012));

  const frontBoard = new THREE.Mesh(boardGeo, baseSideMat);
  frontBoard.position.set(0, 0, blockDepth / 2 + coverThick / 2);
  group.add(frontBoard);

  const faceGeo = trackGeo(new THREE.PlaneGeometry(bookW - 0.05, bookH - 0.05));
  const frontFace = new THREE.Mesh(faceGeo, frontPlaneMat);
  frontFace.position.set(0, 0, blockDepth / 2 + coverThick + 0.002);
  group.add(frontFace);

  const backBoard = new THREE.Mesh(boardGeo, baseSideMat);
  backBoard.position.set(0, 0, -blockDepth / 2 - coverThick / 2);
  group.add(backBoard);

  const backFace = new THREE.Mesh(faceGeo, backPlaneMat);
  backFace.rotation.y = Math.PI;
  backFace.position.set(0, 0, -blockDepth / 2 - coverThick - 0.002);
  group.add(backFace);

  const pageGeo = trackGeo(
    new THREE.BoxGeometry(bookW - overhang, bookH - overhang * 1.4, blockDepth)
  );
  const pageMat = trackMat(new THREE.MeshStandardMaterial({ map: paperEdgeTex, roughness: 0.88 }));
  const pageBlock = new THREE.Mesh(pageGeo, pageMat);
  pageBlock.position.set(overhang * 0.25, 0, 0);
  group.add(pageBlock);

  if (isSpiral) {
    const ringGeo = trackGeo(new THREE.TorusGeometry(blockDepth * 0.72 + 0.028, 0.015, 10, 24));
    ringGeo.rotateY(Math.PI / 2);
    const ringMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xd6b36a, metalness: 0.88, roughness: 0.22 })
    );
    const count = 11;
    for (let i = 0; i < count; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      const py = -bookH * 0.42 + (i / (count - 1)) * (bookH * 0.84);
      ring.position.set(-bookW / 2 - 0.01, py, 0);
      group.add(ring);
    }
  } else if (binding !== "none") {
    const spineGeo = trackGeo(
      new RoundedBoxGeometry(coverThick * 1.35, bookH, blockDepth + coverThick * 2 + 0.008, 3, 0.012)
    );
    const spineMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: spineHex,
        roughness: coverRough,
        bumpMap,
        bumpScale: 0.012,
      })
    );
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.set(-bookW / 2 + coverThick * 0.35, 0, 0);
    group.add(spine);

    const ribbonMat = trackMat(
      new THREE.MeshStandardMaterial({ color: border, roughness: 0.42, metalness: 0.1 })
    );
    const ribbonGeo = trackGeo(new THREE.BoxGeometry(0.05, 0.28, 0.008));
    const ribbon1 = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon1.position.set(-bookW * 0.16, -bookH / 2 - 0.1, 0.015);
    ribbon1.rotation.z = -0.08;
    group.add(ribbon1);

    if (dualRibbon) {
      const ribbon2Mat = trackMat(
        new THREE.MeshStandardMaterial({ color: "#AE3322", roughness: 0.45 })
      );
      const ribbon2 = new THREE.Mesh(ribbonGeo, ribbon2Mat);
      ribbon2.position.set(-bookW * 0.04, -bookH / 2 - 0.08, -0.015);
      ribbon2.rotation.z = 0.05;
      group.add(ribbon2);
    }

    if (isHardcover) {
      const bandGeo = trackGeo(
        new THREE.BoxGeometry(0.055, bookH + 0.016, blockDepth + coverThick * 2 + 0.018)
      );
      const bandMat = trackMat(
        new THREE.MeshStandardMaterial({ color: spineHex, roughness: 0.84 })
      );
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.set(bookW * 0.36, 0, 0);
      group.add(band);
    }
  }

  addShadowDisc(group, -bookH * 0.6, 1.15, trackGeo, trackMat);
}

/**
 * 2. Gift Box + Grosgrain Ribbon + Brass Wax Seal Stamp + 3 Wax Sticks + Sealed Envelope
 */
function buildGiftBoxScene({ group, swatchHex, variantIdx, interactiveOpen, trackGeo, trackMat, trackTex }) {
  const isIvory = variantIdx === 1 || isLightHex(swatchHex);
  const boxColor = swatchHex || (isIvory ? "#E7DFCF" : "#1F4E3D");
  const ribbonColor = isIvory ? "#1F4E3D" : "#F1E8D5";
  const waxColor = isIvory ? "#C8A258" : "#9E251A";
  const bump = trackTex(createBumpTexture("cotton240"));

  const boxMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: boxColor,
      roughness: 0.72,
      metalness: 0.04,
      bumpMap: bump,
      bumpScale: 0.012,
    })
  );
  const innerMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#F6F0E4", roughness: 0.9 })
  );
  const ribbonMat = trackMat(
    new THREE.MeshStandardMaterial({ color: ribbonColor, roughness: 0.46, metalness: 0.05 })
  );
  const brassMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#D6B36A", metalness: 0.88, roughness: 0.24 })
  );
  const woodMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#5C3A21", roughness: 0.52 })
  );
  const waxMat = trackMat(
    new THREE.MeshStandardMaterial({ color: waxColor, roughness: 0.25, metalness: 0.06 })
  );

  // Box Lower Base (slightly recessed inside lid)
  const boxGroup = new THREE.Group();
  boxGroup.position.set(-0.34, -0.14, 0.08);
  group.add(boxGroup);

  const baseGeo = trackGeo(new RoundedBoxGeometry(1.16, 0.62, 1.16, 3, 0.02));
  const baseMesh = new THREE.Mesh(baseGeo, boxMat);
  boxGroup.add(baseMesh);

  // Pleated tissue paper inside top rim
  const tissueGeo = trackGeo(new RoundedBoxGeometry(1.06, 0.08, 1.06, 2, 0.01));
  const tissueMesh = new THREE.Mesh(tissueGeo, innerMat);
  tissueMesh.position.set(0, 0.3, 0);
  boxGroup.add(tissueMesh);

  // Side vertical ribbons on box base
  const sideRibGeoA = trackGeo(new THREE.BoxGeometry(0.14, 0.63, 1.185));
  const sideRibGeoB = trackGeo(new THREE.BoxGeometry(1.185, 0.63, 0.14));
  boxGroup.add(new THREE.Mesh(sideRibGeoA, ribbonMat));
  boxGroup.add(new THREE.Mesh(sideRibGeoB, ribbonMat));

  // Lid Pivot (back edge hinge so interactiveOpen lifts lid realistically)
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.26, -0.61);
  if (interactiveOpen) {
    lidPivot.rotation.x = -0.58;
    lidPivot.position.y = 0.36;
  }
  boxGroup.add(lidPivot);

  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0, 0.61);
  lidPivot.add(lidGroup);

  const lidGeo = trackGeo(new RoundedBoxGeometry(1.24, 0.22, 1.24, 3, 0.02));
  const lidMesh = new THREE.Mesh(lidGeo, boxMat);
  lidGroup.add(lidMesh);

  const lidRibA = trackGeo(new THREE.BoxGeometry(0.145, 0.235, 1.26));
  const lidRibB = trackGeo(new THREE.BoxGeometry(1.26, 0.235, 0.145));
  lidGroup.add(new THREE.Mesh(lidRibA, ribbonMat));
  lidGroup.add(new THREE.Mesh(lidRibB, ribbonMat));

  // Double-Loop Satin Bow on top of lid
  const bowGroup = new THREE.Group();
  bowGroup.position.set(0, 0.135, 0);
  lidGroup.add(bowGroup);

  const knotGeo = trackGeo(new RoundedBoxGeometry(0.14, 0.07, 0.14, 2, 0.02));
  bowGroup.add(new THREE.Mesh(knotGeo, ribbonMat));

  const loopGeo = trackGeo(new THREE.TorusGeometry(0.14, 0.036, 10, 22));
  [-1, 1].forEach((dir) => {
    const loop = new THREE.Mesh(loopGeo, ribbonMat);
    loop.position.set(dir * 0.16, 0.04, 0);
    loop.rotation.x = Math.PI / 2.4;
    loop.rotation.y = dir * 0.32;
    loop.scale.set(1.25, 0.65, 0.85);
    bowGroup.add(loop);
  });

  // Sealed Cotton Envelope leaning at front-right
  const envGroup = new THREE.Group();
  envGroup.position.set(0.68, -0.18, 0.25);
  envGroup.rotation.y = -0.35;
  envGroup.rotation.x = -0.18;
  group.add(envGroup);

  const envGeo = trackGeo(new RoundedBoxGeometry(0.84, 0.56, 0.03, 2, 0.008));
  envGroup.add(new THREE.Mesh(envGeo, innerMat));

  const flapGeo = trackGeo(new THREE.ConeGeometry(0.41, 0.28, 3));
  flapGeo.rotateY(Math.PI);
  flapGeo.scale(1.42, 1, 0.08);
  const flapMesh = new THREE.Mesh(flapGeo, innerMat);
  flapMesh.rotation.z = Math.PI;
  flapMesh.position.set(0, 0.14, 0.022);
  envGroup.add(flapMesh);

  // Glossy Wax Seal Medallion on envelope
  const sealGeo = trackGeo(new THREE.CylinderGeometry(0.095, 0.105, 0.024, 24));
  sealGeo.rotateX(Math.PI / 2);
  const sealMesh = new THREE.Mesh(sealGeo, waxMat);
  sealMesh.position.set(0, -0.01, 0.032);
  envGroup.add(sealMesh);

  // Turned Wood & Machined Brass Wax Stamp
  const stampGroup = new THREE.Group();
  stampGroup.position.set(0.58, -0.25, -0.34);
  group.add(stampGroup);

  const baseDiscGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 28));
  const baseDisc = new THREE.Mesh(baseDiscGeo, brassMat);
  baseDisc.position.y = 0.03;
  stampGroup.add(baseDisc);

  const collarGeo = trackGeo(new THREE.CylinderGeometry(0.055, 0.09, 0.09, 20));
  const collar = new THREE.Mesh(collarGeo, brassMat);
  collar.position.y = 0.1;
  stampGroup.add(collar);

  const handleGeo = trackGeo(new THREE.CylinderGeometry(0.085, 0.05, 0.34, 20));
  const handle = new THREE.Mesh(handleGeo, woodMat);
  handle.position.y = 0.31;
  stampGroup.add(handle);

  const knobGeo = trackGeo(new THREE.SphereGeometry(0.088, 20, 16));
  const knob = new THREE.Mesh(knobGeo, woodMat);
  knob.position.y = 0.48;
  stampGroup.add(knob);

  // 3 Wax Sticks resting neatly in foreground
  const stickGeo = trackGeo(new RoundedBoxGeometry(0.46, 0.065, 0.065, 2, 0.012));
  for (let i = 0; i < 3; i++) {
    const stick = new THREE.Mesh(stickGeo, waxMat);
    stick.position.set(0.42, -0.42 + i * 0.005, 0.52 + i * 0.095);
    stick.rotation.y = 0.18 - i * 0.06;
    group.add(stick);
  }

  addShadowDisc(group, -0.49, 1.48, trackGeo, trackMat);
}

/**
 * 3. Upright Boutique Carry Bag with Gussets & Woven Rope Handles
 */
function buildCarryBagScene({ group, swatchHex, variantIdx, trackGeo, trackMat, trackTex }) {
  const isIvory = variantIdx === 1 || isLightHex(swatchHex);
  const bagColor = swatchHex || (isIvory ? "#EFE6D5" : "#C5AC8B");
  const cordColor = isIvory ? "#A68243" : "#183E30";
  const bump = trackTex(createBumpTexture("kraft"));

  const bagMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: bagColor,
      roughness: 0.78,
      bumpMap: bump,
      bumpScale: 0.014,
    })
  );
  const creaseMat = trackMat(
    new THREE.MeshStandardMaterial({ color: shiftHex(bagColor, -22), roughness: 0.85 })
  );
  const brassMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#D6B36A", metalness: 0.86, roughness: 0.26 })
  );
  const cordMat = trackMat(
    new THREE.MeshStandardMaterial({ color: cordColor, roughness: 0.72 })
  );
  const tissueMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#FAF6EE", roughness: 0.9 })
  );

  // Main Bag Body
  const bodyGeo = trackGeo(new RoundedBoxGeometry(1.16, 1.44, 0.46, 2, 0.015));
  const body = new THREE.Mesh(bodyGeo, bagMat);
  body.position.set(0, -0.14, 0);
  group.add(body);

  // Recessed Side Gussets (left & right V-creases)
  const gussetGeo = trackGeo(new THREE.BoxGeometry(0.03, 1.38, 0.24));
  [-0.575, 0.575].forEach((gx) => {
    const gMesh = new THREE.Mesh(gussetGeo, creaseMat);
    gMesh.position.set(gx, -0.14, 0);
    group.add(gMesh);
  });

  // Top Reinforced Fold Lip
  const lipGeo = trackGeo(new RoundedBoxGeometry(1.19, 0.14, 0.49, 2, 0.01));
  const lip = new THREE.Mesh(lipGeo, creaseMat);
  lip.position.set(0, 0.54, 0);
  group.add(lip);

  // Pleated Tissue Paper Peeking Out Top
  for (let i = -2; i <= 2; i++) {
    const tGeo = trackGeo(new THREE.BoxGeometry(0.26, 0.36, 0.03));
    const tMesh = new THREE.Mesh(tGeo, tissueMat);
    tMesh.position.set(i * 0.16, 0.66 + (Math.abs(i) % 2) * 0.04, (i % 2) * 0.04);
    tMesh.rotation.z = i * 0.12;
    group.add(tMesh);
  }

  // Front Gold Foil Emblem Plaque
  const crestTex = trackTex(
    createCoverTexture({
      title: "IMAGE BOUTIQUE",
      sizeLabel: "250 GSM",
      bg: bagColor,
      text: isLightHex(bagColor) ? "#183E30" : "#FAF6EE",
      border: "#C8A258",
      paperStock: "kraft",
      isBack: false,
    })
  );
  const plaqueGeo = trackGeo(new THREE.PlaneGeometry(0.84, 0.96));
  const plaqueMat = trackMat(new THREE.MeshStandardMaterial({ map: crestTex, roughness: 0.65 }));
  const frontPlaque = new THREE.Mesh(plaqueGeo, plaqueMat);
  frontPlaque.position.set(0, -0.16, 0.233);
  group.add(frontPlaque);

  const backPlaque = new THREE.Mesh(plaqueGeo, plaqueMat);
  backPlaque.rotation.y = Math.PI;
  backPlaque.position.set(0, -0.16, -0.233);
  group.add(backPlaque);

  // 4 Eyelets + 2 Arched Rope Handles
  const eyeletGeo = trackGeo(new THREE.TorusGeometry(0.028, 0.009, 8, 16));
  [-0.22, 0.22].forEach((x) => {
    [-0.246, 0.246].forEach((z) => {
      const eye = new THREE.Mesh(eyeletGeo, brassMat);
      eye.position.set(x, 0.54, z);
      group.add(eye);
    });
  });

  [-0.24, 0.24].forEach((z) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.54, z),
      new THREE.Vector3(-0.2, 0.88, z * 1.05),
      new THREE.Vector3(0, 0.98, z * 1.08),
      new THREE.Vector3(0.2, 0.88, z * 1.05),
      new THREE.Vector3(0.22, 0.54, z),
    ]);
    const cordGeo = trackGeo(new THREE.TubeGeometry(curve, 24, 0.022, 8, false));
    group.add(new THREE.Mesh(cordGeo, cordMat));
  });

  addShadowDisc(group, -0.89, 1.05, trackGeo, trackMat);
}

/**
 * 4. Genuine 6-Sided Hexagonal Ballpoint Pen on Travertine Tray
 */
function buildHexPenScene({ group, swatchHex, trackGeo, trackMat }) {
  const bodyColor = swatchHex || "#1F4E3D";
  const bodyMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: bodyColor,
      metalness: 0.42,
      roughness: 0.34,
    })
  );
  const chromeMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#E8E8E6", metalness: 0.92, roughness: 0.16 })
  );
  const trayMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#DED6C6", roughness: 0.86 })
  );
  const grooveMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#C8BEA8", roughness: 0.9 })
  );

  // Travertine Presentation Tray
  const trayGeo = trackGeo(new RoundedBoxGeometry(2.15, 0.14, 0.82, 3, 0.03));
  const tray = new THREE.Mesh(trayGeo, trayMat);
  tray.position.set(0, -0.18, 0);
  group.add(tray);

  const recessGeo = trackGeo(new RoundedBoxGeometry(1.88, 0.03, 0.52, 2, 0.02));
  const recess = new THREE.Mesh(recessGeo, grooveMat);
  recess.position.set(0, -0.11, 0);
  group.add(recess);

  // Hexagonal Pen Assembly
  const pen = new THREE.Group();
  pen.position.set(0, -0.02, 0);
  pen.rotation.z = Math.PI / 2;
  pen.rotation.x = 0.06;
  pen.rotation.y = 0.12;
  group.add(pen);

  // 6-sided faceted barrel
  const barrelGeo = trackGeo(new THREE.CylinderGeometry(0.088, 0.088, 1.48, 6));
  pen.add(new THREE.Mesh(barrelGeo, bodyMat));

  // Tapered nose cone
  const coneGeo = trackGeo(new THREE.CylinderGeometry(0.086, 0.022, 0.28, 18));
  const cone = new THREE.Mesh(coneGeo, chromeMat);
  cone.position.y = -0.88;
  pen.add(cone);

  // Precision ballpoint tip
  const tipGeo = trackGeo(new THREE.CylinderGeometry(0.015, 0.005, 0.08, 12));
  const tip = new THREE.Mesh(tipGeo, chromeMat);
  tip.position.y = -1.04;
  pen.add(tip);

  // Knock clicker button at top
  const knockGeo = trackGeo(new THREE.CylinderGeometry(0.055, 0.062, 0.18, 16));
  const knock = new THREE.Mesh(knockGeo, chromeMat);
  knock.position.y = 0.81;
  pen.add(knock);

  // Spring clip aligned to a hex facet
  const clipGeo = trackGeo(new RoundedBoxGeometry(0.038, 0.56, 0.022, 2, 0.005));
  const clip = new THREE.Mesh(clipGeo, chromeMat);
  clip.position.set(0.095, 0.42, 0);
  pen.add(clip);

  addShadowDisc(group, -0.3, 1.35, trackGeo, trackMat);
}

/**
 * 5. Solid Brass / Pine Fountain Pen with Gold Nib + Glass Inkwell
 */
function buildFountainPenScene({ group, swatchHex, variantIdx, interactiveOpen, trackGeo, trackMat }) {
  const isPine = variantIdx === 1;
  const barrelColor = isPine ? swatchHex || "#1F4E3D" : "#B8965A";
  const barrelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: barrelColor,
      metalness: isPine ? 0.3 : 0.85,
      roughness: isPine ? 0.26 : 0.24,
    })
  );
  const goldMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#E7C46C", metalness: 0.92, roughness: 0.18 })
  );
  const darkMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#151917", roughness: 0.45 })
  );
  const glassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: "#D9ECE4",
      transparent: true,
      opacity: 0.55,
      roughness: 0.12,
      metalness: 0.15,
    })
  );

  // Pen resting diagonally
  const pen = new THREE.Group();
  pen.position.set(-0.18, -0.05, 0.15);
  pen.rotation.z = Math.PI / 2 - 0.18;
  pen.rotation.y = 0.22;
  group.add(pen);

  const barrelGeo = trackGeo(new THREE.CylinderGeometry(0.09, 0.074, 1.15, 24));
  pen.add(new THREE.Mesh(barrelGeo, barrelMat));

  const ringGeo = trackGeo(new THREE.CylinderGeometry(0.096, 0.096, 0.04, 24));
  const ring = new THREE.Mesh(ringGeo, goldMat);
  ring.position.y = -0.56;
  pen.add(ring);

  const gripGeo = trackGeo(new THREE.CylinderGeometry(0.072, 0.058, 0.26, 20));
  const grip = new THREE.Mesh(gripGeo, darkMat);
  grip.position.y = -0.7;
  pen.add(grip);

  // Sculpted Gold Nib
  const nibGeo = trackGeo(new THREE.ConeGeometry(0.052, 0.26, 6));
  nibGeo.scale(1, 1, 0.35);
  const nib = new THREE.Mesh(nibGeo, goldMat);
  nib.rotation.z = Math.PI;
  nib.position.y = -0.94;
  pen.add(nib);

  // Cap (toggled posted on back or resting beside via interactiveOpen)
  const capGroup = new THREE.Group();
  const capGeo = trackGeo(new THREE.CylinderGeometry(0.104, 0.102, 0.62, 24));
  capGroup.add(new THREE.Mesh(capGeo, barrelMat));
  const clipGeo = trackGeo(new RoundedBoxGeometry(0.032, 0.44, 0.025, 2, 0.005));
  const clip = new THREE.Mesh(clipGeo, goldMat);
  clip.position.set(0.108, -0.04, 0);
  capGroup.add(clip);

  if (interactiveOpen) {
    // Posted on tail
    capGroup.position.set(0, 0.72, 0);
    pen.add(capGroup);
  } else {
    // Resting neatly beside pen
    capGroup.position.set(-0.2, -0.22, 0.48);
    capGroup.rotation.z = Math.PI / 2;
    capGroup.rotation.y = -0.25;
    group.add(capGroup);
  }

  // Faceted Inkwell Bottle
  const inkwell = new THREE.Group();
  inkwell.position.set(0.68, -0.15, -0.28);
  group.add(inkwell);

  const inkCoreGeo = trackGeo(new THREE.CylinderGeometry(0.22, 0.26, 0.3, 8));
  const inkCore = new THREE.Mesh(inkCoreGeo, darkMat);
  inkCore.position.y = 0.02;
  inkwell.add(inkCore);

  const bottleGeo = trackGeo(new THREE.CylinderGeometry(0.27, 0.31, 0.42, 8));
  const bottle = new THREE.Mesh(bottleGeo, glassMat);
  bottle.position.y = 0.05;
  inkwell.add(bottle);

  const capWellGeo = trackGeo(new THREE.CylinderGeometry(0.17, 0.17, 0.16, 20));
  const capWell = new THREE.Mesh(capWellGeo, goldMat);
  capWell.position.y = 0.33;
  inkwell.add(capWell);

  addShadowDisc(group, -0.4, 1.35, trackGeo, trackMat);
}

/**
 * 6. Florentine Decorative Paper Set (5 Fanned Sheets + Rolled Scroll)
 */
function buildPaperSheetsScene({ group, swatchHex, variantIdx, trackGeo, trackMat, trackTex }) {
  const patTex = trackTex(createFlorentinePatternTexture(swatchHex, variantIdx));
  const sheetMat = trackMat(
    new THREE.MeshStandardMaterial({ map: patTex, roughness: 0.62, metalness: 0.12 })
  );
  const backMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#FAF5EB", roughness: 0.86 })
  );

  for (let i = 0; i < 5; i++) {
    const sGeo = trackGeo(new THREE.BoxGeometry(1.38, 1.78, 0.012));
    const mesh = new THREE.Mesh(sGeo, [
      backMat, backMat, backMat, backMat, sheetMat, backMat,
    ]);
    mesh.position.set(-0.22 + i * 0.06, 0.02 - i * 0.01, -0.09 + i * 0.045);
    mesh.rotation.z = 0.16 - i * 0.075;
    group.add(mesh);
  }

  // Rolled Scroll tied with gold cord
  const scrollGroup = new THREE.Group();
  scrollGroup.position.set(0.68, -0.05, 0.25);
  scrollGroup.rotation.z = -0.14;
  group.add(scrollGroup);

  const rollGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 1.65, 24, 1, true));
  const rollMat = trackMat(
    new THREE.MeshStandardMaterial({ map: patTex, side: THREE.DoubleSide, roughness: 0.58 })
  );
  scrollGroup.add(new THREE.Mesh(rollGeo, rollMat));

  const tieGeo = trackGeo(new THREE.TorusGeometry(0.146, 0.014, 8, 24));
  tieGeo.rotateX(Math.PI / 2);
  const tieMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#D6B36A", metalness: 0.8, roughness: 0.28 })
  );
  scrollGroup.add(new THREE.Mesh(tieGeo, tieMat));

  addShadowDisc(group, -1.02, 1.32, trackGeo, trackMat);
}

/**
 * 7. Cotton Deckle-Edge Letter Set (Paper Stack + Lined Open Envelope + Wax-Sealed Envelope)
 */
function buildLetterSetScene({ group, swatchHex, title, trackGeo, trackMat, trackTex }) {
  const paperHex = swatchHex || "#FAF5EB";
  const letterTex = trackTex(createLetterSheetTexture(paperHex, title));
  const paperMat = trackMat(new THREE.MeshStandardMaterial({ color: paperHex, roughness: 0.88 }));
  const topLetterMat = trackMat(new THREE.MeshStandardMaterial({ map: letterTex, roughness: 0.82 }));
  const linerMat = trackMat(new THREE.MeshStandardMaterial({ color: "#1B4636", roughness: 0.7 }));
  const waxMat = trackMat(new THREE.MeshStandardMaterial({ color: "#9E251A", roughness: 0.25 }));

  // Stack of 20 sheets
  const stackGeo = trackGeo(new RoundedBoxGeometry(1.24, 1.66, 0.16, 2, 0.01));
  const stack = new THREE.Mesh(stackGeo, paperMat);
  stack.position.set(-0.26, 0.04, -0.14);
  stack.rotation.z = 0.08;
  group.add(stack);

  const topSheet = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.18, 1.6)), topLetterMat);
  topSheet.position.set(-0.26, 0.04, -0.056);
  topSheet.rotation.z = 0.08;
  group.add(topSheet);

  // Foreground Sealed Envelope
  const envGroup = new THREE.Group();
  envGroup.position.set(0.36, -0.26, 0.24);
  envGroup.rotation.z = -0.1;
  group.add(envGroup);

  envGroup.add(
    new THREE.Mesh(trackGeo(new RoundedBoxGeometry(1.18, 0.78, 0.04, 2, 0.01)), paperMat)
  );
  const flapGeo = trackGeo(new THREE.ConeGeometry(0.56, 0.36, 3));
  flapGeo.rotateY(Math.PI);
  flapGeo.scale(1.48, 1, 0.06);
  const flap = new THREE.Mesh(flapGeo, linerMat);
  flap.rotation.z = Math.PI;
  flap.position.set(0, 0.2, 0.025);
  envGroup.add(flap);

  const sealGeo = trackGeo(new THREE.CylinderGeometry(0.09, 0.1, 0.024, 24));
  sealGeo.rotateX(Math.PI / 2);
  const seal = new THREE.Mesh(sealGeo, waxMat);
  seal.position.set(0, 0.02, 0.036);
  envGroup.add(seal);

  addShadowDisc(group, -0.92, 1.32, trackGeo, trackMat);
}

/**
 * 8. Botanical Sticker Folio (6 Fanned Sheets + Raised Kiss-Cut Decals)
 */
function buildStickersScene({ group, swatchHex, trackGeo, trackMat, trackTex }) {
  const sheetTex = trackTex(createStickerSheetTexture(swatchHex));
  const sheetMat = trackMat(new THREE.MeshStandardMaterial({ map: sheetTex, roughness: 0.55 }));
  const backMat = trackMat(new THREE.MeshStandardMaterial({ color: "#EFEAE0", roughness: 0.78 }));

  for (let i = 0; i < 6; i++) {
    const geo = trackGeo(new RoundedBoxGeometry(1.32, 1.68, 0.016, 2, 0.01));
    const mesh = new THREE.Mesh(geo, i === 5 ? sheetMat : backMat);
    mesh.position.set(-0.18 + i * 0.055, 0, -0.08 + i * 0.032);
    mesh.rotation.z = 0.16 - i * 0.05;
    if (i === 5) {
      const topFace = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.28, 1.64)), sheetMat);
      topFace.position.z = 0.01;
      mesh.add(topFace);
    }
    group.add(mesh);
  }

  addShadowDisc(group, -0.98, 1.25, trackGeo, trackMat);
}

/**
 * 9. Washi Tape Trio (3 Hollow Rolls + Peeled Ribbon Strip)
 */
function buildWashiTapeScene({ group, swatchHex, variantIdx, trackGeo, trackMat, trackTex }) {
  const colors =
    variantIdx === 1
      ? ["#D98A6C", "#E8DEC8", "#AE3322"]
      : [swatchHex || "#1F4E3D", "#C8A258", "#123126"];

  const coreMat = trackMat(new THREE.MeshStandardMaterial({ color: "#DFD3BE", roughness: 0.85 }));

  const createRoll = (hex, radius, height) => {
    const roll = new THREE.Group();
    const tex = trackTex(createWashiWrapTexture(hex, "#E7D19F"));
    const outerMat = trackMat(
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.16 })
    );
    const outerGeo = trackGeo(new THREE.CylinderGeometry(radius, radius, height, 32, 1, true));
    roll.add(new THREE.Mesh(outerGeo, outerMat));

    const innerGeo = trackGeo(
      new THREE.CylinderGeometry(radius * 0.66, radius * 0.66, height + 0.002, 28, 1, true)
    );
    roll.add(new THREE.Mesh(innerGeo, coreMat));

    const capGeo = trackGeo(new THREE.RingGeometry(radius * 0.66, radius, 32));
    const capMat = trackMat(
      new THREE.MeshStandardMaterial({ color: "#FAF6EE", side: THREE.DoubleSide, roughness: 0.78 })
    );
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.rotation.x = -Math.PI / 2;
    topCap.position.y = height / 2;
    roll.add(topCap);

    const botCap = new THREE.Mesh(capGeo, capMat);
    botCap.rotation.x = Math.PI / 2;
    botCap.position.y = -height / 2;
    roll.add(botCap);
    return roll;
  };

  const r1 = createRoll(colors[0], 0.44, 0.24);
  r1.position.set(-0.36, -0.32, 0.12);
  group.add(r1);

  const r2 = createRoll(colors[1], 0.44, 0.24);
  r2.position.set(0.38, -0.32, -0.12);
  group.add(r2);

  const r3 = createRoll(colors[2], 0.42, 0.24);
  r3.position.set(0.02, -0.08, 0.02);
  r3.rotation.y = 0.6;
  group.add(r3);

  // Unrolled tape tail from front roll
  const stripTex = trackTex(createWashiWrapTexture(colors[0], "#E7D19F"));
  const stripMat = trackMat(
    new THREE.MeshStandardMaterial({ map: stripTex, side: THREE.DoubleSide, roughness: 0.45 })
  );
  const strip = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.75, 0.22)), stripMat);
  strip.rotation.x = -Math.PI / 2;
  strip.position.set(-0.08, -0.43, 0.56);
  strip.rotation.z = -0.25;
  group.add(strip);

  addShadowDisc(group, -0.46, 1.25, trackGeo, trackMat);
}

/**
 * 10. Linocut & Relief Printmaking Kit (Carved Lino Block + Rubber Brayer + Gouges + Ink Tube)
 */
function buildLinocutKitScene({ group, swatchHex, trackGeo, trackMat, trackTex }) {
  const inkColor = swatchHex || "#1F4E3D";
  const plateTex = trackTex(createLinocutPlateTexture(inkColor));
  const woodMat = trackMat(new THREE.MeshStandardMaterial({ color: "#B88E5B", roughness: 0.62 }));
  const plateMat = trackMat(new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.72 }));
  const rubberMat = trackMat(new THREE.MeshStandardMaterial({ color: "#1C211F", roughness: 0.65 }));
  const steelMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#D7DCE0", metalness: 0.88, roughness: 0.22 })
  );
  const inkMat = trackMat(
    new THREE.MeshStandardMaterial({ color: inkColor, metalness: 0.25, roughness: 0.36 })
  );

  // Mounted Carved Linoleum Block
  const block = new THREE.Mesh(
    trackGeo(new RoundedBoxGeometry(1.16, 1.22, 0.14, 2, 0.01)),
    woodMat
  );
  block.position.set(-0.26, 0.06, -0.14);
  block.rotation.y = 0.12;
  group.add(block);

  const linoFace = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.08, 1.14)), plateMat);
  linoFace.position.z = 0.072;
  block.add(linoFace);

  // Rubber Brayer Roller
  const brayer = new THREE.Group();
  brayer.position.set(0.55, -0.14, 0.24);
  brayer.rotation.z = 0.3;
  group.add(brayer);

  const rollerGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.68, 24));
  rollerGeo.rotateZ(Math.PI / 2);
  brayer.add(new THREE.Mesh(rollerGeo, rubberMat));

  const yokeGeo = trackGeo(new RoundedBoxGeometry(0.76, 0.03, 0.03, 2, 0.005));
  const yoke = new THREE.Mesh(yokeGeo, steelMat);
  yoke.position.set(0, -0.18, 0);
  brayer.add(yoke);

  const brayerHandle = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.06, 0.045, 0.45, 16)),
    woodMat
  );
  brayerHandle.position.set(0, -0.42, 0);
  brayer.add(brayerHandle);

  // Archival Ink Tube
  const tube = new THREE.Group();
  tube.position.set(-0.5, -0.62, 0.32);
  tube.rotation.z = Math.PI / 2 - 0.15;
  group.add(tube);

  tube.add(new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.11, 0.08, 0.68, 18)), inkMat));
  const cap = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.045, 0.055, 0.12, 14)),
    rubberMat
  );
  cap.position.y = -0.39;
  tube.add(cap);

  // 2 Carving Gouges
  [-0.12, 0.16].forEach((oz, idx) => {
    const gouge = new THREE.Group();
    gouge.position.set(0.32, -0.68, oz);
    gouge.rotation.z = Math.PI / 2 + idx * 0.08;
    gouge.add(new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.045, 0.035, 0.48, 12)), woodMat));
    const blade = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.015, 0.008, 0.36, 10)),
      steelMat
    );
    blade.position.y = -0.4;
    gouge.add(blade);
    group.add(gouge);
  });

  addShadowDisc(group, -0.82, 1.38, trackGeo, trackMat);
}

/**
 * 11. 300gsm Cold-Press Cotton Printmaking Pad
 */
function buildCottonPadScene({ group, swatchHex, trackGeo, trackMat, trackTex }) {
  const padHex = swatchHex || "#FAF7F2";
  const topTex = trackTex(createCottonPadTopTexture(padHex));
  const edgeTex = trackTex(createPaperEdgeTexture());
  const blockMat = trackMat(new THREE.MeshStandardMaterial({ map: edgeTex, roughness: 0.9 }));
  const topMat = trackMat(new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.88 }));
  const spineMat = trackMat(new THREE.MeshStandardMaterial({ color: "#151917", roughness: 0.72 }));

  const padGeo = trackGeo(new THREE.BoxGeometry(1.38, 1.82, 0.24));
  const pad = new THREE.Mesh(padGeo, [
    blockMat, blockMat, blockMat, blockMat, topMat, blockMat,
  ]);
  group.add(pad);

  const tapeSpine = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.39, 0.16, 0.26)),
    spineMat
  );
  tapeSpine.position.y = 0.85;
  group.add(tapeSpine);

  addShadowDisc(group, -1.04, 1.15, trackGeo, trackMat);
}

/**
 * 12. 3D Photo Showcase Box (for Custom Uploaded Admin Products)
 */
function buildFramedShowcaseScene({ group, product, variantIdx, trackGeo, trackMat, trackTex }) {
  const frameMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#183E30", roughness: 0.42, metalness: 0.18 })
  );
  const goldMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#C8A258", metalness: 0.84, roughness: 0.26 })
  );
  const photoMat = trackMat(
    new THREE.MeshStandardMaterial({ color: "#FAF6EE", roughness: 0.55 })
  );

  const imgUrl = product.variantImages?.[variantIdx] || product.image;
  if (imgUrl) {
    const loader = new THREE.TextureLoader();
    loader.load(imgUrl, (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      trackTex(loaded);
      photoMat.map = loaded;
      photoMat.needsUpdate = true;
    });
  }

  const body = new THREE.Mesh(
    trackGeo(new RoundedBoxGeometry(1.52, 1.52, 0.24, 3, 0.02)),
    frameMat
  );
  group.add(body);

  const trim = new THREE.Mesh(
    trackGeo(new RoundedBoxGeometry(1.44, 1.44, 0.25, 2, 0.01)),
    goldMat
  );
  group.add(trim);

  const frontPhoto = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.34, 1.34)), photoMat);
  frontPhoto.position.z = 0.128;
  group.add(frontPhoto);

  const backPhoto = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.34, 1.34)), photoMat);
  backPhoto.rotation.y = Math.PI;
  backPhoto.position.z = -0.128;
  group.add(backPhoto);

  addShadowDisc(group, -0.94, 1.2, trackGeo, trackMat);
}

/**
 * Master dispatcher for any store product 360° preview
 */
export function buildProduct3DScene({
  group,
  product,
  variantIdx = 0,
  lang = "fa",
  interactiveOpen = false,
  trackGeo,
  trackMat,
  trackTex,
}) {
  const modelType = product?.modelType || "framed-box";
  const swatchHex = product?.swatches?.[variantIdx] || product?.swatches?.[0] || "#1B4636";
  const title = product?.[lang]?.title || product?.en?.title || "ATELIER EDITION";

  switch (modelType) {
    case "notebook": {
      const bg = swatchHex;
      const isLight = isLightHex(bg);
      buildNotebookModel({
        group,
        title,
        sizeLabel: "A5",
        bg,
        text: isLight ? "#14201A" : "#F3E4BD",
        border: "#C8A258",
        spineHex: shiftHex(bg, -20),
        pages: 180,
        binding: "hardcover",
        paperStock: "cotton240",
        dualRibbon: product?.id === "nb-linen-forest",
        trackGeo,
        trackMat,
        trackTex,
      });
      break;
    }
    case "giftbox":
      buildGiftBoxScene({ group, swatchHex, variantIdx, interactiveOpen, trackGeo, trackMat, trackTex });
      break;
    case "carrybag":
      buildCarryBagScene({ group, swatchHex, variantIdx, trackGeo, trackMat, trackTex });
      break;
    case "pen-hex":
      buildHexPenScene({ group, swatchHex, trackGeo, trackMat });
      break;
    case "fountain-pen":
      buildFountainPenScene({ group, swatchHex, variantIdx, interactiveOpen, trackGeo, trackMat });
      break;
    case "paper-sheets":
      buildPaperSheetsScene({ group, swatchHex, variantIdx, trackGeo, trackMat, trackTex });
      break;
    case "letter-set":
      buildLetterSetScene({ group, swatchHex, title, trackGeo, trackMat, trackTex });
      break;
    case "stickers":
      buildStickersScene({ group, swatchHex, trackGeo, trackMat, trackTex });
      break;
    case "washi-tape":
      buildWashiTapeScene({ group, swatchHex, variantIdx, trackGeo, trackMat, trackTex });
      break;
    case "linocut-kit":
      buildLinocutKitScene({ group, swatchHex, trackGeo, trackMat, trackTex });
      break;
    case "cotton-pad":
      buildCottonPadScene({ group, swatchHex, trackGeo, trackMat, trackTex });
      break;
    default:
      buildFramedShowcaseScene({ group, product, variantIdx, trackGeo, trackMat, trackTex });
      break;
  }
}

/**
 * Print Atelier 3D Job Builder (used in #/services)
 */
export function buildPrintJob3DScene({
  group,
  config,
  activeTheme,
  titleText,
  uploadedPreviewUrl,
  trackGeo,
  trackMat,
  trackTex,
}) {
  const isSticker = config.printType === "sticker";
  const isPlot = config.printType === "plot";
  const bookW = config.size === "A3" ? 1.62 : config.size === "A5" ? 1.24 : 1.44;
  const bookH = config.size === "A3" ? 2.15 : config.size === "A5" ? 1.72 : 1.98;

  if (isSticker) {
    const sheetGeo = trackGeo(new RoundedBoxGeometry(bookW, bookH, 0.03, 2, 0.01));
    const sheetMat = trackMat(new THREE.MeshStandardMaterial({ color: activeTheme.bg, roughness: 0.45 }));
    group.add(new THREE.Mesh(sheetGeo, sheetMat));
    const decalColors = ["#1B4636", "#BF3927", "#C8A258", "#2B6B53", "#D8CFC0", "#14201A"];
    const positions = [
      [-0.36, 0.48], [0.36, 0.48],
      [-0.36, 0.0], [0.36, 0.0],
      [-0.36, -0.48], [0.36, -0.48],
    ];
    positions.forEach(([px, py], i) => {
      const cyl = trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.028, 28));
      cyl.rotateX(Math.PI / 2);
      const decalMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: decalColors[i % decalColors.length],
          roughness: 0.16,
          metalness: 0.12,
        })
      );
      const mesh = new THREE.Mesh(cyl, decalMat);
      mesh.position.set(px, py, 0.025);
      group.add(mesh);
    });
    addShadowDisc(group, -bookH * 0.6, 1.15, trackGeo, trackMat);
  } else if (isPlot) {
    const plotTex = trackTex(createPlotTexture(config.size, titleText, activeTheme.bg, activeTheme.text));
    const sideMat = trackMat(new THREE.MeshStandardMaterial({ color: activeTheme.bg, roughness: 0.65 }));
    const frontMat = trackMat(new THREE.MeshStandardMaterial({ map: plotTex, roughness: 0.55 }));
    const backMat = trackMat(new THREE.MeshStandardMaterial({ color: "#FAF5EB", roughness: 0.85 }));
    const sheetGeo = trackGeo(new THREE.BoxGeometry(bookW, bookH, 0.018));
    group.add(new THREE.Mesh(sheetGeo, [sideMat, sideMat, sideMat, sideMat, frontMat, backMat]));
    addShadowDisc(group, -bookH * 0.6, 1.15, trackGeo, trackMat);
  } else {
    buildNotebookModel({
      group,
      title: titleText,
      sizeLabel: config.size,
      bg: activeTheme.bg,
      text: activeTheme.text,
      border: activeTheme.border,
      spineHex: activeTheme.spine,
      pages: config.pages,
      binding: config.binding,
      paperStock: config.paperStock,
      dualRibbon: false,
      uploadedPreviewUrl,
      trackGeo,
      trackMat,
      trackTex,
    });
  }
}
