import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GiveawayEditor } from "@/components/giveaway-editor";
import { supabase } from "@/integrations/supabase/client";
import type { Giveaway } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/giveaways/$id")({
  component: EditGiveaway,
});

function EditGiveaway() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["giveaways", "by-id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("giveaways")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Giveaway | null;
    },
  });
  if (isLoading) return <div className="p-6 text-eyebrow text-white/40">Loading…</div>;
  if (!data) throw notFound();
  return <GiveawayEditor initial={data} />;
}