import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery, publicImageUrl } from "@/lib/queries";

export function DynamicFavicon() {
  const { data } = useQuery(siteSettingsQuery());
  const href = publicImageUrl(data?.favicon_url, "partner-logos");
  useEffect(() => {
    if (!href) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [href]);
  return null;
}