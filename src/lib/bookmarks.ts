import { useEffect, useState } from "react";

const KEY = "dg:saved-features";

function read(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function write(list: number[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("dg:saved-updated"));
}

export function useSaved() {
  const [saved, setSaved] = useState<number[]>([]);
  useEffect(() => {
    setSaved(read());
    const onUpdate = () => setSaved(read());
    window.addEventListener("dg:saved-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("dg:saved-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);
  return {
    saved,
    isSaved: (n: number) => saved.includes(n),
    toggle: (n: number) => {
      const current = read();
      const next = current.includes(n)
        ? current.filter((x) => x !== n)
        : [n, ...current];
      write(next);
    },
  };
}

const LIKED_KEY = "dg:liked-features";

export function hasLiked(num: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = JSON.parse(localStorage.getItem(LIKED_KEY) || "[]");
    return Array.isArray(v) && v.includes(num);
  } catch {
    return false;
  }
}

export function markLiked(num: number) {
  try {
    const v = JSON.parse(localStorage.getItem(LIKED_KEY) || "[]");
    const arr = Array.isArray(v) ? v : [];
    if (!arr.includes(num)) arr.push(num);
    localStorage.setItem(LIKED_KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}