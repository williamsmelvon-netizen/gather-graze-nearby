import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProduceAdmin() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-produce"],
    queryFn: async () => (await supabase.from("produce").select("*").order("name")).data ?? [],
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>, id?: string) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const months = String(f.get("months") ?? "")
      .split(",").map((m) => parseInt(m.trim())).filter((m) => m >= 1 && m <= 12);
    const row = {
      name: String(f.get("name")),
      typical_unit: String(f.get("unit") || "") || null,
      est_price_per_unit: f.get("price") ? Number(f.get("price")) : null,
      season_months: months,
    };
    const res = id
      ? await supabase.from("produce").update(row).eq("id", id)
      : await supabase.from("produce").insert(row);
    if (res.error) return toast.error(res.error.message);
    toast.success("Saved");
    if (!id) e.currentTarget.reset();
    qc.invalidateQueries({ queryKey: ["admin-produce"] });
  };

  const Row = ({ p }: { p?: (typeof rows)[number] }) => (
    <form onSubmit={(e) => onSubmit(e, p?.id)} className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-card p-3">
      <Input aria-label="Name" name="name" defaultValue={p?.name} placeholder="Name" required className="col-span-2 h-11" />
      <Input aria-label="Price per unit" name="price" type="number" step="0.01" defaultValue={p?.est_price_per_unit ?? ""} placeholder="Price $" className="h-11" />
      <Input aria-label="Unit" name="unit" defaultValue={p?.typical_unit ?? ""} placeholder="Unit (lb, bunch)" className="h-11" />
      <Input aria-label="Season months" name="months" defaultValue={p?.season_months?.join(", ") ?? ""} placeholder="Months, e.g. 6, 7, 8" className="col-span-2 h-11" />
      <Button type="submit" size="sm" className="col-span-2">{p ? "Save" : "Add produce"}</Button>
    </form>
  );

  return (
    <div className="space-y-3">
      <Row />
      {rows.map((p) => <Row key={p.id} p={p} />)}
    </div>
  );
}
