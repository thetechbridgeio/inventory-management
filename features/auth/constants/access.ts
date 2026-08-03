// import "server-only";

import { ROLES, UserRole } from "./user-role";

export const ACCESS = {
  dashboard: [
    ROLES.SUPER_ADMIN,
    ROLES.PURCHASE_ADMIN,
    ROLES.STORE_ADMIN,
    ROLES.OPERATIONS_ADMIN,
  ],
  inventory: [
    ROLES.SUPER_ADMIN,
    ROLES.STORE_ADMIN,
    ROLES.PURCHASE_ADMIN,
    ROLES.OPERATIONS_ADMIN,
  ],
  suppliers: [
    ROLES.SUPER_ADMIN,
    ROLES.STORE_ADMIN,
    ROLES.PURCHASE_ADMIN,
    ROLES.OPERATIONS_ADMIN,
  ],
  purchases: [ROLES.SUPER_ADMIN, ROLES.PURCHASE_ADMIN, ROLES.OPERATIONS_ADMIN],
  sales: [ROLES.SUPER_ADMIN, ROLES.STORE_ADMIN, ROLES.OPERATIONS_ADMIN],
  processOrders: [
    ROLES.SUPER_ADMIN,
    ROLES.PURCHASE_ADMIN,
    ROLES.STORE_ADMIN,
    ROLES.OPERATIONS_ADMIN,
  ],
  company: [ROLES.SUPER_ADMIN],
  users: [ROLES.SUPER_ADMIN],
  purchaseRequest: [
    ROLES.SUPER_ADMIN,
    ROLES.PURCHASE_ADMIN,
    ROLES.OPERATIONS_ADMIN,
  ],
  support: [
    ROLES.SUPER_ADMIN,
    ROLES.PURCHASE_ADMIN,
    ROLES.STORE_ADMIN,
    ROLES.OPERATIONS_ADMIN,
  ],
} satisfies Record<string, readonly UserRole[]>;

export function assertRoleAllowed(role: UserRole, group: keyof typeof ACCESS) {
  const allowedRoles: readonly UserRole[] = ACCESS[group];
  return allowedRoles.includes(role);
}