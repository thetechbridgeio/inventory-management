export const saleKeys = {
  all: ["sales"] as const,

  lists: () => [...saleKeys.all, "list"] as const,

  list: (filters: unknown) =>
    [...saleKeys.lists(), filters] as const,

  details: () =>
    [...saleKeys.all, "detail"] as const,

  detail: (id: string) =>
    [...saleKeys.details(), id] as const,
};