import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { activeAnnouncementsQuery, type Announcement } from "@/lib/queries";

function styleClasses(style: string) {
  switch (style) {
    case "gold":
      return "bg-gold text-background";
    case "alert":
      return "bg-red-900/90 text-white";
    default:
      return "bg-white text-background";
  }
}

export function AnnouncementBanner() {
  const { data: all = [] } = useQuery(activeAnnouncementsQuery());
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dg_dismissed_announcements");
      if (raw) setDismissed(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  const announcement: Announcement | undefined = all.find(
    (a) => !dismissed.includes(a.id),
  );
  if (!announcement) return null;

  function dismiss() {
    if (!announcement) return;
    const next = [...dismissed, announcement.id];
    setDismissed(next);
    try {
      localStorage.setItem("dg_dismissed_announcements", JSON.stringify(next));
    } catch {
      /* noop */
    }
  }

  return (
    <div
      className={`relative z-40 flex items-center justify-between gap-3 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${styleClasses(
        announcement.style,
      )}`}
    >
      <div className="flex-1 truncate">
        <span>{announcement.message}</span>
        {announcement.link_url && (
          <a
            href={announcement.link_url}
            target={announcement.link_url.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="ml-3 underline underline-offset-2"
          >
            {announcement.link_label || "Learn more"} →
          </a>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="shrink-0 opacity-70 hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}