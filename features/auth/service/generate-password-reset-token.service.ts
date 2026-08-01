import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function generatePasswordResetToken(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (error) {
    return null;
  }

  return data.properties.hashed_token;
}
