import { redirect } from "next/navigation";

/** Legacy URL — course editor moved to `/lecturer/create/[id]`. */
export default async function LegacyCourseEditRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/lecturer/create?id=${encodeURIComponent(id)}`);
}
