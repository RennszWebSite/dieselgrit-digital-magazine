import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { siteSettingsQuery, publicImageUrl, type SiteSettings } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

const EFFECTS = [
  { value: "none", label: "None" },
  { value: "snow", label: "Snow" },
  { value: "rain", label: "Rain" },
  { value: "embers", label: "Embers" },
  { value: "confetti", label: "Confetti" },
];

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery(siteSettingsQuery());
  const [form, setForm] = useState<Partial<SiteSettings>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data?.id) throw new Error("Settings row missing");
      const { error } = await supabase
        .from("site_settings")
        .update({
          site_title: form.site_title ?? "DieselGrit",
          tagline: form.tagline ?? null,
          seasonal_effect: form.seasonal_effect ?? "none",
          effect_intensity: form.effect_intensity ?? 50,
          accent_color: form.accent_color ?? null,
          social_instagram: form.social_instagram ?? null,
          social_youtube: form.social_youtube ?? null,
          social_tiktok: form.social_tiktok ?? null,
          contact_email: form.contact_email ?? null,
          footer_note: form.footer_note ?? null,
          homepage_intro: form.homepage_intro ?? null,
          favicon_url: form.favicon_url ?? null,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["site_settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function update<K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onFaviconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `favicon-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("partner-logos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      update("favicon_url", path as SiteSettings["favicon_url"]);
      toast.success("Favicon uploaded — click Save to apply");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const faviconPreview = publicImageUrl(form.favicon_url, "partner-logos");

  const field =
    "w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none";
  const label = "text-eyebrow text-white/60 mb-1.5 block";

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="font-display text-3xl">Site Settings</h1>
      <p className="mt-1 text-sm text-white/60">Controls site-wide branding & effects.</p>

      <div className="mt-8 space-y-5">
        <div>
          <label className={label}>Site title</label>
          <input
            className={field}
            value={form.site_title ?? ""}
            onChange={(e) => update("site_title", e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Tagline</label>
          <input
            className={field}
            value={form.tagline ?? ""}
            onChange={(e) => update("tagline", e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Homepage intro</label>
          <textarea
            rows={3}
            className={field}
            value={form.homepage_intro ?? ""}
            onChange={(e) => update("homepage_intro", e.target.value)}
          />
        </div>

        <div>
          <label className={label}>Favicon</label>
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center border border-white/10 bg-white/5">
              {faviconPreview ? (
                <img src={faviconPreview} alt="Favicon" className="size-10 object-contain" />
              ) : (
                <span className="text-[10px] text-white/40">None</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 border border-white/20 px-3 py-2 text-eyebrow disabled:opacity-50"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {form.favicon_url ? "Replace" : "Upload"}
            </button>
            {form.favicon_url && (
              <button
                type="button"
                onClick={() => update("favicon_url", null)}
                className="flex items-center gap-1 text-eyebrow text-white/60"
              >
                <X className="size-4" /> Remove
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/x-icon,image/svg+xml,image/jpeg,image/webp"
              className="hidden"
              onChange={onFaviconChange}
            />
          </div>
          <p className="mt-1 text-[10px] text-white/40">
            Square PNG/SVG recommended (min 64×64).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Seasonal effect</label>
            <select
              className={field}
              value={form.seasonal_effect ?? "none"}
              onChange={(e) => update("seasonal_effect", e.target.value)}
            >
              {EFFECTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Intensity ({form.effect_intensity ?? 50})</label>
            <input
              type="range"
              min={0}
              max={100}
              className="w-full accent-gold"
              value={form.effect_intensity ?? 50}
              onChange={(e) => update("effect_intensity", parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Instagram</label>
            <input
              className={field}
              value={form.social_instagram ?? ""}
              onChange={(e) => update("social_instagram", e.target.value)}
              placeholder="@dieselgrit"
            />
          </div>
          <div>
            <label className={label}>YouTube</label>
            <input
              className={field}
              value={form.social_youtube ?? ""}
              onChange={(e) => update("social_youtube", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>TikTok</label>
            <input
              className={field}
              value={form.social_tiktok ?? ""}
              onChange={(e) => update("social_tiktok", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Contact email</label>
            <input
              className={field}
              value={form.contact_email ?? ""}
              onChange={(e) => update("contact_email", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={label}>Footer note</label>
          <input
            className={field}
            value={form.footer_note ?? ""}
            onChange={(e) => update("footer_note", e.target.value)}
          />
        </div>

        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate()}
          className="w-full border border-gold bg-gold px-5 py-3 text-eyebrow text-background disabled:opacity-50"
        >
          {save.isPending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}