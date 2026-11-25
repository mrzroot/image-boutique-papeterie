import { useState } from "react";
import { Phone, Mail, CheckCircle2, ArrowUpRight, LayoutDashboard } from "lucide-react";

export default function Footer({ t, lang, contact, onNavigate, onSelectCategory }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const phone = contact?.phone || "0935-383-4393";
  const emailAddr = contact?.email || "atelier@imageboutique.ir";
  const hours = lang === "fa" ? contact?.hoursFa || "شنبه تا پنج‌شنبه · ۱۰ الی ۲۱" : contact?.hoursEn || "Sat - Thu · 10:00 - 21:00";
  const cleanTel = `tel:${String(phone).replace(/[^0-9+]/g, "")}`;

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="border-t border-[var(--border-subtle)]">
      {/* Newsletter Strip */}
      <section
        className="px-4 py-10 sm:px-6 transition-colors"
        style={{ backgroundColor: "var(--bg-newsletter)" }}
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-start">
          <div className="max-w-lg space-y-1.5">
            <h3 className="text-xl font-bold text-[var(--ink-main)]">
              {t.newsletterTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--ink-sub)]">
              {t.newsletterDesc}
            </p>
          </div>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 rounded-[3px] bg-[var(--accent-pine)] px-5 py-3 text-xs font-semibold text-white">
              <CheckCircle2 className="h-4 w-4 text-[#9BD4B8]" aria-hidden="true" />
              <span>{t.newsletterSuccess}</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex w-full max-w-md items-center gap-2 rounded-[3px] border border-[var(--border-strong)] bg-[var(--bg-surface)] p-1.5"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                {t.newsletterPlaceholder}
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.newsletterPlaceholder}
                className="flex-1 bg-transparent px-3.5 py-2 text-xs sm:text-sm text-[var(--ink-main)] placeholder:text-[var(--ink-sub)]"
              />
              <button
                type="submit"
                className="rounded-[3px] bg-[var(--accent-pine)] px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
              >
                {t.newsletterBtn}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Main Botanical / Obsidian Footer */}
      <div
        className="text-[#E6ECE8] border-t border-[var(--accent-gold)]/25"
        style={{ backgroundColor: "var(--footer-bg)" }}
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-12">
          <div className="space-y-4 md:col-span-5">
            <div>
              <p className="brand-mark text-xl text-white">
                {t.brandEn}
              </p>
              <p className="font-editorial italic text-sm text-[#D6B36A]">
                La Boutique Papeterie
              </p>
            </div>
            <p className="max-w-md text-xs sm:text-sm leading-relaxed text-[#C7D6CD]">
              {t.footerAbout}
            </p>
          </div>

          <div className="space-y-3 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6B36A]">
              {t.footerCols.boutique}
            </h4>
            <ul className="space-y-2 text-xs text-[#DFEAE3]">
              {["notebooks", "papers", "pens", "stickers", "packaging"].map(
                (catId) => (
                  <li key={catId}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory(catId);
                        onNavigate("store", "catalog");
                      }}
                      className="hover:text-white transition"
                    >
                      {t.categoryNames[catId]}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="space-y-3 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6B36A]">
              {t.footerCols.services}
            </h4>
            <ul className="space-y-2 text-xs text-[#DFEAE3]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("services")}
                  className="inline-flex items-center gap-1 font-semibold text-[#F2B8A8] hover:text-white"
                >
                  <span>{t.nav.servicesPortal}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("services", "quote-calculator")}
                  className="hover:text-white"
                >
                  {t.calcTitle}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3 md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6B36A]">
              {t.footerCols.contact}
            </h4>
            <div className="space-y-2.5 text-xs text-[#DFEAE3]">
              <a
                href={cleanTel}
                className="flex items-center gap-2 hover:text-white font-latin-ui"
                dir="ltr"
              >
                <Phone className="h-3.5 w-3.5 text-[#D6B36A]" aria-hidden="true" />
                <span>{phone}</span>
              </a>
              <a
                href={`mailto:${emailAddr}`}
                className="flex items-center gap-2 hover:text-white font-latin-ui"
                dir="ltr"
              >
                <Mail className="h-3.5 w-3.5 text-[#D6B36A]" aria-hidden="true" />
                <span>{emailAddr}</span>
              </a>
              <p className="text-xs text-[#B8C8BE] pt-1">{hours}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-[#B8C8BE] sm:px-6">
            <span>
              © {lang === "fa" ? "۱۴۰۵" : "2026"} {t.brandMain} · La Boutique
              Papeterie
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate("admin")}
                className="inline-flex items-center gap-1.5 text-[#E7D19F] hover:text-white transition"
              >
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{lang === "fa" ? "پنل مدیریت سایت" : "Admin Dashboard"}</span>
              </button>
              <span className="font-latin-ui hidden sm:inline">
                FA / EN · Archival Paper & Print Atelier
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
