import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const PUBLIC_MEDIA_BUCKETS = new Set(["feature-images", "partner-logos"]);

function createPublicStorageClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Media storage is not configured");

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

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
          const storage = createPublicStorageClient();
          const { data, error } = await storage.storage.from(bucket).download(path);
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