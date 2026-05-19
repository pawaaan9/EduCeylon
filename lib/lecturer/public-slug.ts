/** URL slug for a public lecturer profile page. */
export function lecturerPublicSlug(profile: {
  uid: string;
  displayName?: string;
  email?: string;
}): string {
  const raw =
    profile.displayName?.trim() ||
    profile.email?.split("@")[0]?.trim() ||
    profile.uid;
  const base = slugify(raw);
  return `${base}-${profile.uid.slice(0, 6)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "lecturer";
}
