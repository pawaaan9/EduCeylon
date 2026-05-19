import type { Locale } from "@/lib/i18n/config";

export type Localized = Partial<Record<Locale, string>> & { en: string };

export type CategoryKey =
  | "ol"
  | "al"
  | "languages"
  | "university"
  | "skills"
  | "revision"
  | "seminars";

export type Level = "beginner" | "intermediate" | "advanced" | "allLevels";
export type CourseType = "recorded" | "live" | "hybrid";

export type Lesson = {
  id: string;
  title: Localized;
  durationMin: number;
  preview?: boolean;
};

export type CourseModule = {
  id: string;
  title: Localized;
  lessons: Lesson[];
};

export type Lecturer = {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: Localized;
  qualifications: string[];
  experienceYears: number;
  rating: number;
  reviews: number;
  students: number;
  courses: number;
  subjects: string[];
  verified: boolean;
  coverGradient: string;
  photoURL?: string;
  coverURL?: string;
  district?: string;
  social?: { youtube?: string; facebook?: string; web?: string };
};

export type Course = {
  id: string;
  slug: string;
  title: Localized;
  shortDescription: Localized;
  longDescription: Localized;
  category: CategoryKey;
  level: Level;
  type: CourseType;
  language: Locale;
  price: number;
  rating: number;
  reviews: number;
  students: number;
  lessons: number;
  hours: number;
  featured?: boolean;
  trending?: boolean;
  thumbnailGradient: string;
  lecturer: Pick<Lecturer, "id" | "slug" | "name" | "title">;
  modules: CourseModule[];
  status?: "published" | "draft" | "pending" | "rejected";
};

export type LiveSession = {
  id: string;
  courseId: string;
  courseTitle: Localized;
  lecturerName: string;
  startsAt: string; // ISO
  durationMin: number;
};
