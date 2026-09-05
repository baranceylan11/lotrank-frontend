import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionPage } from "@/app/components/section-page";

const sections = new Set(["auctions","selection","compare","business","sources","how","login","register","pricing","checkout","search"]);
const sectionTitles:Record<string,string> = {
  auctions:"Toutes les enchères",
  selection:"Mes favoris",
  compare:"Comparer",
  business:"Analyses du marché",
  sources:"Sources de données",
  how:"Comment fonctionne LotRank ?",
  login:"Connexion",
  register:"Inscription",
  pricing:"Passez à la vitesse supérieure avec LotRank Pro",
  checkout:"Finaliser l’abonnement",
  search:"Résultats de recherche",
};

export async function generateMetadata({params}:{params:Promise<{section:string}>}):Promise<Metadata>{
  const {section}=await params;
  const title=sectionTitles[section];
  return title?{title:`${title} | LotRank`}:{};
}

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
