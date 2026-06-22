import { supabaseAdmin } from "../supabase/admin";

const BUCKET_NAME = "inventory-edge-images";

function getStoragePath(pathOrUrl: string): string {
  if (!pathOrUrl.startsWith("http")) {
    return pathOrUrl;
  }

  const parts = pathOrUrl.split(`/${BUCKET_NAME}/`);

  if (parts.length !== 2) {
    throw new Error("Invalid Supabase public URL");
  }

  return parts[1];
}

export async function deleteImage(pathOrUrl: string) {
  const storagePath = getStoragePath(pathOrUrl);

  console.log(storagePath);

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (error) {
    throw error;
  }
}
