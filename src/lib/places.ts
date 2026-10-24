export type LatLng = { lat: number; lng: number };

export function milesBetween(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

type Place = { type: string; double_up: boolean | null; lat: number | null; lng: number | null };

/** Selected chips combine with OR: a place shows if it matches any selected chip. */
export function matchesFilters(p: Place, active: string[]): boolean {
  if (active.length === 0) return true;
  return active.some((f) => (f === "double_up" ? !!p.double_up : p.type === f));
}

/** Filter by chips and radius (when an origin is known), then sort nearest first. */
export function nearbyPlaces<T extends Place>(
  places: T[],
  active: string[],
  origin: LatLng | null,
  radiusMiles: number,
): (T & { distance: number | null })[] {
  return places
    .filter((p) => matchesFilters(p, active))
    .map((p) => ({
      ...p,
      distance: origin && p.lat != null && p.lng != null ? milesBetween(origin, { lat: p.lat, lng: p.lng }) : null,
    }))
    .filter((p) => !origin || (p.distance != null && p.distance <= radiusMiles))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}
