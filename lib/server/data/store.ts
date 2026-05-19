import "server-only";
import type { CategoryKey, Course, Lecturer, User } from "../types";

export const categories: { key: CategoryKey; nameEn: string; nameSi: string; nameTa: string }[] = [
  { key: "ol", nameEn: "O/L Classes", nameSi: "O/L පන්ති", nameTa: "O/L வகுப்புகள்" },
  { key: "al", nameEn: "A/L Classes", nameSi: "A/L පන්ති", nameTa: "A/L வகுப்புகள்" },
  { key: "languages", nameEn: "Language Courses", nameSi: "භාෂා පාඨමාලා", nameTa: "மொழி பாடநெறிகள்" },
  { key: "university", nameEn: "University & Professional", nameSi: "විශ්ව විද්‍යාල සහ වෘත්තීය", nameTa: "பல்கலைக்கழகம் & தொழில்முறை" },
  { key: "skills", nameEn: "Skill Programs", nameSi: "කුසලතා පාඨමාලා", nameTa: "திறன் பாடநெறிகள்" },
  { key: "revision", nameEn: "Revision Classes", nameSi: "පුනරීක්ෂණ පන්ති", nameTa: "மறுபார்வை வகுப்புகள்" },
  { key: "seminars", nameEn: "Seminars", nameSi: "සම්මන්ත්‍රණ", nameTa: "கருத்தரங்குகள்" },
];

export const lecturers: Lecturer[] = [
  {
    id: "lec-1",
    slug: "ishara-madushan",
    name: "Ishara Madushan",
    email: "ishara@educeylon.lk",
    title: "A/L ICT · 12 yrs",
    bio: {
      en: "Senior ICT lecturer helping A/L students master programming, networks and databases.",
      si: "A/L සිසුන්ට වැඩසටහන්කරණය උගන්වන ජ්‍යෙෂ්ඨ ICT ගුරුවරයෙක්.",
      ta: "A/L மாணவர்களுக்கு நிரலாக்கம் கற்பிக்கும் மூத்த ICT ஆசிரியர்.",
    },
    qualifications: ["BSc IT — University of Moratuwa", "MSc Computer Science"],
    subjects: ["ICT", "Python", "Networks"],
    experienceYears: 12,
    rating: 4.9,
    reviews: 1284,
    students: 12500,
    courses: 6,
    verified: true,
  },
  {
    id: "lec-2",
    slug: "nadeesha-perera",
    name: "Nadeesha Perera",
    email: "nadeesha@educeylon.lk",
    title: "O/L Maths · 9 yrs",
    bio: {
      en: "Maths made simple. Specialised in O/L Maths with clear step-by-step explanations.",
      si: "O/L ගණිතය සරලව.",
      ta: "எளிய கணிதம்.",
    },
    qualifications: ["BSc Mathematics — University of Colombo"],
    subjects: ["Maths", "Statistics"],
    experienceYears: 9,
    rating: 4.8,
    reviews: 980,
    students: 9800,
    courses: 4,
    verified: true,
  },
  {
    id: "lec-3",
    slug: "kavinda-fernando",
    name: "Kavinda Fernando",
    email: "kavinda@educeylon.lk",
    title: "IELTS & Spoken English · 7 yrs",
    bio: {
      en: "British Council certified IELTS trainer.",
      si: "British Council සහතික IELTS පුහුණුකරුවෙක්.",
      ta: "British Council சான்றிதழ் IELTS பயிற்சியாளர்.",
    },
    qualifications: ["CELTA", "IELTS Trainer Certificate"],
    subjects: ["IELTS", "Spoken English"],
    experienceYears: 7,
    rating: 4.9,
    reviews: 1520,
    students: 8400,
    courses: 5,
    verified: true,
  },
];

export const courses: Course[] = [
  {
    id: "c-1",
    slug: "al-ict-mastery-2026",
    title: {
      en: "A/L ICT Mastery 2026",
      si: "A/L ICT 2026 සම්පූර්ණ පාඨමාලාව",
      ta: "A/L ICT 2026 முழுமையான பாடநெறி",
    },
    description: {
      en: "Complete A/L ICT syllabus with practicals.",
      si: "A/L ICT සම්පූර්ණ විෂය මාලාව.",
      ta: "A/L ICT முழு பாடத்திட்டம்.",
    },
    category: "al",
    level: "advanced",
    type: "hybrid",
    language: "en",
    price: 14500,
    rating: 4.9,
    reviews: 412,
    students: 3200,
    lessons: 86,
    hours: 64,
    status: "published",
    featured: true,
    trending: true,
    lecturerId: "lec-1",
  },
  {
    id: "c-2",
    slug: "ol-maths-paper-class",
    title: {
      en: "O/L Maths Paper Class — 2025/2026",
      si: "O/L ගණිතය පත්‍රපන්තිය",
      ta: "O/L கணித தாள் வகுப்பு",
    },
    description: {
      en: "Past paper discussions, model papers and exam strategy.",
      si: "පසුගිය ප්‍රශ්න පත්‍ර සාකච්ඡාව.",
      ta: "முந்தைய தாள்கள், மாதிரித் தாள்கள்.",
    },
    category: "ol",
    level: "intermediate",
    type: "live",
    language: "si",
    price: 6500,
    rating: 4.8,
    reviews: 218,
    students: 2100,
    lessons: 48,
    hours: 36,
    status: "published",
    featured: true,
    trending: false,
    lecturerId: "lec-2",
  },
  {
    id: "c-3",
    slug: "ielts-band-7-bootcamp",
    title: {
      en: "IELTS Band 7+ Bootcamp",
      si: "IELTS Band 7+ පුහුණු වැඩසටහන",
      ta: "IELTS Band 7+ பயிற்சி",
    },
    description: {
      en: "Intensive 8-week IELTS prep.",
      si: "දැඩි 8-සති IELTS පුහුණුව.",
      ta: "8 வார IELTS பயிற்சி.",
    },
    category: "languages",
    level: "intermediate",
    type: "live",
    language: "en",
    price: 22000,
    rating: 4.9,
    reviews: 540,
    students: 1850,
    lessons: 64,
    hours: 48,
    status: "published",
    featured: true,
    trending: true,
    lecturerId: "lec-3",
  },
];

export const users: User[] = [
  {
    id: "u-admin",
    name: "EduCeylon Admin",
    email: "admin@educeylon.lk",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
];

let userSeq = 1;
export function nextUserId(): string {
  return `u-${Date.now().toString(36)}-${userSeq++}`;
}
