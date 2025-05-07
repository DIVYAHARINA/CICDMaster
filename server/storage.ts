import {
  users, pipelines, builds, buildSteps, deployments, statistics, dockerImages, dockerContainers, jenkinsJobs,
  type User,
  type InsertUser,
  type Pipeline,
  type InsertPipeline,
  type Build,
  type InsertBuild,
  type BuildStep,
  type InsertBuildStep,
  type Deployment,
  type InsertDeployment,
  type Statistics,
  type InsertStatistics,
  type DockerImage,
  type InsertDockerImage,
  type DockerContainer,
  type InsertDockerContainer,
  type JenkinsJob,
  type InsertJenkinsJob
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Extend storage interface with methods needed for CI/CD dashboard
export interface IStorage {
  // User methods (from original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pipeline methods
  getAllPipelines(): Promise<Pipeline[]>;
  getPipeline(id: number): Promise<Pipeline | undefined>;
  getPipelineByRepo(repository: string, branch: string): Promise<Pipeline | undefined>;
  createPipeline(pipeline: InsertPipeline): Promise<Pipeline>;
  
  // Build methods
  getAllBuilds(): Promise<Build[]>;
  getBuild(id: number): Promise<Build | undefined>;
  getBuildsByPipeline(pipelineId: number): Promise<Build[]>;
  getLastBuildNumber(pipelineId: number): Promise<number>;
  createBuild(build: InsertBuild): Promise<Build>;
  updateBuildStatus(id: number, status: string, completedAt?: Date, duration?: number): Promise<Build | undefined>;
  
  // Build step methods
  getBuildSteps(buildId: number): Promise<BuildStep[]>;
  getBuildStep(id: number): Promise<BuildStep | undefined>;
  createBuildStep(step: InsertBuildStep): Promise<BuildStep>;
  updateBuildStep(id: number, status: string, completedAt?: Date, logs?: string): Promise<BuildStep | undefined>;
  
  // Deployment methods
  getAllDeployments(): Promise<Deployment[]>;
  getDeployment(id: number): Promise<Deployment | undefined>;
  getDeploymentsByBuild(buildId: number): Promise<Deployment[]>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  
  // Docker image methods
  getAllDockerImages(): Promise<DockerImage[]>;
  getDockerImage(id: number): Promise<DockerImage | undefined>;
  createDockerImage(image: InsertDockerImage): Promise<DockerImage>;
  incrementImagePullCount(id: number): Promise<void>;
  
  // Docker container methods
  getAllDockerContainers(): Promise<DockerContainer[]>;
  getDockerContainer(id: number): Promise<DockerContainer | undefined>;
  getDockerContainersByBuild(buildId: number): Promise<DockerContainer[]>;
  createDockerContainer(container: InsertDockerContainer): Promise<DockerContainer>;
  updateDockerContainerStatus(id: number, status: string): Promise<DockerContainer | undefined>;
  updateDockerContainerResources(id: number, cpuUsage: number, memoryUsage: number): Promise<DockerContainer | undefined>;
  
  // Jenkins job methods
  getAllJenkinsJobs(): Promise<JenkinsJob[]>;
  getJenkinsJob(id: number): Promise<JenkinsJob | undefined>;
  getJenkinsJobsByPipeline(pipelineId: number): Promise<JenkinsJob[]>;
  createJenkinsJob(job: InsertJenkinsJob): Promise<JenkinsJob>;
  updateJenkinsJobStatus(id: number, status: string, buildNumber: number, buildTime: Date): Promise<JenkinsJob | undefined>;
  updateJenkinsJobDefinition(id: number, jenkinsJobDefinition: string): Promise<JenkinsJob | undefined>;
  toggleJenkinsJobEnabled(id: number, enabled: boolean): Promise<JenkinsJob | undefined>;
  
  // Statistics methods
  getStatistics(): Promise<Statistics>;
  incrementSuccessfulBuilds(): Promise<void>;
  incrementFailedBuilds(): Promise<void>;
  incrementTotalDeployments(): Promise<void>;
  updateAverageBuildTime(buildTime: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pipelines: Map<number, Pipeline>;
  private builds: Map<number, Build>;
  private buildSteps: Map<number, BuildStep>;
  private deployments: Map<number, Deployment>;
  private dockerImages: Map<number, DockerImage>;
  private dockerContainers: Map<number, DockerContainer>;
  private jenkinsJobs: Map<number, JenkinsJob>;
  private stats: Statistics;
  
  private userCurrentId: number;
  private pipelineCurrentId: number;
  private buildCurrentId: number;
  private buildStepCurrentId: number;
  private deploymentCurrentId: number;
  private dockerImageCurrentId: number;
  private dockerContainerCurrentId: number;
  private jenkinsJobCurrentId: number;

  constructor() {
    this.users = new Map();
    this.pipelines = new Map();
    this.builds = new Map();
    this.buildSteps = new Map();
    this.deployments = new Map();
    this.dockerImages = new Map();
    this.dockerContainers = new Map();
    this.jenkinsJobs = new Map();
    
    this.userCurrentId = 1;
    this.pipelineCurrentId = 1;
    this.buildCurrentId = 1;
    this.buildStepCurrentId = 1;
    this.deploymentCurrentId = 1;
    this.dockerImageCurrentId = 1;
    this.dockerContainerCurrentId = 1;
    this.jenkinsJobCurrentId = 1;
    
    // Initialize with some statistics
    this.stats = {
      id: 1,
      successfulBuilds: 24,
      failedBuilds: 3,
      totalDeployments: 18,
      averageBuildTime: 192, // 3m 12s in seconds
      updatedAt: new Date()
    };
    
    // Initialize with sample data
    this.initSampleData();
  }

  // Initialize sample data for demo purposes
  private initSampleData() {
    // Create sample pipelines
    const expressApi = this.createPipeline({
      name: "express-api-service",
      repository: "organization/express-api-service",
      branch: "main"
    });
    
    const userAuth = this.createPipeline({
      name: "user-auth-service", 
      repository: "organization/user-auth-service",
      branch: "feature/oauth"
    });
    
    const paymentGateway = this.createPipeline({
      name: "payment-gateway",
      repository: "organization/payment-gateway",
      branch: "develop"
    });
    
    // Create sample builds for each pipeline
    const expressBuild = this.createBuild({
      pipelineId: expressApi.id,
      buildNumber: 127,
      status: "success",
      commitSha: "a1b2c3d4e5f6",
      commitMessage: "Add authentication middleware",
      commitAuthor: "jsmith",
      startedAt: new Date(Date.now() - 1380000) // 23 minutes ago
    });
    
    const userAuthBuild = this.createBuild({
      pipelineId: userAuth.id,
      buildNumber: 89,
      status: "in_progress",
      commitSha: "f5e4d3c2b1a0",
      commitMessage: "Implement OAuth provider integration",
      commitAuthor: "alee",
      startedAt: new Date(Date.now() - 180000) // 3 minutes ago
    });
    
    const paymentBuild = this.createBuild({
      pipelineId: paymentGateway.id,
      buildNumber: 56,
      status: "failed",
      commitSha: "9a8b7c6d5e4",
      commitMessage: "Add support for recurring payments",
      commitAuthor: "mwang",
      startedAt: new Date(Date.now() - 2700000) // 45 minutes ago
    });
    
    // Update completed builds
    this.updateBuildStatus(expressBuild.id, "success", new Date(Date.now() - 1320000), 60);
    this.updateBuildStatus(paymentBuild.id, "failed", new Date(Date.now() - 2640000), 60);
    
    // Create build steps for each build
    // Express build (success)
    const expressSteps = [
      { buildId: expressBuild.id, name: "Checkout", status: "success", order: 1 },
      { buildId: expressBuild.id, name: "Test", status: "success", order: 2 },
      { buildId: expressBuild.id, name: "Build", status: "success", order: 3 },
      { buildId: expressBuild.id, name: "Deploy", status: "success", order: 4 },
    ];
    
    // User Auth build (in progress)
    const userAuthSteps = [
      { buildId: userAuthBuild.id, name: "Checkout", status: "success", order: 1 },
      { buildId: userAuthBuild.id, name: "Test", status: "success", order: 2 },
      { buildId: userAuthBuild.id, name: "Build", status: "in_progress", order: 3 },
      { buildId: userAuthBuild.id, name: "Deploy", status: "pending", order: 4 },
    ];
    
    // Payment build (failed)
    const paymentSteps = [
      { buildId: paymentBuild.id, name: "Checkout", status: "success", order: 1 },
      { buildId: paymentBuild.id, name: "Test", status: "failed", order: 2 },
      { buildId: paymentBuild.id, name: "Build", status: "pending", order: 3 },
      { buildId: paymentBuild.id, name: "Deploy", status: "pending", order: 4 },
    ];
    
    // Add all steps
    [...expressSteps, ...userAuthSteps, ...paymentSteps].forEach(step => this.createBuildStep(step));
    
    // Create deployments for successful builds
    this.createDeployment({
      buildId: expressBuild.id,
      environment: "Replit (Dev)",
      status: "success",
      deployedAt: new Date(Date.now() - 1320000),
      version: "v1.3.2",
      url: "https://express-api-dev.example.repl.co"
    });
    
    // Create more sample deployments
    this.createDeployment({
      buildId: 123, // Fictional past build
      environment: "Replit (Dev)",
      status: "success",
      deployedAt: new Date(Date.now() - 3600000), // 1 hour ago
      version: "v2.1.0",
      url: "https://auth-service-dev.example.repl.co"
    });
    
    this.createDeployment({
      buildId: 124, // Fictional past build
      environment: "Replit (Staging)",
      status: "failed",
      deployedAt: new Date(Date.now() - 10800000), // 3 hours ago
      version: "v0.9.5",
      url: "https://payment-gateway-staging.example.repl.co"
    });
    
    this.createDeployment({
      buildId: 125, // Fictional past build
      environment: "Replit (Dev)",
      status: "success",
      deployedAt: new Date(Date.now() - 86400000), // 1 day ago
      version: "v3.0.1",
      url: "https://frontend-app-dev.example.repl.co"
    });
    
    // Create sample Docker images
    const nodeImage = this.createDockerImage({
      name: "node",
      tag: "18-alpine",
      repository: "docker.io/library",
      size: 128,
      description: "Node.js 18 Alpine Linux"
    });
    
    const nginxImage = this.createDockerImage({
      name: "nginx",
      tag: "latest",
      repository: "docker.io/library",
      size: 142,
      description: "Nginx Web Server"
    });
    
    const expressImage = this.createDockerImage({
      name: "express-api",
      tag: "1.3.2",
      repository: "registry.example.com/organization",
      size: 248,
      description: "Express API Service"
    });
    
    // Create sample Docker containers
    this.createDockerContainer({
      name: "express-api-1",
      imageId: expressImage.id,
      status: "running",
      ports: [{ internal: 3000, external: 80 }],
      volumes: [{ hostPath: "/data", containerPath: "/app/data" }],
      environment: { "NODE_ENV": "production", "LOG_LEVEL": "info" },
      command: "npm start",
      restartPolicy: "always",
      buildId: expressBuild.id
    });
    
    this.createDockerContainer({
      name: "express-api-db",
      imageId: this.createDockerImage({
        name: "postgres",
        tag: "16-alpine",
        repository: "docker.io/library",
        size: 320,
        description: "PostgreSQL Database"
      }).id,
      status: "running",
      ports: [{ internal: 5432, external: 5432 }],
      volumes: [{ hostPath: "/data/postgres", containerPath: "/var/lib/postgresql/data" }],
      environment: { "POSTGRES_PASSWORD": "secret", "POSTGRES_USER": "app" },
      restartPolicy: "always",
      buildId: expressBuild.id
    });
    
    this.createDockerContainer({
      name: "auth-service",
      imageId: nodeImage.id,
      status: "exited",
      ports: [{ internal: 3001, external: 3001 }],
      environment: { "NODE_ENV": "development" },
      command: "node index.js",
      restartPolicy: "no",
      buildId: userAuthBuild.id
    });
    
    // Create sample Jenkins jobs
    this.createJenkinsJob({
      name: "express-api-build",
      url: "https://jenkins.example.com/job/express-api-build",
      jenkinsJobDefinition: `
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'npm ci'
        sh 'npm run build'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('Deploy') {
      steps {
        sh 'docker build -t express-api:$BUILD_NUMBER .'
        sh 'docker push express-api:$BUILD_NUMBER'
      }
    }
  }
}`,
      pipelineId: expressApi.id
    });
    
    this.createJenkinsJob({
      name: "auth-service-build",
      url: "https://jenkins.example.com/job/auth-service-build",
      jenkinsJobDefinition: `
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'npm ci'
        sh 'npm run build'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
  }
}`,
      pipelineId: userAuth.id
    });
    
    const paymentJob = this.createJenkinsJob({
      name: "payment-gateway-build",
      url: "https://jenkins.example.com/job/payment-gateway-build",
      jenkinsJobDefinition: `
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'npm ci'
        sh 'npm run build'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('Package') {
      steps {
        sh 'npm pack'
      }
    }
  }
}`,
      pipelineId: paymentGateway.id
    });
    
    // Update Jenkins job statuses
    this.updateJenkinsJobStatus(paymentJob.id, "failed", 56, new Date(Date.now() - 2640000));
  }

  // User methods (from original)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Pipeline methods
  async getAllPipelines(): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values());
  }
  
  async getPipeline(id: number): Promise<Pipeline | undefined> {
    return this.pipelines.get(id);
  }
  
  async getPipelineByRepo(repository: string, branch: string): Promise<Pipeline | undefined> {
    return Array.from(this.pipelines.values()).find(
      (pipeline) => pipeline.repository === repository && pipeline.branch === branch
    );
  }
  
  async createPipeline(pipeline: InsertPipeline): Promise<Pipeline> {
    const id = this.pipelineCurrentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newPipeline: Pipeline = { ...pipeline, id, createdAt, updatedAt };
    this.pipelines.set(id, newPipeline);
    return newPipeline;
  }
  
  // Build methods
  async getAllBuilds(): Promise<Build[]> {
    return Array.from(this.builds.values());
  }
  
  async getBuild(id: number): Promise<Build | undefined> {
    return this.builds.get(id);
  }
  
  async getBuildsByPipeline(pipelineId: number): Promise<Build[]> {
    return Array.from(this.builds.values())
      .filter(build => build.pipelineId === pipelineId)
      .sort((a, b) => b.buildNumber - a.buildNumber); // Sort by build number desc
  }
  
  async getLastBuildNumber(pipelineId: number): Promise<number> {
    const builds = await this.getBuildsByPipeline(pipelineId);
    if (builds.length === 0) return 0;
    return builds[0].buildNumber;
  }
  
  async createBuild(build: InsertBuild): Promise<Build> {
    const id = this.buildCurrentId++;
    const newBuild: Build = { ...build, id, completedAt: null, duration: null };
    this.builds.set(id, newBuild);
    return newBuild;
  }
  
  async updateBuildStatus(id: number, status: string, completedAt?: Date, duration?: number): Promise<Build | undefined> {
    const build = this.builds.get(id);
    if (!build) return undefined;
    
    const updatedBuild: Build = { 
      ...build, 
      status, 
      completedAt: completedAt || build.completedAt,
      duration: duration !== undefined ? duration : build.duration
    };
    
    this.builds.set(id, updatedBuild);
    
    // Update statistics
    if (status === "success") {
      await this.incrementSuccessfulBuilds();
    } else if (status === "failed") {
      await this.incrementFailedBuilds();
    }
    
    return updatedBuild;
  }
  
  // Build step methods
  async getBuildSteps(buildId: number): Promise<BuildStep[]> {
    return Array.from(this.buildSteps.values())
      .filter(step => step.buildId === buildId)
      .sort((a, b) => a.order - b.order); // Sort by order
  }
  
  async getBuildStep(id: number): Promise<BuildStep | undefined> {
    return this.buildSteps.get(id);
  }
  
  async createBuildStep(step: InsertBuildStep): Promise<BuildStep> {
    const id = this.buildStepCurrentId++;
    const newStep: BuildStep = { ...step, id, completedAt: null, logs: step.logs || "" };
    this.buildSteps.set(id, newStep);
    return newStep;
  }
  
  async updateBuildStep(id: number, status: string, completedAt?: Date, logs?: string): Promise<BuildStep | undefined> {
    const step = this.buildSteps.get(id);
    if (!step) return undefined;
    
    const updatedStep: BuildStep = { 
      ...step, 
      status, 
      completedAt: completedAt || step.completedAt,
      logs: logs !== undefined ? (step.logs || "") + logs : step.logs
    };
    
    this.buildSteps.set(id, updatedStep);
    return updatedStep;
  }
  
  // Deployment methods
  async getAllDeployments(): Promise<Deployment[]> {
    return Array.from(this.deployments.values())
      .sort((a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime());
  }
  
  async getDeployment(id: number): Promise<Deployment | undefined> {
    return this.deployments.get(id);
  }
  
  async getDeploymentsByBuild(buildId: number): Promise<Deployment[]> {
    return Array.from(this.deployments.values())
      .filter(deployment => deployment.buildId === buildId);
  }
  
  async createDeployment(deployment: InsertDeployment): Promise<Deployment> {
    const id = this.deploymentCurrentId++;
    const newDeployment: Deployment = { ...deployment, id };
    this.deployments.set(id, newDeployment);
    
    await this.incrementTotalDeployments();
    
    return newDeployment;
  }
  
  // Docker image methods
  async getAllDockerImages(): Promise<DockerImage[]> {
    return Array.from(this.dockerImages.values());
  }
  
  async getDockerImage(id: number): Promise<DockerImage | undefined> {
    return this.dockerImages.get(id);
  }
  
  async createDockerImage(image: InsertDockerImage): Promise<DockerImage> {
    const id = this.dockerImageCurrentId++;
    const createdAt = new Date();
    const newImage: DockerImage = { 
      ...image, 
      id, 
      createdAt, 
      pullCount: 0
    };
    this.dockerImages.set(id, newImage);
    return newImage;
  }
  
  async incrementImagePullCount(id: number): Promise<void> {
    const image = this.dockerImages.get(id);
    if (image) {
      image.pullCount += 1;
      this.dockerImages.set(id, image);
    }
  }
  
  // Docker container methods
  async getAllDockerContainers(): Promise<DockerContainer[]> {
    return Array.from(this.dockerContainers.values());
  }
  
  async getDockerContainer(id: number): Promise<DockerContainer | undefined> {
    return this.dockerContainers.get(id);
  }
  
  async getDockerContainersByBuild(buildId: number): Promise<DockerContainer[]> {
    return Array.from(this.dockerContainers.values())
      .filter(container => container.buildId === buildId);
  }
  
  async createDockerContainer(container: InsertDockerContainer): Promise<DockerContainer> {
    const id = this.dockerContainerCurrentId++;
    const createdAt = new Date();
    const newContainer: DockerContainer = { 
      ...container, 
      id, 
      createdAt, 
      cpuUsage: 0, 
      memoryUsage: 0
    };
    this.dockerContainers.set(id, newContainer);
    return newContainer;
  }
  
  async updateDockerContainerStatus(id: number, status: string): Promise<DockerContainer | undefined> {
    const container = this.dockerContainers.get(id);
    if (!container) return undefined;
    
    const updatedContainer: DockerContainer = { ...container, status: status as any };
    this.dockerContainers.set(id, updatedContainer);
    return updatedContainer;
  }
  
  async updateDockerContainerResources(id: number, cpuUsage: number, memoryUsage: number): Promise<DockerContainer | undefined> {
    const container = this.dockerContainers.get(id);
    if (!container) return undefined;
    
    const updatedContainer: DockerContainer = { ...container, cpuUsage, memoryUsage };
    this.dockerContainers.set(id, updatedContainer);
    return updatedContainer;
  }
  
  // Jenkins job methods
  async getAllJenkinsJobs(): Promise<JenkinsJob[]> {
    return Array.from(this.jenkinsJobs.values());
  }
  
  async getJenkinsJob(id: number): Promise<JenkinsJob | undefined> {
    return this.jenkinsJobs.get(id);
  }
  
  async getJenkinsJobsByPipeline(pipelineId: number): Promise<JenkinsJob[]> {
    return Array.from(this.jenkinsJobs.values())
      .filter(job => job.pipelineId === pipelineId);
  }
  
  async createJenkinsJob(job: InsertJenkinsJob): Promise<JenkinsJob> {
    const id = this.jenkinsJobCurrentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newJob: JenkinsJob = { 
      ...job, 
      id, 
      createdAt, 
      updatedAt,
      lastBuildStatus: null,
      lastBuildNumber: null,
      lastBuildTime: null,
      enabled: true
    };
    this.jenkinsJobs.set(id, newJob);
    return newJob;
  }
  
  async updateJenkinsJobStatus(id: number, status: string, buildNumber: number, buildTime: Date): Promise<JenkinsJob | undefined> {
    const job = this.jenkinsJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob: JenkinsJob = { 
      ...job, 
      lastBuildStatus: status as any, 
      lastBuildNumber: buildNumber,
      lastBuildTime: buildTime,
      updatedAt: new Date()
    };
    this.jenkinsJobs.set(id, updatedJob);
    return updatedJob;
  }
  
  async updateJenkinsJobDefinition(id: number, jenkinsJobDefinition: string): Promise<JenkinsJob | undefined> {
    const job = this.jenkinsJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob: JenkinsJob = { 
      ...job, 
      jenkinsJobDefinition,
      updatedAt: new Date()
    };
    this.jenkinsJobs.set(id, updatedJob);
    return updatedJob;
  }
  
  async toggleJenkinsJobEnabled(id: number, enabled: boolean): Promise<JenkinsJob | undefined> {
    const job = this.jenkinsJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob: JenkinsJob = { 
      ...job, 
      enabled,
      updatedAt: new Date()
    };
    this.jenkinsJobs.set(id, updatedJob);
    return updatedJob;
  }
  
  // Statistics methods
  async getStatistics(): Promise<Statistics> {
    return this.stats;
  }
  
  async incrementSuccessfulBuilds(): Promise<void> {
    this.stats.successfulBuilds += 1;
    this.stats.updatedAt = new Date();
  }
  
  async incrementFailedBuilds(): Promise<void> {
    this.stats.failedBuilds += 1;
    this.stats.updatedAt = new Date();
  }
  
  async incrementTotalDeployments(): Promise<void> {
    this.stats.totalDeployments += 1;
    this.stats.updatedAt = new Date();
  }
  
  async updateAverageBuildTime(buildTime: number): Promise<void> {
    // Simple moving average
    const totalBuilds = this.stats.successfulBuilds + this.stats.failedBuilds;
    if (totalBuilds <= 1) {
      this.stats.averageBuildTime = buildTime;
    } else {
      this.stats.averageBuildTime = Math.round(
        (this.stats.averageBuildTime * (totalBuilds - 1) + buildTime) / totalBuilds
      );
    }
    this.stats.updatedAt = new Date();
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getAllPipelines(): Promise<Pipeline[]> {
    return db.select().from(pipelines).orderBy(desc(pipelines.updatedAt));
  }
  
  async getPipeline(id: number): Promise<Pipeline | undefined> {
    const [pipeline] = await db.select().from(pipelines).where(eq(pipelines.id, id));
    return pipeline || undefined;
  }
  
  async getPipelineByRepo(repository: string, branch: string): Promise<Pipeline | undefined> {
    const [pipeline] = await db.select().from(pipelines)
      .where(and(
        eq(pipelines.repository, repository),
        eq(pipelines.branch, branch)
      ));
    return pipeline || undefined;
  }
  
  async createPipeline(pipeline: InsertPipeline): Promise<Pipeline> {
    const createdAt = new Date();
    const updatedAt = createdAt;
    const [newPipeline] = await db.insert(pipelines)
      .values({ ...pipeline, createdAt, updatedAt })
      .returning();
    return newPipeline;
  }
  
  async getAllBuilds(): Promise<Build[]> {
    return db.select().from(builds).orderBy(desc(builds.startedAt));
  }
  
  async getBuild(id: number): Promise<Build | undefined> {
    const [build] = await db.select().from(builds).where(eq(builds.id, id));
    return build || undefined;
  }
  
  async getBuildsByPipeline(pipelineId: number): Promise<Build[]> {
    return db.select().from(builds)
      .where(eq(builds.pipelineId, pipelineId))
      .orderBy(desc(builds.buildNumber));
  }
  
  async getLastBuildNumber(pipelineId: number): Promise<number> {
    const [result] = await db.select({ maxNumber: sql<number>`max(${builds.buildNumber})` })
      .from(builds)
      .where(eq(builds.pipelineId, pipelineId));
    return result?.maxNumber || 0;
  }
  
  async createBuild(build: InsertBuild): Promise<Build> {
    const [newBuild] = await db.insert(builds)
      .values(build)
      .returning();
    return newBuild;
  }
  
  async updateBuildStatus(id: number, status: string, completedAt?: Date, duration?: number): Promise<Build | undefined> {
    const [updatedBuild] = await db.update(builds)
      .set({ 
        status, 
        ...(completedAt && { completedAt }),
        ...(duration && { duration }),
      })
      .where(eq(builds.id, id))
      .returning();
    return updatedBuild || undefined;
  }
  
  async getBuildSteps(buildId: number): Promise<BuildStep[]> {
    return db.select().from(buildSteps)
      .where(eq(buildSteps.buildId, buildId))
      .orderBy(buildSteps.stepNumber);
  }
  
  async getBuildStep(id: number): Promise<BuildStep | undefined> {
    const [step] = await db.select().from(buildSteps).where(eq(buildSteps.id, id));
    return step || undefined;
  }
  
  async createBuildStep(step: InsertBuildStep): Promise<BuildStep> {
    const [newStep] = await db.insert(buildSteps)
      .values(step)
      .returning();
    return newStep;
  }
  
  async updateBuildStep(id: number, status: string, completedAt?: Date, logs?: string): Promise<BuildStep | undefined> {
    const [updatedStep] = await db.update(buildSteps)
      .set({ 
        status, 
        ...(completedAt && { completedAt }),
        ...(logs !== undefined && { logs }),
      })
      .where(eq(buildSteps.id, id))
      .returning();
    return updatedStep || undefined;
  }
  
  async getAllDeployments(): Promise<Deployment[]> {
    return db.select().from(deployments).orderBy(desc(deployments.deployedAt));
  }
  
  async getDeployment(id: number): Promise<Deployment | undefined> {
    const [deployment] = await db.select().from(deployments).where(eq(deployments.id, id));
    return deployment || undefined;
  }
  
  async getDeploymentsByBuild(buildId: number): Promise<Deployment[]> {
    return db.select().from(deployments)
      .where(eq(deployments.buildId, buildId))
      .orderBy(desc(deployments.deployedAt));
  }
  
  async createDeployment(deployment: InsertDeployment): Promise<Deployment> {
    const [newDeployment] = await db.insert(deployments)
      .values(deployment)
      .returning();
    return newDeployment;
  }
  
  async getStatistics(): Promise<Statistics> {
    // Try to get existing statistics
    const [existingStats] = await db.select().from(statistics);
    
    // If no statistics exist, create initial record
    if (!existingStats) {
      const [newStats] = await db.insert(statistics)
        .values({
          successfulBuilds: 0,
          failedBuilds: 0,
          totalDeployments: 0,
          averageBuildTime: 0
        })
        .returning();
      return newStats;
    }
    
    return existingStats;
  }
  
  async incrementSuccessfulBuilds(): Promise<void> {
    const stats = await this.getStatistics();
    await db.update(statistics)
      .set({ successfulBuilds: stats.successfulBuilds + 1 })
      .where(eq(statistics.id, stats.id));
  }
  
  async incrementFailedBuilds(): Promise<void> {
    const stats = await this.getStatistics();
    await db.update(statistics)
      .set({ failedBuilds: stats.failedBuilds + 1 })
      .where(eq(statistics.id, stats.id));
  }
  
  async incrementTotalDeployments(): Promise<void> {
    const stats = await this.getStatistics();
    await db.update(statistics)
      .set({ totalDeployments: stats.totalDeployments + 1 })
      .where(eq(statistics.id, stats.id));
  }
  
  async updateAverageBuildTime(buildTime: number): Promise<void> {
    const stats = await this.getStatistics();
    const totalBuilds = stats.successfulBuilds + stats.failedBuilds;
    
    if (totalBuilds === 0) {
      await db.update(statistics)
        .set({ averageBuildTime: buildTime })
        .where(eq(statistics.id, stats.id));
      return;
    }
    
    // Calculate new average
    const currentTotalTime = stats.averageBuildTime * totalBuilds;
    const newTotalTime = currentTotalTime + buildTime;
    const newAverage = newTotalTime / (totalBuilds + 1);
    
    await db.update(statistics)
      .set({ averageBuildTime: newAverage })
      .where(eq(statistics.id, stats.id));
  }
  
  // Docker image methods
  async getAllDockerImages(): Promise<DockerImage[]> {
    return db.select().from(dockerImages).orderBy(desc(dockerImages.createdAt));
  }
  
  async getDockerImage(id: number): Promise<DockerImage | undefined> {
    const [image] = await db.select().from(dockerImages).where(eq(dockerImages.id, id));
    return image || undefined;
  }
  
  async createDockerImage(image: InsertDockerImage): Promise<DockerImage> {
    const [newImage] = await db.insert(dockerImages)
      .values({
        ...image,
        pullCount: 0,
        createdAt: new Date()
      })
      .returning();
    return newImage;
  }
  
  async incrementImagePullCount(id: number): Promise<void> {
    const image = await this.getDockerImage(id);
    if (!image) return;
    
    await db.update(dockerImages)
      .set({ pullCount: image.pullCount + 1 })
      .where(eq(dockerImages.id, id));
  }
  
  // Docker container methods
  async getAllDockerContainers(): Promise<DockerContainer[]> {
    return db.select().from(dockerContainers).orderBy(desc(dockerContainers.createdAt));
  }
  
  async getDockerContainer(id: number): Promise<DockerContainer | undefined> {
    const [container] = await db.select().from(dockerContainers).where(eq(dockerContainers.id, id));
    return container || undefined;
  }
  
  async getDockerContainersByBuild(buildId: number): Promise<DockerContainer[]> {
    return db.select().from(dockerContainers)
      .where(eq(dockerContainers.buildId, buildId))
      .orderBy(dockerContainers.createdAt);
  }
  
  async createDockerContainer(container: InsertDockerContainer): Promise<DockerContainer> {
    const [newContainer] = await db.insert(dockerContainers)
      .values({
        ...container,
        cpuUsage: 0,
        memoryUsage: 0,
        createdAt: new Date()
      })
      .returning();
    return newContainer;
  }
  
  async updateDockerContainerStatus(id: number, status: string): Promise<DockerContainer | undefined> {
    const [updatedContainer] = await db.update(dockerContainers)
      .set({ status })
      .where(eq(dockerContainers.id, id))
      .returning();
    return updatedContainer || undefined;
  }
  
  async updateDockerContainerResources(id: number, cpuUsage: number, memoryUsage: number): Promise<DockerContainer | undefined> {
    const [updatedContainer] = await db.update(dockerContainers)
      .set({ cpuUsage, memoryUsage })
      .where(eq(dockerContainers.id, id))
      .returning();
    return updatedContainer || undefined;
  }
  
  // Jenkins job methods
  async getAllJenkinsJobs(): Promise<JenkinsJob[]> {
    return db.select().from(jenkinsJobs).orderBy(desc(jenkinsJobs.updatedAt));
  }
  
  async getJenkinsJob(id: number): Promise<JenkinsJob | undefined> {
    const [job] = await db.select().from(jenkinsJobs).where(eq(jenkinsJobs.id, id));
    return job || undefined;
  }
  
  async getJenkinsJobsByPipeline(pipelineId: number): Promise<JenkinsJob[]> {
    return db.select().from(jenkinsJobs)
      .where(eq(jenkinsJobs.pipelineId, pipelineId))
      .orderBy(jenkinsJobs.name);
  }
  
  async createJenkinsJob(job: InsertJenkinsJob): Promise<JenkinsJob> {
    const createdAt = new Date();
    const updatedAt = createdAt;
    const [newJob] = await db.insert(jenkinsJobs)
      .values({
        ...job,
        createdAt,
        updatedAt,
        enabled: true
      })
      .returning();
    return newJob;
  }
  
  async updateJenkinsJobStatus(id: number, status: string, buildNumber: number, buildTime: Date): Promise<JenkinsJob | undefined> {
    const [updatedJob] = await db.update(jenkinsJobs)
      .set({
        lastBuildStatus: status,
        lastBuildNumber: buildNumber,
        lastBuildTime: buildTime,
        updatedAt: new Date()
      })
      .where(eq(jenkinsJobs.id, id))
      .returning();
    return updatedJob || undefined;
  }
  
  async updateJenkinsJobDefinition(id: number, jenkinsJobDefinition: string): Promise<JenkinsJob | undefined> {
    const [updatedJob] = await db.update(jenkinsJobs)
      .set({
        jenkinsJobDefinition,
        updatedAt: new Date()
      })
      .where(eq(jenkinsJobs.id, id))
      .returning();
    return updatedJob || undefined;
  }
  
  async toggleJenkinsJobEnabled(id: number, enabled: boolean): Promise<JenkinsJob | undefined> {
    const [updatedJob] = await db.update(jenkinsJobs)
      .set({
        enabled,
        updatedAt: new Date()
      })
      .where(eq(jenkinsJobs.id, id))
      .returning();
    return updatedJob || undefined;
  }
}

export const storage = new DatabaseStorage();
