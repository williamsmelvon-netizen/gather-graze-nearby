import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLocalList } from "@/lib/device";

export const Route = createFileRoute("/shopping-list")({
  head: () => ({
    meta: [
      { title: "Shopping list — Let’s Eat" },
      { name: "description", content: "Your ingredients, grouped by where to buy them." },
      { property: "og:title", content: "Shopping list — Let’s Eat" },
      { property: "og:description", content: "Ingredients grouped by where to buy." },
    ],
  }),
  component: ShoppingList,
});

function ShoppingList() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(getLocalList()), []);
  const { data: items = [] } = useQuery({
    queryKey: ["list", ids],
    enabled: ids.length > 0,
    queryFn: async () =>
      (await supabase.from("recipe_ingredients").select("*").in("recipe_id", ids)).data ?? [],
  });
  const fresh = items.filter((i) => !i.is_pantry);
  const pantry = items.filter((i) => i.is_pantry);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Shopping list</h1>
      {ids.length === 0 && <p className="text-muted-foreground">Add a recipe to start your list.</p>}
      {[["Fresh food", fresh], ["Pantry", pantry]].map(([title, list]) =>
        (list as typeof items).length ? (
          <section key={title as string}>
            <h2 className="mb-2 text-xl font-semibold">{title as string}</h2>
            <ul className="space-y-1">
              {(list as typeof items).map((i) => (
                <li key={i.id}>
                  {i.quantity ? `${i.quantity} ${i.unit ?? ""} ` : ""}
                  {i.name}
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}
