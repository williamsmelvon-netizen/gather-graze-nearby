import { Link } from "@tanstack/react-router";
import { Home, MapPin, ShoppingBasket, Info, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/recipes", label: "Recipes", icon: UtensilsCrossed },
  { to: "/nearby", label: "Nearby", icon: MapPin },
  { to: "/shopping-list", label: "List", icon: ShoppingBasket },
  { to: "/about", label: "About", icon: Info },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <header className="flex items-center justify-between px-4 py-4">
        <Link to="/" className="font-display text-2xl font-bold text-primary">
          Let’s Eat
        </Link>
      </header>
      <main className="flex-1 px-4 pb-24">{children}</main>
      <footer className="px-4 pb-28 text-sm text-muted-foreground">
        Program rules change. Confirm with the market or store, or at michigan.gov. Prices are
        estimates.
      </footer>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 border-t border-border bg-card"
      >
        <ul className="mx-auto grid max-w-2xl grid-cols-5">
          {nav.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex min-h-16 flex-col items-center justify-center gap-1 text-sm text-muted-foreground [&.active]:font-bold [&.active]:text-primary"
              >
                <Icon className="h-6 w-6" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
