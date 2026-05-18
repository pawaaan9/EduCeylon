import Image from "next/image";
import Link from "next/link";

/** Tight box: image is mainly the square “EC” mark; wider boxes left empty gap before wording. */
const BOX = {
  sm: { h: 32, w: 36 },
  md: { h: 40, w: 44 },
  lg: { h: 52, w: 56 },
} as const;

const TEXT = {
  sm: { title: "text-base", sub: "text-[10px] leading-tight" },
  md: { title: "text-lg", sub: "text-[11px] leading-tight" },
  lg: { title: "text-2xl", sub: "text-xs leading-tight" },
} as const;

export function Logo({
  size = "md",
  variant = "dark",
}: {
  size?: "sm" | "md" | "lg";
  /** `light` = white text (e.g. auth gradient sidebar). */
  variant?: "dark" | "light";
}) {
  const b = BOX[size];
  const t = TEXT[size];
  const titleColor = variant === "light" ? "text-white" : "text-ink-900";
  const subColor = variant === "light" ? "text-white/75" : "text-ink-500";

  return (
    <Link
      href="/"
      className="flex items-center gap-1 sm:gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-md"
      aria-label="EduCeylon home"
    >
      {/*
        logo1.jpg is very large (e.g. 6250²). next/image optimization often fails on huge assets.
        unoptimized + fixed box keeps SSR/CSR stable and avoids broken images in dev/prod.
      */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ width: b.w, height: b.h }}
      >
        <Image
          src="/logo1.jpg"
          alt=""
          fill
          unoptimized
          priority={size !== "sm"}
          sizes={`${b.w}px`}
          className="object-contain object-left"
        />
      </div>
      <span className="flex flex-col leading-tight min-w-0">
        <span className={`font-extrabold tracking-tight ${titleColor} ${t.title}`}>
          EduCeylon
        </span>
        <span className={`font-medium tracking-wide ${subColor} ${t.sub}`}>
          Smart learning platform
        </span>
      </span>
    </Link>
  );
}
