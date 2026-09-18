import { relations } from 'drizzle-orm';
import { account, session, user } from './auth';
import { operatingHours, restaurants } from './directory';
import { media, reviews } from './engagement';

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  reviews: many(reviews),
  submittedRestaurants: many(restaurants),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  author: one(user, {
    fields: [restaurants.createdBy],
    references: [user.id],
  }),
  operatingHours: many(operatingHours),
  reviews: many(reviews),
  media: many(media),
}));

export const operatingHoursRelations = relations(operatingHours, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [operatingHours.restaurantId],
    references: [restaurants.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [reviews.restaurantId],
    references: [restaurants.id],
  }),
  user: one(user, {
    fields: [reviews.userId],
    references: [user.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [media.restaurantId],
    references: [restaurants.id],
  }),
}));
