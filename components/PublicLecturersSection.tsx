"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LecturerCard } from "@/components/LecturerCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ArrowRightIcon } from "@/components/icons";
import { fetchPublicLecturers } from "@/lib/api/public-lecturers";
import type { Lecturer } from "@/lib/data/types";
import { useT } from "@/lib/i18n/I18nProvider";

export function HomeLecturersSection({ limit = 4 }: { limit?: number }) {
  const t = useT();
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await fetchPublicLecturers();
        if (!cancelled) setLecturers(all.slice(0, limit));
      } catch {
        if (!cancelled) setLecturers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return (
    <section>
      <SectionHeader
        eyebrow="Lecturers"
        title={t("home.lecturers.title")}
        subtitle={t("home.lecturers.subtitle")}
        action={
          <Link
            href="/lecturers"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            {t("home.lecturers.viewAll")}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        }
      />
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-ink-200 bg-ink-50 animate-pulse"
            />
          ))}
        </div>
      ) : lecturers.length === 0 ? (
        <p className="text-sm text-ink-500">{t("home.lecturers.empty")}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {lecturers.map((l) => (
            <LecturerCard key={l.id} lecturer={l} />
          ))}
        </div>
      )}
    </section>
  );
}
