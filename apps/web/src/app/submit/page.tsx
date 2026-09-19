import type { Metadata } from 'next';

import { SignInPrompt } from '@/components/submission/SignInPrompt';
import { SubmissionForm } from '@/components/submission/SubmissionForm';
import { getIsSignedIn } from '@/lib/dal/session';

export const metadata: Metadata = {
  title: 'Submit a stall | Midnight Munches',
  description: 'Pin a late-night food stall for the Midnight Munches directory.',
};

export default async function SubmitPage() {
  // NOTE: the API re-checks the session on every write; this only decides what to render.
  const isSignedIn = await getIsSignedIn();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-32 px-16 py-40 md:py-64">
      <header className="flex flex-col gap-12">
        <h1 className="font-display text-heading leading-heading tracking-heading text-bone-white uppercase">
          Submit a stall
        </h1>
        <p className="font-body text-body leading-body tracking-body text-blush-highlight">
          Know a late-night spot we&apos;re missing? Pin it. Moderators check every stall before it
          goes live.
        </p>
      </header>
      {isSignedIn ? <SubmissionForm /> : <SignInPrompt />}
    </main>
  );
}
