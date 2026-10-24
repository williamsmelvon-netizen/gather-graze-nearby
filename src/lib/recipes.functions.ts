import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Public read client created per request; runs on the app server so shoppers'
// browsers never need to reach the database host directly.
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listRecipes = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [r, c] = await Promise.all([
    sb
      .from("recipes")
      .select("id,title,description,servings,prep_minutes,cook_minutes,tags,cuisines(name)")
      .eq("status", "published")
      .order("title"),
    sb.from("cuisines").select("id,name").order("sort_order"),
  ]);
  if (r.error) throw new Error("We couldn’t load recipes right now.");
  if (c.error) throw new Error("We couldn’t load cuisines right now.");
  return { recipes: r.data ?? [], cuisines: c.data ?? [] };
});

export const getHomeData = createServerFn({ method: "GET" })
  .inputValidator((d: { month: number }) => ({ month: Math.min(12, Math.max(1, Math.trunc(Number(d.month)) || 1)) }))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [c, f, p] = await Promise.all([
      sb.from("cuisines").select("*").order("sort_order"),
      sb
        .from("recipes")
        .select("id,title,description,prep_minutes,cook_minutes,cuisines(name)")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6),
      sb.from("produce").select("name").contains("season_months", [data.month]),
    ]);
    if (c.error || f.error || p.error) throw new Error("We couldn’t load this page right now.");
    return { cuisines: c.data ?? [], featured: f.data ?? [], inSeason: p.data ?? [] };
  });

export const getCuisine = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => ({ id: String(d.id).slice(0, 64) }))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [c, r] = await Promise.all([
      sb.from("cuisines").select("*").eq("id", data.id).maybeSingle(),
      sb.from("recipes").select("*").eq("cuisine_id", data.id).eq("status", "published"),
    ]);
    if (c.error || r.error) throw new Error("We couldn’t load these recipes right now.");
    return { cuisine: c.data, recipes: r.data ?? [] };
  });

export const getRecipe = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => ({ id: String(d.id).slice(0, 64) }))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [r, i] = await Promise.all([
      sb.from("recipes").select("*").eq("id", data.id).eq("status", "published").maybeSingle(),
      sb.from("recipe_ingredients").select("*").eq("recipe_id", data.id),
    ]);
    if (r.error || i.error) throw new Error("We couldn’t load this recipe right now.");
    return { recipe: r.data, ingredients: i.data ?? [] };
  });

export const saveList = createServerFn({ method: "POST" })
  .inputValidator((d: { deviceId: string; ids: string[] }) => ({
    deviceId: String(d.deviceId).slice(0, 100),
    ids: (Array.isArray(d.ids) ? d.ids : []).slice(0, 100).map(String),
  }))
  .handler(async ({ data }) => {
    const { error } = await publicClient().rpc("save_shopping_list", {
      _device_id: data.deviceId,
      _recipe_ids: data.ids,
    });
    return { ok: !error };
  });
