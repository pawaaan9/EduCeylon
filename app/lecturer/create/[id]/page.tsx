import { redirect } from "next/navigation";

/** Legacy path — editor uses `/lecturer/create?id=…` to avoid client navigation fetch errors. */
export default async function LegacyCreateIdRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/lecturer/create?id=${encodeURIComponent(id)}`);
}
