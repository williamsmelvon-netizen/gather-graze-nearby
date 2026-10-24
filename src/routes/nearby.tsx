import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

type Search = { address?: string | undefined };

export const Route = createFileRoute("/nearby")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    address: typeof s["address"] === "string" ? s["address"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Nearby fresh food — Let’s Eat" },
      { name: "description", content: "Double Up Food Bucks sites, farmers markets and farm stands near you in Detroit." },
      { property: "og:title", content: "Nearby fresh food — Let’s Eat" },
      { property: "og:description", content: "Find markets and farm stands near you." },
    ],
  }),
  component: Nearby,
});

const filters = [
  { key: "double_up", label: "Double Up" },
  { key: "farmers_market", label: "Farmers market" },
  { key: "farm_stand", label: "Farm stand" },
  { key: "grocery", label: "Grocery" },
] as const;

const typeLabel: Record<string, string> = {
  grocery: "Grocery",
  farmers_market: "Farmers market",
  farm_stand: "Farm stand",
  csa: "CSA",
  garden_store: "Garden store",
};

function Nearby() {
  const [radius, setRadius] = useState(3);
  const [active, setActive] = useState<string[]>([]);
  const { data: sources = [] } = useQuery({
    queryKey: ["sources"],
    queryFn: async () => (await supabase.from("sources").select("*").order("name")).data ?? [],
  });
  const shown = sources.filter((s) =>
    active.every((f) => (f === "double_up" ? s.double_up : s.type === f)),
  );
  const toggle = (k: string) =>
    setActive((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Nearby</h1>
      <div role="group" aria-label="Distance" className="flex gap-2">
        {[1, 3, 5].map((r) => (
          <button
            key={r}
            onClick={() => setRadius(r)}
            aria-pressed={radius === r}
            className="min-h-11 flex-1 rounded-full border border-border px-4 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {r} mi
          </button>
        ))}
      </div>
      <div role="group" aria-label="Filters" className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => toggle(f.key)}
            aria-pressed={active.includes(f.key)}
            className="min-h-11 rounded-full border border-border bg-card px-4 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex h-48 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        Map coming soon
      </div>
      <ul className="space-y-3">
        {shown.length === 0 && <li className="text-muted-foreground">No places found yet.</li>}
        {shown.map((s) => (
          <li key={s.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">{s.name}</h2>
              {s.double_up && <Badge className="text-sm">Double Up</Badge>}
            </div>
            <p className="text-muted-foreground">{typeLabel[s.type] ?? s.type}</p>
            {s.address && <p>{s.address}</p>}
            {s.hours_note && <p className="text-sm">{s.hours_note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
