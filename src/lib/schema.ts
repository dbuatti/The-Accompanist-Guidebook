import { pgTable, text, timestamp, uuid, varchar, integer, unique, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const progress = pgTable('progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  lessonId: text('lesson_id').notNull(),
  lastPosition: integer('last_position').default(0).notNull(),
  completedAt: timestamp('completed_at').defaultNow(),
}, (t) => ({
  unq: unique().on(t.userId, t.lessonId),
}));

export const modules = pgTable('modules', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  moduleId: uuid('module_id').references(() => modules.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  videoUrl: text('video_url').notNull(),
  duration: text('duration').notNull(),
  notes: text('notes'), // Client-facing notes
  adminNotes: text('admin_notes'), // Back-end / Draft notes
  isPublished: boolean('is_published').default(false).notNull(), // Draft status
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  hasVideo: boolean('has_video').default(true).notNull(),
  videoStatus: varchar('video_status', { length: 50 }).default('not_started').notNull(),
  filmingDate: timestamp('filming_date'),
});