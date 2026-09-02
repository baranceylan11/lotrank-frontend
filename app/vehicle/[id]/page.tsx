import { notFound } from "next/navigation";
import { VehicleDetailClient } from "@/app/components/vehicle-detail-client";
import { vehicles } from "@/lib/vehicles";
import { getVehicleBySlug } from "@/lib/auction-repository";

export default async function Vehicle({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{lang?:string}>}){
  const {id}=await params; const q=await searchParams;
  const lang=q.lang==="en"||q.lang==="zh"?q.lang:"fr";
  let vehicle=vehicles.find(x=>x.id===id) ?? null;
  try { vehicle=await getVehicleBySlug(id) ?? vehicle; } catch { /* D1 is optional during local previews. */ }
  if(!vehicle)notFound();
  return <VehicleDetailClient vehicle={vehicle} lang={lang}/>;
}
