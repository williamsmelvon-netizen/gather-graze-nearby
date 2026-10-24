import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getDeviceId, getLocalList, setLocalList } from "@/lib/device";

export const Route = createFileRoute("/recipe/$recipeId")({
  head: () => ({
    meta: [
      { title: "Recipe — Let’s Eat" },
      { name: "description", content: "Ingredients, steps and cost per serving with Double Up Food Bucks." },
      { property: "og:title", content: "Recipe — Let’s Eat" },
      { property: "og:description", content: "A budget-friendly seasonal recipe." },
    ],
  }),
  component: Recipe,
});

function Recipe() {
  const { recipeId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: async () => {
      const [r, i] = await Promise.all([
        supabase.from("recipes").select("*").eq("id", recipeId).maybeSingle(),
        supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipeId),
      ]);
      return { recipe: r.data, ingredients: i.data ?? [] };
    },
  });
  const [servings, setServings] = useState<number | null>(null);

  if (!data) return <p>Loading…</p>;
  if (!data.recipe) return <p>We couldn’t find that recipe.</p>;
  const base = data.recipe.servings;
  const s = servings ?? base;
  const scale = s / base;
  const steps = Array.isArray(data.recipe.steps) ? (data.recipe.steps as string[]) : [];

  const add = async () => {
    const ids = Array.from(new Set([...getLocalList(), recipeId]));
    setLocalList(ids);
    await supabase.rpc("save_shopping_list", { _device_id: getDeviceId(), _recipe_ids: ids });
    toast.success("Added to your shopping list");
  };

  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold">{data.recipe.title}</h1>
      {data.recipe.description && <p>{data.recipe.description}</p>}
      <div className="flex items-center gap-3">
        <span className="font-semibold">Servings</span>
        <Button variant="secondary" className="h-11 w-11" aria-label="Fewer servings" onClick={() => setServings(Math.max(1, s - 1))}>−</Button>
        <span className="w-8 text-center text-lg" aria-live="polite">{s}</span>
        <Button variant="secondary" className="h-11 w-11" aria-label="More servings" onClick={() => setServings(s + 1)}>+</Button>
      </div>
      <section>
        <h2 className="mb-2 text-2xl font-semibold">Ingredients</h2>
        <ul className="space-y-1">
          {data.ingredients.map((i) => (
            <li key={i.id}>
              {i.quantity ? `${+(Number(i.quantity) * scale).toFixed(2)} ${i.unit ?? ""} ` : ""}
              {i.name}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-2xl font-semibold">Steps</h2>
        <ol className="list-decimal space-y-2 pl-6">
          {steps.map((st, n) => <li key={n}>{st}</li>)}
        </ol>
      </section>
      <Button size="lg" className="h-12 w-full text-base" onClick={add}>
        Add to shopping list
      </Button>
    </article>
  );
}
