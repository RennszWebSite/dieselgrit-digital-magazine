import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Trash2 } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { publishedFeaturesQuery, publicImageUrl } from "@/lib/queries";
import { useSaved } from "@/lib/bookmarks";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
  head: () => ({
    meta: [
      { title: "Saved Trucks — DieselGrit" },
      {
        name: "description",
        content: "Your personal garage of saved DieselGrit features.",
      },
      { property: "og:title", content: "Saved Trucks — DieselGrit" },
      {
        property: "og:description",
        content: "Your personal garage of saved DieselGrit features.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function SavedPage() {
  const { data: features = [] } = useQuery(publishedFeaturesQuery());
  const { saved, toggle } = useSaved();
  const list = saved
    .map((n) => features.find((f) => f.feature_number === n))
    .filter(Boolean) as typeof features;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="px-6 pt-28 pb-6">
        <p className="text-eyebrow text-gold">Your Garage</p>
        <h1 className="mt-3 font-display text-5xl leading-none tracking-tight">
          Saved Trucks
        </h1>
        <p className="mt-3 max-w-sm text-sm text-white/60">
          Every feature you've bookmarked, stored on this device.
        </p>
      </header>

      <section className="px-6 py-10">
        {list.length === 0 ? (
          <div className="border border-dashed border-white/10 py-20 text-center">
            <Bookmark className="mx-auto size-6 text-white/30" />
            <p className="mt-4 text-eyebrow text-white/50">Nothing saved yet</p>
            <Link
              to="/features"
              className="mt-6 inline-block text-eyebrow text-gold"
            >
              Browse the archive →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {list.map((f) => (
              <div key={f.id} className="group relative">
                <Link
                  to="/features/$number"
                  params={{ number: String(f.feature_number) }}
                  className="block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                    {f.hero_image && (
                      <img
                        src={publicImageUrl(f.hero_image) ?? ""}
                        alt={f.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute left-4 top-4 bg-background/80 px-3 py-1 text-[10px] font-bold tracking-widest backdrop-blur">
                      Nº {String(f.feature_number).padStart(3, "0")}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-eyebrow text-gold">{f.owner_instagram}</p>
                    <h3 className="mt-1 font-display text-xl">{f.title}</h3>
                  </div>
                </Link>
                <button
                  onClick={() => toggle(f.feature_number)}
                  className="absolute right-3 top-3 grid size-9 place-items-center bg-background/80 text-white/70 backdrop-blur"
                  aria-label="Remove"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}