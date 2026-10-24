import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getListIngredients } from "@/lib/sources.functions";
import * as device from "../lib/device";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

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
  const [custom, setCustom] = useState<device.CustomItem[]>([]);
  const [newItem, setNewItem] = useState("");
  useEffect(() => {
    setIds(device.getLocalList());
    setCustom(device.getCustomItems());
  }, []);

  const addItem = () => {
    const next = device.addCustomItem(newItem);
    if (next !== custom) setCustom(next);
    setNewItem("");
  };

  const dropItem = (id: string) => setCustom(device.removeCustomItem(id));
  const {
    data: items = [],
    isError,
    refetch,
  } = useQuery({
    queryKey: ["list", ids],
    enabled: ids.length > 0,
    queryFn: () => getListIngredients({ data: { ids } }),
  });
  const fresh = items.filter((i) => !i.is_pantry);
  const pantry = items.filter((i) => i.is_pantry);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Shopping list</h1>
      {isError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
          <p>We couldn’t load your list right now.</p>
          <Button className="h-11" onClick={() => refetch()}>Try again</Button>
        </div>
      )}
      {ids.length === 0 && custom.length === 0 && (
        <p className="text-muted-foreground">Add a recipe to start your list.</p>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addItem();
        }}
      >
        <Input
          className="h-11"
          aria-label="Add item"
          placeholder="Add an item, e.g. vegetable oil"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          maxLength={100}
        />
        <Button type="submit" className="h-11 shrink-0">
          Add
        </Button>
      </form>
      {[
        ["Fresh food", fresh],
        ["Pantry", pantry],
      ].map(([title, list]) =>
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
      {custom.length > 0 && (
        <section>
          <h2 className="mb-2 text-xl font-semibold">My items</h2>
          <ul className="divide-y divide-border">
            {custom.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-base">{item.name}</span>
                <Button
                  variant="outline"
                  className="h-11 shrink-0 gap-2 px-3"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => dropItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
