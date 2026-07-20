import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Copy,
  GripVertical,
  Instagram,
  Loader2,
  Plus,
  Sparkles,
  Star,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  featurePartnerIdsQuery,
  publicImageUrl,
  type Feature,
} from "@/lib/queries";
import { PartnerPicker } from "@/components/partner-picker";
import { parseInstagramCaption, slugify } from "@/lib/instagram-caption";

type SpecRow = { label: string; value: string };
type SponsorRow = { name: string; url?: string };

const CATEGORIES = ["Daily", "Show", "Work", "Overland", "Race", "Diesel Brothers"];

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
  const [slug, setSlug] = useState<string>(initial?.slug ?? "");
  const [seoTitle, setSeoTitle] = useState<string>(initial?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState<string>(initial?.seo_description ?? "");
  const [instagramPostUrl, setInstagramPostUrl] = useState<string>(
    initial?.instagram_post_url ?? "",
  );
  const [category, setCategory] = useState<string>(initial?.category ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [partnerIds, setPartnerIds] = useState<string[]>([]);
  const [captionOpen, setCaptionOpen] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);

  // Load partner ids for existing feature
  const { data: existingPartnerIds } = useQuery({
    ...featurePartnerIdsQuery(initial?.id ?? ""),
    enabled: !!initial?.id,
  });
  useEffect(() => {
    if (existingPartnerIds) setPartnerIds(existingPartnerIds);
  }, [existingPartnerIds]);

  // Auto-slug from title
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

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

  async function onGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });
    const paths: string[] = [];
    for (const f of files) {
      const p = await uploadImage(f);
      if (p) paths.push(p);
      setUploadProgress((prev) =>
        prev ? { done: prev.done + 1, total: prev.total } : prev,
      );
    }
    setGallery((g) => {
      const merged = [...g, ...paths];
      // If no hero yet, use the first uploaded image
      if (!heroImage && paths[0]) setHeroImage(paths[0]);
      return merged;
    });
    setUploading(false);
    setUploadProgress(null);
    // reset input so same file can be re-selected
    e.target.value = "";
  }

  function applyCaption() {
    const parsed = parseInstagramCaption(captionText);
    if (parsed.ownerInstagram && !ownerInstagram) setOwnerInstagram(parsed.ownerInstagram);
    if (parsed.year && !truckYear) setTruckYear(String(parsed.year));
    if (parsed.make && !make) setMake(parsed.make);
    if (parsed.model && !model) setModel(parsed.model);
    if (parsed.engine && !engine) setEngine(parsed.engine);
    if (parsed.story && !story) setStory(parsed.story);
    if (parsed.year && parsed.make && !title) {
      setTitle([parsed.year, parsed.make, parsed.model].filter(Boolean).join(" "));
    }
    setCaptionOpen(false);
    setCaptionText("");
    toast.success("Caption parsed");
  }

  async function duplicateFromLatest() {
    const { data } = await supabase
      .from("features")
      .select("*")
      .order("feature_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return toast.error("No previous feature to duplicate");
    const f = data as unknown as Feature;
    setTitle(f.title + " (copy)");
    setOwnerInstagram(f.owner_instagram);
    setTruckYear(f.truck_year ? String(f.truck_year) : "");
    setMake(f.make);
    setModel(f.model ?? "");
    setEngine(f.engine ?? "");
    setStory(f.story ?? "");
    setSpecs(f.build_specs?.length ? f.build_specs : [{ label: "", value: "" }]);
    setSponsors(f.sponsors ?? []);
    setCategory(f.category ?? "");
    // do NOT copy images/slug/feature_number
    toast.success(`Duplicated from Nº ${f.feature_number}`);
  }

  async function saveFeaturePartners(featureId: string) {
    // simple replace strategy
    await supabase.from("feature_partners").delete().eq("feature_id", featureId);
    if (partnerIds.length) {
      const rows = partnerIds.map((pid, idx) => ({
        feature_id: featureId,
        partner_id: pid,
        sort_order: idx,
      }));
      await supabase.from("feature_partners").insert(rows);
    }
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
        slug: slug || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        instagram_post_url: instagramPostUrl || null,
        category: category || null,
        status: publish ? "published" : "draft",
      };
      let featureId = initial?.id ?? "";
      if (initial) {
        const { error } = await supabase
          .from("features")
          .update(payload)
          .eq("id", initial.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("features")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        featureId = data.id;
      }
      if (featureId) await saveFeaturePartners(featureId);
      toast.success(publish ? "Feature published" : "Draft saved");
      qc.invalidateQueries({ queryKey: ["features"] });
      qc.invalidateQueries({ queryKey: ["feature_partners"] });
      setPublished(publish);
      navigate({ to: "/admin" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = gallery.indexOf(String(active.id));
    const newIdx = gallery.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    setGallery(arrayMove(gallery, oldIdx, newIdx));
  }

  const seoTitlePreview = useMemo(
    () => seoTitle || `${title} · DieselGrit`,
    [seoTitle, title],
  );

  return (
    <div className="px-5 pb-24 pt-6 space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-eyebrow text-gold">
            {initial ? "Edit Feature" : `New Feature${nextNumber ? ` · Nº ${nextNumber}` : ""}`}
          </p>
          <h1 className="mt-2 font-display text-3xl">{initial ? initial.title : "Compose"}</h1>
        </div>
        {!initial && (
          <button
            onClick={duplicateFromLatest}
            className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-2 text-eyebrow"
          >
            <Copy className="size-3.5 text-gold" /> Duplicate last
          </button>
        )}
      </div>

      {/* Instagram caption paste */}
      <div className="border border-white/10 bg-white/[0.02] p-4">
        <button
          onClick={() => setCaptionOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold" />
            <span className="text-eyebrow">Paste Instagram caption to auto-fill</span>
          </div>
          <span className="text-eyebrow text-white/40">{captionOpen ? "Hide" : "Open"}</span>
        </button>
        {captionOpen && (
          <div className="mt-3 space-y-3">
            <textarea
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              rows={6}
              placeholder="Paste the caption exactly as it appears on Instagram…"
              className={ipt + " resize-none"}
            />
            <div className="flex gap-2">
              <button
                onClick={applyCaption}
                disabled={!captionText.trim()}
                className="flex-1 bg-gold py-2 text-eyebrow text-background disabled:opacity-40"
              >
                Fill fields
              </button>
              <button
                onClick={() => {
                  setCaptionOpen(false);
                  setCaptionText("");
                }}
                className="border border-white/15 px-4 py-2 text-eyebrow"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-white/40">
              Only empty fields are filled — nothing you've typed will be overwritten.
            </p>
          </div>
        )}
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
      <Field label="URL Slug">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/40">/features/</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
            className={ipt}
          />
        </div>
      </Field>
      <Field label="Owner Instagram">
        <input
          value={ownerInstagram}
          onChange={(e) => setOwnerInstagram(e.target.value)}
          className={ipt}
          placeholder="@handle"
        />
      </Field>
      <Field label="Instagram Post URL (optional)">
        <div className="flex items-center gap-2">
          <Instagram className="size-4 text-white/40" />
          <input
            value={instagramPostUrl}
            onChange={(e) => setInstagramPostUrl(e.target.value)}
            placeholder="https://instagram.com/p/…"
            className={ipt}
          />
        </div>
      </Field>
      <Grid>
        <Field label="Make">
          <input value={make} onChange={(e) => setMake(e.target.value)} className={ipt} />
        </Field>
        <Field label="Model">
          <input value={model} onChange={(e) => setModel(e.target.value)} className={ipt} />
        </Field>
      </Grid>
      <Grid>
        <Field label="Engine">
          <input value={engine} onChange={(e) => setEngine(e.target.value)} className={ipt} />
        </Field>
        <Field label="Category">
          <select
            value={category}
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
      </Grid>

      <Field label="Story">
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={8}
          className={ipt + " resize-none"}
          placeholder="Editorial narrative. Blank lines separate paragraphs."
        />
      </Field>

      {/* Photos */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-eyebrow text-gold">Photos</p>
          <p className="text-[11px] text-white/40">
            {gallery.length ? `${gallery.length} image${gallery.length === 1 ? "" : "s"}` : "None"}
          </p>
        </div>
        <p className="mt-1 text-[11px] text-white/50">
          Drag to reorder. Tap the star to set the hero.
        </p>
        {gallery.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={gallery} strategy={rectSortingStrategy}>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {gallery.map((p) => (
                  <SortablePhoto
                    key={p}
                    id={p}
                    isHero={p === heroImage}
                    onRemove={() => {
                      setGallery((g) => g.filter((x) => x !== p));
                      if (heroImage === p) setHeroImage("");
                    }}
                    onSetHero={() => setHeroImage(p)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 border border-dashed border-white/20 py-4">
          {uploading ? (
            <>
              <Loader2 className="size-4 animate-spin text-gold" />
              <span className="text-eyebrow">
                Uploading {uploadProgress?.done}/{uploadProgress?.total}…
              </span>
            </>
          ) : (
            <>
              <Upload className="size-4 text-gold" />
              <span className="text-eyebrow">Upload photos (multi-select)</span>
            </>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onGalleryUpload}
            className="hidden"
          />
        </label>
      </div>

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
        <p className="text-eyebrow text-gold">Build Partners</p>
        <p className="mt-1 text-[11px] text-white/50">
          Pick from your reusable library — logos and links auto-embed on the feature page.
        </p>
        <div className="mt-3">
          <PartnerPicker selectedIds={partnerIds} onChange={setPartnerIds} />
        </div>
      </div>

      <div>
        <p className="text-eyebrow text-gold">Extra Sponsors (free-form)</p>
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
        <p className="text-eyebrow text-gold">SEO</p>
        <div className="mt-3 space-y-4">
          <Field label="SEO Title">
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={seoTitlePreview}
              className={ipt}
            />
          </Field>
          <Field label="SEO Description">
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
              placeholder="Short summary for Google & social share previews."
              className={ipt + " resize-none"}
            />
          </Field>
        </div>
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

function SortablePhoto({
  id,
  isHero,
  onRemove,
  onSetHero,
}: {
  id: string;
  isHero: boolean;
  onRemove: () => void;
  onSetHero: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square overflow-hidden bg-white/5 ${
        isHero ? "ring-2 ring-gold" : ""
      }`}
    >
      <img src={publicImageUrl(id) ?? ""} alt="" className="h-full w-full object-cover" />
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 grid size-6 touch-none place-items-center bg-background/80"
        aria-label="Drag"
      >
        <GripVertical className="size-3" />
      </button>
      <button
        onClick={onSetHero}
        className={`absolute left-1 bottom-1 grid size-6 place-items-center ${
          isHero ? "bg-gold text-background" : "bg-background/80 text-white"
        }`}
        aria-label="Set as hero"
      >
        <Star className="size-3" />
      </button>
      <button
        onClick={onRemove}
        className="absolute right-1 top-1 grid size-6 place-items-center bg-background/80"
        aria-label="Remove"
      >
        <X className="size-3" />
      </button>
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
