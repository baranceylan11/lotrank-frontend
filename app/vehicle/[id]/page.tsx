import { notFound } from "next/navigation";
import { VehicleDetailClient } from "@/app/components/vehicle-detail-client";
import { SiteFooter, SiteHeader } from "@/app/components/site-header";
import { getVehicleBySlug } from "@/lib/auction-repository";

export default async function Vehicle({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{lang?:string}>}){
  const {id}=await params; const q=await searchParams;
  const lang=q.lang==="en"||q.lang==="zh"?q.lang:"fr";
  let vehicle;
  try {
    vehicle=await getVehicleBySlug(id);
  } catch {
    return <main className="detail"><SiteHeader lang={lang} active="auctions"/><section className="pageSurface"><div className="innerWrap"><div className="emptyState"><h1>Véhicule temporairement indisponible</h1><p>Les données de cette annonce n’ont pas pu être chargées. Réessayez plus tard.</p></div></div></section><SiteFooter/></main>;
  }
  if(!vehicle)notFound();
  return <VehicleDetailClient vehicle={vehicle} lang={lang}/>;
}
