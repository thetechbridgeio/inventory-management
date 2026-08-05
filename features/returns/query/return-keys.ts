export const returnKeys = {
  all: ["sale-returns"] as const,

  lists: () => [...returnKeys.all, "list"] as const,

  list: (filters: unknown) => [...returnKeys.lists(), filters] as const,

  details: () => [...returnKeys.all, "detail"] as const,

  detail: (id: string) => [...returnKeys.details(), id] as const,
};
