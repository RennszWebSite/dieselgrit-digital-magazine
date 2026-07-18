import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Instagram } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { featureByNumberQuery, publicImageUrl } from "@/lib/queries";

export const Route = createFileRoute("/features/$number")({
  component: FeatureDetail,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="px-6 pt-40 pb-20 text-center">
        <p className="text-eyebrow text-gold">404</p>
        <h1 className="mt-4 font-display text-4xl">Feature not found</h1>
        <Link to="/features" className="mt-8 inline-block text-eyebrow text-gold">
          Back to archive →
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen bg-background px-6 pt-40 text-center">
      <SiteNav />
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-2 text-sm text-white/60">{error.message}</p>
      <button onClick={reset} className="mt-6 text-eyebrow text-gold">
        Retry
      </button>
    </div>
  ),
});

function FeatureDetail() {
  const { number } = Route.useParams();
  const num = parseInt(number, 10);
  const { data, isLoading } = useQuery({
    ...featureByNumberQuery(num),
    enabled: !isNaN(num),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="px-6 pt-40 text-eyebrow text-white/40">Loading…</div>
      </div>
    );
  }
  if (!data) throw notFound();
  const { feature: f, prev, next } = data;
  const gallery = f.gallery_images ?? [];
  const specs = f.build_specs ?? [];
  const sponsors = f.sponsors ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="relative h-svh min-h-[560px]">
        <div className="absolute inset-0">
          {f.hero_image && (
            <img
              src={publicImageUrl(f.hero_image) ?? ""}
              alt={f.title}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        </div>
        <div className="relative flex h-full flex-col justify-end px-6 pb-14">
          <p className="text-eyebrow text-gold">
            Feature Nº {String(f.feature_number).padStart(3, "0")}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight">
            {f.title}
          </h1>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-white/60">
            {[f.truck_year, f.make, f.model].filter(Boolean).join(" · ")}
          </p>
          <a
            href={`https://instagram.com/${f.owner_instagram.replace("@", "")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-eyebrow text-gold"
          >
            <Instagram className="size-4" />
            {f.owner_instagram}
          </a>
        </div>
      </section>

      {f.story && (
        <section className="border-t border-white/5 px-6 py-16">
          <p className="text-eyebrow text-gold">The Story</p>
          <div className="mt-6 space-y-5 text-[15px] leading-[1.8] text-white/80">
            {f.story.split(/\n\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="border-t border-white/5 py-16">
          <p className="px-6 text-eyebrow text-gold">Gallery</p>
          <div className="mt-6 space-y-3">
            {gallery.map((src, i) => (
              <img
                key={i}
                src={publicImageUrl(src) ?? ""}
                alt={`${f.title} — ${i + 1}`}
                className="w-full object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </section>
      )}

      {specs.length > 0 && (
        <section className="border-t border-white/5 bg-card px-6 py-16">
          <p className="text-eyebrow text-gold text-center">Build Specifications</p>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
            {specs.map((s, i) => (
              <div key={i}>
                <dt className="text-[10px] uppercase tracking-widest text-white/40">
                  {s.label}
                </dt>
                <dd className="mt-1 text-sm font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {sponsors.length > 0 && (
        <section className="border-t border-white/5 px-6 py-16">
          <p className="text-eyebrow text-gold text-center">Sponsors</p>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4">
            {sponsors.map((s, i) => (
              <li key={i}>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-display text-lg text-white/70 hover:text-gold"
                  >
                    {s.name}
                  </a>
                ) : (
                  <span className="font-display text-lg text-white/70">{s.name}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="grid grid-cols-2 border-t border-white/5">
        {prev ? (
          <Link
            to="/features/$number"
            params={{ number: String(prev) }}
            className="flex flex-col items-start gap-2 border-r border-white/5 p-6 hover:bg-white/5"
          >
            <span className="text-eyebrow flex items-center gap-2 text-white/40">
              <ArrowLeft className="size-3" /> Previous
            </span>
            <span className="font-display text-lg">
              Nº {String(prev).padStart(3, "0")}
            </span>
          </Link>
        ) : (
          <div className="border-r border-white/5 p-6 text-eyebrow text-white/20">
            End of archive
          </div>
        )}
        {next ? (
          <Link
            to="/features/$number"
            params={{ number: String(next) }}
            className="flex flex-col items-end gap-2 p-6 text-right hover:bg-white/5"
          >
            <span className="text-eyebrow flex items-center gap-2 text-white/40">
              Next <ArrowRight className="size-3" />
            </span>
            <span className="font-display text-lg">
              Nº {String(next).padStart(3, "0")}
            </span>
          </Link>
        ) : (
          <div className="p-6 text-right text-eyebrow text-white/20">Latest</div>
        )}
      </nav>
      <SiteFooter />
    </div>
  );
}
