import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, FileText, Gift, Inbox, TrendingUp } from "lucide-react";
import {
  allFeaturesAdminQuery,
  submissionsQuery,
  allGiveawaysAdminQuery,
  publicImageUrl,
} from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const { data: features = [] } = useQuery(allFeaturesAdminQuery());
  const { data: submissions = [] } = useQuery(submissionsQuery());
  const { data: giveaways = [] } = useQuery(allGiveawaysAdminQuery());
  const { data: entriesCount = 0 } = useQuery({
    queryKey: ["giveaway_entries", "count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("giveaway_entries")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const published = features.filter((f) => f.published);
  const totalViews = published.reduce((s, f) => s + (f.view_count ?? 0), 0);
  const topFeatures = [...published]
    .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
    .slice(0, 5);
  const pendingSubs = submissions.filter((s) => s.status === "pending").length;
  const approvedSubs = submissions.filter((s) => s.status === "approved").length;
  const activeGiveaways = giveaways.filter((g) => g.active).length;

  const now = Date.now();
  const last30 = submissions.filter(
    (s) => now - new Date(s.created_at).getTime() < 30 * 86400000
  ).length;

  return (
    <div className="px-5 py-8 pb-20">
      <p className="text-eyebrow text-gold">Insights</p>
      <h1 className="mt-2 font-display text-3xl">Analytics</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat icon={<Eye className="size-4" />} label="Total Views" value={totalViews.toLocaleString()} />
        <Stat icon={<FileText className="size-4" />} label="Published" value={published.length} />
        <Stat icon={<Inbox className="size-4" />} label="Pending Subs" value={pendingSubs} accent={pendingSubs > 0} />
        <Stat icon={<TrendingUp className="size-4" />} label="Subs · 30d" value={last30} />
        <Stat icon={<Gift className="size-4" />} label="Live Drops" value={activeGiveaways} />
        <Stat icon={<Gift className="size-4" />} label="Entries" value={entriesCount} />
      </div>

      <section className="mt-10">
        <h2 className="text-eyebrow text-white/60">Top Features</h2>
        <div className="mt-4 space-y-2">
          {topFeatures.length === 0 && (
            <p className="text-eyebrow text-white/40">No published features yet.</p>
          )}
          {topFeatures.map((f, i) => (
            <Link
              key={f.id}
              to="/features/$number"
              params={{ number: String(f.feature_number) }}
              className="flex items-center gap-3 border border-white/10 bg-white/[0.02] p-3"
            >
              <div className="w-6 text-eyebrow text-gold">{String(i + 1).padStart(2, "0")}</div>
              <div className="size-12 shrink-0 overflow-hidden bg-white/5">
                {f.hero_image && (
                  <img
                    src={publicImageUrl(f.hero_image) ?? ""}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base">{f.title}</p>
                <p className="truncate text-[11px] text-white/50">
                  Nº {String(f.feature_number).padStart(3, "0")} · {f.owner_instagram}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/70">
                <Eye className="size-3.5" />
                {(f.view_count ?? 0).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-eyebrow text-white/60">Submissions</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Mini label="Pending" value={pendingSubs} tone="gold" />
          <Mini label="Approved" value={approvedSubs} />
          <Mini label="Total" value={submissions.length} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-eyebrow text-white/60">Giveaways</h2>
        <div className="mt-4 space-y-2">
          {giveaways.slice(0, 6).map((g) => (
            <Link
              key={g.id}
              to="/admin/giveaways/$id"
              params={{ id: g.id }}
              className="flex items-center justify-between border border-white/10 bg-white/[0.02] p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-display text-base">{g.title}</p>
                <p className="truncate text-[11px] text-white/50">{g.prize}</p>
              </div>
              <span
                className={`shrink-0 text-eyebrow ${
                  g.active ? "text-gold" : "text-white/40"
                }`}
              >
                {g.active ? "Live" : g.winner_entry_id ? "Drawn" : "Closed"}
              </span>
            </Link>
          ))}
          {giveaways.length === 0 && (
            <p className="text-eyebrow text-white/40">No giveaways yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`border p-4 ${
        accent ? "border-gold/60 bg-gold/[0.06]" : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-1.5 text-eyebrow text-white/50">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "gold";
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-3">
      <p className={`font-display text-2xl ${tone === "gold" ? "text-gold" : ""}`}>{value}</p>
      <p className="mt-1 text-eyebrow text-white/50">{label}</p>
    </div>
  );
}