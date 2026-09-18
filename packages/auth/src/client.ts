import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { roles } from './permissions';

// Undefined baseURL falls back to the current origin.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [adminClient({ roles })],
});

export const { useSession, signIn, signOut, signUp } = authClient;
