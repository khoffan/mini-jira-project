import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string; projectSlug: string; boradSlug: string }>;
}

export default async function TaskPage({ params }: PageProps) {
  const { slug, projectSlug, boradSlug } = await params;
  redirect(`/workspace/${slug}/${projectSlug}/${boradSlug}`);
}
