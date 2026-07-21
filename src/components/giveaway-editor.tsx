import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, Sparkles, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GiveawayWheel } from "@/components/giveaway-wheel";
import {
  giveawayEntriesQuery,
  publicImageUrl,
  type Giveaway,
  type GiveawayEntry,
} from "@/lib/queries";

function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function toInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const defaults = (): Partial<Giveaway> => ({
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  prize: "",
  prize_value: "",
  hero_image: null,
  rules: "",
  entry_method: "form",
  starts_at: new Date().toISOString(),
  ends_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  active: true,
  winner_entry_id: null,
});

export function GiveawayEditor({ initial }: { initial?: Giveaway }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [g, setG] = useState<Partial<Giveaway>>(initial ?? defaults());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const isEdit = Boolean(initial?.id);

  const { data: entries = [] } = useQuery({
    ...giveawayEntriesQuery(initial?.id ?? ""),
    enabled: Boolean(initial?.id),
  });

  function update<K extends keyof Giveaway>(k: K, v: Giveaway[K]) {
    setG((p) => ({ ...p, [k]: v }));
  }

  async function uploadHero(file: File) {
    setUploading(true);
    const path = `giveaways/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error } = await supabase.storage.from("feature-images").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    setUploading(false);
    if (error) return toast.error(error.message);
    update("hero_image", path);
  }

  async function save(publish: boolean) {
    if (!g.title?.trim()) return toast.error("Title required");
    if (!g.prize?.trim()) return toast.error("Prize required");
    if (!g.ends_at) return toast.error("End date required");
    setSaving(true);
    const payload = {
      slug: g.slug?.trim() || toSlug(g.title),
      title: g.title.trim(),
      subtitle: g.subtitle?.trim() || null,
      description: g.description?.trim() || null,
      prize: g.prize.trim(),
      prize_value: g.prize_value?.trim() || null,
      hero_image: g.hero_image || null,
      rules: g.rules?.trim() || null,
      entry_method: g.entry_method || "form",
      starts_at: g.starts_at,
      ends_at: g.ends_at,
      active: publish,
    };
    const { data, error } = isEdit
      ? await supabase.from("giveaways").update(payload).eq("id", initial!.id).select().maybeSingle()
      : await supabase.from("giveaways").insert(payload).select().maybeSingle();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(publish ? "Giveaway live" : "Draft saved");
    qc.invalidateQueries({ queryKey: ["giveaways"] });
    if (!isEdit && data) navigate({ to: "/admin/giveaways/$id", params: { id: data.id } });
  }

  async function persistWinner(winner: GiveawayEntry) {
    if (!initial?.id) return;
    const { error } = await supabase
      .from("giveaways")
      .update({ winner_entry_id: winner.id, drawn_at: new Date().toISOString(), active: false })
      .eq("id", initial.id);
    if (error) return toast.error(error.message);
    toast.success(`Winner: ${winner.name}`);
    qc.invalidateQueries({ queryKey: ["giveaways"] });
  }

  const heroUrl = publicImageUrl(g.hero_image);
  const winner = initial?.winner_entry_id
    ? entries.find((e) => e.id === initial.winner_entry_id)
    : null;

  return (
    <div className="px-5 py-6 pb-40">
      <p className="text-eyebrow text-gold">
        {isEdit ? "Edit Giveaway" : "New Giveaway"}
      </p>
      <h1 className="mt-2 font-display text-3xl">
        {g.title || "Untitled drop"}
      </h1>

      <div className="mt-8 space-y-5">
        <Field label="Title">
          <input
            value={g.title ?? ""}
            onChange={(e) => update("title", e.target.value)}
            className="w-full border-b border-white/15 bg-transparent py-2 text-sm outline-none focus:border-gold"
          />
        </Field>
        <Field label="Subtitle">
          <input
            value={g.subtitle ?? ""}
            onChange={(e) => update("subtitle", e.target.value)}
            className="w-full border-b border-white/15 bg-transparent py-2 text-sm outline-none focus:border-gold"
          />
        </Field>
        <Field label="URL Slug" hint="auto-generated from title if blank">
          <input
            value={g.slug ?? ""}
            onChange={(e) => update("slug", e.target.value)}
            placeholder={g.title ? toSlug(g.title) : "auto"}
            className="w-full border-b border-white/15 bg-transparent py-2 text-sm outline-none focus:border-gold"
          />
        </Field>
        <Field label="Prize">
          <input
            value={g.prize ?? ""}
            onChange={(e) => update("prize", e.target.value)}
            placeholder="e.g. Set of AMP Research bed steps"
            className="w-full border-b border-white/15 bg-transparent py-2 text-sm outline-none focus:border-gold"
          />
        </Field>
        <Field label="Prize Value (optional)">
          <input
            value={g.prize_value ?? ""}
            onChange={(e) => update("prize_value", e.target.value)}
            placeholder="$1,200"
            className="w-full border-b border-white/15 bg-transparent py-2 text-sm outline-none focus:border-gold"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Starts">
            <input
              type="datetime-local"
              value={g.starts_at ? toInput(g.starts_at) : ""}
              onChange={(e) => update("starts_at", new Date(e.target.value).toISOString())}
              className="w-full border-b border-white/15 bg-transparent py-2 text-sm outline-none focus:border-gold"
            />
          </Field>
          <Field label="Ends">
            <input
              type="datetime-local"
              value={g.ends_at ? toInput(g.ends_at) : ""}
              onChange={(e) => update("ends_at", new Date(e.target.value).toISOString())}
              className="w-full border-b border-white/15 bg-transparent py-2 text-sm outline-none focus:border-gold"
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={g.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
            rows={5}
            className="w-full border border-white/15 bg-transparent p-3 text-sm outline-none focus:border-gold"
          />
        </Field>

        <Field label="Rules & Fine Print">
          <textarea
            value={g.rules ?? ""}
            onChange={(e) => update("rules", e.target.value)}
            rows={4}
            className="w-full border border-white/15 bg-transparent p-3 text-sm outline-none focus:border-gold"
          />
        </Field>

        <div>
          <p className="text-eyebrow text-white/50">Hero Image</p>
          <div className="mt-2">
            {heroUrl ? (
              <div className="relative">
                <img src={heroUrl} alt="" className="w-full aspect-[4/5] object-cover" />
                <button
                  onClick={() => update("hero_image", null)}
                  className="absolute right-2 top-2 grid size-8 place-items-center bg-background/80 text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ) : (
              <label className="grid aspect-[4/5] w-full cursor-pointer place-items-center border border-dashed border-white/15 bg-white/[0.02]">
                {uploading ? (
                  <Loader2 className="size-6 animate-spin text-gold" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto size-6 text-gold" />
                    <p className="mt-2 text-eyebrow text-white/50">Upload hero</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadHero(f);
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {isEdit && (
          <div className="border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <p className="text-eyebrow text-gold">
                Entries ({entries.length})
              </p>
              {!winner && entries.length > 0 && (
                <button
                  onClick={() => setWheelOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-gold px-3 py-2 text-eyebrow text-background"
                >
                  <Sparkles className="size-3.5" /> Draw Winner
                </button>
              )}
            </div>
            {winner && (
              <div className="mt-3 border border-gold/40 bg-gold/[0.06] p-3">
                <p className="text-eyebrow text-gold">Winner</p>
                <p className="mt-1 font-display text-lg">{winner.name}</p>
                <p className="text-[11px] text-white/60">
                  {winner.email} · {winner.instagram ?? "—"}
                </p>
              </div>
            )}
            {entries.length === 0 ? (
              <p className="mt-3 text-eyebrow text-white/40">No entries yet.</p>
            ) : (
              <div className="mt-3 max-h-64 overflow-auto divide-y divide-white/5">
                {entries.map((e: GiveawayEntry) => (
                  <div
                    key={e.id}
                    className={`flex items-center justify-between gap-3 py-2 ${
                      winner?.id === e.id ? "text-gold" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">{e.name}</p>
                      <p className="truncate text-[11px] text-white/50">{e.email}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-white/40">
                      {new Date(e.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-white/10 bg-background/95 p-4 backdrop-blur">
        <button
          onClick={() => save(false)}
          disabled={saving}
          className="flex-1 border border-white/15 px-4 py-3 text-eyebrow text-white/80"
        >
          Save Draft
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gold px-4 py-3 text-eyebrow text-background"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {isEdit ? "Save & Publish" : "Publish"}
        </button>
      </div>
      {wheelOpen && (
        <GiveawayWheel
          entries={entries}
          onWinner={(w) => persistWinner(w)}
          onClose={() => setWheelOpen(false)}
        />
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-eyebrow text-white/50">{label}</span>
        {hint && <span className="text-[10px] text-white/30">{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}