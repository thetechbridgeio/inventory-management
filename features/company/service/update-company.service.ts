import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";

import {
  rollbackUploadedFiles,
  uploadImage,
  TransactionContext,
} from "@/lib/storage/upload-image.service";
import { deleteImage } from "@/lib/storage/delete-image.service";

import { companies } from "../schemas/company.schema";
import { UpdateCompanyFormType } from "../types/company.type";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { ExternalServiceError } from "@/lib/errors/external-service-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function updateCompany(
  companyId: string,
  data: UpdateCompanyFormType,
) {
  const transactionContext: TransactionContext = { uploadedFiles: [] };

  let oldLogoToDelete: string | undefined;

  try {
    const existingCompany = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    });

    if (!existingCompany) {
      throw new NotFoundError("Company not found");
    }

    let logoUrl = existingCompany.logoUrl;

    if (data.logoUrl instanceof File) {
      const uploadedLogo = await uploadImage({
        file: data.logoUrl,
        folder: `${companyId}/COMPANY`,
        transactionContext,
      });

      logoUrl = uploadedLogo.publicUrl;

      if (existingCompany.logoUrl) {
        oldLogoToDelete = existingCompany.logoUrl;
      }
    } else if (data.logoUrl !== undefined) {
      // `null` means the logo was explicitly removed; any other string is a new value.
      if (data.logoUrl === null && existingCompany.logoUrl) {
        oldLogoToDelete = existingCompany.logoUrl;
      }

      logoUrl = data.logoUrl;
    }

    const [company] = await db
      .update(companies)
      .set({
        ...data,
        logoUrl,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId))
      .returning();

    if (oldLogoToDelete) {
      try {
        await deleteImage(oldLogoToDelete);
      } catch (error) {
        console.error("Failed to delete old company logo:", oldLogoToDelete, error);
      }
    }

    return company;
  } catch (error) {
    await rollbackUploadedFiles(transactionContext);

    if (error instanceof NotFoundError || error instanceof ExternalServiceError) {
      throw error;
    }

    mapDatabaseError(error);
  }
}
