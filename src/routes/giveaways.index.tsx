import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gift } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Countdown } from "@/components/countdown";
import { activeGiveawaysQuery, publicImageUrl } from "@/lib/queries";

export const Route = createFileRoute("/giveaways/")({
  component: GiveawaysIndex,
  head: () => ({
    meta: [
      { title: "Giveaways — DieselGrit" },
      {
        name: "description",
        content: "Enter to win gear, parts, and experiences from the DieselGrit editorial desk.",
      },
      { property: "og:title", content: "Giveaways — DieselGrit" },
      {
        property: "og:description",
        content: "Enter to win gear, parts, and experiences from the DieselGrit editorial desk.",
      },
      { property: "og:url", content: "https://grit-gloss-forge.lovable.app/giveaways" },
    ],
    links: [{ rel: "canonical", href: "https://grit-gloss-forge.lovable.app/giveaways" }],
  }),
});

function GiveawaysIndex() {
  const { data: giveaways = [], isLoading } = useQuery(activeGiveawaysQuery());
  const now = Date.now();
  const live = giveaways.filter((g) => new Date(g.ends_at).getTime() > now);
  const closed = giveaways.filter((g) => new Date(g.ends_at).getTime() <= now);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="px-6 pt-28 pb-8">
        <p className="text-eyebrow text-gold">The Prize Board</p>
        <h1 className="mt-3 font-display text-5xl leading-none tracking-tight">Giveaways</h1>
        <p className="mt-3 max-w-sm text-sm text-white/60">
          Gear, parts, and experiences from the DieselGrit editorial desk. Free to enter.
        </p>
      </header>

      <section className="px-6 pb-16">
        {isLoading ? (
          <p className="text-eyebrow text-white/40">Loading…</p>
        ) : live.length === 0 && closed.length === 0 ? (
          <div className="border border-white/10 bg-white/[0.02] p-10 text-center">
            <Gift className="mx-auto size-8 text-gold" />
            <p className="mt-4 font-display text-2xl">No giveaways right now</p>
            <p className="mt-2 text-sm text-white/50">
              Follow the magazine — the next drop won't be quiet.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {live.map((g) => (
              <GiveawayCard key={g.id} g={g} />
            ))}
            {closed.length > 0 && (
              <div className="pt-6">
                <p className="text-eyebrow text-white/40 mb-4">Closed</p>
                <div className="space-y-4">
                  {closed.map((g) => (
                    <Link
                      key={g.id}
                      to="/giveaways/$slug"
                      params={{ slug: g.slug }}
                      className="flex items-center gap-4 border border-white/10 bg-white/[0.02] p-3 opacity-70"
                    >
                      <div className="size-16 shrink-0 overflow-hidden bg-white/5">
                        {g.hero_image && (
                          <img
                            src={publicImageUrl(g.hero_image) ?? ""}
                            alt=""
                            className="h-full w-full object-cover grayscale"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-eyebrow text-white/40">Closed</p>
                        <h3 className="mt-0.5 truncate font-display text-lg">{g.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}

function GiveawayCard({ g }: { g: import("@/lib/queries").Giveaway }) {
  return (
    <Link
      to="/giveaways/$slug"
      params={{ slug: g.slug }}
      className="group block overflow-hidden border border-white/10"
    >
      <div className="relative aspect-[4/5] bg-white/5">
        {g.hero_image && (
          <img
            src={publicImageUrl(g.hero_image) ?? ""}
            alt={g.title}
            className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5">
          <p className="text-eyebrow text-gold">Win This</p>
          <h3 className="mt-1 font-display text-3xl leading-tight">{g.title}</h3>
          <p className="mt-1 text-sm text-white/70">{g.prize}</p>
          <div className="mt-4">
            <Countdown endsAt={g.ends_at} />
          </div>
        </div>
      </div>
    </Link>
  );
}