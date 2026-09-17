import type { Id } from '@midnightmunches/types';

export const sessionRoles = ['guest', 'customer', 'staff', 'admin'] as const;

export type SessionRole = (typeof sessionRoles)[number];

export type Session = {
  userId: Id;
  role: SessionRole;
  expiresAt: Date;
};

export function isStaff(session: Session): boolean {
  return session.role === 'staff' || session.role === 'admin';
}
