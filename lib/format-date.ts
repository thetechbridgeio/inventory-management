export const formatDate = (
  value?: string | null,
) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};