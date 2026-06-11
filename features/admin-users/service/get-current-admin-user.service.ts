// features/admin-users/service/get-current-admin-user.service.ts

import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentAdminUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}