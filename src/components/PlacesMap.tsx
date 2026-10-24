import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap, LayerGroup } from "leaflet";
import type { LatLng } from "@/lib/places";

type Pin = { id: string; name: string; lat: number | null; lng: number | null; double_up: boolean | null };

export default function PlacesMap({
  places,
  origin,
  radiusMiles,
  onSelect,
}: {
  places: Pin[];
  origin: LatLng | null;
  radiusMiles: number;
  onSelect?: (id: string) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || map.current) return;
      L.current = mod;
      map.current = mod.map(el.current).setView([42.36, -83.08], 11);
      mod.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map.current);
      layer.current = mod.layerGroup().addTo(map.current);
      draw();
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = () => {
    const mod = L.current;
    if (!mod || !map.current || !layer.current) return;
    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue("--primary").trim();
    const accent = styles.getPropertyValue("--accent").trim();
    layer.current.clearLayers();
    const pts: [number, number][] = [];
    for (const p of places) {
      if (p.lat == null || p.lng == null) continue;
      pts.push([p.lat, p.lng]);
      mod.circleMarker([p.lat, p.lng], {
        radius: 11,
        color: primary,
        weight: 3,
        fillColor: p.double_up ? accent : primary,
        fillOpacity: 0.9,
      })
        .bindPopup(p.name)
        .on("click", () => onSelect?.(p.id))
        .addTo(layer.current);
    }
    if (origin) {
      mod.circle([origin.lat, origin.lng], { radius: radiusMiles * 1609.34, color: primary, weight: 1, fillOpacity: 0.06 }).addTo(layer.current);
      mod.circleMarker([origin.lat, origin.lng], { radius: 7, color: primary, fillColor: primary, fillOpacity: 1 }).bindPopup("You").addTo(layer.current);
      pts.push([origin.lat, origin.lng]);
    }
    if (pts.length) map.current.fitBounds(pts, { padding: [30, 30], maxZoom: 14 });
  };

  useEffect(draw, [places, origin, radiusMiles]);

  return <div ref={el} className="h-72 w-full overflow-hidden rounded-lg border border-border" role="region" aria-label="Map of places" />;
}
