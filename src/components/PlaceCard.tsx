import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail, MapPin, Phone, ShieldCheck, Sprout, User } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

export type Place = Database["public"]["Tables"]["sources"]["Row"] & { distance: number | null };

export const typeLabel: Record<string, string> = {
  grocery: "Grocery",
  farmers_market: "Farmers market",
  farm_stand: "Farm stand",
  csa: "CSA",
  garden_store: "Garden store",
};

const hostOf = (url: string) =>
  url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");

const linkClass =
  "inline-flex min-h-11 items-center gap-2 rounded-md underline underline-offset-4 break-all";

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2">
      <span aria-hidden className="mt-1 shrink-0 text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 space-y-0.5">{children}</dd>
      </div>
    </div>
  );
}

export function PlaceCard({
  place,
  selected,
  onSelect,
}: {
  place: Place;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const source = place.source_url || place.website;
  const checked = place.verified_on
    ? `Last checked ${place.verified_on}`
    : "Not yet checked — call ahead";

  return (
    <li
      id={`place-${place.id}`}
      className={`rounded-lg border bg-card p-4 ${
        selected ? "border-primary ring-2 ring-primary" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(place.id)}
        aria-pressed={selected}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold">{place.name}</h2>
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {place.double_up && <Badge className="text-sm">Double Up</Badge>}
            {!place.double_up && place.accepts_snap && (
              <Badge variant="outline" className="text-sm">
                SNAP
              </Badge>
            )}
          </div>
        </div>
        <p className="text-muted-foreground">
          {typeLabel[place.type] ?? place.type}
          {place.distance != null && ` · ${place.distance.toFixed(1)} mi`}
        </p>
      </button>

      <dl className="mt-3 space-y-3">
        <Row icon={<MapPin className="h-5 w-5" />} label="Address">
          <p>{place.address ?? "Address not listed"}</p>
        </Row>

        <Row icon={<User className="h-5 w-5" />} label="Contact">
          {place.contact_name && <p>{place.contact_name}</p>}
          {place.phone && (
            <p>
              <a className={linkClass} href={`tel:${place.phone}`}>
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                {place.phone}
              </a>
            </p>
          )}
          {place.email && (
            <p>
              <a className={linkClass} href={`mailto:${place.email}`}>
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                {place.email}
              </a>
            </p>
          )}
          {!place.contact_name && !place.phone && !place.email && (
            <p className="text-muted-foreground">Contact not listed</p>
          )}
        </Row>

        {(place.hours_note || place.season_note) && (
          <Row icon={<Sprout className="h-5 w-5" />} label="Hours & season">
            {place.hours_note && <p>{place.hours_note}</p>}
            {place.season_note && <p className="text-sm text-muted-foreground">{place.season_note}</p>}
          </Row>
        )}

        <Row icon={<ExternalLink className="h-5 w-5" />} label="Website">
          {place.website ? (
            <a className={linkClass} href={place.website} target="_blank" rel="noreferrer">
              {hostOf(place.website)}
            </a>
          ) : (
            <p className="text-muted-foreground">Website not listed</p>
          )}
        </Row>

        <Row icon={<ShieldCheck className="h-5 w-5" />} label="Verification source">
          <p className="text-sm">{checked}</p>
          {source && (
            <a className={linkClass} href={source} target="_blank" rel="noreferrer">
              {hostOf(source)}
            </a>
          )}
          {place.verification_notes && (
            <p className="text-sm text-muted-foreground">{place.verification_notes}</p>
          )}
        </Row>
      </dl>
    </li>
  );
}
