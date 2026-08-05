export function buildProductFormData<
  T extends Record<string, unknown> & {
    images?: (File | string)[];
  },
>(data: T): FormData {
  const formData = new FormData();

  const { images, ...payload } = data;

  const existingImages: string[] = [];

  for (const image of images ?? []) {
    if (image instanceof File) {
      formData.append("images", image);
    } else {
      existingImages.push(image);
    }
  }

  formData.append(
    "payload",
    JSON.stringify({ ...payload, images: existingImages }),
  );

  return formData;
}
