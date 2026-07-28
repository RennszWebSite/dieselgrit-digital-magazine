import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const PUBLIC_MEDIA_BUCKETS = new Set(["feature-images", "partner-logos", "submission-photos"]);

export const Route = createFileRoute("/api/public/media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const bucket = url.searchParams.get("bucket") ?? "";
        const path = url.searchParams.get("path") ?? "";

        if (
          !PUBLIC_MEDIA_BUCKETS.has(bucket) ||
          !path ||
          path.length > 1024 ||
          path.startsWith("/") ||
          path.split("/").includes("..")
        ) {
          return new Response("Invalid media path", { status: 400 });
        }

        try {
          const SUPABASE_URL = process.env.SUPABASE_URL;
          const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (!SUPABASE_URL || (!anonKey && !serviceKey)) {
            return new Response("Media service not configured", { status: 503 });
          }
          const key = anonKey || serviceKey!;
          const client = createClient(SUPABASE_URL, key, {
            auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
            global: {
              fetch: (input, init) => {
                const h = new Headers(init?.headers);
                if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
                  h.delete("Authorization");
                }
                h.set("apikey", key);
                return fetch(input, { ...init, headers: h });
              },
            },
          });
          const { data, error } = await client.storage.from(bucket).download(path);
          if (error || !data) return new Response("Media not found", { status: 404 });

          return new Response(await data.arrayBuffer(), {
            headers: {
              "Content-Type": data.type || "application/octet-stream",
              "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
              "X-Content-Type-Options": "nosniff",
            },
          });
        } catch {
          return new Response("Media unavailable", { status: 503 });
        }
      },
    },
  },
});