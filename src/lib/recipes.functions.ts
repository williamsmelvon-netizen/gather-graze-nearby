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
