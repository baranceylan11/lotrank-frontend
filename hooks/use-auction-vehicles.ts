"use client";

import { useEffect, useState } from "react";
import { vehicles as fallbackVehicles, type Vehicle } from "@/lib/vehicles";

export function useAuctionVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(fallbackVehicles);
  const [mode, setMode] = useState<"sample" | "live">("sample");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auctions", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Auction API unavailable")))
      .then((payload: { vehicles?: Vehicle[]; mode?: string }) => {
        if (payload.mode === "live" && payload.vehicles?.length) {
          setVehicles(payload.vehicles);
          setMode("live");
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return { vehicles, mode };
}
