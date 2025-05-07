import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertPipelineSchema, 
  insertBuildSchema, 
  insertBuildStepSchema, 
  insertDeploymentSchema,
  insertDockerImageSchema,
  insertDockerContainerSchema,
  insertJenkinsJobSchema
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

  // Docker image routes
  // Get all Docker images
  app.get("/api/docker/images", async (req, res) => {
    try {
      const images = await storage.getAllDockerImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Docker images" });
    }
  });

  // Get Docker image by ID
  app.get("/api/docker/images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const image = await storage.getDockerImage(id);
      
      if (!image) {
        return res.status(404).json({ message: "Docker image not found" });
      }
      
      res.json(image);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Docker image" });
    }
  });

  // Create Docker image
  app.post("/api/docker/images", async (req, res) => {
    try {
      const imageData = insertDockerImageSchema.parse(req.body);
      const image = await storage.createDockerImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid Docker image data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create Docker image" });
    }
  });

  // Increment Docker image pull count
  app.post("/api/docker/images/:id/increment-pull", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.incrementImagePullCount(id);
      const updatedImage = await storage.getDockerImage(id);
      
      if (!updatedImage) {
        return res.status(404).json({ message: "Docker image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      res.status(500).json({ message: "Failed to increment pull count" });
    }
  });

  // Docker container routes
  // Get all Docker containers
  app.get("/api/docker/containers", async (req, res) => {
    try {
      const containers = await storage.getAllDockerContainers();
      res.json(containers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Docker containers" });
    }
  });

  // Get Docker container by ID
  app.get("/api/docker/containers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const container = await storage.getDockerContainer(id);
      
      if (!container) {
        return res.status(404).json({ message: "Docker container not found" });
      }
      
      res.json(container);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Docker container" });
    }
  });

  // Get Docker containers by build ID
  app.get("/api/builds/:id/containers", async (req, res) => {
    try {
      const buildId = parseInt(req.params.id);
      const containers = await storage.getDockerContainersByBuild(buildId);
      res.json(containers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Docker containers for build" });
    }
  });

  // Create Docker container
  app.post("/api/docker/containers", async (req, res) => {
    try {
      const containerData = insertDockerContainerSchema.parse(req.body);
      const container = await storage.createDockerContainer(containerData);
      res.status(201).json(container);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid Docker container data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create Docker container" });
    }
  });

  // Update Docker container status
  app.patch("/api/docker/containers/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["running", "stopped", "exited", "created", "restarting", "paused"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const container = await storage.updateDockerContainerStatus(id, status);
      
      if (!container) {
        return res.status(404).json({ message: "Docker container not found" });
      }
      
      res.json(container);
    } catch (error) {
      res.status(500).json({ message: "Failed to update Docker container status" });
    }
  });

  // Update Docker container resources
  app.patch("/api/docker/containers/:id/resources", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { cpuUsage, memoryUsage } = req.body;
      
      if (typeof cpuUsage !== 'number' || typeof memoryUsage !== 'number') {
        return res.status(400).json({ message: "Invalid resource values" });
      }
      
      const container = await storage.updateDockerContainerResources(id, cpuUsage, memoryUsage);
      
      if (!container) {
        return res.status(404).json({ message: "Docker container not found" });
      }
      
      res.json(container);
    } catch (error) {
      res.status(500).json({ message: "Failed to update Docker container resources" });
    }
  });

  // Jenkins job routes
  // Get all Jenkins jobs
  app.get("/api/jenkins/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJenkinsJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Jenkins jobs" });
    }
  });

  // Get Jenkins job by ID
  app.get("/api/jenkins/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJenkinsJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Jenkins job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Jenkins job" });
    }
  });

  // Get Jenkins jobs by pipeline ID
  app.get("/api/pipelines/:id/jenkins-jobs", async (req, res) => {
    try {
      const pipelineId = parseInt(req.params.id);
      const jobs = await storage.getJenkinsJobsByPipeline(pipelineId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Jenkins jobs for pipeline" });
    }
  });

  // Create Jenkins job
  app.post("/api/jenkins/jobs", async (req, res) => {
    try {
      const jobData = insertJenkinsJobSchema.parse(req.body);
      const job = await storage.createJenkinsJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid Jenkins job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create Jenkins job" });
    }
  });

  // Update Jenkins job status
  app.patch("/api/jenkins/jobs/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, buildNumber, buildTime } = req.body;
      
      if (!status || !buildNumber || !buildTime) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const job = await storage.updateJenkinsJobStatus(id, status, buildNumber, new Date(buildTime));
      
      if (!job) {
        return res.status(404).json({ message: "Jenkins job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to update Jenkins job status" });
    }
  });

  // Update Jenkins job definition
  app.patch("/api/jenkins/jobs/:id/definition", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { jenkinsJobDefinition } = req.body;
      
      if (!jenkinsJobDefinition) {
        return res.status(400).json({ message: "Missing job definition" });
      }
      
      const job = await storage.updateJenkinsJobDefinition(id, jenkinsJobDefinition);
      
      if (!job) {
        return res.status(404).json({ message: "Jenkins job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to update Jenkins job definition" });
    }
  });

  // Toggle Jenkins job enabled status
  app.patch("/api/jenkins/jobs/:id/toggle-enabled", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ message: "Invalid enabled value" });
      }
      
      const job = await storage.toggleJenkinsJobEnabled(id, enabled);
      
      if (!job) {
        return res.status(404).json({ message: "Jenkins job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle Jenkins job enabled status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
