import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

test("normalizes missing values and removes duplicate vehicles", async () => {
  const {
    VEHICLE_PLACEHOLDER_IMAGE,
    normalizeVehicles,
  } = await vite.ssrLoadModule("/lib/vehicles.ts");

  const vehicles = normalizeVehicles([
    {
      id: "listing-1",
      brand: "BMW",
      model: "320d",
      year: null,
      km: null,
      place: "Lyon",
      price: null,
      start: undefined,
      score: 0,
      gain: Number.NaN,
      time: "--:--:--",
      image: "/file.svg",
      sourceUrl: "javascript:alert(1)",
    },
    {
      id: "listing-2",
      brand: "BMW",
      model: "320d",
      year: null,
      km: null,
      place: "Lyon",
      price: "€18 000",
    },
    { id: null, brand: "Audi" },
  ]);

  assert.equal(vehicles.length, 1);
  assert.equal(vehicles[0].score, null);
  assert.equal(vehicles[0].gain, null);
  assert.equal(vehicles[0].time, null);
  assert.equal(vehicles[0].year, null);
  assert.equal(vehicles[0].price, "—");
  assert.equal(vehicles[0].start, "—");
  assert.equal(vehicles[0].image, VEHICLE_PLACEHOLDER_IMAGE);
  assert.equal(vehicles[0].sourceUrl, undefined);
});

test("keeps real analysis values and safe images", async () => {
  const { hasVehicleScore, normalizeVehicle } = await vite.ssrLoadModule(
    "/lib/vehicles.ts",
  );

  const vehicle = normalizeVehicle({
    id: "listing-3",
    brand: "Audi",
    model: "A4",
    year: 2020,
    km: "98 000 km",
    place: "Lille",
    price: "€17 900",
    start: "€12 200",
    score: 81,
    gain: 28,
    time: "00:45:30",
    image: "https://example.com/car.jpg",
  });

  assert.ok(vehicle);
  assert.equal(hasVehicleScore(vehicle.score), true);
  assert.equal(vehicle.image, "https://example.com/car.jpg");
  assert.equal(vehicle.time, "00:45:30");
});

test("uses bounded API requests and no sample fallback", async () => {
  const hook = await readFile(
    new URL("../hooks/use-auction-vehicles.ts", import.meta.url),
    "utf8",
  );
  const route = await readFile(
    new URL("../app/api/auctions/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(hook, /AUCTION_TIMEOUT_MS\s*=\s*10_000/);
  assert.match(hook, /useState<Vehicle\[]>\(\[\]\)/);
  assert.doesNotMatch(hook, /fallbackVehicles/);
  assert.match(route, /API_TIMEOUT_MS\s*=\s*8_000/);
  assert.match(route, /status:\s*503/);
});

test("keeps the home showcase small and the active auction list expandable", async () => {
  const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const sections = await readFile(
    new URL("../app/components/section-page.tsx", import.meta.url),
    "utf8",
  );
  const repository = await readFile(
    new URL("../lib/auction-repository.ts", import.meta.url),
    "utf8",
  );

  assert.match(home, /shown\.slice\(0,5\)/);
  assert.match(home, /href={`\/auctions\?lang=\$\{lang\}`}/);
  assert.match(sections, /AUCTION_PAGE_SIZE\s*=\s*24/);
  assert.match(sections, /shown\.slice\(0,visibleCount\)/);
  assert.match(repository, /\.eq\("status",\s*"active"\)/);
});
