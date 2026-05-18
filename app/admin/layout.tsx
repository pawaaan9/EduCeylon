"use client";

import { DashboardShell, type NavSection } from "@/components/DashboardShell";
import { RequireRole } from "@/components/RequireRole";
import {
  BellIcon,
  BookIcon,
  ChartIcon,
  FlagIcon,
  HomeIcon,
  SettingsIcon,
  UsersIcon,
  GraduationIcon,
} from "@/components/icons";
import { useT } from "@/lib/i18n/I18nProvider";

const FALLBACK_USER = { name: "Admin", email: "" };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useT();

  const sections: NavSection[] = [
    {
      heading: "Admin Portal",
      items: [
        { href: "/admin", label: t("admin.nav.dashboard"), icon: HomeIcon },
        { href: "/admin/lecturers", label: t("admin.nav.lecturers"), icon: GraduationIcon },
        { href: "/admin/students", label: t("admin.nav.students"), icon: UsersIcon },
        { href: "/admin/courses", label: t("admin.nav.courses"), icon: BookIcon },
        { href: "/admin/categories", label: t("admin.nav.categories"), icon: FlagIcon },
      ],
    },
    {
      heading: "System",
      items: [
        { href: "/admin/reports", label: t("admin.nav.reports"), icon: ChartIcon },
        { href: "/admin/announcements", label: t("admin.nav.announcements"), icon: BellIcon },
        { href: "/admin/settings", label: t("admin.nav.settings"), icon: SettingsIcon },
      ],
    },
  ];

  return (
    <RequireRole role="admin">
      <DashboardShell role="admin" user={FALLBACK_USER} sections={sections}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
