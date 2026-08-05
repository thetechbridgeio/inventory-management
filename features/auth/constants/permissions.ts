import { AuthorizationError } from "@/lib/errors";

import { ROLES, UserRole } from "./user-role";

export const PERMISSIONS = {
  "product:update": [ROLES.SUPER_ADMIN, ROLES.OPERATIONS_ADMIN],
  "product:delete": [ROLES.SUPER_ADMIN],
  "product:add-supplier": [ROLES.SUPER_ADMIN, ROLES.PURCHASE_ADMIN],
  "purchase:delete": [ROLES.SUPER_ADMIN, ROLES.PURCHASE_ADMIN],
  "sale:delete": [ROLES.SUPER_ADMIN, ROLES.STORE_ADMIN],
  "supplier:delete": [
    ROLES.SUPER_ADMIN,
    ROLES.PURCHASE_ADMIN,
    ROLES.STORE_ADMIN,
  ],
  "process-order:delete": [
    ROLES.SUPER_ADMIN,
    ROLES.PURCHASE_ADMIN,
    ROLES.STORE_ADMIN,
  ],
  "purchase-request:approve": [ROLES.SUPER_ADMIN],
  "purchase-request:reject": [ROLES.SUPER_ADMIN],
  "user:update-role": [ROLES.SUPER_ADMIN],
  "user:delete": [ROLES.SUPER_ADMIN],
  "return:create": [
    ROLES.SUPER_ADMIN,
    ROLES.STORE_ADMIN,
    ROLES.OPERATIONS_ADMIN,
  ],
  "return:approve": [ROLES.SUPER_ADMIN],
  "return:reject": [ROLES.SUPER_ADMIN],
} satisfies Record<string, readonly UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(
  role: UserRole | undefined,
  permission: Permission,
): boolean {
  if (!role) {
    return false;
  }

  const allowedRoles: readonly UserRole[] = PERMISSIONS[permission];
  return allowedRoles.includes(role);
}

export function assertPermission(role: UserRole, permission: Permission) {
  if (!can(role, permission)) {
    throw new AuthorizationError("User is not authorized");
  }
}
