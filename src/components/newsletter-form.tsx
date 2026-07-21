import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function NewsletterForm({ source = "footer" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) return toast.error("Enter a valid email");
    setBusy(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: trimmed, source });
    setBusy(false);
    if (error && !/duplicate|unique/i.test(error.message)) {
      return toast.error(error.message);
    }
    setDone(true);
    setEmail("");
    toast.success("You're on the list");
  }

  if (done) {
    return (
      <p className="text-eyebrow text-gold">
        ✓ Welcome to the DieselGrit dispatch.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 border-b border-white/20 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-white/30 focus:border-gold"
      />
      <button
        type="submit"
        disabled={busy}
        className="text-eyebrow text-gold disabled:opacity-50"
      >
        {busy ? "…" : "Subscribe →"}
      </button>
    </form>
  );
}