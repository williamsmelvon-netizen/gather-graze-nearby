import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type Source = Database["public"]["Tables"]["sources"]["Row"];
const TYPES = ["grocery", "farmers_market", "farm_stand", "csa", "garden_store"];
const FIELDS: { key: keyof Source; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "address", label: "Address" },
  { key: "hours_note", label: "Hours" },
  { key: "season_note", label: "Season" },
  { key: "website", label: "Website" },
  { key: "source_url", label: "Source URL (where this info came from)" },
  { key: "contact_name", label: "Contact name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
];

export const today = () => new Date().toISOString().slice(0, 10);

export function isStale(date: string | null) {
  if (!date) return true;
  return Date.now() - new Date(date).getTime() > 180 * 86400000;
}

export function SourcesAdmin() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-sources"],
    queryFn: async () => (await supabase.from("sources").select("*").order("name")).data ?? [],
  });
  const [editing, setEditing] = useState<Partial<Source> | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-sources"] });

  const save = async (s: Partial<Source>) => {
    const { id, created_at, ...rest } = s;
    const res = id
      ? await supabase.from("sources").update(rest).eq("id", id)
      : await supabase.from("sources").insert({ name: rest.name ?? "", type: rest.type ?? "farm_stand", ...rest });
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Saved");
    setEditing(null);
    refresh();
  };

  if (editing)
    return (
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          save(editing);
        }}
      >
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input
              id={f.key}
              className="h-11"
              value={(editing[f.key] as string) ?? ""}
              onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value || null })}
              required={f.key === "name"}
            />
          </div>
        ))}
        <div className="space-y-1">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            className="h-11 w-full rounded-md border border-input bg-card px-3"
            value={editing.type ?? "farm_stand"}
            onChange={(e) => setEditing({ ...editing, type: e.target.value })}
          >
            {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
          </select>
        </div>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" className="h-5 w-5" checked={!!editing.double_up} onChange={(e) => setEditing({ ...editing, double_up: e.target.checked })} />
          Double Up site
        </label>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" className="h-5 w-5" checked={editing.accepts_snap ?? true} onChange={(e) => setEditing({ ...editing, accepts_snap: e.target.checked })} />
          Accepts SNAP
        </label>
        <div className="space-y-1">
          <Label htmlFor="verified_on">Last verified</Label>
          <Input id="verified_on" type="date" className="h-11" value={editing.verified_on ?? ""} onChange={(e) => setEditing({ ...editing, verified_on: e.target.value || null })} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="notes">Verification notes</Label>
          <Textarea id="notes" value={editing.verification_notes ?? ""} onChange={(e) => setEditing({ ...editing, verification_notes: e.target.value || null })} />
        </div>
        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
        </div>
      </form>
    );

  const needs = rows.filter((r) => isStale(r.verified_on)).length;
  return (
    <div className="space-y-3">
      <p>{needs} of {rows.length} places need checking (never verified or older than 6 months).</p>
      <Button onClick={() => setEditing({ type: "farm_stand", accepts_snap: true })}>Add a place</Button>
      <ul className="space-y-3">
        {rows.map((s) => (
          <li key={s.id} className="space-y-2 rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold">{s.name}</h3>
              {isStale(s.verified_on) ? <Badge variant="destructive">Needs check</Badge> : <Badge>Verified</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              Last verified: {s.verified_on ?? "never"} · Source:{" "}
              {s.source_url ? <a className="underline" href={s.source_url} target="_blank" rel="noreferrer">link</a> : "none"}
              {" "}· Contact: {[s.contact_name, s.phone, s.email].filter(Boolean).join(", ") || "none"}
            </p>
            {s.verification_notes && <p className="text-sm">{s.verification_notes}</p>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(s)}>Edit</Button>
              <Button size="sm" onClick={() => save({ id: s.id, verified_on: today() })}>Mark verified today</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
