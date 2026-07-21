import { useEffect, useState } from "react";

function diff(target: number) {
  const now = Date.now();
  const ms = Math.max(0, target - now);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { ms, days, hours, minutes, seconds };
}

export function Countdown({ endsAt, compact = false }: { endsAt: string; compact?: boolean }) {
  const target = new Date(endsAt).getTime();
  const [t, setT] = useState(() => diff(target));
  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (t.ms === 0) {
    return (
      <div className="text-eyebrow text-white/50">
        Giveaway closed
      </div>
    );
  }

  const cells: [string, number][] = [
    ["Days", t.days],
    ["Hours", t.hours],
    ["Min", t.minutes],
    ["Sec", t.seconds],
  ];

  if (compact) {
    return (
      <span className="text-eyebrow text-gold tabular-nums">
        {t.days}d {String(t.hours).padStart(2, "0")}h {String(t.minutes).padStart(2, "0")}m
      </span>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {cells.map(([label, n]) => (
        <div key={label} className="border border-white/10 bg-white/[0.02] px-2 py-3 text-center">
          <div className="font-display text-3xl leading-none tabular-nums">
            {String(n).padStart(2, "0")}
          </div>
          <div className="mt-1.5 text-[9px] uppercase tracking-widest text-white/50">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}