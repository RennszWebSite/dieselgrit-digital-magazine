import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft } from "lucide-react";
import {
  featureByNumberQuery,
  featurePartnersDetailsQuery,
  publicImageUrl,
} from "@/lib/queries";

export const Route = createFileRoute("/features/$number/magazine")({
  component: MagazineView,
  loader: async ({ params, context }) => {
    const num = parseInt(params.number, 10);
    if (isNaN(num)) throw notFound();
    const data = await context.queryClient.ensureQueryData(featureByNumberQuery(num));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.feature
          ? `${loaderData.feature.title} — Magazine — DieselGrit`
          : "Magazine — DieselGrit",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background px-6 pt-32 text-center">
      <p className="text-eyebrow text-gold">404</p>
      <h1 className="mt-4 font-display text-4xl">Not found</h1>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background px-6 pt-32 text-center">
      <p className="text-sm text-red-400">{error.message}</p>
    </div>
  ),
});

function MagazineView() {
  const { feature: f } = Route.useLoaderData();
  const { data: partners = [] } = useQuery(featurePartnersDetailsQuery(f.id));
  const num = String(f.feature_number).padStart(3, "0");
  const hero = publicImageUrl(f.hero_image);

  return (
    <div className="min-h-screen bg-white text-black print:bg-white">
      {/* Toolbar (hidden in print) */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-white/95 px-5 py-3 backdrop-blur print:hidden">
        <Link
          to="/features/$number"
          params={{ number: String(f.feature_number) }}
          className="flex items-center gap-1.5 text-eyebrow text-black/70"
        >
          <ArrowLeft className="size-3.5" /> Back
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 border border-black bg-black px-3 py-1.5 text-eyebrow text-white"
        >
          <Printer className="size-3.5" /> Print / Save PDF
        </button>
      </div>

      <div className="mx-auto max-w-[820px] px-6 py-10 print:py-0 print:px-0">
        {/* Cover */}
        <section className="relative aspect-[3/4] w-full overflow-hidden bg-black text-white print:aspect-[210/297]">
          {hero && <img src={hero} alt={f.title} className="h-full w-full object-cover opacity-90" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em]">
              <span>DieselGrit Magazine</span>
              <span>Vol. 01 · Nº {num}</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c6a15b]">
                {f.owner_instagram}
              </p>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
                {f.title}
              </h1>
              <p className="mt-3 text-sm uppercase tracking-[0.2em] opacity-80">
                {[f.truck_year, f.make, f.model].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="page-break mt-10 print:mt-0 print:px-10 print:py-14">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-black/60">
            <span className="h-px w-6 bg-black/60" /> Feature Nº {num}
          </div>
          <h2 className="mt-4 font-display text-4xl leading-tight">{f.title}</h2>
          {f.story && (
            <div className="mt-6 columns-1 gap-8 text-[15px] leading-[1.7] text-black/80 sm:columns-2">
              {f.story.split(/\n\n+/).map((p: string, i: number) => (
                <p key={i} className="mb-4 break-inside-avoid">
                  {p}
                </p>
              ))}
            </div>
          )}
        </section>

        {/* Specs */}
        {f.build_specs?.length > 0 && (
          <section className="page-break mt-14 print:mt-0 print:px-10 print:py-14">
            <h3 className="font-display text-2xl">Build Sheet</h3>
            <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {f.build_specs.map((s: { label: string; value: string }, i: number) => (
                <div key={i} className="flex justify-between border-b border-black/10 py-2">
                  <dt className="text-[10px] uppercase tracking-widest text-black/50">{s.label}</dt>
                  <dd className="text-sm">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Gallery */}
        {f.gallery_images?.length > 0 && (
          <section className="page-break mt-14 grid grid-cols-1 gap-2 print:mt-0 print:grid-cols-2 print:gap-1 print:p-10">
            {f.gallery_images.map((g: string, i: number) => {
              const src = publicImageUrl(g);
              return src ? (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-full break-inside-avoid object-cover"
                />
              ) : null;
            })}
          </section>
        )}

        {/* Partners */}
        {partners.length > 0 && (
          <section className="page-break mt-14 print:mt-0 print:p-10">
            <h3 className="font-display text-2xl">Build Partners</h3>
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
              {partners.map((p) => (
                <div key={p.id} className="text-sm">
                  <p className="font-semibold">{p.name}</p>
                  {p.instagram && <p className="text-xs text-black/60">{p.instagram}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-16 border-t border-black/10 py-6 text-center text-[10px] uppercase tracking-[0.3em] text-black/50 print:mt-0">
          DieselGrit Magazine — Vol. 01 · Nº {num}
        </footer>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          .page-break { page-break-before: always; }
        }
      `}</style>
    </div>
  );
}