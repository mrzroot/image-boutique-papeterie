import { useState, useEffect, useRef } from "react";
import { RotateCw, Move3d } from "lucide-react";

export const COVER_THEMES = [
  { id: "pine", bg: "#1B4636", text: "#F3E4BD", border: "#C8A258", spine: "#133327", labelFa: "سبز بوتیک", labelEn: "Botanical Pine" },
  { id: "ivory", bg: "#FAF6EE", text: "#14201A", border: "#C8B89A", spine: "#E6DEC9", labelFa: "عاجی کتان", labelEn: "Cotton Ivory" },
  { id: "crimson", bg: "#7E261C", text: "#F6E9D2", border: "#D7B26E", spine: "#5E1A12", labelFa: "زرشکی فلورانس", labelEn: "Florentine Crimson" },
  { id: "charcoal", bg: "#1C2320", text: "#EAE4D6", border: "#B89352", spine: "#111614", labelFa: "ذغالی آتلیه", labelEn: "Atelier Charcoal" },
  { id: "kraft", bg: "#B58D5D", text: "#1F1810", border: "#8A663D", spine: "#967145", labelFa: "کرافت طبیعی", labelEn: "Natural Kraft" },
];

export default function Live3DPreview({
  config,
  customTitle,
  coverTheme,
  uploadedPreviewUrl,
  t,
}) {
  const [rot, setRot] = useState({ x: 8, y: -26 });
  const [autoSpin, setAutoSpin] = useState(false);
  const draggingRef = useRef(null);

  useEffect(() => {
    if (!autoSpin) return;
    let frame;
    let angle = -28;
    const tick = () => {
      angle = (angle + 0.55) % 360;
      const rad = (angle * Math.PI) / 180;
      setRot({ x: Math.round(Math.sin(rad) * 8 + 6), y: Math.round(Math.sin(rad * 0.5) * 42) });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoSpin]);

  const handlePointerDown = (e) => {
    setAutoSpin(false);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    draggingRef.current = { x: e.clientX, y: e.clientY, startX: rot.x, startY: rot.y };
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - draggingRef.current.x;
    const dy = e.clientY - draggingRef.current.y;
    setRot({
      x: Math.max(-32, Math.min(32, draggingRef.current.startX - dy * 0.35)),
      y: Math.max(-72, Math.min(72, draggingRef.current.startY + dx * 0.45)),
    });
  };

  const handlePointerUp = () => {
    draggingRef.current = null;
  };

  const isSticker = config.printType === "sticker";
  const isPlot = config.printType === "plot";
  const isSpiral = !isSticker && !isPlot && config.binding === "spiral";
  const isHardcover = !isSticker && !isPlot && config.binding === "hardcover";
  const isGlossy = config.paperStock === "glossy135";

  // Resolve cover colors dynamically from selected theme or paper stock
  const activeTheme =
    COVER_THEMES.find((c) => c.id === coverTheme) ||
    (config.paperStock === "kraft" ? COVER_THEMES[4] : isHardcover ? COVER_THEMES[0] : COVER_THEMES[1]);

  // Thickness scales realistically with pages (between 4px sheet and 24px thick book)
  const thickness =
    isSticker || isPlot || config.binding === "none"
      ? 4
      : Math.max(8, Math.min(24, Math.round(config.pages / 10) + (isHardcover ? 6 : 2)));
  const halfDepth = thickness / 2;

  const boxWidth = config.size === "A3" ? 136 : config.size === "A5" ? 112 : 124;
  const boxHeight = config.size === "A3" ? 178 : config.size === "A5" ? 156 : 170;
  const titleText = customTitle.trim() || t.calcLabels.previewDefaultTitle;

  return (
    <div className="rounded-2xl border border-white/12 bg-black/30 p-3.5 space-y-3 select-none">
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold tracking-wider text-[#E7D19F] font-latin-ui">
        <span className="inline-flex items-center gap-1.5">
          <Move3d className="h-3.5 w-3.5" />
          <span>{t.calcLabels.previewLabel}</span>
        </span>
        <span>
          {config.size} · {config.pages}P
        </span>
      </div>

      {/* Interactive Draggable 3D Viewport */}
      <div
        dir="ltr"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="perspective-3d relative flex h-52 cursor-grab active:cursor-grabbing items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_center,rgba(231,209,159,0.12)_0%,rgba(0,0,0,0.22)_85%)]"
      >
        <div
          className="preserve-3d relative transition-transform duration-150 ease-out"
          style={{
            width: `${boxWidth}px`,
            height: `${boxHeight}px`,
            transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          }}
        >
          {/* FRONT FACE */}
          <div
            className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-e-md border p-3 shadow-2xl"
            style={{
              backgroundColor: activeTheme.bg,
              color: activeTheme.text,
              borderColor: `${activeTheme.border}88`,
              transform: `translateZ(${halfDepth}px)`,
            }}
          >
            {isGlossy && (
              <div className="pointer-events-none absolute inset-0 paper-gloss-sheen" />
            )}

            {/* Uploaded Custom Artwork Overlay (if image file attached!) */}
            {uploadedPreviewUrl ? (
              <div className="relative z-10 flex h-full flex-col justify-between">
                <img
                  src={uploadedPreviewUrl}
                  alt="Uploaded Artwork"
                  className="h-full w-full rounded object-cover border border-white/25"
                />
                {customTitle.trim() && (
                  <span className="absolute inset-x-2 bottom-2 rounded bg-black/70 px-2 py-1 text-center text-[10px] font-bold text-[#F3E4BD] backdrop-blur-xs">
                    {titleText}
                  </span>
                )}
              </div>
            ) : isSticker ? (
              /* Die-Cut Sticker Sheet 3D View */
              <div className="relative z-10 flex h-full flex-col justify-between p-1">
                <div className="flex justify-between text-[7px] font-bold opacity-65 font-latin-ui">
                  <span>KISS-CUT SHEET</span>
                  <span>{config.size}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 my-auto py-1">
                  {["IB", "✦", "1931", "🌿", "ATELIER", "✿"].map((sym, idx) => (
                    <div
                      key={idx}
                      className="flex h-9 items-center justify-center rounded-full border-2 border-dashed border-current/35 bg-white/80 text-[9px] font-bold text-[#1B4636] shadow-xs"
                    >
                      {sym}
                    </div>
                  ))}
                </div>
                <p className="text-center text-[8px] font-semibold opacity-80 truncate">
                  {titleText}
                </p>
              </div>
            ) : isPlot ? (
              /* Architectural Blueprint / Art Poster 3D View */
              <div className="relative z-10 flex h-full flex-col justify-between border border-dashed border-current/40 p-2">
                <div className="flex justify-between text-[7px] font-bold opacity-75 font-latin-ui">
                  <span>PLOT · {config.size}</span>
                  <span>1:50</span>
                </div>
                <div className="my-auto grid grid-cols-3 gap-1 border border-current/25 p-2">
                  <div className="col-span-2 h-12 border border-current/35" />
                  <div className="h-12 border border-current/35 bg-current/10" />
                  <div className="col-span-3 h-5 border border-current/25" />
                </div>
                <p className="text-center text-[9px] font-bold truncate">
                  {titleText}
                </p>
              </div>
            ) : (
              /* Classic Book / Portfolio / Hardcover / Spiral Face */
              <div
                className="relative z-10 flex h-full flex-col justify-between p-2"
                style={{
                  border: `1px solid ${activeTheme.border}66`,
                }}
              >
                <div className="flex items-center justify-between gap-1 text-[7px] uppercase tracking-[0.14em] opacity-80 font-latin-ui whitespace-nowrap">
                  <span>IB · ATELIER</span>
                  <span>{config.size}</span>
                </div>

                <div className="my-auto text-center px-1">
                  <p className="text-[11px] font-bold leading-snug break-words">
                    {titleText}
                  </p>
                  <span className="mt-1 inline-block h-[1px] w-6 bg-current opacity-40" />
                </div>

                <p className="text-center font-editorial italic text-[8px] opacity-80 whitespace-nowrap">
                  La Boutique Papeterie
                </p>
              </div>
            )}

            {/* Spiral Twin-Loop Rings on Binding Edge */}
            {isSpiral && (
              <div className="pointer-events-none absolute inset-y-2 -left-1.5 z-20 flex flex-col justify-between">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <span
                    key={idx}
                    className="h-2 w-3.5 rounded-full border border-[#B89352] bg-gradient-to-b from-[#E5DEC9] to-[#7D7465] shadow-xs"
                  />
                ))}
              </div>
            )}
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 rounded-s-md border"
            style={{
              backgroundColor: activeTheme.bg,
              borderColor: `${activeTheme.border}66`,
              transform: `rotateY(180deg) translateZ(${halfDepth}px)`,
            }}
          />

          {/* LEFT SPINE FACE */}
          <div
            className="absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden border-y"
            style={{
              width: `${thickness}px`,
              backgroundColor: activeTheme.spine,
              borderColor: `${activeTheme.border}55`,
              transform: `translateX(${-halfDepth}px) rotateY(-90deg)`,
            }}
          >
            {thickness >= 12 && (
              <span
                className="text-[6px] font-bold tracking-widest uppercase whitespace-nowrap opacity-75 font-latin-ui"
                style={{
                  color: activeTheme.text,
                  writingMode: "vertical-rl",
                }}
              >
                IMAGE BOUTIQUE
              </span>
            )}
          </div>

          {/* RIGHT PAGE-STACK EDGE FACE */}
          <div
            className="page-edges-texture absolute inset-y-[2px] right-0 border-y border-black/15"
            style={{
              width: `${Math.max(2, thickness - 2)}px`,
              transform: `translateX(${halfDepth - 1}px) rotateY(90deg)`,
            }}
          />

          {/* BOTTOM PAGE EDGE */}
          <div
            className="page-edges-texture absolute inset-x-[2px] bottom-0"
            style={{
              height: `${Math.max(2, thickness - 2)}px`,
              transform: `translateY(${halfDepth - 1}px) rotateX(-90deg)`,
            }}
          />
        </div>

        <span className="pointer-events-none absolute bottom-1.5 right-2 text-[9px] text-white/55 font-latin-ui">
          {t.calcLabels.previewDragHint}
        </span>
      </div>

      {/* Angle Preset & Auto-Spin Bar */}
      <div className="grid grid-cols-4 gap-1.5 text-[10px]">
        {[
          { key: "iso", action: () => { setAutoSpin(false); setRot({ x: 8, y: -26 }); } },
          { key: "front", action: () => { setAutoSpin(false); setRot({ x: 0, y: 0 }); } },
          { key: "spine", action: () => { setAutoSpin(false); setRot({ x: 6, y: 54 }); } },
        ].map((btn) => (
          <button
            key={btn.key}
            type="button"
            onClick={btn.action}
            className="rounded-lg border border-white/15 bg-white/8 py-1.5 font-semibold text-[#FAF6EE] transition hover:bg-white/18 cursor-pointer"
          >
            {t.calcLabels.previewAngles[btn.key]}
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
          <span>{t.calcLabels.previewAngles.spin}</span>
        </button>
      </div>
    </div>
  );
}
