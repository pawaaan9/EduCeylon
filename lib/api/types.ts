/** API response shapes — kept in sync with `lib/server/types.ts`. */

export type LecturerQualification = {
  id: string;
  title: string;
  institute: string;
  year: string;
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

export type DayKey =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type DayScheduleSlot = {
  from: string;
  to: string;
};

export type AvailableSchedule = Partial<Record<DayKey, DayScheduleSlot>>;

export type LecturerProfile = {
  uid: string;
  email?: string;
  phone?: string;
  displayName?: string;
  photoURL?: string;
  coverURL?: string;
  bio?: string;
  district?: string;
  city?: string;
  languages: string[];
  mainSubject?: string;
  subCategories: string[];
  teachingLevels: TeachingLevel[];
  experienceYears?: number;
  qualifications: LecturerQualification[];
  lecturerType?: LecturerType;
  teachingMethods: TeachingMethod[];
  availableDays: string[];
  availableSchedule?: AvailableSchedule;
  availableFrom?: string;
  availableTo?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  instagram?: string;
  website?: string;
  nicFrontURL?: string;
  nicBackURL?: string;
  extraDocs: string[];
  bankAccountHolder?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNumber?: string;
  approvalStatus: LecturerApprovalStatus;
  completion: number;
  rejectionReason?: string;
  submittedAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
};

export type OnboardingStepKey =
  | "basic"
  | "professional"
  | "teaching"
  | "social"
  | "verification"
  | "banking"
  | "review";

export type OnboardingMeta = {
  steps: Record<OnboardingStepKey, boolean>;
  maxReachableStepIndex: number;
  submittable: boolean;
  completion: number;
};

export type LecturerProfileResponse = {
  profile: LecturerProfile;
  onboarding: OnboardingMeta;
};

export type UploadKey =
  | "photo"
  | "cover"
  | "nicFront"
  | "nicBack"
  | "extraDoc";

export function emptyLecturerProfile(uid: string): LecturerProfile {
  return {
    uid,
    languages: [],
    subCategories: [],
    teachingLevels: [],
    qualifications: [],
    teachingMethods: [],
    availableDays: [],
    extraDocs: [],
    approvalStatus: "incomplete",
    completion: 0,
  };
}
