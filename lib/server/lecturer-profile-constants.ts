import "server-only";
import type {
  LecturerType,
  TeachingLevel,
  TeachingMethod,
} from "./types";

export const TEACHING_LEVELS: TeachingLevel[] = [
  "ol",
  "al",
  "university",
  "language",
  "professional",
];

export const TEACHING_METHODS: TeachingMethod[] = [
  "recorded",
  "live",
  "physical",
  "hybrid",
];

export const LECTURER_TYPES: LecturerType[] = [
  "individual",
  "institute",
  "organization",
];

export const LANGUAGE_OPTIONS = ["si", "ta", "en"] as const;

export const DAY_OPTIONS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;
