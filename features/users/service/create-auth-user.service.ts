import { supabaseAdmin } from "@/lib/supabase/admin";
import "server-only";


export async function createAuthUser(data: {
  email: string;
  password: string;
}) {
  const { data: result, error } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  });

  if (error) {
    throw error;
  }

  return result.user;
}
