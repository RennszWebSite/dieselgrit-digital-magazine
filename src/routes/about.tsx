import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site-nav";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — DieselGrit" },
      {
        name: "description",
        content:
          "DieselGrit is an editorial digital magazine documenting the world's most uncompromising diesel truck builds.",
      },
      { property: "og:title", content: "About — DieselGrit" },
      {
        property: "og:description",
        content:
          "DieselGrit is an editorial digital magazine documenting the world's most uncompromising diesel truck builds.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <section className="px-6 pt-28 pb-16">
        <p className="text-eyebrow text-gold">About the Publication</p>
        <h1 className="mt-3 font-display text-6xl leading-[0.9] tracking-tight">
          Documenting the trucks that <span className="italic">matter.</span>
        </h1>
      </section>

      <section className="border-t border-white/5 px-6 py-14">
        <p className="text-eyebrow text-gold">Mission</p>
        <p className="mt-6 text-[16px] leading-[1.8] text-white/80">
          DieselGrit is an independent editorial publication founded to celebrate the artistry
          behind the world's most uncompromising diesel truck builds. We don't chase trends,
          hype, or horsepower numbers alone. We chase intent — the vision, the labor, and the
          craft behind every truck we feature.
        </p>
      </section>

      <section className="border-t border-white/5 px-6 py-14">
        <p className="text-eyebrow text-gold">Community</p>
        <p className="mt-6 text-[16px] leading-[1.8] text-white/80">
          Every feature you read on DieselGrit started as a submission from the community.
          Builders, photographers, and enthusiasts from every corner of the diesel world make
          this magazine what it is. If your truck is telling a story worth reading, we want to
          hear from you.
        </p>
        <Link
          to="/submit"
          className="mt-8 inline-block border border-gold px-6 py-3 text-eyebrow text-gold"
        >
          Submit Your Truck →
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}

