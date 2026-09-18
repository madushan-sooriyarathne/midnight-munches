import type { auth } from './index';
import type { UserRole } from './permissions';

type InferredSession = typeof auth.$Infer.Session;

/** Better Auth types `role` as an optional string; the guard narrows it to `UserRole`. */
export type SessionUser = Omit<InferredSession['user'], 'role'> & { role: UserRole };

export type AuthSession = { session: InferredSession['session']; user: SessionUser };
