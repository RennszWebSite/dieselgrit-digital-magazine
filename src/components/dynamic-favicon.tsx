import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery, publicImageUrl } from "@/lib/queries";

export function DynamicFavicon() {
  const { data } = useQuery(siteSettingsQuery());
  const href = publicImageUrl(data?.favicon_url, "partner-logos");
  useEffect(() => {
    if (!href) return;
    // Cache-bust so the browser actually picks up the new favicon.
    const bust = data?.updated_at
      ? `${href}${href.includes("?") ? "&" : "?"}v=${encodeURIComponent(data.updated_at)}`
      : href;
    // Remove every existing icon <link> so stale ones don't win.
    document
      .querySelectorAll("link[rel~='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")
      .forEach((el) => el.parentNode?.removeChild(el));
    const add = (rel: string, sizes?: string) => {
      const link = document.createElement("link");
      link.rel = rel;
      link.href = bust;
      if (sizes) link.setAttribute("sizes", sizes);
      document.head.appendChild(link);
    };
    add("icon");
    add("shortcut icon");
    add("apple-touch-icon", "180x180");
  }, [href, data?.updated_at]);
  return null;
}