import { supabaseAdmin } from "../supabase/admin";

export async function deleteImage(path: string) {
  const { error } = await supabaseAdmin.storage
    .from("inventory-edge-images")
    .remove([path]);

  if (error) {
    throw error;
  }
}
