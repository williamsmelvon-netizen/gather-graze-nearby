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

export const listSources = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("sources").select("*").order("name");
  if (error) throw new Error("We couldn’t load places right now.");
  return data ?? [];
});

export const getListIngredients = createServerFn({ method: "GET" })
  .inputValidator((d: { ids: string[] }) => ({
    ids: (Array.isArray(d.ids) ? d.ids : []).slice(0, 100).map((id) => String(id).slice(0, 64)),
  }))
  .handler(async ({ data }) => {
    if (data.ids.length === 0) return [];
    const { data: rows, error } = await publicClient()
      .from("recipe_ingredients")
      .select("*")
      .in("recipe_id", data.ids);
    if (error) throw new Error("We couldn’t load your list right now.");
    return rows ?? [];
  });
