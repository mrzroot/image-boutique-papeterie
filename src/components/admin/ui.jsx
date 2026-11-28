import { createContext, useContext, useRef, useState } from "react";
import { Upload, Plus, Trash2, ArrowUp, ArrowDown, ImageOff } from "lucide-react";
import { CATEGORIES, STUDIO_IMAGE_PRESETS } from "../../data/catalog";
import { compressImageFile } from "../../utils/cmsStore";
import { formatNumber } from "../../utils/pricing";

// { lang, s (strings), t (site translations), broken (Set of failed image srcs), markBroken, notify }
export const AdminCtx = createContext(null);
export const useAdmin = () => useContext(AdminCtx);

export const cls = {
  input:
    "w-full min-w-0 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--ink-main)] placeholder:text-[var(--ink-sub)]",
  selectSm:
    "min-w-0 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-page)] px-2 py-1.5 text-xs font-semibold text-[var(--ink-main)]",
  label: "mb-1 block text-xs font-semibold text-[var(--ink-sub)]",
  card: "rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5",
  sub: "rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-3",
  h2: "text-base font-bold text-[var(--ink-main)]",
  h3: "text-sm font-bold text-[var(--ink-main)]",
  hint: "text-xs leading-relaxed text-[var(--ink-sub)]",
  btn: "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-main)] hover:border-[var(--accent-gold)] disabled:opacity-40",
  btnPrimary:
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[3px] border border-[var(--accent-pine)] bg-[var(--accent-pine)] px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50",
  btnDanger:
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[3px] border border-[var(--accent-crimson)] bg-transparent px-3 py-1.5 text-xs font-semibold text-[var(--accent-crimson)] hover:bg-[var(--accent-crimson)] hover:text-white",
  icon: "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-[var(--border-subtle)] text-[var(--ink-sub)] hover:border-[var(--accent-gold)] hover:text-[var(--ink-main)] disabled:opacity-30",
  iconDanger:
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-[var(--border-subtle)] text-[var(--accent-crimson)] hover:border-[var(--accent-crimson)]",
};

