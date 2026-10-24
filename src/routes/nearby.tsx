import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LocateFixed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nearbyPlaces, type LatLng } from "@/lib/places";
import { PlaceCard } from "@/components/PlaceCard";
import { geocodeAddress } from "@/lib/geocode.functions";

const PlacesMap = lazy(() => import("@/components/PlacesMap"));

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


const MapFallback = () => <div className="h-72 rounded-lg bg-muted" aria-hidden />;

function Nearby() {
  const { address } = Route.useSearch();
  const navigate = useNavigate({ from: "/nearby" });
  const geocode = useServerFn(geocodeAddress);
  const [radius, setRadius] = useState(5);
  const [active, setActive] = useState<string[]>([]);
  const [query, setQuery] = useState(address && address !== "my-location" ? address : "");
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: sources = [] } = useQuery({
    queryKey: ["sources"],
    queryFn: async () => (await supabase.from("sources").select("*").order("name")).data ?? [],
  });

  const locate = () => {
    if (!navigator.geolocation) return setStatus("Your phone didn’t share a location. Try typing an address.");
    setStatus("Finding you…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setOrigin({ lat: p.coords.latitude, lng: p.coords.longitude });
        setStatus("Showing places near you.");
      },
      () => setStatus("We couldn’t get your location. Try typing an address."),
    );
  };

  const search = async (q: string) => {
    setStatus("Looking up address…");
    const r = await geocode({ data: { q } });
    if (!r.ok) {
      setStatus(r.message);
      return;
    }
    setOrigin({ lat: r.lat, lng: r.lng });
    setStatus(`Showing places near ${r.label.split(",").slice(0, 2).join(",")}.`);
  };

  useEffect(() => {
    if (address === "my-location") locate();
    else if (address) search(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const shown = nearbyPlaces(sources, active, origin, radius);
  const toggle = (k: string) => setActive((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  const selectFromMap = (id: string) => {
    setSelected(id);
    document.getElementById(`place-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Nearby</h1>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ search: { address: query } });
        }}
      >
        <Label htmlFor="nearby-address">Your address</Label>
        <div className="flex gap-2">
          <Input id="nearby-address" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Street address or ZIP" className="h-12 flex-1 text-base" />
          <Button type="submit" className="h-12">Search</Button>
        </div>
        <Button type="button" variant="secondary" className="h-12 w-full" onClick={() => navigate({ search: { address: "my-location" } })}>
          <LocateFixed className="mr-2 h-5 w-5" /> Use my location
        </Button>
        {status && <p role="status" className="text-sm text-muted-foreground">{status}</p>}
      </form>

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

      <ClientOnly fallback={<MapFallback />}>
        <Suspense fallback={<MapFallback />}>
          <PlacesMap places={shown} origin={origin} radiusMiles={radius} selectedId={selected} onSelect={selectFromMap} />
        </Suspense>
      </ClientOnly>

      {!origin && <p className="text-muted-foreground">Enter an address to see distances. Showing all places for now.</p>}
      <ul className="space-y-3">
        {shown.length === 0 && (
          <li className="text-muted-foreground">
            No places found{origin ? ` within ${radius} miles` : ""}. Try a bigger distance or fewer filters.
          </li>
        )}
        {shown.map((s) => (
          <li
            key={s.id}
            className={`rounded-lg border bg-card p-4 ${selected === s.id ? "border-primary ring-2 ring-primary" : "border-border"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">{s.name}</h2>
              {s.double_up && <Badge className="text-sm">Double Up</Badge>}
            </div>
            <p className="text-muted-foreground">
              {typeLabel[s.type] ?? s.type}
              {s.distance != null && ` · ${s.distance.toFixed(1)} mi`}
            </p>
            {s.address && <p>{s.address}</p>}
            {s.hours_note && <p className="text-sm">{s.hours_note}</p>}
            {(s.phone || s.email) && (
              <p className="text-sm">
                {s.phone && <a className="underline" href={`tel:${s.phone}`}>{s.phone}</a>}
                {s.phone && s.email && " · "}
                {s.email && <a className="underline" href={`mailto:${s.email}`}>{s.email}</a>}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {s.verified_on ? `Last checked ${s.verified_on}` : "Not yet checked — call ahead"}
              {(s.source_url || s.website) && (
                <>
                  {" · "}
                  <a className="underline" href={(s.source_url || s.website)!} target="_blank" rel="noreferrer">Source</a>
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
