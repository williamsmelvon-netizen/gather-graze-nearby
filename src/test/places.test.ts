import { describe, expect, it } from "vitest";
import { matchesFilters, nearbyPlaces } from "@/lib/places";

const market = { type: "farmers_market", double_up: false, lat: 42.3486, lng: -83.0401 };
const stand = { type: "farm_stand", double_up: true, lat: 42.3857, lng: -83.2721 };

describe("Nearby filters", () => {
  it("shows a place matching any selected category (OR)", () => {
    expect(matchesFilters(market, ["farmers_market", "farm_stand"])).toBe(true);
    expect(matchesFilters(stand, ["farmers_market", "farm_stand"])).toBe(true);
  });
  it("hides places matching no selected category", () => {
    expect(matchesFilters(market, ["grocery"])).toBe(false);
  });
  it("limits to the radius and sorts nearest first", () => {
    const origin = { lat: 42.35, lng: -83.04 };
    expect(nearbyPlaces([stand, market], [], origin, 3).map((p) => p.type)).toEqual(["farmers_market"]);
    expect(nearbyPlaces([stand, market], [], origin, 20).map((p) => p.type)).toEqual(["farmers_market", "farm_stand"]);
  });
});
