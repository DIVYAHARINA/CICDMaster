import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertPipelineSchema, 
  insertBuildSchema, 
  insertBuildStepSchema, 
  insertDeploymentSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes prefix with /api
  
  // Get statistics for dashboard
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ 
        message: "Failed to fetch statistics", 
        details: process.env.NODE_ENV === "development" ? String(error) : undefined 
      });
    }
  });

  // Get all pipelines
  app.get("/api/pipelines", async (req, res) => {
    try {
      const pipelines = await storage.getAllPipelines();
      res.json(pipelines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pipelines" });
    }
  });

  // Get pipeline by ID
  app.get("/api/pipelines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pipeline = await storage.getPipeline(id);
      
      if (!pipeline) {
        return res.status(404).json({ message: "Pipeline not found" });
      }
      
      res.json(pipeline);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pipeline" });
    }
  });

  // Create new pipeline
  app.post("/api/pipelines", async (req, res) => {
    try {
      const pipelineData = insertPipelineSchema.parse(req.body);
      const pipeline = await storage.createPipeline(pipelineData);
      res.status(201).json(pipeline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pipeline data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pipeline" });
    }
  });

  // Get builds for a pipeline
  app.get("/api/pipelines/:id/builds", async (req, res) => {
    try {
      const pipelineId = parseInt(req.params.id);
      const builds = await storage.getBuildsByPipeline(pipelineId);
      res.json(builds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch builds" });
    }
  });

  // Get build by ID
  app.get("/api/builds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const build = await storage.getBuild(id);
      
      if (!build) {
        return res.status(404).json({ message: "Build not found" });
      }
      
      res.json(build);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch build" });
    }
  });

  // Create new build
  app.post("/api/builds", async (req, res) => {
    try {
      const buildData = insertBuildSchema.parse(req.body);
      const build = await storage.createBuild(buildData);
      res.status(201).json(build);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid build data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create build" });
    }
  });

  // Update build status
  app.patch("/api/builds/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, completedAt, duration } = req.body;
      
      if (!status || !["success", "failed", "in_progress", "cancelled", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const build = await storage.updateBuildStatus(id, status, completedAt, duration);
      
      if (!build) {
        return res.status(404).json({ message: "Build not found" });
      }
      
      res.json(build);
    } catch (error) {
      res.status(500).json({ message: "Failed to update build status" });
    }
  });

  // Get build steps
  app.get("/api/builds/:id/steps", async (req, res) => {
    try {
      const buildId = parseInt(req.params.id);
      const steps = await storage.getBuildSteps(buildId);
      res.json(steps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch build steps" });
    }
  });

  // Create build step
  app.post("/api/buildsteps", async (req, res) => {
    try {
      const stepData = insertBuildStepSchema.parse(req.body);
      const step = await storage.createBuildStep(stepData);
      res.status(201).json(step);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid build step data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create build step" });
    }
  });

  // Update build step
  app.patch("/api/buildsteps/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, completedAt, logs } = req.body;
      
      if (!status || !["success", "failed", "in_progress", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const step = await storage.updateBuildStep(id, status, completedAt, logs);
      
      if (!step) {
        return res.status(404).json({ message: "Build step not found" });
      }
      
      res.json(step);
    } catch (error) {
      res.status(500).json({ message: "Failed to update build step" });
    }
  });

  // Get all deployments
  app.get("/api/deployments", async (req, res) => {
    try {
      const deployments = await storage.getAllDeployments();
      res.json(deployments);
    } catch (error) {
      console.error("Error fetching deployments:", error);
      res.status(500).json({ 
        message: "Failed to fetch deployments", 
        details: process.env.NODE_ENV === "development" ? String(error) : undefined 
      });
    }
  });

  // Create deployment
  app.post("/api/deployments", async (req, res) => {
    try {
      const deploymentData = insertDeploymentSchema.parse(req.body);
      const deployment = await storage.createDeployment(deploymentData);
      res.status(201).json(deployment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deployment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deployment" });
    }
  });

  // GitHub webhook endpoint for CI/CD events
  app.post("/api/github/webhook", async (req, res) => {
    try {
      const event = req.headers['x-github-event'];
      const payload = req.body;
      
      // Handle different GitHub webhook events
      if (event === 'push') {
        // Process push event (e.g., trigger a new build)
        const repository = payload.repository.full_name;
        const branch = payload.ref.replace('refs/heads/', '');
        const commitSha = payload.after;
        const commitMessage = payload.head_commit.message;
        const commitAuthor = payload.head_commit.author.username;
        
        // Find pipeline for this repository/branch
        const pipeline = await storage.getPipelineByRepo(repository, branch);
        
        if (pipeline) {
          // Create a new build
          const lastBuild = await storage.getLastBuildNumber(pipeline.id);
          const buildNumber = lastBuild ? lastBuild + 1 : 1;
          
          const buildData = {
            pipelineId: pipeline.id,
            buildNumber,
            status: "in_progress" as const,
            commitSha,
            commitMessage,
            commitAuthor,
            startedAt: new Date(),
          };
          
          const build = await storage.createBuild(buildData);
          
          // Create initial build steps
          const steps = [
            { buildId: build.id, name: "Checkout", status: "pending" as const, order: 1 },
            { buildId: build.id, name: "Test", status: "pending" as const, order: 2 },
            { buildId: build.id, name: "Build", status: "pending" as const, order: 3 },
            { buildId: build.id, name: "Deploy", status: "pending" as const, order: 4 }
          ];
          
          for (const step of steps) {
            await storage.createBuildStep(step);
          }
          
          // In a real environment, we would trigger the actual CI/CD process here
          // For this demo, we'll simulate a successful build process
          
          res.status(202).json({ message: "Build triggered", buildId: build.id });
        } else {
          res.status(404).json({ message: "No pipeline configured for this repository/branch" });
        }
      } else {
        // Handle other webhook events if needed
        res.status(200).json({ message: `Received ${event} event` });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to process GitHub webhook" });
    }
  });

  // Mock endpoint to simulate CI/CD processes (for demo purposes)
  app.post("/api/simulate/build/:id", async (req, res) => {
    try {
      const buildId = parseInt(req.params.id);
      const build = await storage.getBuild(buildId);
      
      if (!build) {
        return res.status(404).json({ message: "Build not found" });
      }
      
      // Update build steps in sequence to simulate a build process
      const steps = await storage.getBuildSteps(buildId);
      
      // Simulate each step with a success outcome
      for (const step of steps) {
        await storage.updateBuildStep(step.id, "success" as const, new Date(), "Simulated logs for step execution");
      }
      
      // Update the build status
      const completedAt = new Date();
      const duration = Math.floor((completedAt.getTime() - new Date(build.startedAt).getTime()) / 1000);
      await storage.updateBuildStatus(buildId, "success" as const, completedAt, duration);
      
      // Create a deployment
      const deploymentData = {
        buildId,
        environment: "Replit (Dev)",
        status: "success" as const,
        deployedAt: new Date(),
        version: `v1.0.${build.buildNumber}`,
        url: "https://ci-cd-dashboard.example.repl.co"
      };
      
      await storage.createDeployment(deploymentData);
      
      // Update statistics
      await storage.incrementSuccessfulBuilds();
      await storage.incrementTotalDeployments();
      await storage.updateAverageBuildTime(duration);
      
      res.json({ message: "Build simulation completed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate build" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
