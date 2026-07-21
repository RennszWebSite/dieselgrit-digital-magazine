import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery } from "@/lib/queries";

type Effect = "none" | "snow" | "embers" | "rain" | "confetti";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  hue?: string;
};

export function SeasonalEffect() {
  const { data: settings } = useQuery(siteSettingsQuery());
  const effect = (settings?.seasonal_effect ?? "none") as Effect;
  const intensity = Math.max(0, Math.min(100, settings?.effect_intensity ?? 50));

  if (!effect || effect === "none") return null;
  return <EffectCanvas effect={effect} intensity={intensity} />;
}

function EffectCanvas({ effect, intensity }: { effect: Effect; intensity: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const count = useMemo(() => {
    const base = effect === "confetti" ? 40 : effect === "embers" ? 30 : 80;
    return Math.round((base * intensity) / 50);
  }, [effect, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    function spawn(): Particle {
      switch (effect) {
        case "snow":
          return {
            x: rand(0, width),
            y: rand(-height, 0),
            vx: rand(-0.3, 0.3),
            vy: rand(0.4, 1.4),
            size: rand(1, 3),
            life: 1,
          };
        case "rain":
          return {
            x: rand(0, width),
            y: rand(-height, 0),
            vx: rand(-0.5, -0.2),
            vy: rand(6, 11),
            size: rand(6, 14),
            life: 1,
          };
        case "embers":
          return {
            x: rand(0, width),
            y: rand(height, height + 200),
            vx: rand(-0.3, 0.3),
            vy: rand(-1.4, -0.6),
            size: rand(1, 2.4),
            life: rand(0.6, 1),
            hue: `rgba(255,${Math.floor(rand(120, 200))},${Math.floor(rand(40, 90))},`,
          };
        case "confetti": {
          const golds = ["#c6a15b", "#e8d19b", "#ffffff", "#0a0a0a"];
          return {
            x: rand(0, width),
            y: rand(-height, 0),
            vx: rand(-1, 1),
            vy: rand(1.5, 3),
            size: rand(3, 6),
            life: 1,
            hue: golds[Math.floor(Math.random() * golds.length)],
          };
        }
        default:
          return { x: 0, y: 0, vx: 0, vy: 0, size: 0, life: 0 };
      }
    }

    for (let i = 0; i < count; i++) particles.push(spawn());

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (effect === "snow") {
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === "rain") {
          ctx.strokeStyle = "rgba(180,200,220,0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx, p.y - p.size);
          ctx.stroke();
        } else if (effect === "embers") {
          p.life -= 0.004;
          ctx.fillStyle = `${p.hue}${Math.max(0, p.life).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === "confetti") {
          ctx.fillStyle = p.hue ?? "#c6a15b";
          ctx.fillRect(p.x, p.y, p.size, p.size * 0.4);
        }

        const dead =
          p.y > height + 20 ||
          p.x < -20 ||
          p.x > width + 20 ||
          (effect === "embers" && p.life <= 0);
        if (dead) particles[i] = spawn();
      }
      rafRef.current = requestAnimationFrame(draw);
    }

    function onResize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
    }
    window.addEventListener("resize", onResize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [effect, count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] mix-blend-screen"
    />
  );
}