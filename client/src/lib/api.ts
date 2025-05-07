import { apiRequest } from './queryClient';
import { Build, BuildStep, Deployment, Pipeline, Statistics } from '@shared/schema';

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
