import { createServerFn } from "@tanstack/react-start";

// Detroit, Hamtramck and Highland Park bounding box
const VIEWBOX = "-83.29,42.46,-82.91,42.25";

export const geocodeAddress = createServerFn({ method: "POST" })
  .inputValidator((input: { q: string }) => ({ q: String(input.q ?? "").slice(0, 200) }))
  .handler(async ({ data }) => {
    if (!data.q.trim()) return { ok: false as const, message: "Please enter an address." };
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1&viewbox=${VIEWBOX}&countrycodes=us&q=${encodeURIComponent(data.q)}`;
    const res = await fetch(url, { headers: { "User-Agent": "LetsEat-Detroit/1.0 (food access app)" } });
    if (!res.ok) return { ok: false as const, message: "Address search is busy. Try again in a moment." };
    const rows = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    const r = rows[0];
    if (!r) return { ok: false as const, message: "We couldn’t find that address in Detroit, Hamtramck or Highland Park." };
    return { ok: true as const, lat: Number(r.lat), lng: Number(r.lon), label: r.display_name };
  });