export function move(arr, i, delta) {
  const next = [...arr];
  const j = i + delta;
  if (j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

// Category tile images are shared stock photos, not product-specific photos.
const PLACEHOLDER_IMAGES = new Set(CATEGORIES.map((c) => c.image));

export function photoIssue(product, broken) {
  const src = product.image?.trim();
  if (!src) return "missing";
  if (broken.has(src)) return "broken";
  if (PLACEHOLDER_IMAGES.has(src)) return "placeholder";
  return null;
}

export function Card({ id, title, actions, children, className = "" }) {
  return (
    <section id={id} className={`${cls.card} scroll-mt-36 space-y-4 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className={cls.h2}>{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const TONES = {
  neutral: "border-[var(--border-strong)] text-[var(--ink-sub)]",
  pine: "border-[var(--accent-pine)] text-[var(--accent-pine)]",
  gold: "border-[var(--accent-gold)] text-[var(--accent-gold-ink)]",
  crimson: "border-[var(--accent-crimson)] text-[var(--accent-crimson)]",
};

export function Tag({ tone = "neutral", children }) {
  return (
    <span className={`inline-flex items-center rounded-[3px] border px-1.5 py-px text-xs font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function JumpNav({ items, label }) {
  return (
    <nav aria-label={label} className="flex gap-1.5 overflow-x-auto pb-1">
      {items.map(([id, text]) => (
        <button
          key={id}
          type="button"
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="shrink-0 rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink-sub)] hover:border-[var(--accent-gold)] hover:text-[var(--ink-main)]"
        >
          {text}
        </button>
      ))}
    </nav>
  );
}

// Keeps the typed text while focused (so it can be cleared, retyped or hold a decimal);
// valid numbers are passed up as typed, clamped to min/max, and an empty field becomes min (or 0) on blur
export function NumberInput({ value, onChange, min, max, ...rest }) {
  const [raw, setRaw] = useState(null);
  const clamp = (n) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const commit = (n) => n !== value && onChange(n);
  return (
    <input
      type="number"
      dir="ltr"
      step="any"
      min={min}
      max={max}
      {...rest}
      value={raw ?? value ?? ""}
      onChange={(e) => {
        const text = e.target.value;
        setRaw(text);
        if (text.trim() !== "" && Number.isFinite(Number(text))) commit(clamp(Number(text)));
      }}
      onBlur={() => {
        if (raw === null) return;
        const n = Number(raw);
        commit(raw.trim() !== "" && Number.isFinite(n) ? clamp(n) : clamp(min ?? 0));
        setRaw(null);
      }}
    />
  );
}

export function TextField({ label, value, onChange, dir, type = "text", multiline = false, ...rest }) {
  const Tagname = multiline ? "textarea" : "input";
  return (
    <label className="block min-w-0">
      <span className={cls.label}>{label}</span>
      {type === "number" ? (
        <NumberInput value={value} onChange={onChange} className={cls.input} {...rest} />
      ) : (
        <Tagname
          type={multiline ? undefined : type}
          rows={multiline ? 3 : undefined}
          dir={dir}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cls.input}
          {...rest}
        />
      )}
    </label>
  );
}

// One language block of a bilingual object: fields = [[key, label, multiline?, required?]]
export function LocFields({ l, value = {}, fields, onChange }) {
  const { s } = useAdmin();
  return (
    <div className={`${cls.sub} space-y-2.5`}>
      <p className="text-xs font-bold text-[var(--ink-main)]">{l === "fa" ? s.persian : s.english}</p>
      {fields.map(([key, label, multiline, required]) => (
        <TextField
          key={key}
          label={label}
          dir={l === "fa" ? "rtl" : "ltr"}
          multiline={multiline}
          required={required}
          value={value[key]}
          onChange={(v) => onChange(key, v)}
        />
      ))}
    </div>
  );
}

export function ImgPreview({ src, className = "h-14 w-14" }) {
  const { s, broken, markBroken } = useAdmin();
  const ok = src && !broken.has(src);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[3px] border bg-[var(--bg-soft)] ${
        ok ? "border-[var(--border-subtle)]" : "border-dashed border-[var(--accent-crimson)]"
      } ${className}`}
      title={ok ? undefined : src ? s.imgBroken : s.imgMissing}
    >
      {ok ? (
        <img src={src} alt="" onError={() => markBroken(src)} className="h-full w-full object-cover" />
      ) : (
        <ImageOff className="h-4 w-4 text-[var(--accent-crimson)]" aria-label={src ? s.imgBroken : s.imgMissing} />
      )}
    </span>
  );
}

export function ImageField({ label, value, onChange, compact = false }) {
  const { s, broken } = useAdmin();
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isData = value?.startsWith("data:");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await compressImageFile(file, 900, 0.84));
    } catch {
      setError(s.uploadFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0 space-y-1.5">
      {label && <span className={cls.label}>{label}</span>}
      <div className="flex items-start gap-2.5">
        <ImgPreview src={value} className={compact ? "h-12 w-12" : "h-16 w-16"} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <input
            type="text"
            dir="ltr"
            aria-label={label || s.imagePath}
            value={isData ? s.uploadedImage : value || ""}
            readOnly={isData}
            onChange={(e) => onChange(e.target.value)}
            placeholder="./images/…"
            className={cls.input}
          />
          <div className="flex flex-wrap gap-1.5">
            <label className={`${cls.btn} cursor-pointer`}>
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{busy ? s.compressing : s.upload}</span>
              <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
            </label>
            <button type="button" onClick={() => setPicking((v) => !v)} aria-expanded={picking} className={cls.btn}>
              {s.presets}
            </button>
            {isData && (
              <button type="button" onClick={() => onChange("")} className={cls.btn}>
                {s.clear}
              </button>
            )}
          </div>
        </div>
      </div>
      {(error || (value && broken.has(value)) || !value) && (
        <p className="text-xs font-semibold text-[var(--accent-crimson)]">
          {error || (value ? s.imgBrokenHint : s.imgMissing)}
        </p>
      )}
      {picking && (
        <div className="grid max-h-44 grid-cols-5 gap-1.5 overflow-y-auto rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-page)] p-2 sm:grid-cols-8">
          {STUDIO_IMAGE_PRESETS.map((src) => (
            <button
              key={src}
              type="button"
              title={src}
              onClick={() => {
                onChange(src);
                setPicking(false);
              }}
              className={`aspect-square overflow-hidden rounded-[2px] border ${
                value === src ? "border-[var(--accent-crimson)]" : "border-[var(--border-subtle)] hover:border-[var(--accent-gold)]"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Ordered list of image paths (gallery, 360° spin frames) with add / upload / reorder / remove.
// onChange receives the next list or an updater fn(prevList) (used after async uploads).
export function ImageListField({ label, hint, value, onChange }) {
  const { s, lang, notify } = useAdmin();
  const [busy, setBusy] = useState(false);
  const list = Array.isArray(value) ? value : [];
  // Stable row keys that follow rows through reorder / remove (paths can repeat or be edited)
  const ids = useRef([]);
  const seq = useRef(0);
  while (ids.current.length < list.length) ids.current.push(seq.current++);
  ids.current.length = list.length;
  const apply = (nextIds, nextList) => {
    ids.current = nextIds;
    onChange(nextList);
  };

  const addFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    const added = [];
    for (const file of files) {
      try {
        added.push(await compressImageFile(file, 900, 0.84));
      } catch {
        // Counted below so the owner knows which share of the files was skipped
      }
    }
    setBusy(false);
    if (added.length) onChange((prev) => [...(Array.isArray(prev) ? prev : []), ...added]);
    const failed = files.length - added.length;
    if (failed) notify(s.uploadSomeFailed.replace("{n}", formatNumber(failed, lang)));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={cls.h3}>
          {label} <span className="tabular-nums text-[var(--ink-sub)]">({formatNumber(list.length, lang)})</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => apply([...ids.current, seq.current++], [...list, ""])} className={cls.btn}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{s.addPath}</span>
          </button>
          <label className={`${cls.btn} cursor-pointer`}>
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{busy ? s.compressing : s.uploadMany}</span>
            <input type="file" accept="image/*" multiple onChange={addFiles} className="sr-only" />
          </label>
        </div>
      </div>
      {hint && <p className={cls.hint}>{hint}</p>}
      {list.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-[var(--border-strong)] px-3 py-4 text-center text-xs text-[var(--ink-sub)]">
          {s.listEmpty}
        </p>
      ) : (
        <ol className="space-y-2">
          {list.map((src, i) => (
            <li key={ids.current[i]} className={`${cls.sub} flex items-start gap-2`}>
              <span className="tabular-nums w-5 shrink-0 pt-3 text-center text-xs text-[var(--ink-sub)]">{formatNumber(i + 1, lang)}</span>
              <div className="min-w-0 flex-1">
                <ImageField compact value={src} onChange={(v) => onChange(list.map((x, j) => (j === i ? v : x)))} />
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button type="button" disabled={i === 0} onClick={() => apply(move(ids.current, i, -1), move(list, i, -1))} className={cls.icon} aria-label={s.moveUp}>
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button type="button" disabled={i === list.length - 1} onClick={() => apply(move(ids.current, i, 1), move(list, i, 1))} className={cls.icon} aria-label={s.moveDown}>
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => apply(ids.current.filter((_, j) => j !== i), list.filter((_, j) => j !== i))} className={cls.iconDanger} aria-label={s.remove}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// Up / down / delete controls for a row in a content list
export function RowControls({ index, length, onMove, onDelete }) {
  const { s } = useAdmin();
  return (
    <div className="flex gap-1">
      {onMove && (
        <>
          <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className={cls.icon} aria-label={s.moveUp}>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button type="button" disabled={index === length - 1} onClick={() => onMove(1)} className={cls.icon} aria-label={s.moveDown}>
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className={cls.iconDanger} aria-label={s.delete}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
