import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-background/90 px-5 py-4 backdrop-blur">
        <Link to="/admin" className="text-sm font-bold uppercase tracking-[0.22em]">
          Diesel<span className="text-gold">Grit</span>
          <span className="ml-2 text-[10px] text-white/40">Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/admin/giveaways" className="text-eyebrow text-white/60">
            Giveaways
          </Link>
          <Link to="/admin/partners" className="text-eyebrow text-white/60">
            Partners
          </Link>
          <Link to="/" className="text-eyebrow text-white/60">
            View site
          </Link>
          <button onClick={signOut} className="flex items-center gap-1.5 text-eyebrow text-gold">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
