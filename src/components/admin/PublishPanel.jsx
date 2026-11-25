import { useState } from "react";
import { UploadCloud, Download, Upload, RotateCcw, ExternalLink, CheckCircle2, AlertCircle, KeyRound, ShieldCheck } from "lucide-react";
import { hashPasscode, publishSiteContentToGitHub, mergeSiteContent, buildDefaultSiteContent } from "../../utils/cmsStore";
import { cls, useAdmin, Card, TextField } from "./ui";
import { downloadJson } from "./OrdersPanel";

// localStorage quota is ~5 MB per origin; uploaded photos live in the draft until published
const DRAFT_WARN_CHARS = 4_000_000;

export default function PublishPanel({ cmsContent, hasLocalDraft, ghConfig, setGhConfig, onPublished, onUpdateContent, onDiscardDraft }) {
  const { s, notify } = useAdmin();
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const draftChars = JSON.stringify(cmsContent).length;

  const handlePublish = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setError("");
    setResult(null);
    setProgress(s.preparing);
    try {
      const res = await publishSiteContentToGitHub({
        token: ghConfig.token,
        owner: ghConfig.owner,
        repo: ghConfig.repo,
        branch: ghConfig.branch || "main",
        content: cmsContent,
        onProgress: ({ stage, current, total }) =>
          setProgress(stage === "image" ? s.uploadingImage.replace("{n}", current).replace("{total}", total) : s.committing),
      });
      setResult(res);
      onPublished(res.publishedContent);
      notify(s.toastPublished);
    } catch (err) {
      setError(err?.message || s.publishFailed);
      notify(s.publishFailed);
    } finally {
      setPublishing(false);
      setProgress("");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!window.confirm(s.confirmImport)) return;
      onUpdateContent(mergeSiteContent(buildDefaultSiteContent(), parsed));
      notify(s.toastImported);
    } catch {
      notify(s.errInvalidJson);
    }
  };

  const handlePasscode = async () => {
    if (newPasscode.trim().length < 4) return notify(s.errPasscodeShort);
    const hash = await hashPasscode(newPasscode.trim());
    onUpdateContent((prev) => ({ ...prev, settings: { ...prev.settings, adminPasscodeHash: hash } }));
    setNewPasscode("");
    notify(s.toastPasscode);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-12">
      <form onSubmit={handlePublish} className={`${cls.card} space-y-4 lg:col-span-7`}>
        <div className="flex items-start gap-2.5">
          <UploadCloud className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-crimson)]" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className={cls.h2}>{s.publishTitle}</h2>
            <p className={cls.hint}>{s.publishDesc}</p>
          </div>
        </div>

        <p
          className={`rounded-[3px] border px-3 py-2 text-sm font-semibold ${
            hasLocalDraft ? "border-[var(--accent-gold)] text-[var(--accent-gold)]" : "border-[var(--accent-pine)] text-[var(--accent-pine)]"
          }`}
        >
          {hasLocalDraft ? s.draftPending : s.draftClean}
        </p>

        <div className={`${cls.sub} space-y-1 text-xs leading-relaxed text-[var(--ink-sub)]`}>
          <p className="font-bold text-[var(--ink-main)]">{s.tokenGuideTitle}</p>
          <p>{s.tokenGuide1}</p>
          <p>{s.tokenGuide2}</p>
          <p>{s.tokenGuide3}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <TextField label={s.ghOwner} dir="ltr" required value={ghConfig.owner} onChange={(v) => setGhConfig((c) => ({ ...c, owner: v }))} />
          <TextField label={s.ghRepo} dir="ltr" required value={ghConfig.repo} onChange={(v) => setGhConfig((c) => ({ ...c, repo: v }))} />
          <TextField label={s.ghBranch} dir="ltr" required value={ghConfig.branch} onChange={(v) => setGhConfig((c) => ({ ...c, branch: v }))} />
        </div>

        <div className="space-y-1.5">
          <TextField
            label={s.ghToken}
            type="password"
            dir="ltr"
            required
            autoComplete="off"
            placeholder="github_pat_…"
            value={ghConfig.token}
            onChange={(v) => setGhConfig((c) => ({ ...c, token: v }))}
          />
          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-[var(--ink-sub)]">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-pine)]" aria-hidden="true" />
            <span>{s.tokenSecurity}</span>
          </p>
        </div>

        {progress && (
          <p role="status" className="text-sm font-semibold text-[var(--accent-pine)]">
            {progress}
          </p>
        )}
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-[3px] border border-[var(--accent-crimson)] p-3 text-sm font-semibold text-[var(--accent-crimson)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">
              {s.publishFailed}: {error}
            </span>
          </div>
        )}
        {result && (
          <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-[3px] border border-[var(--accent-pine)] p-3 text-sm font-semibold text-[var(--accent-pine)]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{s.publishedOk.replace("{n}", result.uploadedImages)}</span>
            </span>
            <a href={result.commitUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
              <span>{s.viewCommit}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        )}

        <button type="submit" disabled={publishing} className="inline-flex w-full items-center justify-center gap-2 rounded-[3px] bg-[var(--accent-crimson)] px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
          <UploadCloud className="h-4 w-4" aria-hidden="true" />
          <span>{publishing ? s.publishing : s.publishNow}</span>
        </button>
      </form>

      <div className="space-y-4 lg:col-span-5">
        <Card title={s.backup}>
          <p className={`${cls.hint} tabular-nums`}>
            {s.draftSize.replace("{kb}", Math.round(draftChars / 1024))}
          </p>
          {draftChars > DRAFT_WARN_CHARS && <p className="text-xs font-semibold text-[var(--accent-crimson)]">{s.draftTooBig}</p>}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                downloadJson(cmsContent, `image-boutique-content-${new Date().toISOString().slice(0, 10)}.json`);
                notify(s.toastExported);
              }}
              className={cls.btn}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{s.exportJson}</span>
            </button>
            <label className={`${cls.btn} cursor-pointer`}>
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{s.importJson}</span>
              <input type="file" accept="application/json,.json" onChange={handleImport} className="sr-only" />
            </label>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm(s.confirmDiscard)) return;
                onDiscardDraft(false);
                notify(s.toastDiscarded);
              }}
              className={cls.btn}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{s.discardDraft}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm(s.confirmReset)) return;
                onDiscardDraft(true);
                notify(s.toastReset);
              }}
              className={cls.btnDanger}
            >
              {s.factoryReset}
            </button>
          </div>
        </Card>

        <Card title={s.changePasscode}>
          <p className={cls.hint}>{s.passcodeHint}</p>
          <div className="flex gap-2">
            <input
              type="password"
              dir="ltr"
              autoComplete="new-password"
              aria-label={s.newPasscode}
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder={s.newPasscode}
              className={cls.input}
            />
            <button type="button" onClick={handlePasscode} className={cls.btnPrimary}>
              <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{s.update}</span>
            </button>
          </div>
        </Card>
      </div>
    </section>
  );
}
