import { notFound } from "next/navigation";
import { getScenario, scenarioMeta } from "../../../lib/scenarios";
import { LessonPlayer } from "./LessonPlayer";

export function generateStaticParams() {
  return scenarioMeta
    .filter((item) => item.available)
    .map((item) => ({ slug: item.slug }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scenario = getScenario(slug);
  if (!scenario) notFound();

  return <LessonPlayer scenario={scenario} />;
}
