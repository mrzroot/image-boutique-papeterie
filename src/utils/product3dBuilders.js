import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

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
    // Fit (contain) the upload inside the cover face on the cover colour so it is never stretched.
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.height = 1024;
      canvas.width = Math.round((1024 * (bookW - 0.05)) / (bookH - 0.05));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const s = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      const fitted = trackTex(new THREE.CanvasTexture(canvas));
      fitted.colorSpace = THREE.SRGBColorSpace;
      frontPlaneMat.map = fitted;
      frontPlaneMat.needsUpdate = true;
    };
    img.src = uploadedPreviewUrl;
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
