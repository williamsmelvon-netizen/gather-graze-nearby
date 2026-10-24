import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Let’s Eat" },
      { name: "description", content: "Let’s Eat staff tools." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — Let’s Eat" },
      { property: "og:description", content: "Staff tools." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        const { data: r } = await supabase.from("user_roles").select("role").eq("role", "admin");
        setIsAdmin(!!r?.length);
      }
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!user)
    return (
      <form
        className="mx-auto max-w-sm space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          setError(error?.message ?? "");
        }}
      >
        <h1 className="text-3xl font-semibold">Staff sign in</h1>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="h-12" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" className="h-12" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="h-12 w-full">Sign in</Button>
      </form>
    );

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Admin</h1>
      {isAdmin === false && <p>This account doesn’t have admin access.</p>}
      {isAdmin && <p>Tools for sources, produce, recipes and program rules are coming next.</p>}
      <Button variant="secondary" onClick={() => supabase.auth.signOut()}>Sign out</Button>
    </div>
  );
}
