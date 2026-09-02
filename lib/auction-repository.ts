import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { auctionListings } from "@/db/schema";
import type { Vehicle } from "@/lib/vehicles";

function formatEuro(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatMileage(km: number) {
  return `${new Intl.NumberFormat("fr-FR").format(km)} km`;
}

function formatRemaining(endsAt: string | null) {
  if (!endsAt) return "--:--:--";
  const seconds = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((value) => String(value).padStart(2, "0")).join(":");
}

function toVehicle(row: typeof auctionListings.$inferSelect): Vehicle {
  return {
    id: row.slug,
    brand: row.brand,
    model: row.model,
    year: row.year,
    km: formatMileage(row.mileageKm),
    place: row.location,
    price: formatEuro(row.currentPriceCents),
    start: formatEuro(row.startingPriceCents),
    score: row.lotrankScore,
    gain: row.priceAdvantagePercent,
    time: formatRemaining(row.auctionEndsAt),
    image: row.imageUrl,
    sourceUrl: row.sourceUrl,
  };
}

export async function listLiveVehicles(limit = 100): Promise<Vehicle[]> {
  const db = getDb();
  const rows = await db.select().from(auctionListings)
    .where(eq(auctionListings.status, "live"))
    .orderBy(asc(auctionListings.auctionEndsAt))
    .limit(limit);
  return rows.map(toVehicle);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const db = getDb();
  const [row] = await db.select().from(auctionListings)
    .where(eq(auctionListings.slug, slug))
    .limit(1);
  return row ? toVehicle(row) : null;
}
