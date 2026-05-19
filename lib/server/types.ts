import "server-only";

export type Localized = {
  en: string;
  si?: string;
  ta?: string;
};

export type CategoryKey =
  | "ol"
  | "al"
  | "languages"
  | "university"
  | "skills"
  | "revision"
  | "seminars";

export type Lecturer = {
  id: string;
  slug: string;
  name: string;
  email: string;
  title: string;
  bio: Localized;
  qualifications: string[];
  subjects: string[];
  experienceYears: number;
  rating: number;
  reviews: number;
  students: number;
  courses: number;
  verified: boolean;
};

export type Course = {
  id: string;
  slug: string;
  title: Localized;
  description: Localized;
  category: CategoryKey;
  level: "beginner" | "intermediate" | "advanced" | "allLevels";
  type: "recorded" | "live" | "hybrid";
  language: "en" | "si" | "ta";
  price: number;
  rating: number;
  reviews: number;
  students: number;
  lessons: number;
  hours: number;
  status: "published" | "draft" | "pending" | "rejected";
  featured: boolean;
  trending: boolean;
  lecturerId: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "lecturer" | "admin";
  createdAt: string;
};

export type LecturerApprovalStatus =
  | "incomplete"
  | "pending"
  | "approved"
  | "rejected";

export type LecturerType = "individual" | "institute" | "organization";

export type TeachingLevel =
  | "ol"
  | "al"
  | "university"
  | "language"
  | "professional";

export type TeachingMethod = "recorded" | "live" | "physical" | "hybrid";

/** Degree or certification entry on a lecturer onboarding profile. */
export type LecturerQualification = {
  id?: string;
  title: string;
  institute: string;
  /** Four-digit year obtained, e.g. "2018". */
  year: string;
};

export type LecturerProfile = {
  uid: string;
  email?: string;
  phone?: string;
  // Basic
  displayName?: string;
  photoURL?: string;
  coverURL?: string;
  bio?: string;
  district?: string;
  city?: string;
  languages: string[];
  // Professional
  mainSubject?: string;
  subCategories: string[];
  teachingLevels: TeachingLevel[];
  experienceYears?: number;
  qualifications: LecturerQualification[];
  lecturerType?: LecturerType;
  // Teaching
  teachingMethods: TeachingMethod[];
  availableDays: string[];
  availableFrom?: string;
  availableTo?: string;
  // Social
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  instagram?: string;
  website?: string;
  // Verification
  nicFrontURL?: string;
  nicBackURL?: string;
  extraDocs: string[];
  // Banking
  bankAccountHolder?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNumber?: string;
  // Status & meta
  approvalStatus: LecturerApprovalStatus;
  completion: number;
  rejectionReason?: string;
  submittedAt?: unknown;
  updatedAt?: unknown;
  approvedAt?: unknown;
  rejectedAt?: unknown;
};
