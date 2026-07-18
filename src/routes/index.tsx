import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { publishedFeaturesQuery, publicImageUrl } from "@/lib/queries";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: features = [] } = useQuery(publishedFeaturesQuery());
  const latest = features[0];
  const recent = features.slice(1, 5);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* Hero */}
      <section className="relative flex h-svh min-h-[640px] flex-col justify-end px-6 pb-14">
        <div className="absolute inset-0 -z-10">
          {latest?.hero_image ? (
            <img
              src={publicImageUrl(latest.hero_image) ?? ""}
              alt={latest.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_bottom,rgba(198,161,91,0.15),transparent_60%),linear-gradient(180deg,#111_0%,#000_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        </div>

        <div className="max-w-md">
          <div className="text-eyebrow mb-4 flex items-center gap-3 text-gold">
            <span className="h-px w-8 bg-gold" />
            {latest ? (
              <>Volume 01 · Feature Nº {String(latest.feature_number).padStart(3, "0")}</>
            ) : (
              <>New Publication · Volume 01</>
            )}
          </div>
          <h1 className="font-display text-[3.25rem] leading-[0.95] tracking-tight">
            REAL TRUCKS.
            <br />
            REAL <span className="italic text-gold">GRIT.</span>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            An editorial publication documenting the world's most uncompromising diesel builds.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              to={latest ? "/features/$number" : "/features"}
              params={latest ? { number: String(latest.feature_number) } : undefined}
              className="group flex w-full items-center justify-between border border-white bg-white px-5 py-4 text-eyebrow text-background transition-colors hover:bg-gold hover:border-gold"
            >
              Latest Feature
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              to="/submit"
              className="group flex w-full items-center justify-between border border-white/20 px-5 py-4 text-eyebrow"
            >
              Submit Your Truck
              <ArrowUpRight className="size-4 text-gold" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest featured */}
      {latest && (
        <section className="border-t border-white/5 px-6 py-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-eyebrow text-gold">Cover Story</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight">Currently Featured</h2>
            </div>
            <span className="font-display text-4xl italic text-white/15">
              {String(latest.feature_number).padStart(3, "0")}
            </span>
          </div>
          <Link
            to="/features/$number"
            params={{ number: String(latest.feature_number) }}
            className="group block"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
              {latest.hero_image && (
                <img
                  src={publicImageUrl(latest.hero_image) ?? ""}
                  alt={latest.title}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5">
                <p className="text-eyebrow text-gold">{latest.owner_instagram}</p>
                <h3 className="mt-1 font-display text-2xl leading-tight">{latest.title}</h3>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-eyebrow">
              <span className="text-white/50">
                {latest.truck_year} {latest.make} {latest.model}
              </span>
              <span className="text-gold">Read Feature →</span>
            </div>
          </Link>
        </section>
      )}

      {/* Recent grid */}
      {recent.length > 0 && (
        <section className="border-t border-white/5 px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-eyebrow text-gold">The Archive</p>
              <h2 className="mt-2 font-display text-3xl">Recent Features</h2>
            </div>
            <Link to="/features" className="text-eyebrow text-white/60">
              View all →
            </Link>
          </div>
          <div className="space-y-12">
            {recent.map((f) => (
              <Link
                key={f.id}
                to="/features/$number"
                params={{ number: String(f.feature_number) }}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                  {f.hero_image && (
                    <img
                      src={publicImageUrl(f.hero_image) ?? ""}
                      alt={f.title}
                      className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                    />
                  )}
                  <div className="absolute left-4 top-4 bg-background/80 px-3 py-1 text-[10px] font-bold tracking-widest backdrop-blur">
                    Nº {String(f.feature_number).padStart(3, "0")}
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-eyebrow text-gold truncate">{f.owner_instagram}</p>
                    <h3 className="mt-1 font-display text-xl leading-tight">{f.title}</h3>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-xs">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Submit CTA */}
      <section className="border-t border-white/5 bg-gold px-6 py-20 text-background">
        <p className="text-eyebrow opacity-70">Built for the bold</p>
        <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-tight">
          Think your rig has what it takes?
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-80">
          We're scouting the cleanest, most capable diesel builds. Submit yours for editorial review.
        </p>
        <Link
          to="/submit"
          className="mt-8 inline-flex items-center gap-3 border border-background bg-background px-6 py-4 text-eyebrow text-gold"
        >
          Submit Your Build <ArrowUpRight className="size-4" />
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
