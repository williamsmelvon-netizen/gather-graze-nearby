import { describe, it, expect } from "vitest";
import { getCustomItems, addCustomItem } from "@/lib/device";
describe("device", () => {
  it("works", () => {
    expect(typeof getCustomItems).toBe("function");
    expect(getCustomItems()).toEqual([]);
    expect(addCustomItem("Salt")[0].name).toBe("Salt");
  });
});
