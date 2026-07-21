import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Copy, Edit3, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  allFeaturesAdminQuery,
  submissionsQuery,
  publicImageUrl,
  type Submission,
} from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [tab, setTab] = useState<"submissions" | "features">("submissions");
  const { data: submissions = [] } = useQuery(submissionsQuery());
  const { data: features = [] } = useQuery(allFeaturesAdminQuery());
  const qc = useQueryClient();

  const pending = submissions.filter((s) => s.status === "pending");

  async function setStatus(id: string, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("submissions")
      .update({ status })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Submission ${status}`);
    qc.invalidateQueries({ queryKey: ["submissions"] });
  }

  async function deleteFeature(id: string, num: number) {
    if (!confirm(`Delete feature Nº ${num}? This cannot be undone.`)) return;
    const { error } = await supabase.from("features").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Feature deleted");
    qc.invalidateQueries({ queryKey: ["features"] });
  }

  async function duplicateFeature(id: string) {
    const { data: src, error: fetchErr } = await supabase
      .from("features")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr || !src) return toast.error(fetchErr?.message ?? "Not found");
    const { data: max } = await supabase
      .from("features")
      .select("feature_number")
      .order("feature_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextNum = (max?.feature_number ?? 0) + 1;
    const clone: Record<string, unknown> = { ...(src as Record<string, unknown>) };
    delete clone.id;
    delete clone.created_at;
    delete clone.updated_at;
    delete clone.slug;
    clone.feature_number = nextNum;
    clone.title = `${(src as { title: string }).title} (Copy)`;
    clone.published = false;
    clone.status = "draft";
    clone.view_count = 0;
    const { data: inserted, error } = await supabase
      .from("features")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(clone as any)
      .select("id")
      .maybeSingle();
    if (error) return toast.error(error.message);
    toast.success(`Duplicated as Nº ${nextNum}`);
    qc.invalidateQueries({ queryKey: ["features"] });
    return inserted?.id;
  }

  return (
    <div className="px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-eyebrow text-gold">Editorial Desk</p>
          <h1 className="mt-2 font-display text-3xl">Dashboard</h1>
        </div>
        <Link
          to="/admin/features/new"
          className="inline-flex items-center gap-1.5 bg-gold px-4 py-2 text-eyebrow text-background"
        >
          <Plus className="size-3.5" /> New Feature
        </Link>
      </div>

      <div className="mb-6 flex gap-2 border-b border-white/10">
        <TabBtn active={tab === "submissions"} onClick={() => setTab("submissions")}>
          Submissions
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-gold px-2 text-[10px] text-background">
              {pending.length}
            </span>
          )}
        </TabBtn>
        <TabBtn active={tab === "features"} onClick={() => setTab("features")}>
          Features ({features.length})
        </TabBtn>
      </div>

      {tab === "submissions" &&
        (submissions.length === 0 ? (
          <p className="text-eyebrow text-white/40">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <SubmissionRow key={s.id} s={s} onStatus={setStatus} />
            ))}
          </div>
        ))}

      {tab === "features" &&
        (features.length === 0 ? (
          <p className="text-eyebrow text-white/40">
            No features published yet. Create your first one.
          </p>
        ) : (
          <div className="space-y-3">
            {features.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-4 border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="size-16 shrink-0 overflow-hidden bg-white/5">
                  {f.hero_image && (
                    <img
                      src={publicImageUrl(f.hero_image) ?? ""}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-eyebrow text-gold">
                    Nº {String(f.feature_number).padStart(3, "0")}{" "}
                    {f.published ? (
                      <span className="ml-1 text-white/40">· Published</span>
                    ) : (
                      <span className="ml-1 text-white/40">· Draft</span>
                    )}
                  </p>
                  <h3 className="mt-0.5 truncate font-display text-lg">{f.title}</h3>
                  <p className="truncate text-[11px] text-white/50">{f.owner_instagram}</p>
                </div>
                <Link
                  to="/admin/features/$id"
                  params={{ id: f.id }}
                  className="grid size-9 place-items-center border border-white/10 text-gold"
                  aria-label="Edit"
                >
                  <Edit3 className="size-4" />
                </Link>
                <button
                  onClick={() => duplicateFeature(f.id)}
                  className="grid size-9 place-items-center border border-white/10 text-white/70"
                  aria-label="Duplicate"
                  title="Duplicate as draft"
                >
                  <Copy className="size-4" />
                </button>
                <button
                  onClick={() => deleteFeature(f.id, f.feature_number)}
                  className="grid size-9 place-items-center border border-white/10 text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 pb-3 text-eyebrow ${
        active ? "border-gold text-foreground" : "border-transparent text-white/50"
      }`}
    >
      {children}
    </button>
  );
}

function SubmissionRow({
  s,
  onStatus,
}: {
  s: Submission;
  onStatus: (id: string, status: "approved" | "rejected") => void;
}) {
  const [open, setOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState<string[]>([]);

  async function loadPhotos() {
    if (signed.length || !s.photo_urls.length) return;
    setSigning(true);
    const { data } = await supabase.storage
      .from("submission-photos")
      .createSignedUrls(s.photo_urls, 3600);
    setSigned((data ?? []).map((d) => d.signedUrl).filter(Boolean) as string[]);
    setSigning(false);
  }

  return (
    <div className="border border-white/10 bg-white/[0.02]">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) loadPhotos();
        }}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-eyebrow text-gold">{s.instagram}</p>
          <p className="mt-0.5 truncate font-display text-lg">
            {[s.truck_year, s.make, s.model].filter(Boolean).join(" ")}
          </p>
          <p className="truncate text-[11px] text-white/50">
            {s.name} · {s.email} · {new Date(s.created_at).toLocaleDateString()}
          </p>
        </div>
        <StatusPill status={s.status} />
      </button>
      {open && (
        <div className="border-t border-white/10 p-4 space-y-3 text-sm">
          <Detail label="Engine" value={s.engine} />
          <Detail label="Wheels" value={s.wheel_setup} />
          <Detail label="Suspension" value={s.suspension} />
          <Detail label="Build List" value={s.build_list} multiline />
          <Detail label="Story" value={s.story} multiline />
          {signing ? (
            <Loader2 className="size-4 animate-spin text-gold" />
          ) : signed.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {signed.map((u, i) => (
                <a key={i} href={u} target="_blank" rel="noreferrer">
                  <img
                    src={u}
                    alt=""
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          ) : null}
          {s.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onStatus(s.id, "approved")}
                className="inline-flex items-center gap-1.5 bg-gold px-3 py-2 text-eyebrow text-background"
              >
                <Check className="size-3.5" /> Approve
              </button>
              <button
                onClick={() => onStatus(s.id, "rejected")}
                className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-2 text-eyebrow text-white/80"
              >
                <X className="size-3.5" /> Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: Submission["status"] }) {
  const styles = {
    pending: "bg-white/10 text-white/70",
    approved: "bg-gold/20 text-gold",
    rejected: "bg-destructive/20 text-destructive",
  }[status];
  return (
    <span className={`shrink-0 px-2 py-0.5 text-[10px] uppercase tracking-widest ${styles}`}>
      {status}
    </span>
  );
}

function Detail({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string | null;
  multiline?: boolean;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-eyebrow text-white/40">{label}</p>
      <p className={`mt-1 text-sm text-white/80 ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value}
      </p>
    </div>
  );
}
