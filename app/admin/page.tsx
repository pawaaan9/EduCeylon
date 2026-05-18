"use client";

import Link from "next/link";
import { GradientHeader } from "@/components/GradientHeader";
import { StatCard } from "@/components/StatCard";
import { Avatar } from "@/components/Avatar";
import {
  ArrowRightIcon,
  BookIcon,
  GraduationIcon,
  MoneyIcon,
  UsersIcon,
} from "@/components/icons";
import { COURSES, LECTURERS } from "@/lib/data/mock";
import { useI18n } from "@/lib/i18n/I18nProvider";

const RECENT_SIGNUPS = [
  { name: "Saduni Wickramasinghe", role: "Student", at: "2h ago" },
  { name: "Nimesha Karunaratne", role: "Lecturer", at: "4h ago" },
  { name: "Tharindu Bandara", role: "Student", at: "6h ago" },
  { name: "Lakshan De Silva", role: "Lecturer", at: "1d ago" },
];

export default function AdminDashboardPage() {
  const { t, locale } = useI18n();
  const pending = COURSES.filter((c) => c.status === "pending");

  return (
    <>
      <GradientHeader
        title="Admin overview"
        subtitle="Platform-wide stats, pending approvals and recent activity."
      />
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t("admin.stats.users")} value="42,180" icon={<UsersIcon className="h-5 w-5" />} trend={{ value: "+1,240 this week", positive: true }} />
        <StatCard label={t("admin.stats.lecturers")} value={LECTURERS.length} icon={<GraduationIcon className="h-5 w-5" />} tint="emerald" />
        <StatCard label={t("admin.stats.courses")} value={COURSES.length} icon={<BookIcon className="h-5 w-5" />} tint="amber" />
        <StatCard label={t("admin.stats.revenue")} value="LKR 4.2M" icon={<MoneyIcon className="h-5 w-5" />} tint="rose" trend={{ value: "+12% MoM", positive: true }} />
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-200 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">{t("admin.pending.title")}</h2>
            <Link href="/admin/courses" className="text-xs font-semibold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1">
              {t("action.viewAll")} <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          {pending.length === 0 ? (
            <div className="p-8 text-center text-ink-500">No pending courses.</div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {pending.map((c) => (
                <li key={c.id} className="flex items-center gap-4 p-4">
                  <div className="h-10 w-16 rounded-md flex-shrink-0" style={{ background: c.thumbnailGradient }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink-900 line-clamp-1">{c.title[locale] ?? c.title.en}</div>
                    <div className="text-xs text-ink-500">{c.lecturer.name}</div>
                  </div>
                  <button className="btn btn-secondary h-9 text-xs">{t("admin.action.review")}</button>
                  <button className="btn btn-primary h-9 text-xs">{t("admin.action.approve")}</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-200">
            <h2 className="font-semibold text-ink-900">{t("admin.recent.users")}</h2>
          </div>
          <ul className="divide-y divide-ink-100">
            {RECENT_SIGNUPS.map((u) => (
              <li key={u.name} className="flex items-center gap-3 p-4">
                <Avatar name={u.name} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-900 truncate">{u.name}</div>
                  <div className="text-xs text-ink-500">{u.role}</div>
                </div>
                <div className="text-xs text-ink-500">{u.at}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
