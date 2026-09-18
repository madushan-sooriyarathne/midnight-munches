import { adminAc, userAc } from 'better-auth/plugins/admin/access';

/**
 * Role → Better Auth admin-plugin permissions. Declaring the map makes the
 * plugin reject any role not listed here on `setRole` / `createUser`.
 * Moderators get no admin-plugin powers (ban, set role, impersonate);
 * moderation access is gated app-side with `isModeratorOrAdmin`.
 *
 * NOTE: imported by `./client`, so this module must never import server code.
 */
export const roles = { user: userAc, moderator: userAc, admin: adminAc };

export type UserRole = keyof typeof roles;

export function hasRole(
  userRole: string | null | undefined,
  allowedRoles: readonly UserRole[],
): userRole is UserRole {
  return allowedRoles.some((role) => role === userRole);
}

export function isAdmin(userRole: string | null | undefined): boolean {
  return hasRole(userRole, ['admin']);
}

export function isModeratorOrAdmin(userRole: string | null | undefined): boolean {
  return hasRole(userRole, ['moderator', 'admin']);
}
