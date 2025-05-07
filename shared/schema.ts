import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
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

// Docker container types
export const containerStatusEnum = pgEnum("container_status", [
  "running",
  "stopped",
  "exited",
  "created",
  "restarting",
  "paused",
]);

// Docker images schema
export const dockerImages = pgTable("docker_images", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tag: text("tag").notNull(),
  repository: text("repository").notNull(),
  pullCount: integer("pull_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  size: integer("size").notNull(), // in MB
  description: text("description"),
});

export const insertDockerImageSchema = createInsertSchema(dockerImages).omit({
  id: true,
  pullCount: true,
  createdAt: true,
});

export type InsertDockerImage = z.infer<typeof insertDockerImageSchema>;
export type DockerImage = typeof dockerImages.$inferSelect;

// Docker containers schema
export const dockerContainers = pgTable("docker_containers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageId: integer("image_id").notNull().references(() => dockerImages.id),
  status: text("status", { 
    enum: ["running", "stopped", "exited", "created", "restarting", "paused"] 
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ports: jsonb("ports").notNull(), // JSON array of port mappings
  volumes: jsonb("volumes"), // JSON array of volume mappings
  environment: jsonb("environment"), // JSON object of environment variables
  command: text("command"),
  cpuUsage: integer("cpu_usage").default(0), // percentage
  memoryUsage: integer("memory_usage").default(0), // in MB
  restartPolicy: text("restart_policy").default("no"),
  buildId: integer("build_id").references(() => builds.id),
});

export const insertDockerContainerSchema = createInsertSchema(dockerContainers).omit({
  id: true,
  createdAt: true,
  cpuUsage: true,
  memoryUsage: true,
});

export type InsertDockerContainer = z.infer<typeof insertDockerContainerSchema>;
export type DockerContainer = typeof dockerContainers.$inferSelect;

// Jenkins jobs schema
export const jenkinsJobs = pgTable("jenkins_jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  pipelineId: integer("pipeline_id").references(() => pipelines.id),
  lastBuildStatus: text("last_build_status", { 
    enum: ["success", "failed", "in_progress", "cancelled", "pending"] 
  }),
  lastBuildNumber: integer("last_build_number"),
  lastBuildTime: timestamp("last_build_time"),
  jenkinsJobDefinition: text("jenkins_job_definition").notNull(), // XML or JSON definition
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  enabled: boolean("enabled").default(true).notNull(),
});

export const insertJenkinsJobSchema = createInsertSchema(jenkinsJobs).omit({
  id: true,
  lastBuildStatus: true,
  lastBuildNumber: true,
  lastBuildTime: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJenkinsJob = z.infer<typeof insertJenkinsJobSchema>;
export type JenkinsJob = typeof jenkinsJobs.$inferSelect;
