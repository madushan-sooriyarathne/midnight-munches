'use client';

import { signIn } from '@midnightmunches/auth/client';
import { Button } from '@midnightmunches/ui';
import { useState, useTransition } from 'react';

export function SignInPrompt() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSignIn() {
    startTransition(async () => {
      // Absolute: Better Auth runs on the API origin, so a bare path would redirect there.
      const result = await signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/submit`,
      });
      if (result.error) setError(result.error.message ?? 'Sign-in failed. Try again');
    });
  }

  return (
    <section className="flex flex-col items-start gap-16 border-2 border-bone-white p-24">
      <h2 className="font-display text-heading-sm leading-heading-sm tracking-heading-sm uppercase">
        Sign in to submit
      </h2>
      <p className="font-body text-body leading-body tracking-body text-blush-highlight">
        Submissions are tied to an account so moderators can follow up.
      </p>
      <Button disabled={isPending} onClick={handleSignIn}>
        {isPending ? 'Redirecting…' : 'Continue with Google'}
      </Button>
      <p aria-live="polite" className="font-body text-body-sm leading-body-sm text-blush-highlight">
        {error}
      </p>
    </section>
  );
}
