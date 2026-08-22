export function buildCompanyFormData<
  T extends Record<string, unknown> & {
    logoUrl?: File | string | null;
  },
>(data: T): FormData {
  const formData = new FormData();

  const { logoUrl, ...payload } = data;

  const jsonPayload: Record<string, unknown> = { ...payload };

  if (logoUrl instanceof File) {
    formData.append("logo", logoUrl);
  } else if (logoUrl !== undefined) {
    jsonPayload.logoUrl = logoUrl;
  }

  formData.append("payload", JSON.stringify(jsonPayload));

  return formData;
}
