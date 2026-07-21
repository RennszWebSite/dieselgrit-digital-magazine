import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { allGiveawaysAdminQuery, publicImageUrl } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Countdown } from "@/components/countdown";

export const Route = createFileRoute("/_authenticated/admin/giveaways/")({
  component: AdminGiveaways,
});

function AdminGiveaways() {
  const { data: giveaways = [] } = useQuery(allGiveawaysAdminQuery());
  const qc = useQueryClient();

  async function del(id: string, title: string) {
    if (!confirm(`Delete giveaway "${title}"? All entries will be lost.`)) return;
    const { error } = await supabase.from("giveaways").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Giveaway deleted");
    qc.invalidateQueries({ queryKey: ["giveaways"] });
  }

  return (
    <div className="px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-eyebrow text-gold">Prize Desk</p>
          <h1 className="mt-2 font-display text-3xl">Giveaways</h1>
        </div>
        <Link
          to="/admin/giveaways/new"
          className="inline-flex items-center gap-1.5 bg-gold px-4 py-2 text-eyebrow text-background"
        >
          <Plus className="size-3.5" /> New
        </Link>
      </div>

      {giveaways.length === 0 ? (
        <p className="text-eyebrow text-white/40">
          No giveaways yet. Create your first drop.
        </p>
      ) : (
        <div className="space-y-3">
          {giveaways.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-4 border border-white/10 bg-white/[0.02] p-3"
            >
              <div className="size-16 shrink-0 overflow-hidden bg-white/5">
                {g.hero_image && (
                  <img
                    src={publicImageUrl(g.hero_image) ?? ""}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-eyebrow text-gold">
                  {g.active ? "Live" : "Hidden"}
                  <span className="ml-2 text-white/40">
                    · <Countdown endsAt={g.ends_at} compact />
                  </span>
                </p>
                <h3 className="mt-0.5 truncate font-display text-lg">{g.title}</h3>
                <p className="truncate text-[11px] text-white/50">{g.prize}</p>
              </div>
              <Link
                to="/admin/giveaways/$id"
                params={{ id: g.id }}
                className="grid size-9 place-items-center border border-white/10 text-gold"
                aria-label="Edit"
              >
                <Edit3 className="size-4" />
              </Link>
              <button
                onClick={() => del(g.id, g.title)}
                className="grid size-9 place-items-center border border-white/10 text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}