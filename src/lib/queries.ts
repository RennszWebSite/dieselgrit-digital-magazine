import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Feature = {
  id: string;
  feature_number: number;
  published: boolean;
  publish_date: string;
  owner_instagram: string;
  title: string;
  truck_year: number | null;
  make: string;
  model: string | null;
  engine: string | null;
  story: string | null;
  build_specs: { label: string; value: string }[];
  hero_image: string | null;
  gallery_images: string[];
  sponsors: { name: string; url?: string }[];
  created_at: string;
  updated_at: string;
  slug?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  instagram_post_url?: string | null;
  status?: string | null;
  view_count?: number | null;
  category?: string | null;
};

export type BuildPartner = {
  id: string;
  name: string;
  instagram: string | null;
  website: string | null;
  logo_url: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
};

export type Submission = {
  id: string;
  name: string;
  instagram: string;
  email: string;
  truck_year: number | null;
  make: string;
  model: string | null;
  engine: string | null;
  wheel_setup: string | null;
  suspension: string | null;
  build_list: string | null;
  story: string | null;
  photo_urls: string[];
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export const publishedFeaturesQuery = () =>
  queryOptions({
    queryKey: ["features", "published"],
    queryFn: async (): Promise<Feature[]> => {
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .eq("published", true)
        .order("feature_number", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Feature[];
    },
  });

export const featureByNumberQuery = (num: number) =>
  queryOptions({
    queryKey: ["features", "by-number", num],
    queryFn: async (): Promise<{
      feature: Feature;
      prev: number | null;
      next: number | null;
    } | null> => {
      const { data } = await supabase
        .from("features")
        .select("*")
        .eq("feature_number", num)
        .eq("published", true)
        .maybeSingle();
      if (!data) return null;
      const [{ data: prev }, { data: next }] = await Promise.all([
        supabase
          .from("features")
          .select("feature_number")
          .eq("published", true)
          .lt("feature_number", num)
          .order("feature_number", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("features")
          .select("feature_number")
          .eq("published", true)
          .gt("feature_number", num)
          .order("feature_number", { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);
      return {
        feature: data as unknown as Feature,
        prev: prev?.feature_number ?? null,
        next: next?.feature_number ?? null,
      };
    },
  });

export const allFeaturesAdminQuery = () =>
  queryOptions({
    queryKey: ["features", "all-admin"],
    queryFn: async (): Promise<Feature[]> => {
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .order("feature_number", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Feature[];
    },
  });

export const submissionsQuery = () =>
  queryOptions({
    queryKey: ["submissions"],
    queryFn: async (): Promise<Submission[]> => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Submission[];
    },
  });

export function publicImageUrl(path: string | null | undefined, bucket = "feature-images") {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export const buildPartnersQuery = () =>
  queryOptions({
    queryKey: ["build_partners"],
    queryFn: async (): Promise<BuildPartner[]> => {
      const { data, error } = await supabase
        .from("build_partners")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as BuildPartner[];
    },
  });

export const featurePartnerIdsQuery = (featureId: string) =>
  queryOptions({
    queryKey: ["feature_partners", featureId],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("feature_partners")
        .select("partner_id, sort_order")
        .eq("feature_id", featureId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r) => r.partner_id as string);
    },
  });
