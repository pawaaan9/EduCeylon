"use client";

import { useEffect, useMemo, useState } from "react";
import { LecturerCard } from "@/components/LecturerCard";
import { useT } from "@/lib/i18n/I18nProvider";
import { fetchPublicLecturers } from "@/lib/api/public-lecturers";
import type { Lecturer } from "@/lib/data/types";
import { SearchIcon } from "@/components/icons";

export default function LecturersPage() {
  const t = useT();
  const [query, setQuery] = useState("");
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicLecturers();
        if (!cancelled) setLecturers(data);
      } catch {
        if (!cancelled) setLecturers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lecturers;
    return lecturers.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.subjects.some((s) => s.toLowerCase().includes(q)) ||
        l.title.toLowerCase().includes(q),
    );
  }, [query, lecturers]);

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

      {loading ? (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-ink-200 bg-ink-50 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-center text-ink-500">{t("home.lecturers.empty")}</p>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((l) => (
            <LecturerCard key={l.id} lecturer={l} />
          ))}
        </div>
      )}
    </div>
  );
}
