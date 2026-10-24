import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Double Up and SNAP — Let’s Eat" },
      { name: "description", content: "Plain-language info about Double Up Food Bucks and SNAP in Michigan." },
      { property: "og:title", content: "About Double Up and SNAP — Let’s Eat" },
      { property: "og:description", content: "How Double Up Food Bucks works." },
    ],
  }),
  component: About,
});

function About() {
  const { data: rules = [] } = useQuery({
    queryKey: ["rules"],
    queryFn: async () =>
      (await supabase.from("program_rules").select("*").order("effective_date", { ascending: false })).data ?? [],
  });
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">About Double Up</h1>
      <p>
        When you use SNAP to buy fresh fruits and vegetables at a Double Up site, you get extra
        money to spend on more fruits and vegetables. Let’s Eat never asks for your card number or
        balance.
      </p>
      <ul className="space-y-3">
        {rules.map((r) => (
          <li key={r.id} className="rounded-lg border border-border bg-card p-4">
            <p className="font-semibold">{r.program}: {r.rule_key.replaceAll("_", " ")} = {r.rule_value}</p>
            <p className="text-sm text-muted-foreground">
              As of {r.effective_date} ·{" "}
              <a href={r.source_url} className="underline" target="_blank" rel="noreferrer">Source</a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
