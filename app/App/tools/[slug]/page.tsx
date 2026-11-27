import { notFound } from "next/navigation";
import { getTool, tools } from "../../lib/tools";
import { ToolView } from "../components/ToolView";

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return <ToolView tool={tool} />;
}
