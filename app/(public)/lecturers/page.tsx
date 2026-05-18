"use client";

import { useMemo, useState } from "react";
import { LecturerCard } from "@/components/LecturerCard";
import { useT } from "@/lib/i18n/I18nProvider";
import { LECTURERS } from "@/lib/data/mock";
import { SearchIcon } from "@/components/icons";

export default function LecturersPage() {
  const t = useT();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LECTURERS;
    return LECTURERS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.subjects.some((s) => s.toLowerCase().includes(q)) ||
        l.title.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl brand-gradient text-white p-8 sm:p-10 shadow-card overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.35), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("lecturers.title")}
          </h1>
          <p className="mt-2 text-white/80">{t("lecturers.subtitle")}</p>
          <div className="mt-6 flex items-center h-12 rounded-xl bg-white/95 text-ink-900 px-4 shadow-lg">
            <SearchIcon className="h-5 w-5 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("lecturers.search.placeholder")}
              className="flex-1 bg-transparent outline-none px-3 placeholder:text-ink-400"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((l) => (
          <LecturerCard key={l.id} lecturer={l} />
        ))}
      </div>
    </div>
  );
}
