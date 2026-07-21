import { useState } from "react";
import { Bookmark, BookmarkCheck, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { hasLiked, markLiked, useSaved } from "@/lib/bookmarks";

export function FeatureActions({
  featureNumber,
  title,
  initialLikes,
}: {
  featureNumber: number;
  title: string;
  initialLikes: number;
}) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(featureNumber);
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(() => hasLiked(featureNumber));
  const [busy, setBusy] = useState(false);

  async function like() {
    if (liked || busy) return;
    setBusy(true);
    setLiked(true);
    setLikes((n) => n + 1);
    markLiked(featureNumber);
    const { data, error } = await supabase.rpc("increment_feature_likes", {
      _feature_number: featureNumber,
    });
    setBusy(false);
    if (error) {
      setLiked(false);
      setLikes((n) => Math.max(0, n - 1));
      toast.error("Couldn't record like");
    } else if (typeof data === "number") {
      setLikes(data);
    }
  }

  async function share() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/features/${featureNumber}`
        : "";
    const shareData = { title: `DieselGrit — ${title}`, url };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <button
        onClick={like}
        disabled={liked}
        className={`inline-flex items-center gap-2 border px-4 py-2 text-eyebrow transition ${
          liked
            ? "border-gold/40 bg-gold/10 text-gold"
            : "border-white/15 text-white/80 hover:border-gold hover:text-gold"
        }`}
      >
        <Heart
          className={`size-3.5 ${liked ? "fill-gold text-gold" : ""}`}
        />
        {likes.toLocaleString()} {likes === 1 ? "like" : "likes"}
      </button>
      <button
        onClick={() => toggle(featureNumber)}
        className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-eyebrow text-white/80 hover:border-gold hover:text-gold"
      >
        {saved ? (
          <>
            <BookmarkCheck className="size-3.5 text-gold" /> Saved
          </>
        ) : (
          <>
            <Bookmark className="size-3.5" /> Save
          </>
        )}
      </button>
      <button
        onClick={share}
        className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-eyebrow text-white/80 hover:border-gold hover:text-gold"
      >
        <Share2 className="size-3.5" /> Share
      </button>
    </div>
  );
}