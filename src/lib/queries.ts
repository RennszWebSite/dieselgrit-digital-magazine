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

export const relatedFeaturesQuery = (
  featureId: string,
  opts: { category?: string | null; make?: string | null },
) =>
  queryOptions({
    queryKey: ["features", "related", featureId, opts.category, opts.make],
    queryFn: async (): Promise<Feature[]> => {
      const filters: string[] = [];
      if (opts.category) filters.push(`category.eq.${opts.category}`);
      if (opts.make) filters.push(`make.eq.${opts.make}`);
      let q = supabase
        .from("features")
        .select("*")
        .eq("published", true)
        .neq("id", featureId);
      if (filters.length) q = q.or(filters.join(","));
      const { data, error } = await q
        .order("feature_number", { ascending: false })
        .limit(4);
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
  if (bucket !== "feature-images" && bucket !== "partner-logos") return null;
  const params = new URLSearchParams({ bucket, path });
  return `/api/public/media?${params.toString()}`;
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

export const featurePartnersDetailsQuery = (featureId: string) =>
  queryOptions({
    queryKey: ["feature_partners_details", featureId],
    queryFn: async (): Promise<BuildPartner[]> => {
      const { data, error } = await supabase
        .from("feature_partners")
        .select("sort_order, build_partners(*)")
        .eq("feature_id", featureId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? [])
        .map((r) => (r as { build_partners: BuildPartner | null }).build_partners)
        .filter(Boolean) as BuildPartner[];
    },
  });

export type Giveaway = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  prize: string;
  prize_value: string | null;
  hero_image: string | null;
  rules: string | null;
  entry_method: string;
  starts_at: string;
  ends_at: string;
  active: boolean;
  winner_entry_id: string | null;
  drawn_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GiveawayEntry = {
  id: string;
  giveaway_id: string;
  name: string;
  email: string;
  instagram: string | null;
  created_at: string;
};

export const activeGiveawaysQuery = () =>
  queryOptions({
    queryKey: ["giveaways", "active"],
    queryFn: async (): Promise<Giveaway[]> => {
      const { data, error } = await supabase
        .from("giveaways")
        .select("*")
        .eq("active", true)
        .order("ends_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Giveaway[];
    },
  });

export const giveawayBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["giveaways", "by-slug", slug],
    queryFn: async (): Promise<Giveaway | null> => {
      const { data } = await supabase
        .from("giveaways")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      return (data ?? null) as Giveaway | null;
    },
  });

export const allGiveawaysAdminQuery = () =>
  queryOptions({
    queryKey: ["giveaways", "all-admin"],
    queryFn: async (): Promise<Giveaway[]> => {
      const { data, error } = await supabase
        .from("giveaways")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Giveaway[];
    },
  });

export const giveawayEntriesQuery = (giveawayId: string) =>
  queryOptions({
    queryKey: ["giveaway_entries", giveawayId],
    queryFn: async (): Promise<GiveawayEntry[]> => {
      const { data, error } = await supabase
        .from("giveaway_entries")
        .select("*")
        .eq("giveaway_id", giveawayId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as GiveawayEntry[];
    },
  });

export type SiteSettings = {
  id: string;
  site_title: string;
  tagline: string | null;
  seasonal_effect: "none" | "snow" | "embers" | "rain" | "confetti" | string;
  effect_intensity: number;
  accent_color: string | null;
  social_instagram: string | null;
  social_youtube: string | null;
  social_tiktok: string | null;
  contact_email: string | null;
  footer_note: string | null;
  homepage_intro: string | null;
  favicon_url: string | null;
  updated_at: string;
};

export const siteSettingsQuery = () =>
  queryOptions({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<SiteSettings | null> => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      return (data ?? null) as SiteSettings | null;
    },
  });

export type Announcement = {
  id: string;
  message: string;
  link_url: string | null;
  link_label: string | null;
  style: "default" | "gold" | "alert" | string;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export const activeAnnouncementsQuery = () =>
  queryOptions({
    queryKey: ["announcements", "active"],
    queryFn: async (): Promise<Announcement[]> => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Announcement[];
    },
  });

export const allAnnouncementsAdminQuery = () =>
  queryOptions({
    queryKey: ["announcements", "all-admin"],
    queryFn: async (): Promise<Announcement[]> => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Announcement[];
    },
  });
