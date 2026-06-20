export function buildFormData<
  T extends Record<string, unknown> & {
    image?: File | null;
  },
>(data: T): FormData {
  const formData = new FormData();

  const { image, ...payload } = data;

  if (image) {
    formData.append("image", image);
  }

  formData.append(
    "payload",
    JSON.stringify(payload),
  );

  return formData;
}