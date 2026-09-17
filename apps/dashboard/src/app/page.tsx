import type { OutletStatus } from '@midnightmunches/types';
import { Card, CardContent, StatusBadge } from '@midnightmunches/ui';

const outlets: { name: string; status: OutletStatus }[] = [
  { name: 'Colombo 03', status: 'open' },
  { name: 'Dehiwala', status: 'closing_soon' },
  { name: 'Negombo', status: 'closed' },
];

const statusLabel: Record<OutletStatus, string> = {
  open: 'Open now',
  closing_soon: 'Closing soon',
  closed: 'Closed',
};

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col gap-24 bg-butcher-black p-40 font-body text-bone-white">
      <h1 className="font-display text-heading-sm leading-heading-sm tracking-heading-sm text-electric-red">
        OUTLET STATUS
      </h1>
      <ul className="grid gap-16 sm:grid-cols-3">
        {outlets.map((outlet) => (
          <li key={outlet.name}>
            <Card>
              <CardContent className="flex flex-col items-start gap-12">
                <p className="font-display text-subheading leading-subheading tracking-subheading">
                  {outlet.name}
                </p>
                <StatusBadge open={outlet.status !== 'closed'} label={statusLabel[outlet.status]} />
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
