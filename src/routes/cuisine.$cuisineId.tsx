import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cuisine/$cuisineId")({
  head: () => ({
    meta: [
      { title: "Recipes by cuisine — Let’s Eat" },
      { name: "description", content: "Budget-friendly, seasonal recipes from the cuisines Detroit families cook." },
      { property: "og:title", content: "Recipes by cuisine — Let’s Eat" },
      { property: "og:description", content: "Seasonal recipes on a budget." },
    ],
  }),
  component: Cuisine,
});

function Cuisine() {
  const { cuisineId } = Route.useParams();
  const { data, isError, refetch } = useQuery({
    queryKey: ["cuisine", cuisineId],
    queryFn: () => getCuisine({ data: { id: cuisineId } }),
  });

  if (isError) return <LoadError onRetry={() => refetch()} />;
  if (!data) return <p className="text-muted-foreground">Loading recipes…</p>;


  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">{data?.cuisine?.name ?? "Recipes"}</h1>
      {data?.cuisine?.description && <p>{data.cuisine.description}</p>}
      <ul className="space-y-3">
        {data && data.recipes.length === 0 && (
          <li className="text-muted-foreground">No recipes yet. Check back soon.</li>
        )}
        {data?.recipes.map((r) => (
          <li key={r.id}>
            <Link
              to="/recipe/$recipeId"
              params={{ recipeId: r.id }}
              className="block rounded-lg border border-border bg-card p-4 hover:bg-secondary"
            >
              <h2 className="text-lg font-semibold">{r.title}</h2>
              {r.description && <p className="text-muted-foreground">{r.description}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
