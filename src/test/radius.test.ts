import { describe, expect, it } from "vitest";
import { RADII, nextRadius } from "@/lib/radius";

describe("search radius", () => {
  it("offers 2, 5, 10 and 20 miles", () => {
    expect(RADII).toEqual([2, 5, 10, 20]);
  });

  it("expands to the next wider radius in one step", () => {
    expect(nextRadius(2)).toBe(5);
    expect(nextRadius(10)).toBe(20);
  });

  it("has nothing wider than 20 miles", () => {
    expect(nextRadius(20)).toBeNull();
  });
});
