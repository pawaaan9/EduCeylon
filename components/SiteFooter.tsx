"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { useT } from "@/lib/i18n/I18nProvider";

export function SiteFooter() {
  const t = useT();

  const cols = [
    {
      heading: t("footer.product"),
      links: [
        { href: "/courses", label: t("nav.courses") },
        { href: "/lecturers", label: t("nav.lecturers") },
        { href: "/categories", label: t("nav.categories") },
        { href: "/register", label: t("nav.becomeLecturer") },
      ],
    },
    {
      heading: t("footer.company"),
      links: [
        { href: "/about", label: t("nav.about") },
        { href: "#", label: "Careers" },
        { href: "#", label: "Press" },
        { href: "#", label: "Contact" },
      ],
    },
    {
      heading: t("footer.support"),
      links: [
        { href: "#", label: "Help Center" },
        { href: "#", label: "Community" },
        { href: "#", label: "Status" },
        { href: "#", label: "Report an issue" },
      ],
    },
    {
      heading: t("footer.legal"),
      links: [
        { href: "#", label: "Terms" },
        { href: "#", label: "Privacy" },
        { href: "#", label: "Cookies" },
      ],
    },
  ];

  return (
    <footer className="border-t border-ink-200 bg-white mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 max-w-sm">
          <Logo />
          <p className="mt-4 text-sm text-ink-500 leading-6">
            {t("brand.tagline")}. Built for Sri Lankan students and lecturers — in
            Sinhala, Tamil and English.
          </p>
        </div>
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {cols.map((c) => (
            <div key={c.heading}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500">
                {c.heading}
              </h4>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-700 hover:text-brand-700"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-500">
          <p>
            © {new Date().getFullYear()} EduCeylon. {t("footer.rights")}
          </p>
          <p>Made with care in Sri Lanka.</p>
        </div>
      </div>
    </footer>
  );
}
