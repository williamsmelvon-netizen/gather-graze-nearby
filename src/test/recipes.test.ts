import { describe, expect, it } from "vitest";
import { byCuisine, grouped, tagLabel, totalMinutes, type RecipeCard } from "@/lib/recipes";

const r = (over: Partial<RecipeCard> = {}): RecipeCard => ({
  id: "r",
  title: "T",
  description: null,
  servings: 4,
  prep_minutes: 10,
  cook_minutes: 20,
  tags: [],
  cuisines: { name: "Soul Food" },
  ...over,
});

describe("recipe list", () => {
  it("shows every recipe when no cuisine is picked", () => {
    const all = [r(), r({ cuisines: { name: "Mexican" } })];
    expect(byCuisine(all, null)).toHaveLength(2);
  });

  it("keeps only the picked cuisine", () => {
    const all = [r(), r({ cuisines: { name: "Mexican" } })];
    const out = byCuisine(all, "Mexican");
    expect(out).toHaveLength(1);
    expect(out[0]?.cuisines?.name).toBe("Mexican");
  });

  it("adds prep and cook time together", () => {
    expect(totalMinutes(r({}))).toBe(30);
    expect(totalMinutes(r({ prep_minutes: null, cook_minutes: null }))).toBe(0);
  });

  it("groups by cuisine, then by title", () => {
    const out = grouped([
      r({ title: "Zucchini", cuisines: { name: "Polish" } }),
      r({ title: "Beans", cuisines: { name: "Mexican" } }),
      r({ title: "Okra", cuisines: { name: "Polish" } }),
    ]);
    expect(out.map((x) => `${x.cuisines?.name}/${x.title}`)).toEqual([
      "Mexican/Beans",
      "Polish/Okra",
      "Polish/Zucchini",
    ]);
  });

  it("labels tags in plain words", () => {
    expect(tagLabel("one-pot")).toBe("One pot");
    expect(tagLabel("gluten-free")).toBe("gluten-free");
  });
});
