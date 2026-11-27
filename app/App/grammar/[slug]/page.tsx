import { notFound } from "next/navigation";
import { getGrammarTopic, grammarTopics } from "../../lib/grammar";
import { TopicView } from "./TopicView";

export function generateStaticParams() {
  return grammarTopics.map((topic) => ({ slug: topic.slug }));
}

export default async function GrammarTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getGrammarTopic(slug);
  if (!topic) notFound();

  return <TopicView topic={topic} />;
}
