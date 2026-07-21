import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { siteSettingsQuery } from "@/lib/queries";
import { NewsletterForm } from "@/components/newsletter-form";

const NAV = [
  { to: "/features", label: "Features" },
  { to: "/giveaways", label: "Giveaways" },
  { to: "/saved", label: "Saved" },
  { to: "/submit", label: "Submit" },
  { to: "/about", label: "About" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 transition-colors ${
          scrolled || open
            ? "border-b border-white/5 bg-background/85 backdrop-blur-md"
            : "bg-gradient-to-b from-background/60 to-transparent"
        }`}
      >
        <Link
          to="/"
          className="text-sm font-bold uppercase tracking-[0.22em]"
          onClick={() => setOpen(false)}
        >
          Diesel<span className="text-gold">Grit</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex items-center gap-2 text-gold"
        >
          <span className="h-px w-4 bg-gold" />
          <span className="text-eyebrow">{open ? "Close" : "Menu"}</span>
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-background pt-20 px-6 pb-10">
          <div className="flex flex-col gap-6">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="font-display text-5xl leading-none tracking-tight"
                activeProps={{ className: "text-gold" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-6">
            <span className="text-eyebrow text-white/40">Est. MMXXIV</span>
            <Link
              to={signedIn ? "/admin" : "/auth"}
              onClick={() => setOpen(false)}
              className="text-eyebrow text-gold"
            >
              {signedIn ? "Admin →" : "Editor Login →"}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export function SiteFooter() {
  const { data: settings } = useQuery(siteSettingsQuery());
  const socials: { href: string; label: string }[] = [];
  if (settings?.social_instagram)
    socials.push({
      href: `https://instagram.com/${settings.social_instagram.replace("@", "")}`,
      label: "Instagram",
    });
  if (settings?.social_youtube) socials.push({ href: settings.social_youtube, label: "YouTube" });
  if (settings?.social_tiktok) socials.push({ href: settings.social_tiktok, label: "TikTok" });
  return (
    <footer className="border-t border-white/5 px-6 py-14 text-center">
      <p className="text-eyebrow text-white/40 mb-6">
        {settings?.site_title ?? "DieselGrit"} Magazine
      </p>
      <div className="mx-auto mb-10 max-w-sm">
        <p className="text-eyebrow text-gold mb-3">The Dispatch</p>
        <p className="mb-4 text-xs text-white/50">
          New features, giveaways, and behind-the-scenes drops — straight to your inbox.
        </p>
        <div className="flex justify-center">
          <NewsletterForm />
        </div>
      </div>
      <div className="flex justify-center gap-6 mb-6 text-eyebrow text-white/60">
        <Link to="/features">Features</Link>
        <Link to="/saved">Saved</Link>
        <Link to="/submit">Submit</Link>
        <Link to="/about">About</Link>
      </div>
      {socials.length > 0 && (
        <div className="mb-6 flex justify-center gap-5 text-eyebrow text-gold">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      )}
      {settings?.footer_note && (
        <p className="mb-4 text-xs text-white/50">{settings.footer_note}</p>
      )}
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">
        © {new Date().getFullYear()} — Built with grit.
      </p>
    </footer>
  );
}
