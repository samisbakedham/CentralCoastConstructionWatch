import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  county: varchar("county", { length: 50 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // residential, commercial, infrastructure, mixed-use
  status: varchar("status", { length: 50 }).notNull(), // planning, under-construction, complete
  estimatedCost: decimal("estimated_cost", { precision: 12, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 12, scale: 2 }),
  contractor: text("contractor"),
  developer: text("developer"),
  estimatedCompletion: text("estimated_completion"),
  actualCompletion: timestamp("actual_completion"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Residential project details
export const residentialDetails = pgTable("residential_details", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  totalUnits: integer("total_units"),
  studioUnits: integer("studio_units"),
  studioRent: decimal("studio_rent", { precision: 8, scale: 2 }),
  oneBedroomUnits: integer("one_bedroom_units"),
  oneBedroomRent: decimal("one_bedroom_rent", { precision: 8, scale: 2 }),
  twoBedroomUnits: integer("two_bedroom_units"),
  twoBedroomRent: decimal("two_bedroom_rent", { precision: 8, scale: 2 }),
  threeBedroomUnits: integer("three_bedroom_units"),
  threeBedroomRent: decimal("three_bedroom_rent", { precision: 8, scale: 2 }),
  isAffordableHousing: boolean("is_affordable_housing").default(false),
});

// Project milestones/timeline
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project photos
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  milestoneId: integer("milestone_id").references(() => milestones.id),
  url: text("url").notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  residentialDetails: one(residentialDetails, {
    fields: [projects.id],
    references: [residentialDetails.projectId],
  }),
  milestones: many(milestones),
  photos: many(photos),
}));

export const residentialDetailsRelations = relations(residentialDetails, ({ one }) => ({
  project: one(projects, {
    fields: [residentialDetails.projectId],
    references: [projects.id],
  }),
}));

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  project: one(projects, {
    fields: [photos.projectId],
    references: [projects.id],
  }),
  milestone: one(milestones, {
    fields: [photos.milestoneId],
    references: [milestones.id],
  }),
}));

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResidentialDetailsSchema = createInsertSchema(residentialDetails).omit({
  id: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ResidentialDetails = typeof residentialDetails.$inferSelect;
export type InsertResidentialDetails = z.infer<typeof insertResidentialDetailsSchema>;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

// Combined project type with relations
export type ProjectWithDetails = Project & {
  residentialDetails?: ResidentialDetails;
  milestones: (Milestone & { photos: Photo[] })[];
  photos: Photo[];
};
