export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  km: string;
  place: string;
  price: string;
  start: string;
  score: number | null;
  gain: number | null;
  time: string | null;
  image: string;
  fuel?: string | null;
  transmission?: string | null;
  sourceUrl?: string;
  confidence: number | null;
  lotrankMax: number | null;
  weightedMarketPrice: number | null;
  safeSaleValue: number | null;
  remainingBidRoom: number | null;
  bidStatus: string | null;
  estimatedNetProfit: number | null;
  marketSpread: number | null;
  targetProfit: number | null;
  riskReserve: number | null;
  calculatedAt: string | null;
  riskFlags: Array<{ type: string; description: string }>;
};

export const VEHICLE_PLACEHOLDER_IMAGE = "/vehicle-placeholder.svg";

function textOrFallback(value: unknown, fallback = "—") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeRiskFlags(value: unknown): Vehicle["riskFlags"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as { type?: unknown; description?: unknown };
    const type = optionalText(row.type);
    const description = optionalText(row.description);
    return type || description ? [{ type: type ?? "—", description: description ?? type ?? "—" }] : [];
  });
}

export function hasVehicleScore(score: unknown): score is number {
  const parsed = optionalNumber(score);
  return parsed !== null && parsed > 0 && parsed <= 100;
}

export function safeVehicleImage(value: unknown) {
  if (typeof value !== "string" || !value.trim() || value === "/file.svg") {
    return VEHICLE_PLACEHOLDER_IMAGE;
  }

  const image = value.trim();
  if (image.startsWith("/") && !image.startsWith("//")) return image;

  try {
    const url = new URL(image);
    return url.protocol === "https:"
      ? url.toString()
      : VEHICLE_PLACEHOLDER_IMAGE;
  } catch {
    return VEHICLE_PLACEHOLDER_IMAGE;
  }
}

function safeSourceUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function normalizeVehicle(value: unknown): Vehicle | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<Record<keyof Vehicle, unknown>>;
  const id = textOrFallback(row.id, "");
  if (!id) return null;

  const year = optionalNumber(row.year);
  const score = optionalNumber(row.score);
  const gain = optionalNumber(row.gain);
  const time = optionalText(row.time);

  return {
    id,
    brand: textOrFallback(row.brand),
    model: textOrFallback(row.model),
    year: year !== null && year >= 1886 && year <= 2100 ? Math.trunc(year) : null,
    km: textOrFallback(row.km),
    place: textOrFallback(row.place),
    price: textOrFallback(row.price),
    start: textOrFallback(row.start),
    score: hasVehicleScore(score) ? score : null,
    gain,
    time: time && /^\d{1,3}:\d{2}(?::\d{2})?$/.test(time) ? time : null,
    image: safeVehicleImage(row.image),
    fuel: optionalText(row.fuel),
    transmission: optionalText(row.transmission),
    sourceUrl: safeSourceUrl(row.sourceUrl),
    confidence: optionalNumber(row.confidence),
    lotrankMax: optionalNumber(row.lotrankMax),
    weightedMarketPrice: optionalNumber(row.weightedMarketPrice),
    safeSaleValue: optionalNumber(row.safeSaleValue),
    remainingBidRoom: optionalNumber(row.remainingBidRoom),
    bidStatus: optionalText(row.bidStatus),
    estimatedNetProfit: optionalNumber(row.estimatedNetProfit),
    marketSpread: optionalNumber(row.marketSpread),
    targetProfit: optionalNumber(row.targetProfit),
    riskReserve: optionalNumber(row.riskReserve),
    calculatedAt: optionalText(row.calculatedAt),
    riskFlags: safeRiskFlags(row.riskFlags),
  };
}

function duplicateKey(vehicle: Vehicle) {
  const identity = [
    vehicle.brand,
    vehicle.model,
    vehicle.year ?? "",
    vehicle.km,
    vehicle.place,
  ]
    .map((part) => String(part).trim().toLocaleLowerCase("fr"))
    .join("|");

  const hasUsefulIdentity = vehicle.brand !== "—" && vehicle.model !== "—";
  return hasUsefulIdentity ? `vehicle:${identity}` : `id:${vehicle.id}`;
}

export function normalizeVehicles(values: unknown): Vehicle[] {
  if (!Array.isArray(values)) return [];

  const unique = new Map<string, Vehicle>();
  const ids = new Set<string>();

  for (const value of values) {
    const vehicle = normalizeVehicle(value);
    if (!vehicle || ids.has(vehicle.id)) continue;

    const key = duplicateKey(vehicle);
    if (unique.has(key)) continue;

    ids.add(vehicle.id);
    unique.set(key, vehicle);
  }

  return [...unique.values()];
}
