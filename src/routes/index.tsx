import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LocateFixed, Sprout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Let’s Eat — Fresh local food for Detroit SNAP households" },
      { name: "description", content: "Find Double Up Food Bucks sites, markets and farm stands near you, and cook budget recipes from the cuisines you love." },
      { property: "og:title", content: "Let’s Eat — Fresh local food in Detroit" },
      { property: "og:description", content: "Nearby markets, seasonal produce and budget recipes for Detroit families." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const month = new Date().getMonth() + 1;
  const { data: cuisines = [] } = useQuery({
    queryKey: ["cuisines"],
    queryFn: async () => (await supabase.from("cuisines").select("*").order("sort_order")).data ?? [],
  });
  const { data: inSeason = [] } = useQuery({
    queryKey: ["in-season", month],
    queryFn: async () =>
      (await supabase.from("produce").select("name").contains("season_months", [month])).data ?? [],
  });

  return (
    <div className="space-y-8">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/nearby", search: { address } });
        }}
      >
        <Label htmlFor="address" className="font-display text-2xl font-semibold">
          Where are you in Detroit?
        </Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street address or ZIP"
          className="h-14 text-lg"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" size="lg" className="h-12 flex-1 text-base">
            Find food near me
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="h-12 flex-1 text-base"
            onClick={() => navigate({ to: "/nearby", search: { address: "my-location" } })}
          >
            <LocateFixed className="mr-2 h-5 w-5" /> Use my location
          </Button>
        </div>
      </form>

      <section className="flex gap-3 rounded-lg bg-secondary p-4">
        <Sprout className="h-6 w-6 shrink-0 text-primary" aria-hidden />
        <p>
          <strong>In season now in Michigan:</strong>{" "}
          {inSeason.length ? inSeason.map((p) => p.name).join(", ") : "check back soon"}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold">What do you like to cook?</h2>
        {cuisines.length === 0 && <p className="text-muted-foreground">Cuisines are coming soon.</p>}
        <div className="grid grid-cols-2 gap-3">
          {cuisines.map((c) => (
            <Link
              key={c.id}
              to="/cuisine/$cuisineId"
              params={{ cuisineId: c.id }}
              className="flex min-h-24 items-center justify-center rounded-lg border border-border bg-card p-4 text-center text-lg font-semibold shadow-sm hover:bg-secondary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
