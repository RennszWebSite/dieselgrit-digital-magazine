import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { GiveawayEntry } from "@/lib/queries";

type Props = {
  entries: GiveawayEntry[];
  onWinner: (winner: GiveawayEntry) => void;
  onClose: () => void;
};

// Visually spins through entries and lands on a random one.
export function GiveawayWheel({ entries, onWinner, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<GiveawayEntry | null>(null);
  const rotationRef = useRef(0);

  // Cap visible slices for legibility; keep true random across all entries.
  const slices = useMemo(() => {
    if (entries.length <= 24) return entries;
    // Sample down for the visual wheel; winner is still drawn from full pool.
    const step = Math.ceil(entries.length / 24);
    return entries.filter((_, i) => i % step === 0).slice(0, 24);
  }, [entries]);

  useEffect(() => {
    draw(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slices.length]);

  function draw(rotation: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 6;
    const n = Math.max(slices.length, 1);
    const seg = (Math.PI * 2) / n;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    for (let i = 0; i < n; i++) {
      const a0 = i * seg;
      const a1 = a0 + seg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, a0, a1);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? "#0a0a0a" : "#141414";
      ctx.fill();
      ctx.strokeStyle = "rgba(212,175,90,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // label
      ctx.save();
      ctx.rotate(a0 + seg / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#e9e2cf";
      ctx.font = "600 11px Inter, system-ui, sans-serif";
      const label = slices[i]?.name ?? "";
      const truncated = label.length > 14 ? label.slice(0, 13) + "…" : label;
      ctx.fillText(truncated, r - 12, 4);
      ctx.restore();
    }

    // outer ring
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#d4af5a";
    ctx.lineWidth = 3;
    ctx.stroke();

    // hub
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0a0a";
    ctx.fill();
    ctx.strokeStyle = "#d4af5a";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  function spin() {
    if (spinning || entries.length === 0) return;
    setResult(null);
    setSpinning(true);

    // Pick the true winner from the full pool.
    const winner = entries[Math.floor(Math.random() * entries.length)];

    // Find a slice to visually land on; if winner isn't visible, land on any slice.
    const visibleIdx = slices.findIndex((s) => s.id === winner.id);
    const targetIdx = visibleIdx >= 0 ? visibleIdx : Math.floor(Math.random() * slices.length);
    const seg = (Math.PI * 2) / Math.max(slices.length, 1);
    // Pointer sits at the top (angle = -PI/2). We want the target segment's center under it.
    const targetCenter = targetIdx * seg + seg / 2;
    const spins = 6; // full rotations
    const finalRotation =
      spins * Math.PI * 2 + (-Math.PI / 2 - targetCenter - rotationRef.current % (Math.PI * 2));

    const start = performance.now();
    const from = rotationRef.current;
    const duration = 4200;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

    function frame(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const cur = from + finalRotation * easeOut(t);
      rotationRef.current = cur;
      draw(cur);
      if (t < 1) requestAnimationFrame(frame);
      else {
        setSpinning(false);
        setResult(winner);
        onWinner(winner);
      }
    }
    requestAnimationFrame(frame);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm px-5 py-8 overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute right-5 top-5 grid size-10 place-items-center border border-white/10 text-white/60"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>
      <div className="w-full max-w-sm text-center">
        <p className="text-eyebrow text-gold">Draw Winner</p>
        <h2 className="mt-1 font-display text-2xl">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </h2>

        <div className="relative mx-auto mt-6 aspect-square w-full">
          {/* pointer */}
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
            <div className="size-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-gold" />
          </div>
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>

        <button
          onClick={spin}
          disabled={spinning || entries.length === 0}
          className="mt-8 w-full bg-gold py-4 text-eyebrow text-background disabled:opacity-40"
        >
          {spinning ? "Spinning…" : result ? "Spin Again" : "Spin the Wheel"}
        </button>

        {result && !spinning && (
          <div className="mt-6 border border-gold/40 bg-gold/5 p-5">
            <p className="text-eyebrow text-gold">Winner</p>
            <p className="mt-2 font-display text-2xl">{result.name}</p>
            <p className="mt-1 text-xs text-white/60">
              {result.email}
              {result.instagram ? ` · ${result.instagram}` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}