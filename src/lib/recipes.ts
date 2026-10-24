export type RecipeCard = {
  id: string;
  title: string;
  description: string | null;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  tags: string[] | null;
  cuisines: { name: string | null } | null;
};

export const totalMinutes = (r: Pick<RecipeCard, "prep_minutes" | "cook_minutes">) =>
  (r.prep_minutes ?? 0) + (r.cook_minutes ?? 0);

/** Keep only the picked cuisine; null shows everything. */
export const byCuisine = (recipes: RecipeCard[], cuisine: string | null) =>
  cuisine ? recipes.filter((r) => r.cuisines?.name === cuisine) : recipes;

/** Group by cuisine name, then by title, without mutating the input. */
export const grouped = (recipes: RecipeCard[]) =>
  [...recipes].sort(
    (a, b) =>
      (a.cuisines?.name ?? "").localeCompare(b.cuisines?.name ?? "") ||
      a.title.localeCompare(b.title),
  );

const TAG_LABELS: Record<string, string> = {
  "no-cook": "No cook",
  "no-oven": "No oven",
  "one-pot": "One pot",
  vegetarian: "Vegetarian",
};

export const tagLabel = (t: string) => TAG_LABELS[t] ?? t;
