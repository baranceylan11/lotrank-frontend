import { listLiveVehicles } from "@/lib/auction-repository";

const API_TIMEOUT_MS = 8_000;

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const vehicles = await listLiveVehicles(100, controller.signal);
    return Response.json(
      { vehicles, mode: vehicles.length ? "live" : "awaiting_sources" },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("Auction API failed", error);
    return Response.json(
      {
        vehicles: [],
        mode: "awaiting_sources",
        error: controller.signal.aborted ? "timeout" : "unavailable",
      },
      {
        status: 503,
        headers: { "cache-control": "no-store" },
      },
    );
  } finally {
    clearTimeout(timeout);
  }
}
