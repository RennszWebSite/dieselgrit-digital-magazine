import { useEffect, useRef } from "react";

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(pointer: fine)").matches;
}

/** IntersectionObserver-driven class toggle. Adds `is-in` once element enters. */
export function useInView<T extends HTMLElement>(opts?: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            if (opts?.once !== false) io.unobserve(entry.target);
          } else if (opts?.once === false) {
            entry.target.classList.remove("is-in");
          }
        }
      },
      {
        threshold: opts?.threshold ?? 0.01,
        rootMargin: opts?.rootMargin ?? "0px 0px 15% 0px",
      },
    );
    io.observe(el);
    // Safety net: if the observer never fires (fast scroll, mobile quirks),
    // reveal after 1.6s so nothing is left as a black gap.
    const t = window.setTimeout(() => el.classList.add("is-in"), 1600);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [opts?.threshold, opts?.rootMargin, opts?.once]);
  return ref;
}