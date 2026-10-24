import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LocateFixed, Sprout } from "lucide-react";
import { getHomeData } from "@/lib/recipes.functions";
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
  const { data, isError, refetch } = useQuery({
    queryKey: ["home", month],
    queryFn: () => getHomeData({ data: { month } }),
  });
  const cuisines = data?.cuisines ?? [];
  const featured = data?.featured ?? [];
  const inSeason = data?.inSeason ?? [];

  return (
    <div className="space-y-8">
      {isError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
          <p>We couldn’t load meals right now.</p>
          <Button className="h-11" onClick={() => refetch()}>Try again</Button>
        </div>
      )}
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
          <Button type="submit" size="lg" className="h-12 text-base sm:flex-1">
            Find food near me
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="h-12 text-base sm:flex-1"
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
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Featured meals</h2>
        </div>
        {featured.length === 0 && <p className="text-muted-foreground">New recipes are on the way.</p>}
        <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {featured.map((r) => (
            <li key={r.id} className="w-64 shrink-0 snap-start">
              <Link
                to="/recipe/$recipeId"
                params={{ recipeId: r.id }}
                className="flex h-full min-h-36 flex-col rounded-lg border border-border bg-card p-4 shadow-sm hover:bg-secondary"
              >
                <span className="text-sm font-semibold text-primary">{r.cuisines?.name}</span>
                <span className="text-lg font-semibold">{r.title}</span>
                <span className="mt-1 text-muted-foreground">{r.description}</span>
                <span className="mt-auto pt-2 text-sm">
                  {(r.prep_minutes ?? 0) + (r.cook_minutes ?? 0)} min
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" size="lg" className="mt-4 h-12 w-full text-base">
          <Link to="/recipes">Browse all recipes</Link>
        </Button>
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
        <Button asChild variant="outline" size="lg" className="mt-4 h-12 w-full text-base">
          <Link to="/nearby">Browse places to buy fresh food</Link>
        </Button>
      </section>
    </div>
  );
}
