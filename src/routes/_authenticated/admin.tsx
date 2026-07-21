import { useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  const links: Array<{ to: string; label: string }> = [
    { to: "/admin", label: "Features" },
    { to: "/admin/analytics", label: "Stats" },
    { to: "/admin/giveaways", label: "Giveaways" },
    { to: "/admin/partners", label: "Partners" },
    { to: "/admin/announcements", label: "Alerts" },
    { to: "/admin/settings", label: "Settings" },
    { to: "/", label: "View site" },
  ];
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-background/90 px-5 py-4 backdrop-blur">
        <Link to="/admin" onClick={() => setOpen(false)} className="text-sm font-bold uppercase tracking-[0.22em]">
          Diesel<span className="text-gold">Grit</span>
          <span className="ml-2 text-[10px] text-white/40">Admin</span>
        </Link>
        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          {links.slice(1).map((l) => (
            <Link key={l.to} to={l.to} className="text-eyebrow text-white/60 hover:text-white">
              {l.label}
            </Link>
          ))}
          <button onClick={signOut} className="flex items-center gap-1.5 text-eyebrow text-gold">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="md:hidden inline-flex size-10 items-center justify-center border border-white/15"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </header>
      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden sticky top-[57px] z-30 border-b border-white/5 bg-background/95 backdrop-blur">
          <nav className="flex flex-col divide-y divide-white/5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-5 py-4 text-eyebrow text-white/80"
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex items-center gap-2 px-5 py-4 text-left text-eyebrow text-gold"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </nav>
        </div>
      )}
      <Outlet />
    </div>
  );
}
