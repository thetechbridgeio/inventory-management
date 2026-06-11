export const purchaseKeys = {
  all: ["purchases"] as const,

  lists: () => [...purchaseKeys.all, "list"] as const,

  list: (filters: unknown) =>
    [...purchaseKeys.lists(), filters] as const,

  details: () =>
    [...purchaseKeys.all, "detail"] as const,

  detail: (id: string) =>
    [...purchaseKeys.details(), id] as const,
};