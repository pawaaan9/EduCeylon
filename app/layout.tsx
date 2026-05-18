import type { Metadata } from "next";
import { Saira, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { AuthProvider } from "@/lib/firebase/AuthProvider";

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
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
      className={`${saira.variable} ${sinhala.variable} ${tamil.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Finlandica+Text:ital,wght@0,100..900;1,100..900&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>
          <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
