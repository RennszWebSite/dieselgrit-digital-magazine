import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/bootstrap-admin")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = "dieselgrit@gmail.com";
        const password = "Hunterr1234";
        const { data: existing, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (listErr) return new Response(listErr.message, { status: 500 });
        let user = existing?.users?.find((u) => u.email?.toLowerCase() === email);
        if (!user) {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          if (error) return new Response(error.message, { status: 500 });
          user = data.user!;
        } else {
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password,
            email_confirm: true,
          });
        }
        const { error: roleErr } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
        if (roleErr) return new Response(roleErr.message, { status: 500 });
        return new Response(JSON.stringify({ ok: true, userId: user.id }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});