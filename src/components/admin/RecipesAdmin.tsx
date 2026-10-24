import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function RecipesAdmin() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-recipes"],
    queryFn: async () =>
      (await supabase.from("recipes").select("id,title,status,servings,cuisines(name),recipe_ingredients(est_cost,is_double_up_eligible)").order("title")).data ?? [],
  });

  const setStatus = async (id: string, status: "draft" | "published") => {
    const { error } = await supabase.from("recipes").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "published" ? "Published" : "Moved to drafts");
    qc.invalidateQueries({ queryKey: ["admin-recipes"] });
  };

  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const ings = r.recipe_ingredients ?? [];
        const total = ings.reduce((a, i) => a + Number(i.est_cost ?? 0), 0);
        const missing = ings.filter((i) => i.est_cost == null).length;
        return (
          <li key={r.id} className="space-y-2 rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <Badge variant={r.status === "published" ? "default" : "secondary"}>{r.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {r.cuisines?.name} · {ings.length} ingredients · about ${(total / r.servings).toFixed(2)}/serving
              {missing > 0 && ` · ${missing} missing cost`}
            </p>
            <Button size="sm" variant="secondary" onClick={() => setStatus(r.id, r.status === "published" ? "draft" : "published")}>
              {r.status === "published" ? "Unpublish" : "Publish"}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
