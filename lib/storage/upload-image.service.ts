import { randomUUID } from "crypto";

import { ExternalServiceError } from "@/lib/errors/external-service-error";
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

const BUCKET_NAME = "inventory-edge-images";

export async function uploadImage({
  file,
  folder,
  transactionContext,
}: UploadImageOptions): Promise<UploadImageResponse> {
  try {
    const extension =
      file.name.split(".").pop()?.toLowerCase() ?? "jpg";

    const fileName = `${randomUUID()}.${extension}`;
    const filePath = `${folder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new ExternalServiceError(
        "Failed to upload image.",
        error,
      );
    }

    transactionContext?.uploadedFiles.push(data.path);

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl,
      fileName,
    };
  } catch (error) {
    if (error instanceof ExternalServiceError) {
      throw error;
    }

    throw new ExternalServiceError(
      "Failed to upload image.",
      error,
    );
  }
}

export async function rollbackUploadedFiles(
  transactionContext: TransactionContext,
) {
  const { uploadedFiles } = transactionContext;

  if (uploadedFiles.length === 0) {
    return;
  }

  try {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove(uploadedFiles);

    if (error) {
      console.error(
        "Failed to rollback uploaded files:",
        error,
      );
    }
  } catch (error) {
    console.error(
      "Failed to rollback uploaded files:",
      error,
    );
  }
}