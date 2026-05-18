import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-ink-50">
      <aside className="hidden lg:flex w-1/2 brand-gradient text-white p-12 flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 10%, rgba(255,255,255,0.35), transparent 50%), radial-gradient(circle at 0% 90%, rgba(255,255,255,0.15), transparent 60%)",
          }}
        />
        <div className="relative">
          <Logo variant="light" />
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight tracking-tight max-w-md">
            Sri Lanka&apos;s home for online lectures and live classes.
          </h2>
          <p className="mt-4 text-white/80 max-w-md leading-relaxed">
            Discover top lecturers, buy lecture series and never miss a live
            session — in Sinhala, Tamil or English.
          </p>
          <div className="mt-10 flex items-center gap-6 text-white/80">
            <Stat value="150+" label="lecturers" />
            <Stat value="1.2k+" label="courses" />
            <Stat value="42k" label="students" />
          </div>
        </div>
        <div className="relative text-sm text-white/60">
          © {new Date().getFullYear()} EduCeylon
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 lg:px-12 py-5 lg:py-6">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <span className="hidden lg:block" />
          <LanguageSwitcher />
        </div>
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs uppercase tracking-wider">{label}</div>
    </div>
  );
}
