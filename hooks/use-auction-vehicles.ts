"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeVehicles, type Vehicle } from "@/lib/vehicles";

const AUCTION_TIMEOUT_MS = 10_000;
const AUCTION_PAGE_SIZE = 48;
type AuctionMode = "loading" | "live" | "empty" | "error";
type AuctionPayload = {
  vehicles?: unknown;
  mode?: string;
  pagination?: { hasMore?: boolean; nextOffset?: number | null };
};

export function useAuctionVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mode, setMode] = useState<AuctionMode>("loading");
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const nextOffset = useRef(0);
  const active = useRef(true);
  const controllers = useRef(new Set<AbortController>());

  const requestPage = useCallback(async (offset: number, append: boolean) => {
    const controller = new AbortController();
    controllers.current.add(controller);
    const timeout = window.setTimeout(() => controller.abort(), AUCTION_TIMEOUT_MS);
    if (append) setLoadingMore(true);

    try {
      const response = await fetch(`/api/auctions?offset=${offset}&limit=${AUCTION_PAGE_SIZE}`, {
        headers: { accept: "application/json" },
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null) as AuctionPayload | null;
      if (!response.ok) throw new Error("Auction API unavailable");
      if (!active.current) return;

      const liveVehicles = normalizeVehicles(payload?.vehicles);
      const moreAvailable = payload?.pagination?.hasMore === true;
      nextOffset.current = payload?.pagination?.nextOffset ?? offset + liveVehicles.length;
      setHasMore(moreAvailable);

      if (append) {
        setVehicles((current) => normalizeVehicles([...current, ...liveVehicles]));
        setError(null);
        return;
      }

      if (payload?.mode === "live" && liveVehicles.length) {
        setVehicles(liveVehicles);
        setMode("live");
        setError(null);
        return;
      }

      setVehicles([]);
      setMode("empty");
      setError(null);
    } catch (requestError: unknown) {
      if (!active.current || (controller.signal.aborted && append)) return;
      if (!append) {
        setVehicles([]);
        setMode("error");
      }
      setError(
        requestError instanceof DOMException && requestError.name === "AbortError"
          ? "timeout"
          : "unavailable",
      );
    } finally {
      window.clearTimeout(timeout);
      controllers.current.delete(controller);
      if (active.current && append) setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    active.current = true;
    let disposed = false;
    const activeControllers = controllers.current;
    queueMicrotask(() => {
      if (!disposed) void requestPage(0, false);
    });

    return () => {
      disposed = true;
      active.current = false;
      for (const controller of activeControllers) controller.abort();
      activeControllers.clear();
    };
  }, [requestPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    void requestPage(nextOffset.current, true);
  }, [hasMore, loadingMore, requestPage]);

  return { vehicles, mode, error, hasMore, loadingMore, loadMore };
}
