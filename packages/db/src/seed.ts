import { like } from 'drizzle-orm';

import { client, db } from './client';
import { type NewRestaurant, operatingHours, restaurants } from './schema';

type SeedStall = Omit<NewRestaurant, 'slug' | 'status' | 'createdBy'> & {
  days?: number[];
  hours: [open: string, close: string][];
};

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

// Fictional stalls for local development. Hours cover overnight wraps, a 24h stall, a split shift,
// a weekend-only stall, a morning stall and an emergency closure so every status branch shows up.
const STALLS: SeedStall[] = [
  {
    name: 'Kollupitiya Kottu Corner',
    address: '112 Galle Road, Kollupitiya',
    district: 'Colombo 03',
    latitude: 6.911,
    longitude: 79.849,
    phone: '+94 77 123 4501',
    deliveryUrls: {
      ubereats: 'https://www.ubereats.com/lk/store/seed-kollupitiya-kottu-corner',
      pickme: 'https://pickme.lk/food/seed-kollupitiya-kottu-corner',
    },
    foodTypes: ['Kottu'],
    hours: [['18:00', '03:00']],
  },
  {
    name: 'Galle Road Burger Shack',
    address: '48 Galle Road, Kollupitiya',
    district: 'Colombo 03',
    latitude: 6.902,
    longitude: 79.853,
    deliveryUrls: { ubereats: 'https://www.ubereats.com/lk/store/seed-galle-road-burger-shack' },
    foodTypes: ['Burgers'],
    hours: [['19:00', '02:00']],
  },
  {
    name: 'Bambalapitiya Chai Stop',
    address: '9 Station Road, Bambalapitiya',
    district: 'Colombo 04',
    latitude: 6.889,
    longitude: 79.856,
    phone: '+94 77 123 4503',
    foodTypes: ['Chai'],
    hours: [['00:00', '00:00']],
  },
  {
    name: 'Havelock Street Bites',
    address: '21 Havelock Road, Colombo 04',
    district: 'Colombo 04',
    latitude: 6.883,
    longitude: 79.864,
    deliveryUrls: { pickme: 'https://pickme.lk/food/seed-havelock-street-bites' },
    foodTypes: ['Street Food'],
    hours: [['17:00', '23:30']],
  },
  {
    name: 'Cinnamon Gardens Kottu Lab',
    address: '5 Rosmead Place, Colombo 07',
    district: 'Colombo 07',
    latitude: 6.911,
    longitude: 79.865,
    phone: '+94 77 123 4505',
    deliveryUrls: { ubereats: 'https://www.ubereats.com/lk/store/seed-cinnamon-gardens-kottu-lab' },
    foodTypes: ['Kottu', 'Street Food'],
    hours: [['20:00', '04:00']],
  },
  {
    name: 'Ward Place Burger Co',
    address: '30 Ward Place, Colombo 07',
    district: 'Colombo 07',
    latitude: 6.917,
    longitude: 79.868,
    foodTypes: ['Burgers'],
    isEmergencyClosed: true,
    hours: [['18:00', '02:00']],
  },
  {
    name: 'Dehiwala Night Chai',
    address: '77 Galle Road, Dehiwala',
    district: 'Dehiwala',
    latitude: 6.851,
    longitude: 79.865,
    phone: '+94 77 123 4507',
    foodTypes: ['Chai'],
    hours: [['21:00', '05:00']],
  },
  {
    name: 'Mount Lavinia Street Kitchen',
    address: '3 Hotel Road, Mount Lavinia',
    district: 'Dehiwala',
    latitude: 6.839,
    longitude: 79.863,
    deliveryUrls: {
      ubereats: 'https://www.ubereats.com/lk/store/seed-mount-lavinia-street-kitchen',
      pickme: 'https://pickme.lk/food/seed-mount-lavinia-street-kitchen',
    },
    foodTypes: ['Street Food'],
    hours: [['16:00', '22:00']],
  },
  {
    name: 'Dehiwala Junction Kottu',
    address: '140 Galle Road, Dehiwala',
    district: 'Dehiwala',
    latitude: 6.856,
    longitude: 79.864,
    phone: '+94 77 123 4509',
    foodTypes: ['Kottu'],
    hours: [
      ['12:00', '15:00'],
      ['18:00', '00:00'],
    ],
  },
  {
    name: 'Kandy Lake Kottu',
    address: '14 Dalada Veediya, Kandy',
    district: 'Kandy',
    latitude: 7.293,
    longitude: 80.641,
    phone: '+94 77 123 4510',
    deliveryUrls: { pickme: 'https://pickme.lk/food/seed-kandy-lake-kottu' },
    foodTypes: ['Kottu'],
    hours: [['18:30', '01:30']],
  },
  {
    name: 'Peradeniya Road Burgers',
    address: '220 Peradeniya Road, Kandy',
    district: 'Kandy',
    latitude: 7.28,
    longitude: 80.62,
    foodTypes: ['Burgers'],
    days: [5, 6],
    hours: [['19:00', '03:00']],
  },
  {
    name: 'Temple Street Chai & Roti',
    address: '6 Temple Street, Kandy',
    district: 'Kandy',
    latitude: 7.295,
    longitude: 80.638,
    foodTypes: ['Chai', 'Street Food'],
    hours: [['05:00', '11:00']],
  },
];

if (process.env.NODE_ENV === 'production') {
  throw new Error('Refusing to seed a production database');
}

await db.transaction(async (tx) => {
  // Re-runnable: seed rows are recognisable by slug, and hours cascade with them.
  await tx.delete(restaurants).where(like(restaurants.slug, 'seed-%'));

  for (const { days = EVERY_DAY, hours, ...stall } of STALLS) {
    const slug = `seed-${stall.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const [created] = await tx
      .insert(restaurants)
      .values({ ...stall, slug, status: 'approved' })
      .returning({ id: restaurants.id });
    if (!created) throw new Error(`Could not insert seed stall ${slug}`);

    await tx.insert(operatingHours).values(
      days.flatMap((dayOfWeek) =>
        hours.map(([openTime, closeTime]) => ({
          restaurantId: created.id,
          dayOfWeek,
          openTime,
          closeTime,
          isOvernight: closeTime < openTime,
        })),
      ),
    );
  }
});

console.log(`Seeded ${STALLS.length} stalls`);
await client.end();
