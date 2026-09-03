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
    return url.protocol === "https:" || url.protocol === "http:"
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

export const vehicles: Vehicle[] = [
  { id:"bmw-320d", brand:"BMW", model:"320d", year:2019, km:"145.000 km", place:"Lyon", price:"€18.750", start:"€12.000", score:93, gain:56, time:"01:24:18", image:"https://images.unsplash.com/photo-1734940521859-785d926b3e70?auto=format&fit=crop&w=1000&q=82" },
  { id:"mercedes-c220d", brand:"Mercedes", model:"C 220d", year:2018, km:"112.000 km", place:"Paris", price:"€16.300", start:"€10.500", score:87, gain:38, time:"02:15:42", image:"https://images.unsplash.com/photo-1636378182990-3bc1fd5c8307?auto=format&fit=crop&w=1000&q=82" },
  { id:"audi-a4", brand:"Audi", model:"A4 2.0 TDI", year:2020, km:"98.000 km", place:"Lille", price:"€17.900", start:"€12.200", score:81, gain:28, time:"00:45:30", image:"https://images.unsplash.com/photo-1612373091548-26d9ce084461?auto=format&fit=crop&w=1000&q=82" },
  { id:"peugeot-308", brand:"Peugeot", model:"308 BlueHDi", year:2021, km:"75.000 km", place:"Bordeaux", price:"€6.250", start:"€4.200", score:78, gain:22, time:"01:05:31", image:"https://images.unsplash.com/photo-1722088354375-3c64b4d994b6?auto=format&fit=crop&w=1000&q=82" },
  { id:"renault-clio", brand:"Renault", model:"Clio", year:2020, km:"62.000 km", place:"Marseille", price:"€3.450", start:"€2.350", score:76, gain:15, time:"00:30:05", image:"https://images.unsplash.com/photo-1612373091548-26d9ce084461?auto=format&fit=crop&w=1000&q=82" },
];
