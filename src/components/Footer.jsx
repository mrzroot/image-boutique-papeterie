import { useState } from "react";
import { Phone, Mail, CheckCircle2, Sparkles } from "lucide-react";

export default function Footer({ t, lang, onNavigate, onSelectCategory }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="border-t border-[#E5DEC9]">
      {/* Newsletter Strip (Margaux-inspired light botanical tint) */}
      <section className="bg-[#EEF2EE] px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-start">
          <div className="max-w-lg space-y-1.5">
            <h3 className="text-xl font-bold text-[#16221C]">
              {t.newsletterTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#4C5850]">
              {t.newsletterDesc}
            </p>
          </div>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1F4E3D] px-5 py-3 text-xs font-semibold text-white">
              <CheckCircle2 className="h-4 w-4 text-[#9BD4B8]" />
              <span>{t.newsletterSuccess}</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex w-full max-w-md items-center gap-2 rounded-full border border-[#CFD9D2] bg-white p-1.5 shadow-2xs"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.newsletterPlaceholder}
                className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-[#16221C] outline-none placeholder:text-[#8E968F]"
              />
              <button
                type="submit"
                className="rounded-full bg-[#1F4E3D] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#15372B] cursor-pointer"
              >
                {t.newsletterBtn}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Main Deep Botanical Pine Footer */}
      <div className="bg-[#15372B] text-[#E6ECE8]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-12">
          <div className="space-y-4 md:col-span-5">
            <div>
              <p className="font-latin-ui text-lg font-bold tracking-[0.22em] text-white">
                {t.brandEn}
              </p>
              <p className="font-editorial italic text-sm text-[#A9D1BC]">
                La Boutique Papeterie
              </p>
            </div>
            <p className="max-w-md text-xs sm:text-sm leading-relaxed text-[#C7D6CD]">
              {t.footerAbout}
            </p>
          </div>

          <div className="space-y-3 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A9D1BC]">
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
                      className="hover:text-white transition cursor-pointer"
                    >
                      {t.categoryNames[catId]}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="space-y-3 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A9D1BC]">
              {t.footerCols.services}
            </h4>
            <ul className="space-y-2 text-xs text-[#DFEAE3]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("services")}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#F2B8A8] hover:text-white cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.nav.servicesPortal}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("services", "quote-calculator")}
                  className="hover:text-white cursor-pointer"
                >
                  {t.calcTitle}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3 md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A9D1BC]">
              {t.footerCols.contact}
            </h4>
            <div className="space-y-2.5 text-xs text-[#DFEAE3]">
              <a
                href="tel:09353834393"
                className="flex items-center gap-2 hover:text-white font-latin-ui"
                dir="ltr"
              >
                <Phone className="h-3.5 w-3.5 text-[#A9D1BC]" />
                <span>0935 383 4393</span>
              </a>
              <a
                href="mailto:atelier@imageboutique.ir"
                className="flex items-center gap-2 hover:text-white font-latin-ui"
                dir="ltr"
              >
                <Mail className="h-3.5 w-3.5 text-[#A9D1BC]" />
                <span>atelier@imageboutique.ir</span>
              </a>
              <p className="text-[11px] text-[#A8BCB0] pt-1">
                {lang === "fa"
                  ? "شنبه تا پنج‌شنبه · ۱۰ الی ۲۱"
                  : "Sat – Thu · 10:00 – 21:00"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-[11px] text-[#A8BCB0] sm:px-6">
            <span>
              © {lang === "fa" ? "۱۴۰۵" : "2026"} {t.brandMain} · La Boutique
              Papeterie
            </span>
            <span className="font-latin-ui">
              FA / EN Bilingual Boutique & Print Atelier
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
