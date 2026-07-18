import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FeatureEditor } from "@/components/feature-editor";
import { supabase } from "@/integrations/supabase/client";
import type { Feature } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/features/$id")({
  component: EditFeature,
});

function EditFeature() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["features", "by-id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Feature | null;
    },
  });
  if (isLoading) return <div className="p-6 text-eyebrow text-white/40">Loading…</div>;
  if (!data) throw notFound();
  return <FeatureEditor initial={data} />;
}
