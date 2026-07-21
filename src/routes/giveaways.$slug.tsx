import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Gift, Loader2 } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Countdown } from "@/components/countdown";
import { giveawayBySlugQuery, publicImageUrl } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/giveaways/$slug")({
  component: GiveawayDetail,
  loader: async ({ params, context }) => {
    const g = await context.queryClient.ensureQueryData(giveawayBySlugQuery(params.slug));
    if (!g) throw notFound();
    return g;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Giveaway — DieselGrit" }] };
    const url = `https://grit-gloss-forge.lovable.app/giveaways/${params.slug}`;
    const image = publicImageUrl(loaderData.hero_image) ?? undefined;
    const title = `${loaderData.title} — DieselGrit Giveaway`;
    const desc = loaderData.subtitle || `Win ${loaderData.prize}. Enter free on DieselGrit.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="px-6 pt-40 pb-20 text-center">
        <p className="text-eyebrow text-gold">404</p>
        <h1 className="mt-4 font-display text-4xl">Giveaway not found</h1>
        <Link to="/giveaways" className="mt-8 inline-block text-eyebrow text-gold">
          Back to prize board →
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

const EntrySchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  instagram: z.string().optional().nullable(),
});

function GiveawayDetail() {
  const { slug } = Route.useParams();
  const { data: g } = useQuery(giveawayBySlugQuery(slug));
  if (!g) throw notFound();

  const endsMs = new Date(g.ends_at).getTime();
  const closed = endsMs <= Date.now() || !g.active;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="relative h-svh min-h-[560px]">
        <div className="absolute inset-0">
          {g.hero_image ? (
            <img
              src={publicImageUrl(g.hero_image) ?? ""}
              alt={g.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_bottom,rgba(198,161,91,0.15),transparent_60%),linear-gradient(180deg,#111_0%,#000_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        </div>
        <div className="relative flex h-full flex-col justify-end px-6 pb-14">
          <p className="text-eyebrow text-gold">Win This · Giveaway</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight">
            {g.title}
          </h1>
          {g.subtitle && <p className="mt-3 max-w-md text-sm text-white/70">{g.subtitle}</p>}
          <div className="mt-6 max-w-sm">
            <Countdown endsAt={g.ends_at} />
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 px-6 py-10">
        <div className="border border-gold/40 bg-gold/[0.05] p-5">
          <p className="text-eyebrow text-gold flex items-center gap-2">
            <Gift className="size-4" /> The Prize
          </p>
          <p className="mt-2 font-display text-2xl leading-tight">{g.prize}</p>
          {g.prize_value && (
            <p className="mt-1 text-eyebrow text-white/50">Est. value {g.prize_value}</p>
          )}
        </div>
      </section>

      {g.description && (
        <section className="border-t border-white/5 px-6 py-10">
          <p className="text-eyebrow text-gold">About This Drop</p>
          <div className="mt-4 space-y-4 text-[15px] leading-[1.75] text-white/80">
            {g.description.split(/\n\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-white/5 px-6 py-10">
        <p className="text-eyebrow text-gold">Enter to Win</p>
        {closed ? (
          <p className="mt-4 text-sm text-white/60">
            This giveaway is closed. Check the prize board for the next drop.
          </p>
        ) : (
          <EntryForm giveawayId={g.id} />
        )}
      </section>

      {g.rules && (
        <section className="border-t border-white/5 px-6 py-10">
          <p className="text-eyebrow text-white/40">Rules & Fine Print</p>
          <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/50">
            {g.rules}
          </p>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}

function EntryForm({ giveawayId }: { giveawayId: string }) {
  const [form, setForm] = useState({ name: "", email: "", instagram: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = EntrySchema.safeParse(form);
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0].message);
    }
    setSubmitting(true);
    const { error } = await supabase.from("giveaway_entries").insert({
      giveaway_id: giveawayId,
      name: parsed.data.name,
      email: parsed.data.email,
      instagram: parsed.data.instagram?.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        setDone(true);
        return toast.success("You're already entered — good luck.");
      }
      return toast.error(error.message);
    }
    setDone(true);
    toast.success("Entry confirmed. Good luck.");
  }

  if (done) {
    return (
      <div className="mt-6 flex items-start gap-3 border border-gold/40 bg-gold/[0.05] p-5">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold" />
        <div>
          <p className="font-display text-lg">You're in.</p>
          <p className="mt-1 text-sm text-white/70">
            We'll email you if you win. One entry per email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Field label="Name">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border-b border-white/15 bg-transparent py-2 text-sm outline-none focus:border-gold"
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border-b border-white/15 bg-transparent py-2 text-sm outline-none focus:border-gold"
        />
      </Field>
      <Field label="Instagram (optional)">
        <input
          value={form.instagram}
          onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          placeholder="@yourhandle"
          className="w-full border-b border-white/15 bg-transparent py-2 text-sm outline-none focus:border-gold"
        />
      </Field>
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-gold px-5 py-4 text-eyebrow text-background disabled:opacity-60"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {submitting ? "Entering…" : "Enter Giveaway"}
      </button>
      <p className="text-[11px] text-white/40">
        One entry per email. We only use your info to notify the winner.
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-eyebrow text-white/50">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}