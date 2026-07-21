import type { Feature } from "@/lib/queries";

type Props = {
  features: Feature[];
};

export function Ticker({ features }: Props) {
  const items = features.length
    ? features.slice(0, 8).map(
        (f) =>
          `Nº ${String(f.feature_number).padStart(3, "0")} — ${f.title}${
            f.owner_name ? ` · ${f.owner_name}` : ""
          }`,
      )
    : [
        "DIESELGRIT MEDIA",
        "REAL TRUCKS · REAL GRIT",
        "VOLUME 01 · NOW PUBLISHING",
        "SUBMIT YOUR BUILD",
      ];

  const loop = [...items, ...items];

  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y border-white/10 bg-black/60 py-3"
    >
      <div className="dg-marquee gap-10 whitespace-nowrap text-eyebrow text-white/70">
        {loop.map((label, i) => (
          <span key={i} className="flex items-center gap-10">
            <span>{label}</span>
            <span className="inline-block size-1.5 rounded-full bg-gold dg-live-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}