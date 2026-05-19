import "server-only";

import type { Lecturer } from "@/lib/data/types";
import { lecturerPublicSlug } from "@/lib/lecturer/public-slug";
import { listAllLecturerProfiles } from "./admin-lecturers";
import type { LecturerProfile, TeachingLevel } from "./types";

const COVER_GRADIENTS = [
  "linear-gradient(135deg,#1e3a8a,#2563eb)",
  "linear-gradient(135deg,#6d28d9,#a78bfa)",
  "linear-gradient(135deg,#0f766e,#14b8a6)",
  "linear-gradient(135deg,#b45309,#f59e0b)",
  "linear-gradient(135deg,#be123c,#fb7185)",
  "linear-gradient(135deg,#0369a1,#0ea5e9)",
  "linear-gradient(135deg,#4338ca,#818cf8)",
];

const LEVEL_SHORT: Record<TeachingLevel, string> = {
  ol: "O/L",
  al: "A/L",
  university: "University",
  language: "Language",
  professional: "Professional",
};

export async function listPublicLecturers(): Promise<Lecturer[]> {
  const profiles = await listAllLecturerProfiles();
  return profiles
    .filter((p) => p.approvalStatus === "approved")
    .map(profileToPublicLecturer)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPublicLecturerBySlug(
  slug: string,
): Promise<Lecturer | null> {
  const list = await listPublicLecturers();
  return list.find((l) => l.slug === slug) ?? null;
}

export function profileToPublicLecturer(profile: LecturerProfile): Lecturer {
  const name =
    profile.displayName?.trim() ||
    profile.email?.split("@")[0] ||
    "Lecturer";
  const bioText = profile.bio?.trim() || "";
  const subjects = uniqueSubjects([
    profile.mainSubject,
    ...profile.subCategories,
  ]);

  const levels = profile.teachingLevels.map((l) => LEVEL_SHORT[l] ?? l);
  const levelPart = levels.length > 0 ? levels.join(", ") : null;
  const expPart =
    profile.experienceYears != null && profile.experienceYears > 0
      ? `${profile.experienceYears} yrs`
      : null;
  const title = [levelPart, profile.mainSubject?.trim(), expPart]
    .filter(Boolean)
    .join(" · ");

  const hash = profile.uid
    .split("")
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0);

  return {
    id: profile.uid,
    slug: lecturerPublicSlug(profile),
    name,
    title: title || "Lecturer",
    bio: { en: bioText, si: bioText, ta: bioText },
    qualifications: profile.qualifications.map(
      (q) =>
        [q.title, q.institute, q.year].filter(Boolean).join(" — ") || q.title,
    ),
    experienceYears: profile.experienceYears ?? 0,
    rating: 0,
    reviews: 0,
    students: 0,
    courses: 0,
    subjects: subjects.length > 0 ? subjects : ["General"],
    verified: profile.approvalStatus === "approved",
    coverGradient: COVER_GRADIENTS[hash % COVER_GRADIENTS.length],
    photoURL: profile.photoURL,
    coverURL: profile.coverURL,
    district: profile.district,
  };
}

function uniqueSubjects(items: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const s = raw?.trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}
