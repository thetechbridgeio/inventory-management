// constants/role.ts

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  PURCHASE_ADMIN: "PURCHASE_ADMIN",
  STORE_ADMIN: "STORE_ADMIN",
  OPERATIONS_ADMIN: "OPERATIONS_ADMIN",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.PURCHASE_ADMIN]: "Purchase Admin",
  [ROLES.STORE_ADMIN]: "Store Admin",
  [ROLES.OPERATIONS_ADMIN]: "Operations Admin",
};
