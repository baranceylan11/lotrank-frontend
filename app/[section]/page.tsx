import { notFound } from "next/navigation";
import { SectionPage } from "@/app/components/section-page";

const sections = new Set(["auctions","selection","compare","business","sources","how","login","register","pricing","checkout","search"]);

export default async function DynamicSection({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ lang?: string; q?: string }>;
}) {
  const { section } = await params;
  const query = await searchParams;
  if (!sections.has(section)) notFound();
  const lang = query.lang === "en" || query.lang === "zh" ? query.lang : "fr";
  return <SectionPage section={section} lang={lang} initialQuery={query.q ?? ""} />;
}
