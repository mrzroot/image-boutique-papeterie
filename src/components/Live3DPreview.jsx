import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { RotateCw, Move3d, ZoomIn, ZoomOut } from "lucide-react";

export const COVER_THEMES = [
  { id: "pine", bg: "#1B4636", text: "#F3E4BD", border: "#C8A258", spine: "#133327", labelFa: "سبز بوتیک", labelEn: "Botanical Pine" },
  { id: "ivory", bg: "#FAF6EE", text: "#14201A", border: "#C8B89A", spine: "#E6DEC9", labelFa: "عاجی کتان", labelEn: "Cotton Ivory" },
  { id: "crimson", bg: "#7E261C", text: "#F6E9D2", border: "#D7B26E", spine: "#5E1A12", labelFa: "زرشکی فلورانس", labelEn: "Florentine Crimson" },
  { id: "charcoal", bg: "#1C2320", text: "#EAE4D6", border: "#B89352", spine: "#111614", labelFa: "ذغالی آتلیه", labelEn: "Atelier Charcoal" },
  { id: "kraft", bg: "#B58D5D", text: "#1F1810", border: "#8A663D", spine: "#967145", labelFa: "کرافت طبیعی", labelEn: "Natural Kraft" },
];

function createCoverTexture({ title, sizeLabel, bg, text, border, paperStock, isBack }) {
  const w = 512;
  const h = 724;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Procedural linen / paper grain speckles
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }
  ctx.fillStyle = "rgba(0,0,0,0.035)";
  for (let x = 0; x < w; x += 4) {
    ctx.fillRect(x, 0, 1, h);
  }
  if (paperStock === "kraft") {
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(60,35,10,0.08)" : "rgba(255,245,225,0.06)";
      ctx.fillRect((i * 73) % w, (i * 137) % h, 2, 2);
    }
  }

  // Double gold/accent frame
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
    // Centered debossed monogram crest on back cover
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
    ctx.fillText("FIRENZE · GENÈVE · TEHRAN", w / 2, h - 74);
    ctx.globalAlpha = 1;
  } else {
    ctx.globalAlpha = 0.78;
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`IMAGE BOUTIQUE  ·  ${sizeLabel}`, w / 2, 84);

    // Title wrapping cleanly onto up to 2 lines
    ctx.globalAlpha = 1;
    ctx.font = "bold 32px Vazirmatn, Inter, sans-serif";
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
    const startY = h / 2 - ((lines.length - 1) * 42) / 2;
    lines.slice(0, 3).forEach((line, idx) => {
      ctx.fillText(line, w / 2, startY + idx * 44);
    });

    // Gold divider line
    ctx.fillStyle = border;
    ctx.fillRect(w / 2 - 36, startY + lines.slice(0, 3).length * 44 + 14, 72, 2);

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

function createPaperEdgeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4eedf";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 3) {
    ctx.fillStyle = i % 6 === 0 ? "rgba(30,24,18,0.10)" : "rgba(255,255,255,0.45)";
    ctx.fillRect(i, 0, 1, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBumpTexture(paperStock) {
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
  return new THREE.CanvasTexture(canvas);
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

function createRoundedBoardGeo(w, h, depth, radius = 0.06) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + w - radius, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + radius);
  shape.lineTo(x + w, y + h - radius);
  shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  shape.lineTo(x + radius, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

function shiftHex(hex, amount) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function isLightHex(hex) {
  const clean = String(hex || "").replace("#", "");
  if (clean.length !== 6) return false;
  const num = parseInt(clean, 16);
  const r = num >> 16;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return 0.299 * r + 0.587 * g + 0.114 * b > 165;
}

export default function Live3DPreview({
  config = { printType: "color", size: "A4", paperStock: "cotton240", binding: "hardcover", pages: 120 },
  customTitle = "",
  coverTheme = "pine",
  customHex = null,
  uploadedPreviewUrl = null,
  t,
  compact = false,
}) {
  const mountRef = useRef(null);
  const targetRotRef = useRef({ x: 0.24, y: -0.52 });
  const targetZoomRef = useRef(3.35);
  const autoSpinRef = useRef(false);
  const dragRef = useRef(null);
  const [autoSpin, setAutoSpin] = useState(false);
  const [webglError, setWebglError] = useState(false);

  const activeTheme = customHex
    ? {
        bg: customHex,
        text: isLightHex(customHex) ? "#14201A" : "#F5EFE3",
        border: "#C8A258",
        spine: shiftHex(customHex, -20),
      }
    : COVER_THEMES.find((c) => c.id === coverTheme) || COVER_THEMES[0];

  const isSticker = config.printType === "sticker";
  const isPlot = config.printType === "plot";
  const isSpiral = !isSticker && !isPlot && config.binding === "spiral";
  const isHardcover = !isSticker && !isPlot && config.binding === "hardcover";
  const isGlossy = config.paperStock === "glossy135";
  const titleText = customTitle.trim() || t?.calcLabels?.previewDefaultTitle || "ATELIER EDITION";

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  // Build / rebuild Three.js scene cleanly when structural properties change
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || 280;
    const height = container.clientHeight || (compact ? 250 : 215);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 30);
    camera.position.set(0, 0.1, targetZoomRef.current);

    // Studio Lighting Rig
    const ambient = new THREE.AmbientLight(0xfffaf0, 1.35);
    const keyLight = new THREE.DirectionalLight(0xfff4df, 1.85);
    keyLight.position.set(3.2, 4.5, 4.2);
    const rimLight = new THREE.DirectionalLight(0xcfe8dc, 0.9);
    rimLight.position.set(-4.0, 2.0, -3.5);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(0, -3, 2);
    scene.add(ambient, keyLight, rimLight, fillLight);

    const group = new THREE.Group();
    scene.add(group);

    const disposables = [];
    const trackGeo = (g) => { disposables.push(g); return g; };
    const trackMat = (m) => { disposables.push(m); return m; };
    const trackTex = (tx) => { disposables.push(tx); return tx; };

    const bookW = config.size === "A3" ? 1.62 : config.size === "A5" ? 1.24 : 1.44;
    const bookH = config.size === "A3" ? 2.15 : config.size === "A5" ? 1.72 : 1.98;
    const rawPages = Math.max(10, Math.min(600, Number(config.pages) || 80));
    const blockDepth = isSticker || isPlot || config.binding === "none" ? 0.03 : 0.09 + (rawPages / 600) * 0.18;

    const bumpMap = trackTex(createBumpTexture(config.paperStock));
    const paperEdgeTex = trackTex(createPaperEdgeTexture());
    const frontTex = trackTex(
      isPlot
        ? createPlotTexture(config.size, titleText, activeTheme.bg, activeTheme.text)
        : createCoverTexture({
            title: titleText,
            sizeLabel: config.size,
            bg: activeTheme.bg,
            text: activeTheme.text,
            border: activeTheme.border,
            paperStock: config.paperStock,
            isBack: false,
          })
    );
    const backTex = trackTex(
      createCoverTexture({
        title: titleText,
        sizeLabel: config.size,
        bg: activeTheme.bg,
        text: activeTheme.text,
        border: activeTheme.border,
        paperStock: config.paperStock,
        isBack: true,
      })
    );

    const coverRough = isGlossy ? 0.18 : 0.72;
    const baseSideMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: activeTheme.bg,
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

    // Optional uploaded artwork overlay on Front Cover
    if (uploadedPreviewUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(uploadedPreviewUrl, (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        trackTex(loadedTex);
        frontPlaneMat.map = loadedTex;
        frontPlaneMat.needsUpdate = true;
      });
    }

    if (isSticker) {
      // Vinyl release liner sheet + 6 glossy raised die-cut decals
      const sheetGeo = trackGeo(createRoundedBoardGeo(bookW, bookH, 0.025, 0.05));
      const sheetMat = trackMat(
        new THREE.MeshStandardMaterial({ color: activeTheme.bg, roughness: 0.45 })
      );
      group.add(new THREE.Mesh(sheetGeo, sheetMat));

      const decalColors = ["#1B4636", "#BF3927", "#C8A258", "#2B6B53", "#D8CFC0", "#14201A"];
      const positions = [
        [-0.36, 0.48], [0.36, 0.48],
        [-0.36, 0.0], [0.36, 0.0],
        [-0.36, -0.48], [0.36, -0.48],
      ];
      positions.forEach(([px, py], i) => {
        const cyl = trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.025, 28));
        cyl.rotateX(Math.PI / 2);
        const decalMat = trackMat(
          new THREE.MeshStandardMaterial({
            color: decalColors[i % decalColors.length],
            roughness: 0.16,
            metalness: 0.12,
          })
        );
        const mesh = new THREE.Mesh(cyl, decalMat);
        mesh.position.set(px, py, 0.022);
        group.add(mesh);
      });
    } else if (isPlot) {
      // Architectural blueprint / wide poster sheet
      const sheetGeo = trackGeo(new THREE.BoxGeometry(bookW, bookH, 0.018));
      const sheetMesh = new THREE.Mesh(sheetGeo, [
        baseSideMat, baseSideMat, baseSideMat, baseSideMat, frontPlaneMat, backPlaneMat,
      ]);
      group.add(sheetMesh);
    } else {
      // Full 3D Book / Notebook / Portfolio Anatomy
      const coverThick = isHardcover ? 0.028 : 0.014;
      const overhang = isHardcover ? 0.06 : 0.015;
      const boardGeo = trackGeo(createRoundedBoardGeo(bookW, bookH, coverThick, 0.05));

      const frontBoard = new THREE.Mesh(boardGeo, baseSideMat);
      frontBoard.position.set(0, 0, blockDepth / 2 + coverThick / 2);
      group.add(frontBoard);

      // Front artwork face slightly in front of front cover bevel
      const faceGeo = trackGeo(new THREE.PlaneGeometry(bookW - 0.04, bookH - 0.04));
      const frontFace = new THREE.Mesh(faceGeo, frontPlaneMat);
      frontFace.position.set(0, 0, blockDepth / 2 + coverThick + 0.009);
      group.add(frontFace);

      const backBoard = new THREE.Mesh(boardGeo, baseSideMat);
      backBoard.position.set(0, 0, -blockDepth / 2 - coverThick / 2);
      group.add(backBoard);

      const backFace = new THREE.Mesh(faceGeo, backPlaneMat);
      backFace.rotation.y = Math.PI;
      backFace.position.set(0, 0, -blockDepth / 2 - coverThick - 0.009);
      group.add(backFace);

      // Inset Ivory Paper Block with multi-layer page edges
      const pageGeo = trackGeo(new THREE.BoxGeometry(bookW - overhang, bookH - overhang * 1.4, blockDepth));
      const pageMat = trackMat(
        new THREE.MeshStandardMaterial({ map: paperEdgeTex, roughness: 0.88 })
      );
      const pageBlock = new THREE.Mesh(pageGeo, pageMat);
      pageBlock.position.set(overhang * 0.25, 0, 0);
      group.add(pageBlock);

      if (isSpiral) {
        // Metallic Twin-Loop Spiral Rings along spine edge
        const ringGeo = trackGeo(new THREE.TorusGeometry(blockDepth * 0.72 + 0.028, 0.015, 10, 22));
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
      } else if (config.binding !== "none") {
        // Solid Curved/Fitted Spine connecting Front & Back boards
        const spineGeo = trackGeo(
          new THREE.BoxGeometry(coverThick * 1.15, bookH, blockDepth + coverThick * 2 + 0.014)
        );
        const spineMat = trackMat(
          new THREE.MeshStandardMaterial({
            color: activeTheme.spine,
            roughness: coverRough,
            bumpMap,
            bumpScale: 0.012,
          })
        );
        const spine = new THREE.Mesh(spineGeo, spineMat);
        spine.position.set(-bookW / 2 + coverThick * 0.3, 0, 0);
        group.add(spine);

        // Silk Bookmark Ribbon emerging from bottom
        const ribbonGeo = trackGeo(new THREE.BoxGeometry(0.055, 0.28, 0.008));
        const ribbonMat = trackMat(
          new THREE.MeshStandardMaterial({ color: activeTheme.border, roughness: 0.45 })
        );
        const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
        ribbon.position.set(-bookW * 0.14, -bookH / 2 - 0.09, 0);
        ribbon.rotation.z = -0.06;
        group.add(ribbon);

        // Woven Elastic Band on Hardcover
        if (isHardcover) {
          const bandGeo = trackGeo(
            new THREE.BoxGeometry(0.06, bookH + 0.018, blockDepth + coverThick * 2 + 0.028)
          );
          const bandMat = trackMat(
            new THREE.MeshStandardMaterial({ color: activeTheme.spine, roughness: 0.85 })
          );
          const band = new THREE.Mesh(bandGeo, bandMat);
          band.position.set(bookW * 0.36, 0, 0);
          group.add(band);
        }
      }
    }

    // Subtle soft shadow disc beneath object
    const shadowGeo = trackGeo(new THREE.CircleGeometry(1.15, 32));
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = trackMat(
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 })
    );
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.set(0, -bookH * 0.62, 0);
    group.add(shadow);

    // Handle Resize cleanly
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 280;
      const h = container.clientHeight || 215;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // 60fps Animation & Smooth Inertial Orbit Loop
    let rafId;
    const currentRot = { x: targetRotRef.current.x, y: targetRotRef.current.y };
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (autoSpinRef.current) {
        targetRotRef.current.y += 0.012;
      }
      currentRot.x += (targetRotRef.current.x - currentRot.x) * 0.14;
      currentRot.y += (targetRotRef.current.y - currentRot.y) * 0.14;
      group.rotation.x = currentRot.x;
      group.rotation.y = currentRot.y;
      camera.position.z += (targetZoomRef.current - camera.position.z) * 0.14;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
    };
  }, [
    config.printType,
    config.size,
    config.paperStock,
    config.binding,
    config.pages,
    activeTheme.bg,
    activeTheme.text,
    activeTheme.border,
    activeTheme.spine,
    titleText,
    uploadedPreviewUrl,
    isSticker,
    isPlot,
    isSpiral,
    isHardcover,
    isGlossy,
    compact,
  ]);

  const handlePointerDown = (e) => {
    setAutoSpin(false);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    targetRotRef.current.y += dx * 0.012;
    targetRotRef.current.x = Math.max(
      -1.15,
      Math.min(1.15, targetRotRef.current.x + dy * 0.01)
    );
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const adjustZoom = (delta) => {
    targetZoomRef.current = Math.max(2.35, Math.min(4.75, targetZoomRef.current + delta));
  };

  const angles = t?.calcLabels?.previewAngles || {
    iso: "3D",
    front: "Front",
    spine: "Back / Spine",
    spin: "360°",
  };

  return (
    <div className="rounded-2xl border border-white/12 bg-black/30 p-3.5 space-y-2.5 select-none">
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold tracking-wider text-[#E7D19F] font-latin-ui">
        <span className="inline-flex items-center gap-1.5">
          <Move3d className="h-3.5 w-3.5" />
          <span>{t?.calcLabels?.previewLabel || "360° Interactive WebGL"}</span>
        </span>
        <span>
          {config.size} · {config.pages}P
        </span>
      </div>

      {/* WebGL 360° Canvas Stage */}
      <div
        dir="ltr"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative overflow-hidden rounded-xl bg-[radial-gradient(circle_at_center,rgba(231,209,159,0.16)_0%,rgba(7,12,10,0.65)_90%)] cursor-grab active:cursor-grabbing ${
          compact ? "h-64" : "h-56"
        }`}
      >
        {webglError ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-xs text-[#E7D19F]">
            {titleText}
          </div>
        ) : (
          <div ref={mountRef} className="h-full w-full" />
        )}

        {/* Zoom Controls */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); adjustZoom(-0.35); }}
            aria-label="Zoom in"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-[#E7D19F] border border-white/15 hover:bg-black/80 cursor-pointer"
          >
            <ZoomIn className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); adjustZoom(0.35); }}
            aria-label="Zoom out"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-[#E7D19F] border border-white/15 hover:bg-black/80 cursor-pointer"
          >
            <ZoomOut className="h-3 w-3" />
          </button>
        </div>

        <span className="pointer-events-none absolute bottom-1.5 right-2 text-[9px] text-white/60 font-latin-ui">
          {t?.calcLabels?.previewDragHint || "Drag 360°"}
        </span>
      </div>

      {/* 360° Angle Preset & Auto-Spin Bar */}
      <div className="grid grid-cols-4 gap-1.5 text-[10px]">
        {[
          { key: "iso", action: () => { setAutoSpin(false); targetRotRef.current = { x: 0.24, y: -0.52 }; } },
          { key: "front", action: () => { setAutoSpin(false); targetRotRef.current = { x: 0, y: 0 }; } },
          { key: "spine", action: () => { setAutoSpin(false); targetRotRef.current = { x: 0.14, y: Math.PI * 0.85 }; } },
        ].map((btn) => (
          <button
            key={btn.key}
            type="button"
            onClick={btn.action}
            className="rounded-lg border border-white/15 bg-white/8 py-1.5 font-semibold text-[#FAF6EE] transition hover:bg-white/18 cursor-pointer"
          >
            {angles[btn.key]}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setAutoSpin((s) => !s)}
          className={`inline-flex items-center justify-center gap-1 rounded-lg border py-1.5 font-semibold transition cursor-pointer ${
            autoSpin
              ? "border-[#E7D19F] bg-[#E7D19F] text-[#123126]"
              : "border-white/15 bg-white/8 text-[#FAF6EE] hover:bg-white/18"
          }`}
        >
          <RotateCw className={`h-3 w-3 ${autoSpin ? "animate-spin" : ""}`} />
          <span>{angles.spin}</span>
        </button>
      </div>
    </div>
  );
}
