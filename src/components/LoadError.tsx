import { Button } from "@/components/ui/button";

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="space-y-3 rounded-lg border border-border bg-card p-5 text-center">
      <h1 className="text-2xl font-semibold">We couldn’t load this page</h1>
      <p className="text-muted-foreground">Check your connection and try again.</p>
      <Button className="h-12 text-base" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
