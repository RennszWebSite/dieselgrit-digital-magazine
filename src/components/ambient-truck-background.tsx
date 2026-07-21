import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { publishedFeaturesQuery, publicImageUrl } from "@/lib/queries";

/**
 * Site-wide ambient background that slowly cross-fades through
 * hero photos of published features. Sits fixed behind all content
 * with a heavy dark tint so text/UI stays legible.
 */
export function AmbientTruckBackground() {
  const { data: features = [] } = useQuery(publishedFeaturesQuery());

  const images = useMemo(
    () =>
      features
        .map((f) => (f.hero_image ? publicImageUrl(f.hero_image) : null))
        .filter((u): u is string => Boolean(u)),
    [features],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 9000);
    return () => clearInterval(t);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          loading={i === 0 ? "eager" : "lazy"}
          className="dg-ambient-img absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: i === index ? 0.28 : 0,
            transition: "opacity 2200ms ease-in-out",
          }}
        />
      ))}
      {/* Readability overlays */}
      <div className="absolute inset-0 bg-background/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/80" />
      <div className="dg-grain opacity-60" />
    </div>
  );
}