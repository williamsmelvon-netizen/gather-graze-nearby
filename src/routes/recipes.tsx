import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { byCuisine, grouped, tagLabel, totalMinutes, type RecipeCard } from "@/lib/recipes";

type Search = { cuisine?: string | undefined };

export const Route = createFileRoute("/recipes")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cuisine: typeof s["cuisine"] === "string" && s["cuisine"] ? s["cuisine"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All recipes — Let’s Eat" },
      {
        name: "description",
        content:
          "Browse every budget recipe in Let’s Eat — soul food, Arab/Chaldean, Mexican, Bangladeshi and Polish meals with times, servings and simple tags.",
      },
      { property: "og:title", content: "All recipes — Let’s Eat" },
      {
        property: "og:description",
        content: "Every meal in one place: cuisine, time, servings and tags.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Recipes,
});

const chip = (active: boolean) =>
  `inline-flex min-h-11 items-center rounded-full border px-4 ${
    active ? "border-primary bg-primary text-primary-foreground font-semibold" : "border-border bg-card"
  }`;

function Recipes() {
  const { cuisine } = Route.useSearch();
  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () =>
      ((await supabase
        .from("recipes")
        .select("id,title,description,servings,prep_minutes,cook_minutes,tags,cuisines(name)")
        .eq("status", "published")
        .order("title")).data ?? []) as RecipeCard[],
  });
  const { data: cuisines = [] } = useQuery({
    queryKey: ["cuisines"],
    queryFn: async () =>
      (await supabase.from("cuisines").select("id,name").order("sort_order")).data ?? [],
  });

  const shown = grouped(byCuisine(recipes, cuisine ?? null));

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">All recipes</h1>
      <p className="text-muted-foreground">
        {shown.length} {shown.length === 1 ? "meal" : "meals"}
        {cuisine ? ` in ${cuisine}` : ""} — tap one for ingredients, steps and cost.
      </p>

      <div role="group" aria-label="Cuisine" className="flex flex-wrap gap-2">
        <Link to="/recipes" search={{ cuisine: undefined }} className={chip(!cuisine)}>
          All
        </Link>
        {cuisines.map((c) => (
          <Link key={c.id} to="/recipes" search={{ cuisine: c.name }} className={chip(cuisine === c.name)}>
            {c.name}
          </Link>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card p-5 text-center">
          <h2 className="text-lg font-semibold">No recipes in {cuisine} yet</h2>
          <p className="mt-1 text-muted-foreground">We’re adding more meals all the time.</p>
          <Button asChild className="mt-4 h-12 text-base">
            <Link to="/recipes" search={{ cuisine: undefined }}>
              Show all recipes
            </Link>
          </Button>
        </div>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((r) => (
          <li key={r.id}>
            <Link
              to="/recipe/$recipeId"
              params={{ recipeId: r.id }}
              className="flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-sm hover:bg-secondary"
            >
              <span className="text-sm font-semibold text-primary">{r.cuisines?.name}</span>
              <span className="text-lg font-semibold">{r.title}</span>
              <span className="mt-1 text-muted-foreground">{r.description}</span>
              <span className="mt-auto flex flex-wrap items-center gap-2 pt-3 text-sm">
                <span className="font-medium">{totalMinutes(r)} min</span>
                {r.servings ? <span className="text-muted-foreground">· serves {r.servings}</span> : null}
                {(r.tags ?? []).map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-muted-foreground">
                    {tagLabel(t)}
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
