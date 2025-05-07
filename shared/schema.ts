import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema (existing)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Pipeline status enum
export const pipelineStatusEnum = pgEnum("pipeline_status", [
  "success",
  "failed",
  "in_progress",
  "cancelled",
  "pending",
]);

// Pipeline step status enum
export const stepStatusEnum = pgEnum("step_status", [
  "success",
  "failed",
  "in_progress",
  "pending",
]);

// Pipelines schema
export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  repository: text("repository").notNull(),
  branch: text("branch").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPipelineSchema = createInsertSchema(pipelines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type Pipeline = typeof pipelines.$inferSelect;

// Builds schema
export const builds = pgTable("builds", {
  id: serial("id").primaryKey(),
  pipelineId: integer("pipeline_id").notNull().references(() => pipelines.id),
  buildNumber: integer("build_number").notNull(),
  status: text("status", { enum: ["success", "failed", "in_progress", "cancelled", "pending"] }).notNull(),
  commitSha: text("commit_sha").notNull(),
  commitMessage: text("commit_message").notNull(),
  commitAuthor: text("commit_author").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // in seconds
});

export const insertBuildSchema = createInsertSchema(builds).omit({
  id: true,
  completedAt: true,
  duration: true,
});

export type InsertBuild = z.infer<typeof insertBuildSchema>;
export type Build = typeof builds.$inferSelect;

// Build steps schema
export const buildSteps = pgTable("build_steps", {
  id: serial("id").primaryKey(),
  buildId: integer("build_id").notNull().references(() => builds.id),
  name: text("name").notNull(),
  status: text("status", { enum: ["success", "failed", "in_progress", "pending"] }).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  logs: text("logs"),
  order: integer("order").notNull(),
});

export const insertBuildStepSchema = createInsertSchema(buildSteps).omit({
  id: true,
  completedAt: true,
});

export type InsertBuildStep = z.infer<typeof insertBuildStepSchema>;
export type BuildStep = typeof buildSteps.$inferSelect;

// Deployments schema
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  buildId: integer("build_id").notNull().references(() => builds.id),
  environment: text("environment").notNull(),
  status: text("status", { enum: ["success", "failed", "in_progress", "pending"] }).notNull(),
  deployedAt: timestamp("deployed_at").defaultNow().notNull(),
  version: text("version"),
  url: text("url"),
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
});

export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;

// Statistics for dashboard
export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  successfulBuilds: integer("successful_builds").default(0).notNull(),
  failedBuilds: integer("failed_builds").default(0).notNull(),
  totalDeployments: integer("total_deployments").default(0).notNull(), 
  averageBuildTime: integer("average_build_time").default(0).notNull(), // in seconds
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStatisticsSchema = createInsertSchema(statistics).omit({
  id: true,
  updatedAt: true,
});

export type InsertStatistics = z.infer<typeof insertStatisticsSchema>;
export type Statistics = typeof statistics.$inferSelect;
