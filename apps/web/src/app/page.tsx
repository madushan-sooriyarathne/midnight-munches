import { Button, Card, CardContent, CardHeader, FilterPill } from '@midnightmunches/ui';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-32 bg-velvet-wine p-40 font-body text-bone-white">
      <h1 className="font-display text-heading leading-heading tracking-heading text-electric-red">
        MIDNIGHT MUNCHES
      </h1>
      <p className="max-w-md text-center text-body-sm leading-body-sm tracking-body-sm text-blush-highlight">
        The kitchen is open when everything else is shut.
      </p>
      <div className="flex gap-8">
        <FilterPill active>All</FilterPill>
        <FilterPill>Kottu</FilterPill>
        <FilterPill>Short eats</FilterPill>
      </div>
      <Card variant="feature" className="w-full max-w-md">
        <CardHeader>
          <h2 className="font-display text-subheading leading-subheading tracking-subheading">
            TONIGHT&rsquo;S DROP
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-24">
          <p className="text-body-sm leading-body-sm tracking-body-sm text-blush-highlight">
            Rounded corners, theme colours and display type all come from the shared Tailwind v4
            theme.
          </p>
          <Button>Browse the menu</Button>
        </CardContent>
      </Card>
    </main>
  );
}
