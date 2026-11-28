import { useState, useEffect, useRef } from "react";
import {
  RotateCw,
  Move3d,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Moon,
} from "lucide-react";
import { formatNumber } from "../utils/pricing";

export const COVER_THEMES = [
  { id: "pine", bg: "#1B4636", text: "#F3E4BD", border: "#C8A258", spine: "#133327", labelFa: "سبز بوتیک", labelEn: "Botanical Pine" },
  { id: "ivory", bg: "#FAF6EE", text: "#14201A", border: "#C8B89A", spine: "#E6DEC9", labelFa: "عاجی کتان", labelEn: "Cotton Ivory" },
  { id: "crimson", bg: "#7E261C", text: "#F6E9D2", border: "#D7B26E", spine: "#5E1A12", labelFa: "زرشکی فلورانس", labelEn: "Florentine Crimson" },
  { id: "charcoal", bg: "#1C2320", text: "#EAE4D6", border: "#B89352", spine: "#111614", labelFa: "ذغالی آتلیه", labelEn: "Atelier Charcoal" },
  { id: "kraft", bg: "#B58D5D", text: "#1F1810", border: "#8A663D", spine: "#967145", labelFa: "کرافت طبیعی", labelEn: "Natural Kraft" },
];

const ISO = { x: 0.24, y: -0.5 };
const ZOOM0 = 3.35;
const clampZoom = (z) => Math.max(2.2, Math.min(5.2, z));
const clampPitch = (x) => Math.max(-1.35, Math.min(1.35, x));
const PRESETS = {
  iso: ISO,
  front: { x: 0, y: 0 },
  top: { x: 0.95, y: 0 },
  back: { x: 0.14, y: Math.PI },
};
const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Configurator preview of a CUSTOM print job (services page). Store products use ProductMedia.
export default function Live3DPreview({
  lang = "fa",
  config = { printType: "color", size: "A4", paperStock: "cotton240", binding: "hardcover", pages: 120 },
  customTitle = "",
  coverTheme = "pine",
  uploadedPreviewUrl = null,
  t,
}) {
  const fa = lang === "fa";
  const reduce = prefersReducedMotion();
  const mountRef = useRef(null);
  const stageRef = useRef(null);
  const threeRef = useRef(null); // { THREE, renderer, scene, group, lights, buildPrintJob3DScene }
  const targetRotRef = useRef({ ...ISO });
  const targetZoomRef = useRef(ZOOM0);
  const autoSpinRef = useRef(false);
  const dragRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [view, setView] = useState("iso");
  const [studioLight, setStudioLight] = useState("day");
  const [webglError, setWebglError] = useState(false);

  const activeTheme = COVER_THEMES.find((c) => c.id === coverTheme) || COVER_THEMES[0];

  // The shared translation still ships an English default; Persian UI gets a Persian one.
  const tDefault = t?.calcLabels?.previewDefaultTitle;
  const defaultTitle = fa
    ? (/[؀-ۿ]/.test(tDefault || "") ? tDefault : "نسخه آتلیه")
    : tDefault || "Atelier Edition";
  const titleText = customTitle.trim() || defaultTitle;
  // Cover texture is redrawn on title change; wait for a typing pause.
  const [sceneTitle, setSceneTitle] = useState(titleText);
  useEffect(() => {
    const id = setTimeout(() => setSceneTitle(titleText), 200);
    return () => clearTimeout(id);
  }, [titleText]);

  useEffect(() => {
    autoSpinRef.current = autoSpin && !reduce;
  }, [autoSpin, reduce]);

  // Ctrl/Cmd + wheel (and trackpad pinch) zooms; a plain wheel scrolls the page.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      targetZoomRef.current = clampZoom(targetZoomRef.current + (e.deltaY > 0 ? 0.22 : -0.22));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // One renderer for the component's life; config changes only rebuild meshes (below).
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    let cancelled = false;
    let cleanup = () => {};

    // three.js is loaded on demand so the storefront bundle does not pay for it.
    Promise.all([
      import("three"),
      import("three/examples/jsm/environments/RoomEnvironment.js"),
      import("../utils/product3dBuilders"),
    ]).then(([THREE, { RoomEnvironment }, { buildPrintJob3DScene }]) => {
      if (cancelled) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setWebglError(true);
        return;
      }
      const canvas = renderer.domElement;
      canvas.style.display = "block";
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      container.appendChild(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
      camera.position.set(0, 0.08, targetZoomRef.current);

      const lights = {
        ambient: new THREE.AmbientLight(0xfffaf0, 0.9),
        key: new THREE.DirectionalLight(0xfff5e4, 1.55),
        rim: new THREE.DirectionalLight(0xcfe8dc, 0.85),
        fill: new THREE.DirectionalLight(0xffffff, 0.55),
      };
      lights.key.position.set(3.2, 4.5, 4.2);
      lights.rim.position.set(-4.0, 2.0, -3.5);
      lights.fill.position.set(0, -3, 2);
      scene.add(...Object.values(lights));

      const group = new THREE.Group();
      scene.add(group);

      const resize = () => {
        const w = container.clientWidth || 280;
        const h = container.clientHeight || 180;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(container);

      // Render only while on screen and the tab is visible.
      let onScreen = true;
      let raf = 0;
      const currentRot = { ...targetRotRef.current };
      const loop = () => {
        raf = 0;
        if (!onScreen || document.hidden) return;
        if (autoSpinRef.current) targetRotRef.current.y += 0.011;
        currentRot.x += (targetRotRef.current.x - currentRot.x) * 0.14;
        currentRot.y += (targetRotRef.current.y - currentRot.y) * 0.14;
        group.rotation.x = currentRot.x;
        group.rotation.y = currentRot.y;
        camera.position.z += (targetZoomRef.current - camera.position.z) * 0.14;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      const wake = () => {
        if (!raf) raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        wake();
      });
      io.observe(container);
      document.addEventListener("visibilitychange", wake);
      const onLost = (e) => {
        e.preventDefault();
        setWebglError(true);
      };
      canvas.addEventListener("webglcontextlost", onLost);

      threeRef.current = { THREE, renderer, group, lights, buildPrintJob3DScene };
      setReady(true);
      wake();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", wake);
        canvas.removeEventListener("webglcontextlost", onLost);
        threeRef.current = null;
        envTex.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      };
    }).catch(() => !cancelled && setWebglError(true));

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  // Rebuild the job's meshes/textures; dispose the previous set first.
  useEffect(() => {
    const three = threeRef.current;
    if (!ready || !three) return;
    let stale = false;
    const disposables = [];
    // Late async textures (uploaded cover) arriving after a rebuild are disposed at once.
    const track = (d) => {
      if (stale) d.dispose?.();
      else disposables.push(d);
      return d;
    };
    three.buildPrintJob3DScene({
      group: three.group,
      config,
      activeTheme,
      titleText: sceneTitle,
      uploadedPreviewUrl,
      trackGeo: track,
      trackMat: track,
      trackTex: track,
    });
    return () => {
      stale = true;
      three.group.clear();
      disposables.forEach((d) => d.dispose?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ready,
    config.printType,
    config.size,
    config.paperStock,
    config.binding,
    config.pages,
    activeTheme.id,
    sceneTitle,
    uploadedPreviewUrl,
  ]);

  // Studio light only retunes the existing lights.
  useEffect(() => {
    const three = threeRef.current;
    if (!ready || !three) return;
    const warm = studioLight === "warm";
    const { ambient, key, rim } = three.lights;
    ambient.color.setHex(warm ? 0xffe9c8 : 0xfffaf0);
    ambient.intensity = warm ? 0.75 : 0.9;
    key.color.setHex(warm ? 0xffdfb3 : 0xfff5e4);
    rim.color.setHex(warm ? 0xe7d19f : 0xcfe8dc);
    three.renderer.toneMappingExposure = warm ? 1.02 : 1.1;
  }, [ready, studioLight]);

  const stopAuto = () => {
    setAutoSpin(false);
    setView(null);
  };

  const handlePointerDown = (e) => {
    if (e.target.closest?.("button")) return;
    stopAuto();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    targetRotRef.current.y += dx * 0.012;
    targetRotRef.current.x = clampPitch(targetRotRef.current.x + dy * 0.01);
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const adjustZoom = (delta) => {
    targetZoomRef.current = clampZoom(targetZoomRef.current + delta);
  };

  const goTo = (key) => {
    setAutoSpin(false);
    setView(key);
    targetRotRef.current = { ...PRESETS[key] };
  };

  const resetView = () => {
    goTo("iso");
    targetZoomRef.current = ZOOM0;
  };

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    const step = 0.15;
    const r = targetRotRef.current;
    const actions = {
      ArrowLeft: () => (r.y -= step),
      ArrowRight: () => (r.y += step),
      ArrowUp: () => (r.x = clampPitch(r.x - step)),
      ArrowDown: () => (r.x = clampPitch(r.x + step)),
      "+": () => adjustZoom(-0.35),
      "=": () => adjustZoom(-0.35),
      "-": () => adjustZoom(0.35),
    };
    if (e.key === "Home") {
      e.preventDefault();
      resetView();
    } else if (actions[e.key]) {
      e.preventDefault();
      stopAuto();
      actions[e.key]();
    }
  };

  const headerBadge = `${config.size} · ${formatNumber(config.pages, lang)} ${fa ? "صفحه" : "pp"}`;
  const dragHint = t?.calcLabels?.previewDragHint || (fa ? "برای چرخش بکشید" : "Drag to rotate");
  const previewLabel = t?.calcLabels?.previewLabel || (fa ? "پیش‌نمایش سه‌بعدی" : "3D preview");

  // t.calcLabels.previewAngles has spine instead of top/back, so the presets are labelled here.
  const angleLabels = fa
    ? { iso: "سه‌بعدی", front: "روبه‌رو", top: "بالا", back: "پشت", spin: "۳۶۰°" }
    : { iso: "3D", front: "Front", top: "Top", back: "Back", spin: "360°" };

  const ctrlBtn =
    "inline-flex h-6 w-6 items-center justify-center rounded-[3px] bg-black/55 text-[#E7D19F] border border-white/15 hover:bg-black/80";

  return (
    <div className="rounded-[4px] border border-white/12 bg-black/30 p-3 space-y-2 select-none">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#E7D19F]">
        <span className="inline-flex items-center gap-1.5">
          <Move3d className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{previewLabel}</span>
        </span>
        <span className="shrink-0 whitespace-nowrap">{headerBadge}</span>
      </div>

      {/* WebGL 360° Canvas Stage */}
      <div
        ref={stageRef}
        dir="ltr"
        tabIndex={0}
        role="application"
        aria-label={`${previewLabel}. ${dragHint}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={`relative h-[172px] sm:h-[184px] overflow-hidden rounded-[4px] cursor-grab active:cursor-grabbing touch-none focus-visible:outline-2 focus-visible:outline-[#E7D19F] ${
          studioLight === "warm"
            ? "bg-[radial-gradient(circle_at_center,rgba(214,179,106,0.22)_0%,rgba(16,13,10,0.82)_92%)]"
            : "bg-[radial-gradient(circle_at_center,rgba(231,209,159,0.16)_0%,rgba(7,12,10,0.72)_92%)]"
        }`}
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
            aria-label={fa ? "بزرگ‌نمایی" : "Zoom in"}
            className={ctrlBtn}
          >
            <ZoomIn className="h-3 w-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); adjustZoom(0.35); }}
            aria-label={fa ? "کوچک‌نمایی" : "Zoom out"}
            className={ctrlBtn}
          >
            <ZoomOut className="h-3 w-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setStudioLight((s) => (s === "day" ? "warm" : "day"));
            }}
            aria-label={fa ? "نور گرم گالری" : "Warm gallery light"}
            aria-pressed={studioLight === "warm"}
            title={studioLight === "day" ? (fa ? "نور روز" : "Daylight") : (fa ? "نور گرم گالری" : "Warm gallery light")}
            className={ctrlBtn}
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
            aria-label={fa ? "نمای اولیه" : "Reset view"}
            className={ctrlBtn}
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        <span className="pointer-events-none absolute bottom-1.5 right-2 text-xs text-white/65">
          {dragHint}
        </span>
      </div>

      {/* Angle Presets & Auto-Spin Bar */}
      <div className={`grid ${reduce ? "grid-cols-4" : "grid-cols-5"} gap-1 text-xs`}>
        {Object.keys(PRESETS).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={view === key}
            onClick={() => goTo(key)}
            className="rounded-[3px] border border-white/15 bg-white/8 py-1.5 font-semibold text-[#FAF6EE] transition hover:bg-white/18 aria-pressed:border-[#E7D19F] aria-pressed:bg-[#E7D19F] aria-pressed:text-[#123126]"
          >
            {angleLabels[key]}
          </button>
        ))}

        {!reduce && (
          <button
            type="button"
            aria-pressed={autoSpin}
            aria-label={fa ? "چرخش خودکار" : "Auto-rotate"}
            onClick={() => {
              setView(null);
              setAutoSpin((s) => !s);
            }}
            className={`inline-flex items-center justify-center gap-1 rounded-[3px] border py-1.5 font-semibold transition ${
              autoSpin
                ? "border-[#E7D19F] bg-[#E7D19F] text-[#123126]"
                : "border-white/15 bg-white/8 text-[#FAF6EE] hover:bg-white/18"
            }`}
          >
            <RotateCw className={`h-3 w-3 ${autoSpin ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>{angleLabels.spin}</span>
          </button>
        )}
      </div>
    </div>
  );
}
