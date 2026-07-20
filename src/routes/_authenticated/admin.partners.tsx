import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { buildPartnersQuery, publicImageUrl, type BuildPartner } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/partners")({
  component: PartnersAdmin,
});

const CATEGORIES = [
  "Engine",
  "Suspension",
  "Wheels & Tires",
  "Exhaust",
  "Fabrication",
  "Paint & Body",
  "Interior",
  "Photography",
  "Media",
  "Other",
];

function PartnersAdmin() {
  const { data: partners = [] } = useQuery(buildPartnersQuery());
  const qc = useQueryClient();
  const [editing, setEditing] = useState<BuildPartner | null>(null);
  const [creating, setCreating] = useState(false);

  async function remove(p: BuildPartner) {
    if (!confirm(`Delete "${p.name}" from the library?`)) return;
    const { error } = await supabase.from("build_partners").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Partner removed");
    qc.invalidateQueries({ queryKey: ["build_partners"] });
  }

  return (
    <div className="px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-eyebrow text-gold">Library</p>
          <h1 className="mt-2 font-display text-3xl">Build Partners</h1>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
          className="inline-flex items-center gap-1.5 bg-gold px-4 py-2 text-eyebrow text-background"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </div>

      {partners.length === 0 ? (
        <p className="text-eyebrow text-white/40">
          No partners yet. Add shops, brands and photographers you feature repeatedly so you can
          select them in one tap.
        </p>
      ) : (
        <div className="space-y-3">
          {partners.map((p) => {
            const logo = publicImageUrl(p.logo_url, "partner-logos");
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-full bg-white/5">
                  {logo && <img src={logo} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg">{p.name}</p>
                  <p className="truncate text-[11px] text-white/50">
                    {p.instagram} {p.category ? `· ${p.category}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCreating(false);
                    setEditing(p);
                  }}
                  className="grid size-9 place-items-center border border-white/10 text-eyebrow text-gold"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(p)}
                  className="grid size-9 place-items-center border border-white/10 text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <PartnerForm
          initial={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function PartnerForm({ initial, onClose }: { initial?: BuildPartner; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(initial?.name ?? "");
  const [instagram, setInstagram] = useState(initial?.instagram ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? "");
  const [saving, setSaving] = useState(false);

  async function uploadLogo(file: File) {
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const { error } = await supabase.storage
      .from("partner-logos")
      .upload(path, file, { upsert: false });
    if (error) return toast.error(error.message);
    setLogoUrl(path);
  }

  async function save() {
    if (!name.trim()) return toast.error("Name required");
    setSaving(true);
    const payload = {
      name: name.trim(),
      instagram: instagram.trim() || null,
      website: website.trim() || null,
      category: category || null,
      logo_url: logoUrl || null,
    };
    const { error } = initial
      ? await supabase.from("build_partners").update(payload).eq("id", initial.id)
      : await supabase.from("build_partners").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(initial ? "Partner updated" : "Partner added");
    qc.invalidateQueries({ queryKey: ["build_partners"] });
    onClose();
  }

  const logo = publicImageUrl(logoUrl, "partner-logos");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center">
      <div className="w-full max-w-md bg-background border-t border-white/10 sm:border sm:border-white/10 p-5 space-y-4 max-h-[92svh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl">{initial ? "Edit partner" : "New partner"}</p>
          <button onClick={onClose} className="grid size-8 place-items-center">
            <X className="size-4" />
          </button>
        </div>
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={ipt} />
        </Field>
        <Field label="Instagram">
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@handle"
            className={ipt}
          />
        </Field>
        <Field label="Website">
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://…"
            className={ipt}
          />
        </Field>
        <Field label="Category">
          <select
            value={category ?? ""}
            onChange={(e) => setCategory(e.target.value)}
            className={ipt + " appearance-none"}
          >
            <option value="">—</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Logo">
          <div className="flex items-center gap-3">
            <div className="size-16 shrink-0 overflow-hidden rounded-full bg-white/5">
              {logo && <img src={logo} alt="" className="h-full w-full object-cover" />}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 border border-white/15 px-3 py-2 text-eyebrow">
              <Upload className="size-3.5 text-gold" />
              {logoUrl ? "Replace" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadLogo(f);
                }}
              />
            </label>
            {logoUrl && (
              <button
                onClick={() => setLogoUrl("")}
                className="text-eyebrow text-white/40"
              >
                Remove
              </button>
            )}
          </div>
        </Field>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-white/15 py-3 text-eyebrow"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={save}
            className="flex-1 bg-gold py-3 text-eyebrow text-background disabled:opacity-50"
          >
            {saving && <Loader2 className="mr-2 inline size-3 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const ipt =
  "w-full border-b border-white/10 bg-transparent py-2 text-base outline-none focus:border-gold";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-eyebrow text-white/60 mb-1 block">{label}</label>
      {children}
    </div>
  );
}