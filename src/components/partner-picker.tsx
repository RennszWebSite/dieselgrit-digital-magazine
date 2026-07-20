import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { buildPartnersQuery, publicImageUrl } from "@/lib/queries";

export function PartnerPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const { data: partners = [] } = useQuery(buildPartnersQuery());
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return partners;
    return partners.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.instagram ?? "").toLowerCase().includes(needle) ||
        (p.category ?? "").toLowerCase().includes(needle),
    );
  }, [q, partners]);

  function toggle(id: string) {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((x) => x !== id));
    else onChange([...selectedIds, id]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border border-white/10 px-3 py-2">
        <Search className="size-4 text-white/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search build partners…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      {partners.length === 0 && (
        <p className="text-eyebrow text-white/50">
          No partners yet.{" "}
          <Link to="/admin/partners" className="text-gold underline">
            Add one
          </Link>
          .
        </p>
      )}
      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {filtered.map((p) => {
          const selected = selectedIds.includes(p.id);
          const logo = publicImageUrl(p.logo_url, "partner-logos");
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`flex w-full items-center gap-3 border px-3 py-2 text-left transition ${
                selected ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="size-8 shrink-0 overflow-hidden rounded-full bg-white/5">
                {logo && <img src={logo} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{p.name}</p>
                <p className="truncate text-[11px] text-white/50">
                  {p.instagram} {p.category ? `· ${p.category}` : ""}
                </p>
              </div>
              {selected && <Check className="size-4 text-gold" />}
            </button>
          );
        })}
      </div>
      <Link to="/admin/partners" className="block text-eyebrow text-gold">
        Manage build partner library →
      </Link>
    </div>
  );
}