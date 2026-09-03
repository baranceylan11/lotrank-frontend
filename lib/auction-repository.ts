import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/lib/vehicles";

type ListingRow = {
  id: string | number;
  brand: string | null;
  model: string | null;
  year: number | string | null;
  mileage_km: number | string | null;
  fuel_type: string | null;
  location: string | null;
  status: string | null;
  category: string | null;
};

type PriceHistoryRow = {
  listing_id: string | number;
  price: number | string | null;
  recorded_at: string;
};

const LISTING_COLUMNS = [
  "id",
  "brand",
  "model",
  "year",
  "mileage_km",
  "fuel_type",
  "location",
  "status",
  "category",
].join(",");

const PRICE_HISTORY_COLUMNS = "listing_id,price,recorded_at";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatEuro(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(asNumber(value));
}

function formatMileage(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return `${new Intl.NumberFormat("fr-FR").format(asNumber(value))} km`;
}

function listingId(row: ListingRow) {
  return String(row.id);
}

function pricesByListing(rows: PriceHistoryRow[]) {
  const latest = new Map<string, PriceHistoryRow>();
  const earliest = new Map<string, PriceHistoryRow>();

  for (const row of rows) {
    const id = String(row.listing_id);
    if (!latest.has(id)) latest.set(id, row);
    earliest.set(id, row);
  }

  return { latest, earliest };
}

function toVehicle(
  row: ListingRow,
  latestPrice?: PriceHistoryRow,
  earliestPrice?: PriceHistoryRow,
): Vehicle {
  return {
    id: listingId(row),
    brand: asString(row.brand, "—"),
    model: asString(row.model, "—"),
    year: asNumber(row.year),
    km: formatMileage(row.mileage_km),
    place: asString(row.location, "—"),
    price: formatEuro(latestPrice?.price),
    start: formatEuro(earliestPrice?.price),
    score: 0,
    gain: 0,
    time: "--:--:--",
    image: "/file.svg",
    sourceUrl: undefined,
  };
}

export async function listLiveVehicles(limit = 100): Promise<Vehicle[]> {
  const supabase = getSupabaseServerClient();
  const { data: listingRows, error: listingsError } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("status", "active")
    .limit(limit);

  if (listingsError) throw new Error(`Supabase listings query failed: ${listingsError.message}`);
  if (!listingRows?.length) return [];

  const listings = listingRows as unknown as ListingRow[];
  const ids = listings.map(listingId);
  const { data: priceRows, error: pricesError } = await supabase
    .from("price_history")
    .select(PRICE_HISTORY_COLUMNS)
    .in("listing_id", ids)
    .order("recorded_at", { ascending: false });

  if (pricesError) throw new Error(`Supabase price_history query failed: ${pricesError.message}`);

  const { latest, earliest } = pricesByListing(
    (priceRows ?? []) as unknown as PriceHistoryRow[],
  );

  return listings.map((row) => {
    const id = listingId(row);
    return toVehicle(row, latest.get(id), earliest.get(id));
  });
}

export async function getVehicleBySlug(id: string): Promise<Vehicle | null> {
  const supabase = getSupabaseServerClient();
  const { data: row, error: listingError } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (listingError) throw new Error(`Supabase listing query failed: ${listingError.message}`);
  if (!row) return null;

  const listing = row as unknown as ListingRow;
  const { data: priceRows, error: priceError } = await supabase
    .from("price_history")
    .select(PRICE_HISTORY_COLUMNS)
    .eq("listing_id", listingId(listing))
    .order("recorded_at", { ascending: false });

  if (priceError) throw new Error(`Supabase price_history query failed: ${priceError.message}`);

  const history = (priceRows ?? []) as unknown as PriceHistoryRow[];
  return toVehicle(listing, history[0], history.at(-1));
}
