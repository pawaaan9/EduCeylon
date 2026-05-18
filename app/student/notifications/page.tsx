"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { BellIcon, CalendarIcon, CheckCircleIcon, MessageIcon } from "@/components/icons";
import { useT } from "@/lib/i18n/I18nProvider";

const notifications = [
  {
    icon: <CalendarIcon className="h-5 w-5" />,
    tint: "bg-rose-50 text-rose-600",
    title: "O/L Maths Paper Class starts in 2 hours",
    time: "Today · 6:00 PM",
  },
  {
    icon: <CheckCircleIcon className="h-5 w-5" />,
    tint: "bg-emerald-50 text-emerald-600",
    title: "You completed lesson 'Newton's laws'",
    time: "Yesterday",
  },
  {
    icon: <MessageIcon className="h-5 w-5" />,
    tint: "bg-brand-50 text-brand-600",
    title: "Nadeesha Perera posted a new announcement",
    time: "2 days ago",
  },
];

export default function NotificationsPage() {
  const t = useT();
  return (
    <>
      <GradientHeader title={t("student.nav.notifications")} subtitle="All your platform updates in one place." />
      <div className="card divide-y divide-ink-100">
        {notifications.map((n, i) => (
          <div key={i} className="flex items-center gap-4 p-5">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${n.tint}`}>
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-ink-900">{n.title}</div>
              <div className="text-xs text-ink-500 mt-0.5">{n.time}</div>
            </div>
            <BellIcon className="h-4 w-4 text-ink-300" />
          </div>
        ))}
      </div>
    </>
  );
}
