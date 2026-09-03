"use client";

import { useEffect, useState } from "react";
import { normalizeVehicles, type Vehicle } from "@/lib/vehicles";

const AUCTION_TIMEOUT_MS = 10_000;
type AuctionMode = "loading" | "live" | "empty" | "error";

export function useAuctionVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mode, setMode] = useState<AuctionMode>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), AUCTION_TIMEOUT_MS);

    fetch("/api/auctions", {
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error("Auction API unavailable");
        return payload as { vehicles?: unknown; mode?: string } | null;
      })
      .then((payload) => {
        if (!active) return;

        const liveVehicles = normalizeVehicles(payload?.vehicles);
        if (payload?.mode === "live" && liveVehicles.length) {
          setVehicles(liveVehicles);
          setMode("live");
          setError(null);
          return;
        }

        setVehicles([]);
        setMode("empty");
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setVehicles([]);
        setMode("error");
        setError(
          requestError instanceof DOMException && requestError.name === "AbortError"
            ? "timeout"
            : "unavailable",
        );
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return { vehicles, mode, error };
}
