import { describe, it, expect, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { getCustomItems, addCustomItem } from "@/lib/device";

vi.mock("@/lib/sources.functions", () => ({
  listSources: vi.fn(),
  getListIngredients: vi.fn(),
}));

describe("device", () => {
  it("works", () => {
    expect(typeof getCustomItems).toBe("function");
    expect(getCustomItems()).toEqual([]);
    expect(addCustomItem("Salt")[0].name).toBe("Salt");
    expect(Object.keys(routeTree)).toContain("/shopping-list");
  });
});
