import type { Metadata } from "next";
import { Inter, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const tamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/logo1.jpg", type: "image/jpeg" }],
    shortcut: "/logo1.jpg",
    apple: "/logo1.jpg",
  },
  title: {
    default: "EduCeylon — Sri Lanka's Online Lecture Marketplace",
    template: "%s · EduCeylon",
  },
  description:
    "EduCeylon is Sri Lanka's modern lecture marketplace. Discover lecturers, buy lecture series, join live classes and learn in Sinhala, Tamil or English.",
  keywords: [
    "Sri Lanka education",
    "online classes",
    "O/L",
    "A/L",
    "IELTS",
    "Spoken English",
    "Sinhala",
    "Tamil",
    "lecturers",
  ],
  openGraph: {
    title: "EduCeylon — Sri Lanka's Online Lecture Marketplace",
    description:
      "Discover lecturers, buy lecture series, and join live classes across O/L, A/L, language and professional courses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sinhala.variable} ${tamil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
