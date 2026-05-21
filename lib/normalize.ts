export function normalize(value: unknown): string {
  if (typeof value === "string") {
    return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase()
  }

  if (
    value == null ||
    typeof value === "object" ||
    typeof value === "function" ||
    typeof value === "symbol"
  ) {
    return ""
  }

  return String(value)
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}
