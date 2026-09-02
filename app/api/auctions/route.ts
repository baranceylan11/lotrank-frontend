import { listLiveVehicles } from "@/lib/auction-repository";

export async function GET() {
  try {
    const vehicles = await listLiveVehicles();
    return Response.json({ vehicles, mode: vehicles.length ? "live" : "awaiting_sources" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Auction data is unavailable";
    return Response.json({ vehicles: [], mode: "awaiting_sources", error: message });
  }
}
