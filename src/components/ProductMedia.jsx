import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Image as ImageIcon, Box, Rotate3d } from "lucide-react";
import { getMediaModes, getSpinImages, MEDIA_STRINGS } from "../utils/productMedia";

// three.js only loads when a 3D mode is opened. A failed chunk load falls back to the photo.
const load3D = (name) =>
  lazy(() =>
    import("./ProductMedia3D")
      .then((m) => ({ default: m[name] }))
      .catch(() => ({ default: ChunkFailed }))
  );
function ChunkFailed({ onFail }) {
  useEffect(() => onFail("load"), [onFail]);
  return null;
}
const PhotoStage3D = load3D("PhotoStage3D");
const ModelStage3D = load3D("ModelStage3D");

const segBtn =
  "inline-flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 transition focus-visible:outline-2 focus-visible:outline-[var(--accent-pine)]";

/**
 * Product media viewer: original photo (default), 3D presentation of that photo, and an accurate
 * 360° view only when real data exists (product.model3dUrl or >= 8 product.spinImages).
 */
export default function ProductMedia({ product, variantIdx = 0, lang = "fa", compact = false }) {
  const s = MEDIA_STRINGS[lang] || MEDIA_STRINGS.en;
  const modes = getMediaModes(product);
  const accurateMode = modes.find((m) => m === "model" || m === "spin");
  const [mode, setMode] = useState("photo");
  const [photoIdx, setPhotoIdx] = useState(0);
  const [failed, setFailed] = useState(null); // "webgl" | "load" | null
  const heightClass = compact ? "h-[280px] sm:h-[320px]" : "h-[340px] sm:h-[460px]";

  const photos = [product.variantImages?.[variantIdx] || product.image, ...(product.gallery || [])].filter(Boolean);
  const photo = photos[photoIdx] || photos[0];

  useEffect(() => {
    setMode("photo");
    setFailed(null);
  }, [product.id]);
  useEffect(() => setPhotoIdx(0), [product.id, variantIdx]);

  const tabs = [
    { id: "photo", label: s.photo, Icon: ImageIcon },
    modes.includes("presentation") && { id: "presentation", label: s.presentation, Icon: Box },
    accurateMode && { id: accurateMode, label: s.accurate, Icon: Rotate3d },
  ].filter(Boolean);

  const choose = (id) => {
    setMode(id);
    setFailed(null);
  };
  // Arrow keys move between segments (radio-group pattern); visual order follows dir.
  const onTabsKey = (e) => {
    const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const step = getComputedStyle(e.currentTarget).direction === "rtl" ? -dir : dir;
    const next = tabs[(tabs.findIndex((t) => t.id === mode) + step + tabs.length) % tabs.length];
    choose(next.id);
    e.currentTarget.querySelector(`[data-mode="${next.id}"]`)?.focus();
  };

  const showPhoto = mode === "photo" || failed;

  return (
    <div className="w-full space-y-2.5">
      <div
        role="radiogroup"
        aria-label={s.modes}
        onKeyDown={onTabsKey}
        className="inline-flex flex-wrap rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0.5 text-xs font-bold"
      >
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            data-mode={id}
            aria-checked={mode === id}
            tabIndex={mode === id ? 0 : -1}
            onClick={() => choose(id)}
            className={`${segBtn} ${
              mode === id
                ? "bg-[var(--accent-pine)] text-white"
                : "text-[var(--ink-sub)] hover:text-[var(--ink-main)]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {failed && mode !== "photo" && (
        <p role="status" className="text-xs text-[var(--ink-sub)]">
          {failed === "webgl" ? s.noWebgl : s.loadFail}
        </p>
      )}

      {showPhoto ? (
        <ZoomablePhoto key={photo} src={photo} alt={product[lang]?.title || product.fa?.title || ""} s={s} heightClass={heightClass} />
      ) : mode === "spin" ? (
        <SpinViewer images={getSpinImages(product)} s={s} heightClass={heightClass} />
      ) : (
        <Suspense
          fallback={
            <div className={`flex items-center justify-center rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-soft)] text-xs text-[var(--ink-sub)] ${heightClass}`}>
              {s.loading}
            </div>
          }
        >
          {mode === "presentation" ? (
            <PhotoStage3D src={photo} lang={lang} onFail={setFailed} heightClass={heightClass} />
          ) : (
            <ModelStage3D url={product.model3dUrl} lang={lang} onFail={setFailed} heightClass={heightClass} />
          )}
        </Suspense>
      )}

      {photos.length > 1 && (showPhoto || mode === "presentation") && (
        <div className="flex flex-wrap gap-1.5">
          {photos.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setPhotoIdx(i)}
              aria-label={s.photoN(i + 1)}
              aria-pressed={photoIdx === i}
              className={`h-12 w-12 overflow-hidden rounded-[3px] border bg-[var(--bg-surface)] ${
                photoIdx === i ? "border-[var(--accent-pine)]" : "border-[var(--border-subtle)] hover:border-[var(--accent-gold)]"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {!accurateMode && <p className="text-[11px] text-[var(--ink-sub)]">{s.noModel}</p>}
    </div>
  );
}

// Mode 1: the untouched photo, object-contain; click/tap toggles a 2x zoom that follows the pointer.
function ZoomablePhoto({ src, alt, s, heightClass }) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const track = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <button
      type="button"
      onClick={() => setZoomed((z) => !z)}
      onPointerDown={track}
      onPointerMove={(e) => zoomed && track(e)}
      aria-label={zoomed ? s.zoomOut : s.zoomIn}
      aria-pressed={zoomed}
      style={{ touchAction: zoomed ? "none" : "auto" }}
      className={`block w-full overflow-hidden rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] focus-visible:outline-2 focus-visible:outline-[var(--accent-pine)] ${
        zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
      } ${heightClass}`}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="h-full w-full object-contain transition-transform duration-200"
        style={{ transform: zoomed ? "scale(2)" : "none", transformOrigin: origin }}
      />
    </button>
  );
}

// Mode 3 (spin): drag or arrow keys scrub through real ordered photos.
function SpinViewer({ images, s, heightClass }) {
  const n = images.length;
  const [frame, setFrame] = useState(0);
  const drag = useRef(null);

  useEffect(() => {
    images.forEach((src) => {
      new Image().src = src;
    });
  }, [images]);

  const go = (f) => setFrame(((f % n) + n) % n);
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={s.spinHint}
      aria-valuemin={1}
      aria-valuemax={n}
      aria-valuenow={frame + 1}
      onKeyDown={(e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: 1, ArrowDown: -1 }[e.key];
        if (d) {
          e.preventDefault();
          go(frame + d);
        }
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        drag.current = { x: e.clientX, f: frame, px: Math.max(4, e.currentTarget.clientWidth / n) };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (d) go(d.f + Math.round((e.clientX - d.x) / d.px));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      className={`relative w-full overflow-hidden rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] cursor-grab active:cursor-grabbing touch-none select-none focus-visible:outline-2 focus-visible:outline-[var(--accent-pine)] ${heightClass}`}
    >
      <img src={images[frame]} alt="" draggable={false} className="h-full w-full object-contain" />
      <span className="pointer-events-none absolute bottom-2 end-2 text-[11px] text-[var(--ink-sub)]">{s.spinHint}</span>
    </div>
  );
}
