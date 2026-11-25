import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  RotateCw,
  Move3d,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Moon,
  PackageOpen,
} from "lucide-react";
import {
  COVER_THEMES,
  shiftHex,
  isLightHex,
  buildProduct3DScene,
  buildPrintJob3DScene,
} from "../utils/product3dBuilders";

export { COVER_THEMES };

export default function Live3DPreview({
  mode = "print",
  product = null,
  variantIdx = 0,
  lang = "fa",
  config = { printType: "color", size: "A4", paperStock: "cotton240", binding: "hardcover", pages: 120 },
  customTitle = "",
  coverTheme = "pine",
  customHex = null,
  uploadedPreviewUrl = null,
  t,
  compact = false,
}) {
  const mountRef = useRef(null);
  const stageRef = useRef(null);
  const targetRotRef = useRef({ x: 0.24, y: -0.5 });
  const targetZoomRef = useRef(mode === "product" ? 3.55 : 3.35);
  const autoSpinRef = useRef(false);
  const dragRef = useRef(null);
  const [autoSpin, setAutoSpin] = useState(false);
  const [studioLight, setStudioLight] = useState("day");
  const [interactiveOpen, setInteractiveOpen] = useState(false);
  const [webglError, setWebglError] = useState(false);

  const activeTheme = customHex
    ? {
        bg: customHex,
        text: isLightHex(customHex) ? "#14201A" : "#F5EFE3",
        border: "#C8A258",
        spine: shiftHex(customHex, -20),
      }
    : COVER_THEMES.find((c) => c.id === coverTheme) || COVER_THEMES[0];

  const titleText = customTitle.trim() || t?.calcLabels?.previewDefaultTitle || "ATELIER EDITION";
  const isProductMode = mode === "product" && product;
  const modelType = product?.modelType;
  const supportsInteractiveOpen =
    isProductMode && (modelType === "giftbox" || modelType === "fountain-pen");

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  // Reset interactive lid/cap toggle when switching products
  useEffect(() => {
    setInteractiveOpen(false);
    targetRotRef.current = { x: 0.24, y: -0.5 };
    targetZoomRef.current = isProductMode ? 3.55 : 3.35;
  }, [product?.id, isProductMode]);

  // Attach non-passive wheel zoom listener so page doesn't scroll while zooming 3D model
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.22 : -0.22;
      targetZoomRef.current = Math.max(2.2, Math.min(5.2, targetZoomRef.current + delta));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || 280;
    const height = container.clientHeight || (compact ? 240 : 180);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = studioLight === "warm" ? 1.02 : 1.1;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 30);
    camera.position.set(0, 0.08, targetZoomRef.current);

    // Studio Lighting Rig
    const isWarm = studioLight === "warm";
    const ambient = new THREE.AmbientLight(isWarm ? 0xffe9c8 : 0xfffaf0, isWarm ? 0.75 : 0.9);
    const keyLight = new THREE.DirectionalLight(isWarm ? 0xffdfb3 : 0xfff5e4, 1.55);
    keyLight.position.set(3.2, 4.5, 4.2);
    const rimLight = new THREE.DirectionalLight(isWarm ? 0xe7d19f : 0xcfe8dc, 0.85);
    rimLight.position.set(-4.0, 2.0, -3.5);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.55);
    fillLight.position.set(0, -3, 2);
    scene.add(ambient, keyLight, rimLight, fillLight);

    const group = new THREE.Group();
    scene.add(group);

    const disposables = [];
    const trackGeo = (g) => { disposables.push(g); return g; };
    const trackMat = (m) => { disposables.push(m); return m; };
    const trackTex = (tx) => { disposables.push(tx); return tx; };

    if (isProductMode) {
      buildProduct3DScene({
        group,
        product,
        variantIdx,
        lang,
        interactiveOpen,
        trackGeo,
        trackMat,
        trackTex,
      });
    } else {
      buildPrintJob3DScene({
        group,
        config,
        activeTheme,
        titleText,
        uploadedPreviewUrl,
        trackGeo,
        trackMat,
        trackTex,
      });
    }

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 280;
      const h = container.clientHeight || (compact ? 240 : 180);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let rafId;
    const currentRot = { x: targetRotRef.current.x, y: targetRotRef.current.y };
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (autoSpinRef.current) {
        targetRotRef.current.y += 0.011;
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
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, [
    isProductMode,
    product,
    variantIdx,
    lang,
    interactiveOpen,
    studioLight,
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
    compact,
  ]);

  const handlePointerDown = (e) => {
    if (e.target.closest?.("button")) return;
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
      -1.35,
      Math.min(1.35, targetRotRef.current.x + dy * 0.01)
    );
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const adjustZoom = (delta) => {
    targetZoomRef.current = Math.max(2.2, Math.min(5.2, targetZoomRef.current + delta));
  };

  const resetView = () => {
    setAutoSpin(false);
    targetRotRef.current = { x: 0.24, y: -0.5 };
    targetZoomRef.current = isProductMode ? 3.55 : 3.35;
  };

  const headerBadge = isProductMode
    ? product.specs3d?.[lang] || product.sku
    : `${config.size} · ${config.pages}P`;

  const angleLabels =
    lang === "fa"
      ? { iso: "سه‌بعدی", front: "روبرو", top: "بالا", back: "پشت", spin: "۳۶۰°" }
      : { iso: "3D", front: "Front", top: "Top", back: "Back", spin: "360°" };

  return (
    <div className="rounded-[4px] border border-white/12 bg-black/30 p-3 space-y-2 select-none">
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-[#E7D19F]">
        <span className="inline-flex items-center gap-1.5 font-latin-ui">
          <Move3d className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{t?.calcLabels?.previewLabel || "360° Interactive WebGL"}</span>
        </span>
        <span className="truncate max-w-[55%] text-end">{headerBadge}</span>
      </div>

      {/* WebGL 360° Canvas Stage */}
      <div
        ref={stageRef}
        dir="ltr"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative overflow-hidden rounded-[4px] cursor-grab active:cursor-grabbing ${
          studioLight === "warm"
            ? "bg-[radial-gradient(circle_at_center,rgba(214,179,106,0.22)_0%,rgba(16,13,10,0.82)_92%)]"
            : "bg-[radial-gradient(circle_at_center,rgba(231,209,159,0.16)_0%,rgba(7,12,10,0.72)_92%)]"
        } ${compact ? "h-[235px] sm:h-[255px]" : "h-[172px] sm:h-[184px]"}`}
      >
        {webglError ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-xs text-[#E7D19F]">
            {titleText}
          </div>
        ) : (
          <div ref={mountRef} className="h-full w-full" />
        )}

        {/* Top-Right Studio Controls: Zoom, Lighting, Reset */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); adjustZoom(-0.35); }}
            aria-label="Zoom in"
            className="inline-flex h-6 w-6 items-center justify-center rounded-[3px] bg-black/55 text-[#E7D19F] border border-white/15 hover:bg-black/80"
          >
            <ZoomIn className="h-3 w-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); adjustZoom(0.35); }}
            aria-label="Zoom out"
            className="inline-flex h-6 w-6 items-center justify-center rounded-[3px] bg-black/55 text-[#E7D19F] border border-white/15 hover:bg-black/80"
          >
            <ZoomOut className="h-3 w-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setStudioLight((s) => (s === "day" ? "warm" : "day"));
            }}
            aria-label={lang === "fa" ? "نور استودیو" : "Studio lighting"}
            title={studioLight === "day" ? "Daylight" : "Warm Gallery"}
            className="inline-flex h-6 w-6 items-center justify-center rounded-[3px] bg-black/55 text-[#E7D19F] border border-white/15 hover:bg-black/80"
          >
            {studioLight === "day" ? (
              <Sun className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Moon className="h-3 w-3" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); resetView(); }}
            aria-label={lang === "fa" ? "نمای اولیه" : "Reset view"}
            className="inline-flex h-6 w-6 items-center justify-center rounded-[3px] bg-black/55 text-[#E7D19F] border border-white/15 hover:bg-black/80"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        {/* Interactive Open/Close Lid or Pen Cap Button */}
        {supportsInteractiveOpen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setInteractiveOpen((o) => !o);
            }}
            className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-[3px] border border-[#E7D19F]/45 bg-[#123126]/90 px-2.5 py-1 text-[10px] font-bold text-[#F3E4BD] transition hover:bg-[#183E30]"
          >
            <PackageOpen className="h-3 w-3" aria-hidden="true" />
            <span>
              {modelType === "giftbox"
                ? interactiveOpen
                  ? lang === "fa" ? "بستن درب باکس" : "Close Lid"
                  : lang === "fa" ? "باز کردن درب باکس" : "Open Lid"
                : interactiveOpen
                ? lang === "fa" ? "جدا کردن درپوش" : "Uncap Pen"
                : lang === "fa" ? "نصب درپوش قلم" : "Post Cap"}
            </span>
          </button>
        )}

        <span className="pointer-events-none absolute bottom-1.5 right-2 text-[9px] text-white/65">
          {t?.calcLabels?.previewDragHint || "Drag 360°"}
        </span>
      </div>

      {/* 360° Angle Presets & Auto-Spin Bar */}
      <div className="grid grid-cols-5 gap-1 text-[10px]">
        {[
          { key: "iso", action: () => { setAutoSpin(false); targetRotRef.current = { x: 0.24, y: -0.5 }; } },
          { key: "front", action: () => { setAutoSpin(false); targetRotRef.current = { x: 0, y: 0 }; } },
          { key: "top", action: () => { setAutoSpin(false); targetRotRef.current = { x: 0.95, y: 0 }; } },
          { key: "back", action: () => { setAutoSpin(false); targetRotRef.current = { x: 0.14, y: Math.PI }; } },
        ].map((btn) => (
          <button
            key={btn.key}
            type="button"
            onClick={btn.action}
            className="rounded-[3px] border border-white/15 bg-white/8 py-1.5 font-semibold text-[#FAF6EE] transition hover:bg-white/18"
          >
            {angleLabels[btn.key]}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setAutoSpin((s) => !s)}
          className={`inline-flex items-center justify-center gap-1 rounded-[3px] border py-1.5 font-semibold transition ${
            autoSpin
              ? "border-[#E7D19F] bg-[#E7D19F] text-[#123126]"
              : "border-white/15 bg-white/8 text-[#FAF6EE] hover:bg-white/18"
          }`}
        >
          <RotateCw className={`h-3 w-3 ${autoSpin ? "animate-spin" : ""}`} aria-hidden="true" />
          <span>{angleLabels.spin}</span>
        </button>
      </div>
    </div>
  );
}
