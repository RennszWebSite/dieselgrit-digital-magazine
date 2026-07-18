import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site-nav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Editor Login — DieselGrit" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
        <p className="text-eyebrow text-gold">Editor Access</p>
        <h1 className="mt-3 font-display text-4xl">Sign in</h1>
        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div>
            <label className="text-eyebrow block text-white/60 mb-1">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-white/10 bg-transparent py-2 text-base outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="text-eyebrow block text-white/60 mb-1">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-white/10 bg-transparent py-2 text-base outline-none focus:border-gold"
            />
          </div>
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 bg-gold py-4 text-eyebrow text-background disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </button>
          <p className="text-[11px] text-white/40 text-center">
            Editor accounts are created by DieselGrit staff.
          </p>
        </form>
      </div>
    </div>
  );
}
