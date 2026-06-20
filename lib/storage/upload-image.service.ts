import { randomUUID } from "crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";

export interface TransactionContext {
  uploadedFiles: string[];
}

export interface UploadImageOptions {
  file: File;
  folder: string;
  transactionContext?: TransactionContext;
}

export interface UploadImageResponse {
  path: string;
  publicUrl: string;
  fileName: string;
}

export async function uploadImage({
  file,
  folder,
  transactionContext,
}: UploadImageOptions): Promise<UploadImageResponse> {
  const extension =
    file.name.split(".").pop()?.toLowerCase() ?? "jpg";

  const fileName = `${randomUUID()}.${extension}`;
  const filePath = `${folder}/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabaseAdmin.storage
    .from("inventory-edge-images")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  transactionContext?.uploadedFiles.push(data.path);

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage
    .from("inventory-edge-images")
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl,
    fileName,
  };
}

export async function rollbackUploadedFiles(
  transactionContext: TransactionContext,
) {
  const { uploadedFiles } = transactionContext;

  if (uploadedFiles.length === 0) {
    return;
  }

  const { error } = await supabaseAdmin.storage
    .from("inventory-edge-images")
    .remove(uploadedFiles);

  if (error) {
    console.error(
      "Failed to rollback uploaded files:",
      error,
    );
  }
}