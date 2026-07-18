import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit Your Truck — DieselGrit" },
      {
        name: "description",
        content: "Submit your custom diesel build for editorial review by DieselGrit.",
      },
      { property: "og:title", content: "Submit Your Truck — DieselGrit" },
      {
        property: "og:description",
        content: "Submit your custom diesel build for editorial review by DieselGrit.",
      },
    ],
  }),
  component: SubmitPage,
});

const Schema = z.object({
  name: z.string().trim().min(1).max(120),
  instagram: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(180),
  truck_year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "4 digit year")
    .optional()
    .or(z.literal("")),
  make: z.string().trim().min(1).max(60),
  model: z.string().trim().max(60).optional().or(z.literal("")),
  engine: z.string().trim().max(120).optional().or(z.literal("")),
  wheel_setup: z.string().trim().max(200).optional().or(z.literal("")),
  suspension: z.string().trim().max(200).optional().or(z.literal("")),
  build_list: z.string().trim().max(4000).optional().or(z.literal("")),
  story: z.string().trim().max(4000).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof Schema>;

function SubmitPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: "",
      instagram: "",
      email: "",
      truck_year: "",
      make: "",
      model: "",
      engine: "",
      wheel_setup: "",
      suspension: "",
      build_list: "",
      story: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const photo_urls: string[] = [];
      for (const file of files.slice(0, 12)) {
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
        const { error: upErr } = await supabase.storage
          .from("submission-photos")
          .upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        photo_urls.push(path);
      }
      const { error } = await supabase.from("submissions").insert({
        name: values.name,
        instagram: values.instagram,
        email: values.email,
        truck_year: values.truck_year ? parseInt(values.truck_year, 10) : null,
        make: values.make,
        model: values.model || null,
        engine: values.engine || null,
        wheel_setup: values.wheel_setup || null,
        suspension: values.suspension || null,
        build_list: values.build_list || null,
        story: values.story || null,
        photo_urls,
      });
      if (error) throw error;
      setDone(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="px-6 pt-40 pb-20 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full border border-gold text-gold">
            <Check className="size-6" />
          </div>
          <p className="text-eyebrow text-gold mt-8">Submission Received</p>
          <h1 className="mt-4 font-display text-4xl leading-tight">
            Your build is in review.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm text-white/60">
            Our editors read every submission. If your truck is a fit for an upcoming feature,
            we'll reach out via email.
          </p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="px-6 pt-28 pb-8">
        <p className="text-eyebrow text-gold">Submit</p>
        <h1 className="mt-3 font-display text-5xl leading-none tracking-tight">
          Join the<br />
          <span className="italic">Circle.</span>
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
          Tell us about your build. Include as much detail and photography as you can.
        </p>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-20 space-y-8">
        <Section title="Contact">
          <Field label="Name" error={form.formState.errors.name?.message}>
            <input {...form.register("name")} className={inputCls} placeholder="Your name" />
          </Field>
          <Field label="Instagram" error={form.formState.errors.instagram?.message}>
            <input
              {...form.register("instagram")}
              className={inputCls}
              placeholder="@yourhandle"
            />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <input
              type="email"
              {...form.register("email")}
              className={inputCls}
              placeholder="you@domain.com"
            />
          </Field>
        </Section>

        <Section title="The Truck">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Year" error={form.formState.errors.truck_year?.message}>
              <input {...form.register("truck_year")} className={inputCls} placeholder="2022" />
            </Field>
            <Field label="Make" error={form.formState.errors.make?.message}>
              <input {...form.register("make")} className={inputCls} placeholder="Ford" />
            </Field>
            <Field label="Model">
              <input {...form.register("model")} className={inputCls} placeholder="F-250" />
            </Field>
          </div>
          <Field label="Engine">
            <input
              {...form.register("engine")}
              className={inputCls}
              placeholder="6.7L Power Stroke"
            />
          </Field>
        </Section>

        <Section title="Build">
          <Field label="Wheel Setup">
            <input {...form.register("wheel_setup")} className={inputCls} placeholder="24x14 Fuel Forged, 37x13.50 MTs" />
          </Field>
          <Field label="Suspension">
            <input
              {...form.register("suspension")}
              className={inputCls}
              placeholder="8&quot; lift, custom traction bars"
            />
          </Field>
          <Field label="Full Build List">
            <textarea
              {...form.register("build_list")}
              rows={5}
              className={inputCls + " resize-none"}
              placeholder="List every modification you've made…"
            />
          </Field>
          <Field label="The Story">
            <textarea
              {...form.register("story")}
              rows={5}
              className={inputCls + " resize-none"}
              placeholder="Why this truck? Where's it been? Where's it going?"
            />
          </Field>
        </Section>

        <Section title="Photos">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
            <Upload className="size-5 text-gold" />
            <span className="text-eyebrow text-white/70">Upload photos (up to 12)</span>
            <span className="text-[11px] text-white/40">JPG or PNG, high resolution</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 12))}
            />
          </label>
          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative aspect-square overflow-hidden bg-white/5">
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFiles((fs) => fs.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 grid size-6 place-items-center bg-background/80 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-3 bg-gold py-5 text-eyebrow text-background disabled:opacity-50"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitting ? "Submitting…" : "Submit Build"}
        </button>
      </form>
      <SiteFooter />
    </div>
  );
}

const inputCls =
  "w-full border-b border-white/10 bg-transparent py-2 text-base outline-none placeholder:text-white/20 focus:border-gold transition-colors";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h2 className="text-eyebrow text-gold">{title}</h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-eyebrow block text-white/60 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
