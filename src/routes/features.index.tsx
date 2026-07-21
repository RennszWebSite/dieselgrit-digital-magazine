import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { publishedFeaturesQuery, publicImageUrl } from "@/lib/queries";

export const Route = createFileRoute("/features/")({
  component: FeaturesIndex,
});

function FeaturesIndex() {
  const { data: features = [], isLoading } = useQuery(publishedFeaturesQuery());
  const [q, setQ] = useState("");
  const [make, setMake] = useState<string>("all");
  const [engine, setEngine] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "popular">("newest");

  const makes = useMemo(
    () => Array.from(new Set(features.map((f) => f.make).filter(Boolean))).sort(),
    [features],
  );
  const engines = useMemo(
    () =>
      Array.from(new Set(features.map((f) => f.engine).filter(Boolean))).sort() as string[],
    [features],
  );
  const categories = useMemo(
    () =>
      Array.from(new Set(features.map((f) => f.category).filter(Boolean))).sort() as string[],
    [features],
  );

  const filtered = features.filter((f) => {
    const term = q.trim().toLowerCase();
    const matchQ =
      !term ||
      f.title.toLowerCase().includes(term) ||
      f.owner_instagram.toLowerCase().includes(term) ||
      String(f.feature_number).padStart(3, "0").includes(term.replace(/^#/, "")) ||
      String(f.feature_number).includes(term.replace(/^#/, ""));
    const matchMake = make === "all" || f.make === make;
    const matchEngine = engine === "all" || f.engine === engine;
    const matchCategory = category === "all" || f.category === category;
    return matchQ && matchMake && matchEngine && matchCategory;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "popular") return (b.view_count ?? 0) - (a.view_count ?? 0);
    if (sort === "oldest") return a.feature_number - b.feature_number;
    return b.feature_number - a.feature_number;
  });

  return (
    <div className="min-h-screen">
      <SiteNav />
      <header className="px-6 pt-28 pb-6">
        <p className="text-eyebrow text-gold">The Archive</p>
        <h1 className="mt-3 font-display text-5xl leading-none tracking-tight">Every Feature</h1>
        <p className="mt-3 max-w-sm text-sm text-white/60">
          Search and filter every truck we've ever published.
        </p>
      </header>

      <div className="sticky top-14 z-30 border-y border-white/5 bg-background/85 px-6 py-4 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, handle, feature #"
            className="w-full border-b border-white/10 bg-transparent py-2 pl-6 pr-2 text-sm outline-none placeholder:text-white/25 focus:border-gold"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          <SelectPill label="Make" value={make} onChange={setMake} options={makes} />
          <SelectPill label="Engine" value={engine} onChange={setEngine} options={engines} />
          {categories.length > 0 && (
            <SelectPill label="Category" value={category} onChange={setCategory} options={categories} />
          )}
          <SelectPill
            label="Sort"
            value={sort}
            onChange={(v) => setSort(v as typeof sort)}
            options={["newest", "oldest", "popular"]}
          />
          {(q || make !== "all" || engine !== "all" || category !== "all" || sort !== "newest") && (
            <button
              onClick={() => {
                setQ("");
                setMake("all");
                setEngine("all");
                setCategory("all");
                setSort("newest");
              }}
              className="shrink-0 text-eyebrow text-white/50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <section className="px-6 py-10">
        {isLoading ? (
          <p className="text-eyebrow text-white/40">Loading archive…</p>
        ) : sorted.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-eyebrow text-white/40">No features match your filters.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {sorted.map((f) => (
              <Link
                key={f.id}
                to="/features/$number"
                params={{ number: String(f.feature_number) }}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                  {f.hero_image ? (
                    <img
                      src={publicImageUrl(f.hero_image) ?? ""}
                      alt={f.title}
                      className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                    />
                  ) : null}
                  <div className="absolute left-4 top-4 bg-background/80 px-3 py-1 text-[10px] font-bold tracking-widest backdrop-blur">
                    Nº {String(f.feature_number).padStart(3, "0")}
                  </div>
                  {f.category && (
                    <div className="absolute right-4 top-4 bg-gold px-3 py-1 text-[10px] font-bold tracking-widest text-background">
                      {f.category}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-eyebrow text-gold truncate">{f.owner_instagram}</p>
                    <h3 className="mt-1 font-display text-xl leading-tight">{f.title}</h3>
                    <p className="mt-1 text-[11px] uppercase tracking-widest text-white/40">
                      {[f.truck_year, f.make, f.model].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="text-eyebrow text-gold">Read →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}

function SelectPill({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border border-white/15 bg-transparent py-1.5 pl-3 pr-8 text-eyebrow text-white/80 outline-none focus:border-gold"
      >
        <option value="all">{label}: All</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-background">
            {label}: {o}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gold">
        ▾
      </span>
    </label>
  );
}
