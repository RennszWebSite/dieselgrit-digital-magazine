import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { allAnnouncementsAdminQuery, type Announcement } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  component: AnnouncementsAdmin,
});

type Form = {
  id?: string;
  message: string;
  link_url: string;
  link_label: string;
  style: string;
  active: boolean;
  starts_at: string;
  ends_at: string;
};

const EMPTY: Form = {
  message: "",
  link_url: "",
  link_label: "",
  style: "default",
  active: true,
  starts_at: "",
  ends_at: "",
};

function AnnouncementsAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery(allAnnouncementsAdminQuery());
  const [form, setForm] = useState<Form | null>(null);

  const save = useMutation({
    mutationFn: async (f: Form) => {
      const payload = {
        message: f.message,
        link_url: f.link_url || null,
        link_label: f.link_label || null,
        style: f.style,
        active: f.active,
        starts_at: f.starts_at ? new Date(f.starts_at).toISOString() : null,
        ends_at: f.ends_at ? new Date(f.ends_at).toISOString() : null,
      };
      if (f.id) {
        const { error } = await supabase.from("announcements").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("announcements").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      setForm(null);
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  function edit(a: Announcement) {
    setForm({
      id: a.id,
      message: a.message,
      link_url: a.link_url ?? "",
      link_label: a.link_label ?? "",
      style: a.style,
      active: a.active,
      starts_at: a.starts_at ? a.starts_at.slice(0, 16) : "",
      ends_at: a.ends_at ? a.ends_at.slice(0, 16) : "",
    });
  }

  const field =
    "w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none";
  const label = "text-eyebrow text-white/60 mb-1.5 block";

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Announcements</h1>
        <button
          onClick={() => setForm(EMPTY)}
          className="flex items-center gap-1.5 border border-gold px-3 py-1.5 text-eyebrow text-gold"
        >
          <Plus className="size-3.5" /> New
        </button>
      </div>

      {form && (
        <div className="mb-8 space-y-4 border border-white/10 p-5">
          <div>
            <label className={label}>Message</label>
            <input
              className={field}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Link URL</label>
              <input
                className={field}
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Link label</label>
              <input
                className={field}
                value={form.link_label}
                onChange={(e) => setForm({ ...form, link_label: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label}>Style</label>
              <select
                className={field}
                value={form.style}
                onChange={(e) => setForm({ ...form, style: e.target.value })}
              >
                <option value="default">Default</option>
                <option value="gold">Gold</option>
                <option value="alert">Alert</option>
              </select>
            </div>
            <div>
              <label className={label}>Starts at</label>
              <input
                type="datetime-local"
                className={field}
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Ends at</label>
              <input
                type="datetime-local"
                className={field}
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active
          </label>
          <div className="flex gap-2">
            <button
              disabled={save.isPending || !form.message}
              onClick={() => save.mutate(form)}
              className="border border-gold bg-gold px-4 py-2 text-eyebrow text-background disabled:opacity-50"
            >
              {save.isPending ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setForm(null)}
              className="border border-white/20 px-4 py-2 text-eyebrow"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((a) => (
          <div
            key={a.id}
            className="flex items-start justify-between gap-4 border border-white/10 p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
                <span className={a.active ? "text-gold" : "text-white/40"}>
                  {a.active ? "Active" : "Inactive"}
                </span>
                <span className="text-white/30">· {a.style}</span>
              </div>
              <p className="mt-1 text-sm">{a.message}</p>
              {a.link_url && (
                <p className="mt-1 text-xs text-white/50 truncate">
                  {a.link_label || "link"} → {a.link_url}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(a)} className="text-white/60">
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => confirm("Delete?") && del.mutate(a.id)}
                className="text-red-400"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-12 text-center text-sm text-white/40">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}