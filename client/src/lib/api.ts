import { apiRequest as fetchApiRequest } from './queryClient';
import { Build, BuildStep, Deployment, Pipeline, Statistics } from '@shared/schema';

// Re-export apiRequest for use in components
export const apiRequest = fetchApiRequest;

// Statistics API
export const fetchStatistics = async (): Promise<Statistics> => {
  const res = await apiRequest('GET', '/api/statistics');
  return await res.json();
};

// Pipelines API
export const fetchPipelines = async (): Promise<Pipeline[]> => {
  const res = await apiRequest('GET', '/api/pipelines');
  return await res.json();
};

export const fetchPipeline = async (id: number): Promise<Pipeline> => {
  const res = await apiRequest('GET', `/api/pipelines/${id}`);
  return await res.json();
};

export const createPipeline = async (data: { name: string; repository: string; branch: string }): Promise<Pipeline> => {
  const res = await apiRequest('POST', '/api/pipelines', data);
  return await res.json();
};

// Builds API
export const fetchBuilds = async (): Promise<Build[]> => {
  const res = await apiRequest('GET', '/api/builds');
  return await res.json();
};

export const fetchBuildsByPipeline = async (pipelineId: number): Promise<Build[]> => {
  const res = await apiRequest('GET', `/api/pipelines/${pipelineId}/builds`);
  return await res.json();
};

export const fetchBuild = async (id: number): Promise<Build> => {
  const res = await apiRequest('GET', `/api/builds/${id}`);
  return await res.json();
};

export const updateBuildStatus = async (
  id: number, 
  data: { status: string; completedAt?: Date; duration?: number }
): Promise<Build> => {
  const res = await apiRequest('PATCH', `/api/builds/${id}/status`, data);
  return await res.json();
};

// Build Steps API
export const fetchBuildSteps = async (buildId: number): Promise<BuildStep[]> => {
  const res = await apiRequest('GET', `/api/builds/${buildId}/steps`);
  return await res.json();
};

export const updateBuildStep = async (
  id: number, 
  data: { status: string; completedAt?: Date; logs?: string }
): Promise<BuildStep> => {
  const res = await apiRequest('PATCH', `/api/buildsteps/${id}`, data);
  return await res.json();
};

// Deployments API
export const fetchDeployments = async (): Promise<Deployment[]> => {
  const res = await apiRequest('GET', '/api/deployments');
  return await res.json();
};

// Simulation for demo purposes
export const simulateBuild = async (buildId: number): Promise<{ message: string }> => {
  const res = await apiRequest('POST', `/api/simulate/build/${buildId}`);
  return await res.json();
};

// Docker API
export const fetchDockerImages = async () => {
  const res = await apiRequest('GET', '/api/docker/images');
  return await res.json();
};

export const fetchDockerImage = async (id: number) => {
  const res = await apiRequest('GET', `/api/docker/images/${id}`);
  return await res.json();
};

export const createDockerImage = async (data: any) => {
  const res = await apiRequest('POST', '/api/docker/images', data);
  return await res.json();
};

export const incrementImagePullCount = async (id: number) => {
  const res = await apiRequest('POST', `/api/docker/images/${id}/increment-pull`);
  return await res.json();
};

export const fetchDockerContainers = async () => {
  const res = await apiRequest('GET', '/api/docker/containers');
  return await res.json();
};

export const fetchDockerContainer = async (id: number) => {
  const res = await apiRequest('GET', `/api/docker/containers/${id}`);
  return await res.json();
};

export const fetchContainersByBuild = async (buildId: number) => {
  const res = await apiRequest('GET', `/api/builds/${buildId}/containers`);
  return await res.json();
};

export const createDockerContainer = async (data: any) => {
  const res = await apiRequest('POST', '/api/docker/containers', data);
  return await res.json();
};

export const updateDockerContainerStatus = async (id: number, status: string) => {
  const res = await apiRequest('PATCH', `/api/docker/containers/${id}/status`, { status });
  return await res.json();
};

export const updateDockerContainerResources = async (id: number, cpuUsage: number, memoryUsage: number) => {
  const res = await apiRequest('PATCH', `/api/docker/containers/${id}/resources`, { cpuUsage, memoryUsage });
  return await res.json();
};

// Jenkins API
export const fetchJenkinsJobs = async () => {
  const res = await apiRequest('GET', '/api/jenkins/jobs');
  return await res.json();
};

export const fetchJenkinsJob = async (id: number) => {
  const res = await apiRequest('GET', `/api/jenkins/jobs/${id}`);
  return await res.json();
};

export const fetchJenkinsJobsByPipeline = async (pipelineId: number) => {
  const res = await apiRequest('GET', `/api/pipelines/${pipelineId}/jenkins-jobs`);
  return await res.json();
};

export const createJenkinsJob = async (data: any) => {
  const res = await apiRequest('POST', '/api/jenkins/jobs', data);
  return await res.json();
};

export const updateJenkinsJobStatus = async (id: number, status: string, buildNumber: number, buildTime: Date) => {
  const res = await apiRequest('PATCH', `/api/jenkins/jobs/${id}/status`, { status, buildNumber, buildTime });
  return await res.json();
};

export const updateJenkinsJobDefinition = async (id: number, jenkinsJobDefinition: string) => {
  const res = await apiRequest('PATCH', `/api/jenkins/jobs/${id}/definition`, { jenkinsJobDefinition });
  return await res.json();
};

export const toggleJenkinsJobEnabled = async (id: number, enabled: boolean) => {
  const res = await apiRequest('PATCH', `/api/jenkins/jobs/${id}/toggle-enabled`, { enabled });
  return await res.json();
};
