import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { publicImageUrl, type Feature } from "@/lib/queries";

type SpecRow = { label: string; value: string };
type SponsorRow = { name: string; url?: string };

export function FeatureEditor({ initial }: { initial?: Feature }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [featureNumber, setFeatureNumber] = useState<string>(
    initial ? String(initial.feature_number) : "",
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [ownerInstagram, setOwnerInstagram] = useState(initial?.owner_instagram ?? "");
  const [truckYear, setTruckYear] = useState<string>(
    initial?.truck_year ? String(initial.truck_year) : "",
  );
  const [make, setMake] = useState(initial?.make ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [engine, setEngine] = useState(initial?.engine ?? "");
  const [story, setStory] = useState(initial?.story ?? "");
  const [heroImage, setHeroImage] = useState<string>(initial?.hero_image ?? "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery_images ?? []);
  const [specs, setSpecs] = useState<SpecRow[]>(
    initial?.build_specs?.length ? initial.build_specs : [{ label: "", value: "" }],
  );
  const [sponsors, setSponsors] = useState<SponsorRow[]>(
    initial?.sponsors?.length ? initial.sponsors : [],
  );
  const [published, setPublished] = useState<boolean>(initial?.published ?? false);
  const [nextNumber, setNextNumber] = useState<number | null>(null);

  useEffect(() => {
    if (initial) return;
    supabase
      .from("features")
      .select("feature_number")
      .order("feature_number", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const n = (data?.feature_number ?? 0) + 1;
        setNextNumber(n);
        setFeatureNumber(String(n));
      });
  }, [initial]);

  async function uploadImage(file: File): Promise<string | null> {
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const { error } = await supabase.storage
      .from("feature-images")
      .upload(path, file, { upsert: false });
    if (error) {
      toast.error(error.message);
      return null;
    }
    return path;
  }

  async function onHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const p = await uploadImage(file);
    if (p) setHeroImage(p);
  }

  async function onGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const paths: string[] = [];
    for (const f of files) {
      const p = await uploadImage(f);
      if (p) paths.push(p);
    }
    setGallery((g) => [...g, ...paths]);
  }

  async function save(publish: boolean) {
    setSaving(true);
    try {
      const num = parseInt(featureNumber, 10);
      if (isNaN(num)) throw new Error("Feature number required");
      if (!title || !ownerInstagram || !make) throw new Error("Title, Instagram and Make are required");
      const payload = {
        feature_number: num,
        published: publish,
        title,
        owner_instagram: ownerInstagram,
        truck_year: truckYear ? parseInt(truckYear, 10) : null,
        make,
        model: model || null,
        engine: engine || null,
        story: story || null,
        hero_image: heroImage || null,
        gallery_images: gallery,
        build_specs: specs.filter((s) => s.label && s.value),
        sponsors: sponsors.filter((s) => s.name),
      };
      if (initial) {
        const { error } = await supabase
          .from("features")
          .update(payload)
          .eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("features").insert(payload);
        if (error) throw error;
      }
      toast.success(publish ? "Feature published" : "Draft saved");
      qc.invalidateQueries({ queryKey: ["features"] });
      setPublished(publish);
      navigate({ to: "/admin" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-5 pb-24 pt-6 space-y-8">
      <div>
        <p className="text-eyebrow text-gold">
          {initial ? "Edit Feature" : `New Feature${nextNumber ? ` · Nº ${nextNumber}` : ""}`}
        </p>
        <h1 className="mt-2 font-display text-3xl">{initial ? initial.title : "Compose"}</h1>
      </div>

      <Grid>
        <Field label="Feature Number">
          <input
            value={featureNumber}
            onChange={(e) => setFeatureNumber(e.target.value)}
            className={ipt}
          />
        </Field>
        <Field label="Truck Year">
          <input value={truckYear} onChange={(e) => setTruckYear(e.target.value)} className={ipt} />
        </Field>
      </Grid>
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={ipt} />
      </Field>
      <Field label="Owner Instagram">
        <input
          value={ownerInstagram}
          onChange={(e) => setOwnerInstagram(e.target.value)}
          className={ipt}
          placeholder="@handle"
        />
      </Field>
      <Grid>
        <Field label="Make">
          <input value={make} onChange={(e) => setMake(e.target.value)} className={ipt} />
        </Field>
        <Field label="Model">
          <input value={model} onChange={(e) => setModel(e.target.value)} className={ipt} />
        </Field>
      </Grid>
      <Field label="Engine">
        <input value={engine} onChange={(e) => setEngine(e.target.value)} className={ipt} />
      </Field>

      <Field label="Hero Image">
        {heroImage ? (
          <div className="relative">
            <img
              src={publicImageUrl(heroImage) ?? ""}
              alt=""
              className="aspect-[4/5] w-full max-w-sm object-cover"
            />
            <button
              onClick={() => setHeroImage("")}
              className="absolute right-2 top-2 grid size-7 place-items-center bg-background/80"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 border border-dashed border-white/20 py-8">
            <Upload className="size-5 text-gold" />
            <span className="text-eyebrow">Upload hero</span>
            <input type="file" accept="image/*" onChange={onHeroUpload} className="hidden" />
          </label>
        )}
      </Field>

      <Field label="Story">
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={8}
          className={ipt + " resize-none"}
          placeholder="Editorial narrative. Blank lines separate paragraphs."
        />
      </Field>

      <div>
        <p className="text-eyebrow text-gold">Build Specifications</p>
        <div className="mt-3 space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <input
                value={s.label}
                onChange={(e) => {
                  const c = [...specs];
                  c[i] = { ...c[i], label: e.target.value };
                  setSpecs(c);
                }}
                placeholder="Engine"
                className={ipt}
              />
              <input
                value={s.value}
                onChange={(e) => {
                  const c = [...specs];
                  c[i] = { ...c[i], value: e.target.value };
                  setSpecs(c);
                }}
                placeholder="6.7L Cummins"
                className={ipt}
              />
              <button
                onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))}
                className="grid size-9 place-items-center text-white/40"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setSpecs([...specs, { label: "", value: "" }])}
            className="inline-flex items-center gap-1.5 text-eyebrow text-gold"
          >
            <Plus className="size-3.5" /> Add spec
          </button>
        </div>
      </div>

      <div>
        <p className="text-eyebrow text-gold">Sponsors</p>
        <div className="mt-3 space-y-2">
          {sponsors.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <input
                value={s.name}
                onChange={(e) => {
                  const c = [...sponsors];
                  c[i] = { ...c[i], name: e.target.value };
                  setSponsors(c);
                }}
                placeholder="Sponsor name"
                className={ipt}
              />
              <input
                value={s.url ?? ""}
                onChange={(e) => {
                  const c = [...sponsors];
                  c[i] = { ...c[i], url: e.target.value };
                  setSponsors(c);
                }}
                placeholder="https://…"
                className={ipt}
              />
              <button
                onClick={() => setSponsors(sponsors.filter((_, idx) => idx !== i))}
                className="grid size-9 place-items-center text-white/40"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setSponsors([...sponsors, { name: "", url: "" }])}
            className="inline-flex items-center gap-1.5 text-eyebrow text-gold"
          >
            <Plus className="size-3.5" /> Add sponsor
          </button>
        </div>
      </div>

      <div>
        <p className="text-eyebrow text-gold">Gallery</p>
        {gallery.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {gallery.map((p, i) => (
              <div key={i} className="relative aspect-square overflow-hidden bg-white/5">
                <img src={publicImageUrl(p) ?? ""} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 grid size-6 place-items-center bg-background/80"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 border border-dashed border-white/20 py-4">
          <Upload className="size-4 text-gold" />
          <span className="text-eyebrow">Upload gallery images</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onGalleryUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="sticky bottom-0 -mx-5 flex gap-2 border-t border-white/10 bg-background/95 px-5 py-4 backdrop-blur">
        <button
          disabled={saving}
          onClick={() => save(false)}
          className="flex-1 border border-white/15 py-3 text-eyebrow disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          disabled={saving}
          onClick={() => save(true)}
          className="flex-1 bg-gold py-3 text-eyebrow text-background disabled:opacity-50"
        >
          {saving && <Loader2 className="inline size-3 animate-spin mr-2" />}
          {published ? "Update & Publish" : "Publish"}
        </button>
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
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}
