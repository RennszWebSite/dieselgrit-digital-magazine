import { createServerFn } from "@tanstack/react-start";

export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = "dieselgrit@gmail.com";
  const password = "Hunterr1234";
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
  let user = existing?.users?.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user!;
  } else {
    await supabaseAdmin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  }
  await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
  return { ok: true, userId: user.id };
});