import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion";

const WORD = "DIESELGRIT";
const STORAGE_KEY = "dg_intro_seen_v1";

export function SessionIntro() {
  // Start hidden on both server + client to avoid hydration mismatch,
  // then flip on after mount if this session hasn't seen the intro.
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (!seen) setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setVisible(false);
    }, 2200);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="dg-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          style={{ height: "100dvh" }}
        >
          <div className="flex overflow-hidden" aria-label="DieselGrit">
            {WORD.split("").map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: 0.9,
                  delay: 0.15 + i * 0.055,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="font-display text-[clamp(2rem,10vw,4.5rem)] leading-none tracking-[0.02em] text-foreground"
              >
                {ch}
              </motion.span>
            ))}
          </div>
          <div className="mt-10 h-px w-40 overflow-hidden bg-white/10">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
              style={{ transformOrigin: "left" }}
              className="h-full w-full bg-gold"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-6 text-eyebrow text-white/50"
          >
            Volume 01
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}