"use client";

import { DashboardShell, type NavSection } from "@/components/DashboardShell";
import {
  BellIcon,
  BookIcon,
  CalendarIcon,
  ChartIcon,
  HomeIcon,
  MoneyIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
} from "@/components/icons";
import { useT } from "@/lib/i18n/I18nProvider";

const MOCK_LECTURER = {
  name: "Ishara Madushan",
  email: "ishara@educeylon.lk",
};

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useT();

  const sections: NavSection[] = [
    {
      heading: "Lecturer Portal",
      items: [
        { href: "/lecturer", label: t("lecturer.nav.dashboard"), icon: HomeIcon },
        { href: "/lecturer/courses", label: t("lecturer.nav.courses"), icon: BookIcon },
        { href: "/lecturer/create", label: t("lecturer.nav.create"), icon: PlusIcon },
        { href: "/lecturer/live", label: t("lecturer.nav.live"), icon: CalendarIcon },
      ],
    },
    {
      heading: "Insights",
      items: [
        { href: "/lecturer/students", label: t("lecturer.nav.students"), icon: UsersIcon },
        { href: "/lecturer/analytics", label: t("lecturer.nav.analytics"), icon: ChartIcon },
        { href: "/lecturer/earnings", label: t("lecturer.nav.earnings"), icon: MoneyIcon },
      ],
    },
    {
      heading: "Personal",
      items: [
        { href: "/lecturer/announcements", label: t("lecturer.nav.announcements"), icon: BellIcon },
        { href: "/lecturer/settings", label: t("lecturer.nav.settings"), icon: SettingsIcon },
      ],
    },
  ];

  return (
    <DashboardShell role="lecturer" user={MOCK_LECTURER} sections={sections}>
      {children}
    </DashboardShell>
  );
}
