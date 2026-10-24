import { z } from 'zod';
import { BANGKOK_TEST_AREAS } from './constants';

export const LocationQuerySchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('selected_area'),
    areaId: z.string().min(1, 'areaId is required when mode is selected_area'),
    radiusKm: z.number().positive().max(10000).default(8).optional(),
  }),
  z.object({
    mode: z.literal('coordinates'),
    latitude: z.number().min(13.0).max(14.5, 'Latitude must be within Bangkok metropolitan region (13.0 - 14.5)'),
    longitude: z.number().min(99.5).max(101.5, 'Longitude must be within Bangkok metropolitan region (99.5 - 101.5)'),
    radiusKm: z.number().positive().max(10000).default(8).optional(),
  }),
]);

export const DateWindowSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)?)?$/, 'Date must be ISO-8601 or YYYY-MM-DD format'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)?)?$/, 'Date must be ISO-8601 or YYYY-MM-DD format'),
}).refine(data => {
  const fromTime = new Date(data.from.includes('T') ? data.from : `${data.from}T00:00:00+07:00`).getTime();
  const toTime = new Date(data.to.includes('T') ? data.to : `${data.to}T23:59:59+07:00`).getTime();
  return toTime >= fromTime;
}, {
  message: 'End date ("to") must be on or after start date ("from")',
  path: ['to'],
});

export const FreeTimeWindowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD format').optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  durationHours: z.number().positive().max(1000).optional(),
  availableNow: z.boolean().optional(),
});

export const RecommendationRequestSchema = z.object({
  location: LocationQuerySchema,
  intentText: z.string().min(1, 'intentText cannot be empty').max(500, 'intentText is too long'),
  mood: z.string().max(200).optional(),
  activityPreferences: z.array(z.string().max(50)).max(10).optional(),
  freeTime: FreeTimeWindowSchema.optional(),
  dateWindow: DateWindowSchema.optional(),
  budgetTHB: z.number().min(0, 'budgetTHB cannot be negative').max(500000).optional(),
  companions: z.string().max(50).optional(),
  limit: z.number().int().min(1).max(30).default(10).optional(),
});

export const EventFilterSchema = z.object({
  areaId: z.string().optional(),
  latitude: z.coerce.number().min(13.0).max(14.5).optional(),
  longitude: z.coerce.number().min(99.5).max(101.5).optional(),
  radiusKm: z.coerce.number().min(0.5).max(50).default(10).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isFree: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  verificationStatus: z.enum(['verified', 'unverified', 'needs_review']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

export const PlaceFilterSchema = z.object({
  areaId: z.string().optional(),
  latitude: z.coerce.number().min(13.0).max(14.5).optional(),
  longitude: z.coerce.number().min(99.5).max(101.5).optional(),
  radiusKm: z.coerce.number().min(0.5).max(50).default(10).optional(),
  category: z.string().optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  priceTier: z.enum(['free', 'budget', 'moderate', 'expensive', 'unknown']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

export const FeedbackSubmissionSchema = z.object({
  recommendationId: z.string().optional(),
  itemId: z.string().min(1, 'itemId is required'),
  feedbackType: z.enum(['useful', 'not_relevant', 'dismissed', 'visited']),
  comment: z.string().max(300).optional(),
});

export const EventImportItemSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1, 'Title is required').max(200),
  titleTh: z.string().max(200).optional(),
  description: z.string().min(1, 'Description is required').max(2000),
  descriptionTh: z.string().max(2000).optional(),
  placeId: z.string().nullable().optional(),
  venueName: z.string().min(1, 'Venue name is required').max(200),
  address: z.string().min(1, 'Address is required').max(500),
  addressTh: z.string().max(500).optional(),
  areaId: z.string().min(1, 'Area ID is required'),
  latitude: z.number().min(13.0).max(14.5).nullable().optional(),
  longitude: z.number().min(99.5).max(101.5).nullable().optional(),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  tags: z.array(z.string()).default([]),
  startDatetime: z.string().min(1, 'startDatetime is required'),
  endDatetime: z.string().min(1, 'endDatetime is required'),
  minPrice: z.number().min(0).nullable().optional(),
  maxPrice: z.number().min(0).nullable().optional(),
  isFree: z.boolean().default(false),
  currency: z.string().default('THB'),
  sourceUrl: z.string().url('sourceUrl must be a valid URL'),
  sourceName: z.string().min(1, 'sourceName is required'),
  verificationStatus: z.enum(['verified', 'unverified', 'needs_review']).default('unverified'),
  publicationStatus: z.enum(['published', 'draft', 'archived']).default('published'),
  eventStatus: z.enum(['scheduled', 'rescheduled', 'cancelled', 'postponed']).default('scheduled'),
  isDemoFixture: z.boolean().default(false),
}).refine(data => {
  const start = new Date(data.startDatetime).getTime();
  const end = new Date(data.endDatetime).getTime();
  return !isNaN(start) && !isNaN(end) && end >= start;
}, {
  message: 'Invalid dates or endDatetime must be after startDatetime',
  path: ['endDatetime'],
});

export type RecommendationRequestInput = z.infer<typeof RecommendationRequestSchema>;
export type EventFilterInput = z.infer<typeof EventFilterSchema>;
export type PlaceFilterInput = z.infer<typeof PlaceFilterSchema>;
export type FeedbackSubmissionInput = z.infer<typeof FeedbackSubmissionSchema>;
export type EventImportItemInput = z.infer<typeof EventImportItemSchema>;
