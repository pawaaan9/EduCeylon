"use client";

import { GradientHeader } from "@/components/GradientHeader";
import { Avatar } from "@/components/Avatar";
import { useT } from "@/lib/i18n/I18nProvider";

const STUDENTS = [
  { name: "Saduni Wickramasinghe", email: "saduni.w@gmail.com", joined: "Mar 12, 2026", hours: 48, courses: 3 },
  { name: "Tharindu Bandara", email: "tharindu@yahoo.com", joined: "Apr 02, 2026", hours: 41, courses: 2 },
  { name: "Nethmi Gunasekara", email: "nethmi.g@outlook.com", joined: "Feb 28, 2026", hours: 37, courses: 4 },
  { name: "Imash Senanayake", email: "imash.s@gmail.com", joined: "May 06, 2026", hours: 33, courses: 1 },
  { name: "Ravinda Jayasundara", email: "ravinda@gmail.com", joined: "Jan 19, 2026", hours: 28, courses: 2 },
  { name: "Hashini Perera", email: "hashini.p@gmail.com", joined: "Apr 14, 2026", hours: 22, courses: 1 },
];

export default function StudentsPage() {
  const t = useT();
  return (
    <>
      <GradientHeader
        title={t("lecturer.nav.students")}
        subtitle="Students enrolled in your courses."
      />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-50">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-500">
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 font-semibold">Hours</th>
                <th className="px-5 py-3 font-semibold">Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {STUDENTS.map((s) => (
                <tr key={s.email} className="hover:bg-ink-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size={36} />
                      <div>
                        <div className="font-medium text-ink-900">{s.name}</div>
                        <div className="text-xs text-ink-500">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-700">{s.joined}</td>
                  <td className="px-5 py-3.5 text-ink-700">{s.hours}h</td>
                  <td className="px-5 py-3.5 text-ink-700">{s.courses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
