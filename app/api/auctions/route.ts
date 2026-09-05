import { countLiveVehicles, listLiveVehicles } from "@/lib/auction-repository";

const API_TIMEOUT_MS = 8_000;
const DEFAULT_PAGE_SIZE = 48;
const MAX_PAGE_SIZE = 48;

function safeInteger(value: string | null, fallback: number) {
  if (value === null) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: Request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const url = new URL(request.url);
  const offset = Math.max(0, safeInteger(url.searchParams.get("offset"), 0));
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, safeInteger(url.searchParams.get("limit"), DEFAULT_PAGE_SIZE)));

  try {
    const [vehicles, total] = await Promise.all([
      listLiveVehicles(limit, controller.signal, offset),
      countLiveVehicles(controller.signal),
    ]);
    const hasMore = offset + limit < total;
    return Response.json(
      {
        vehicles,
        mode: vehicles.length ? "live" : "awaiting_sources",
        pagination: { offset, limit, hasMore, nextOffset: hasMore ? offset + limit : null },
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    const errorCode = controller.signal.aborted ? "timeout" : "repository_unavailable";
    console.error("Auction API failed", errorCode);
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
