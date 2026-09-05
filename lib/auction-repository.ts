import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  VEHICLE_PLACEHOLDER_IMAGE,
  normalizeVehicles,
  type Vehicle,
} from "@/lib/vehicles";

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

type ScoreRow = {
  listing_id: string | number;
  lotrank_score: number | string | null;
  confidence: number | string | null;
  lotrank_max: number | string | null;
  weighted_market_price: number | string | null;
  safe_sale_value: number | string | null;
  remaining_bid_room: number | string | null;
  bid_status: string | null;
  estimated_net_profit: number | string | null;
  market_spread: number | string | null;
  target_profit: number | string | null;
  risk_reserve: number | string | null;
  calculated_at: string | null;
};

type RiskFlagRow = {
  listing_id: string | number;
  flag_type: string | null;
  description: string | null;
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
const SCORE_COLUMNS = "listing_id,lotrank_score,confidence,lotrank_max,weighted_market_price,safe_sale_value,remaining_bid_room,bid_status,estimated_net_profit,market_spread,target_profit,risk_reserve,calculated_at";
const RISK_FLAG_COLUMNS = "listing_id,flag_type,description";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatEuro(value: unknown) {
  const amount = asNumber(value);
  if (amount === null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMileage(value: unknown) {
  const mileage = asNumber(value);
  if (mileage === null) return "—";
  return `${new Intl.NumberFormat("fr-FR").format(mileage)} km`;
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

function scoresByListing(rows: ScoreRow[]) {
  const scores = new Map<string, ScoreRow>();
  for (const row of rows) {
    const id = String(row.listing_id);
    if (!scores.has(id)) scores.set(id, row);
  }
  return scores;
}

function risksByListing(rows: RiskFlagRow[]) {
  const risks = new Map<string, Vehicle["riskFlags"]>();
  for (const row of rows) {
    const id = String(row.listing_id);
    const type = asString(row.flag_type);
    const description = asString(row.description);
    if (!type && !description) continue;
    const values = risks.get(id) ?? [];
    values.push({ type: type || "—", description: description || type || "—" });
    risks.set(id, values);
  }
  return risks;
}

function toVehicle(
  row: ListingRow,
  latestPrice?: PriceHistoryRow,
  earliestPrice?: PriceHistoryRow,
  score?: ScoreRow,
  riskFlags: Vehicle["riskFlags"] = [],
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
    score: asNumber(score?.lotrank_score),
    gain: null,
    time: null,
    image: VEHICLE_PLACEHOLDER_IMAGE,
    fuel: asString(row.fuel_type) || null,
    transmission: null,
    sourceUrl: undefined,
    confidence: asNumber(score?.confidence),
    lotrankMax: asNumber(score?.lotrank_max),
    weightedMarketPrice: asNumber(score?.weighted_market_price),
    safeSaleValue: asNumber(score?.safe_sale_value),
    remainingBidRoom: asNumber(score?.remaining_bid_room),
    bidStatus: asString(score?.bid_status) || null,
    estimatedNetProfit: asNumber(score?.estimated_net_profit),
    marketSpread: asNumber(score?.market_spread),
    targetProfit: asNumber(score?.target_profit),
    riskReserve: asNumber(score?.risk_reserve),
    calculatedAt: asString(score?.calculated_at) || null,
    riskFlags,
  };
}

export async function listLiveVehicles(
  limit = 100,
  signal?: AbortSignal,
  offset = 0,
): Promise<Vehicle[]> {
  const supabase = getSupabaseServerClient();
  const pageSize = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const pageOffset = Math.max(Math.trunc(offset), 0);
  let listingsQuery = supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("status", "active")
    .order("id", { ascending: true })
    .range(pageOffset, pageOffset + pageSize - 1);

  if (signal) listingsQuery = listingsQuery.abortSignal(signal);

  const { data: listingRows, error: listingsError } = await listingsQuery;

  if (listingsError) throw new Error(`Supabase listings query failed: ${listingsError.message}`);
  if (!listingRows?.length) return [];

  const listings = listingRows as unknown as ListingRow[];
  const ids = listings.map(listingId);
  let pricesQuery = supabase
    .from("price_history")
    .select(PRICE_HISTORY_COLUMNS)
    .in("listing_id", ids)
    .order("recorded_at", { ascending: false });

  if (signal) pricesQuery = pricesQuery.abortSignal(signal);

  const { data: priceRows, error: pricesError } = await pricesQuery;

  if (pricesError) throw new Error(`Supabase price_history query failed: ${pricesError.message}`);

  const { latest, earliest } = pricesByListing(
    (priceRows ?? []) as unknown as PriceHistoryRow[],
  );

  let scoresQuery = supabase.from("scores").select(SCORE_COLUMNS).in("listing_id", ids).order("calculated_at", { ascending: false });
  let risksQuery = supabase.from("risk_flags").select(RISK_FLAG_COLUMNS).in("listing_id", ids);
  if (signal) {
    scoresQuery = scoresQuery.abortSignal(signal);
    risksQuery = risksQuery.abortSignal(signal);
  }
  const [scoresResult, risksResult] = await Promise.all([scoresQuery, risksQuery]);
  const scores = scoresByListing(scoresResult.error ? [] : (scoresResult.data ?? []) as unknown as ScoreRow[]);
  const risks = risksByListing(risksResult.error ? [] : (risksResult.data ?? []) as unknown as RiskFlagRow[]);

  return normalizeVehicles(
    listings.map((row) => {
      const id = listingId(row);
      return toVehicle(row, latest.get(id), earliest.get(id), scores.get(id), risks.get(id));
    }),
  );
}

export async function countLiveVehicles(signal?: AbortSignal): Promise<number> {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  if (signal) query = query.abortSignal(signal);
  const { count, error } = await query;
  if (error) throw new Error(`Supabase listings count failed: ${error.message}`);
  return count ?? 0;
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
  const [scoreResult, riskResult] = await Promise.all([
    supabase.from("scores").select(SCORE_COLUMNS).eq("listing_id", listingId(listing)).order("calculated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("risk_flags").select(RISK_FLAG_COLUMNS).eq("listing_id", listingId(listing)),
  ]);
  const score = scoreResult.error ? undefined : scoreResult.data as unknown as ScoreRow | null;
  const risks = risksByListing(riskResult.error ? [] : (riskResult.data ?? []) as unknown as RiskFlagRow[]);
  return toVehicle(listing, history[0], history.at(-1), score ?? undefined, risks.get(listingId(listing)));
}
