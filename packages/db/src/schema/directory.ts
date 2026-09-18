import {
  boolean,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const restaurantStatusEnum = pgEnum('restaurant_status', [
  'pending',
  'approved',
  'rejected',
]);

export type DeliveryUrls = {
  ubereats?: string;
  pickme?: string;
  direct?: string;
};

export const restaurants = pgTable('restaurants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  address: text('address').notNull(),
  // e.g. Colombo 03, Kandy, Galle
  district: varchar('district', { length: 64 }).notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 7, mode: 'number' }).notNull(),
  longitude: numeric('longitude', { precision: 10, scale: 7, mode: 'number' }).notNull(),
  phone: varchar('phone', { length: 32 }),
  deliveryUrls: jsonb('delivery_urls').$type<DeliveryUrls>(),
  // e.g. Kottu, Burgers, Chai
  foodTypes: text('food_types').array().notNull(),
  // Emergency override: hides the stall as closed regardless of operating hours.
  isEmergencyClosed: boolean('is_emergency_closed').default(false).notNull(),
  status: restaurantStatusEnum('status').default('pending').notNull(),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const operatingHours = pgTable('operating_hours', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id, { onDelete: 'cascade' }),
  // 0 = Sunday through 6 = Saturday
  dayOfWeek: smallint('day_of_week').notNull(),
  // HH:mm:ss
  openTime: time('open_time').notNull(),
  closeTime: time('close_time').notNull(),
  // closeTime lands on the following calendar day (midnight wrap)
  isOvernight: boolean('is_overnight').default(false).notNull(),
});

export type Restaurant = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;
export type OperatingHour = typeof operatingHours.$inferSelect;
export type NewOperatingHour = typeof operatingHours.$inferInsert;
export type RestaurantStatus = (typeof restaurantStatusEnum.enumValues)[number];
