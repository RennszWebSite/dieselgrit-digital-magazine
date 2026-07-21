import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Eye, Instagram } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { ReadingProgress } from "@/components/reading-progress";
import { FeatureActions } from "@/components/feature-actions";
import {
  featureByNumberQuery,
  featurePartnersDetailsQuery,
  relatedFeaturesQuery,
  publicImageUrl,
} from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/features/$number")({
  component: FeatureDetail,
  loader: async ({ params, context }) => {
    const num = parseInt(params.number, 10);
    if (isNaN(num)) throw notFound();
    const data = await context.queryClient.ensureQueryData(featureByNumberQuery(num));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    const f = loaderData?.feature;
    if (!f) return { meta: [{ title: "Feature not found — DieselGrit" }] };
    const title = f.seo_title || `${f.title} — DieselGrit Nº ${String(f.feature_number).padStart(3, "0")}`;
    const desc =
      f.seo_description ||
      (f.story
        ? f.story.replace(/\s+/g, " ").slice(0, 155).trim() + "…"
        : `${[f.truck_year, f.make, f.model].filter(Boolean).join(" ")} — a DieselGrit feature.`);
    const url = `https://grit-gloss-forge.lovable.app/features/${params.number}`;
    const image = publicImageUrl(f.hero_image) ?? undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: f.title,
            description: desc,
            image: image ? [image] : undefined,
            datePublished: f.publish_date,
            author: { "@type": "Person", name: f.owner_instagram },
            publisher: { "@type": "Organization", name: "DieselGrit" },
          }),
        },
      ],
    };
  },
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
  const { data } = useQuery({
    ...featureByNumberQuery(num),
    enabled: !isNaN(num),
  });
  if (!data) throw notFound();
  const { feature: f, prev, next } = data;
  const gallery = f.gallery_images ?? [];
  const specs = f.build_specs ?? [];
  const sponsors = f.sponsors ?? [];
  const { data: partners = [] } = useQuery(featurePartnersDetailsQuery(f.id));
  const { data: related = [] } = useQuery(
    relatedFeaturesQuery(f.id, { category: f.category ?? null, make: f.make ?? null }),
  );

  useEffect(() => {
    supabase.rpc("increment_feature_views", { _feature_number: f.feature_number }).then(() => {});
  }, [f.feature_number]);

  const readMinutes = f.story ? Math.max(1, Math.round(f.story.split(/\s+/).length / 220)) : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <ReadingProgress />

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
          <div className="flex items-center gap-3 text-eyebrow text-gold">
            <span>Feature Nº {String(f.feature_number).padStart(3, "0")}</span>
            {f.category && (
              <>
                <span className="text-white/30">·</span>
                <span className="text-white/70">{f.category}</span>
              </>
            )}
          </div>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight">
            {f.title}
          </h1>
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-white/60">
            {[f.truck_year, f.make, f.model].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={`https://instagram.com/${f.owner_instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-eyebrow text-gold"
            >
              <Instagram className="size-4" />
              {f.owner_instagram}
            </a>
            {readMinutes > 0 && (
              <span className="text-eyebrow text-white/40">{readMinutes} min read</span>
            )}
            {typeof f.view_count === "number" && f.view_count > 0 && (
              <span className="inline-flex items-center gap-1.5 text-eyebrow text-white/40">
                <Eye className="size-3.5" /> {f.view_count.toLocaleString()}
              </span>
            )}
            <Link
              to="/features/$number/magazine"
              params={{ number: String(f.feature_number) }}
              className="inline-flex items-center gap-1.5 text-eyebrow text-gold"
            >
              <BookOpen className="size-3.5" /> Magazine view
            </Link>
          </div>
          <FeatureActions
            featureNumber={f.feature_number}
            title={f.title}
            initialLikes={f.like_count ?? 0}
          />
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

      {partners.length > 0 && (
        <section className="border-t border-white/5 px-6 py-16">
          <p className="text-eyebrow text-gold text-center">Build Partners</p>
          <ul className="mt-8 grid grid-cols-2 gap-4">
            {partners.map((p) => {
              const logo = publicImageUrl(p.logo_url, "partner-logos");
              const inner = (
                <div className="flex h-full flex-col items-center justify-center gap-3 border border-white/10 bg-white/[0.02] p-5 text-center">
                  {logo ? (
                    <img src={logo} alt={p.name} className="h-10 w-auto object-contain" loading="lazy" />
                  ) : (
                    <span className="font-display text-lg text-white/80">{p.name}</span>
                  )}
                  {logo && <span className="text-eyebrow text-white/50">{p.name}</span>}
                  {p.category && (
                    <span className="text-[10px] uppercase tracking-widest text-gold/70">
                      {p.category}
                    </span>
                  )}
                </div>
              );
              const href = p.website || (p.instagram ? `https://instagram.com/${p.instagram.replace("@", "")}` : null);
              return (
                <li key={p.id}>
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer" className="block h-full">
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
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
      {related.length > 0 && (
        <section className="border-t border-white/5 px-6 py-16">
          <p className="text-eyebrow text-gold">More From The Archive</p>
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {related.slice(0, 4).map((r) => (
              <li key={r.id}>
                <Link
                  to="/features/$number"
                  params={{ number: String(r.feature_number) }}
                  className="group block"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-white/5">
                    {r.hero_image && (
                      <img
                        src={publicImageUrl(r.hero_image) ?? ""}
                        alt={r.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-eyebrow text-gold">
                    Nº {String(r.feature_number).padStart(3, "0")}
                  </p>
                  <h3 className="mt-0.5 line-clamp-2 font-display text-base leading-tight">
                    {r.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <SiteFooter />
    </div>
  );
}
