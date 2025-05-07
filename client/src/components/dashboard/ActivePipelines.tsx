import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPipelines, fetchBuildsByPipeline, fetchBuildSteps, simulateBuild } from '@/lib/api';
import { Build, BuildStep, Pipeline } from '@shared/schema';
import { timeFromNow, statusColors } from '@/lib/githubActions';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const PipelineStatus = ({ build, buildSteps }: { build: Build, buildSteps: BuildStep[] }) => {
  // Calculate progress percentage based on completed steps
  const totalSteps = buildSteps.length || 4;
  const completedSteps = buildSteps.filter(step => step.status === 'success').length;
  const progress = build.status === 'success' ? 100 : (completedSteps / totalSteps) * 100;
  
  const getStatusColor = (status: string) => {
    const statusKey = status.toLowerCase() as keyof typeof statusColors;
    return statusColors[statusKey] || statusColors.pending;
  };

  return (
    <div className="mt-3">
      <div className="relative">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-neutral-200 dark:bg-neutral-700">
          <div 
            style={{ width: `${progress}%` }} 
            className={`flex-initial rounded ${build.status === 'success' ? 'bg-success' : 
                                               build.status === 'failed' ? 'bg-error' : 
                                               'bg-warning'}`}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <div className="grid grid-cols-4 gap-1 w-full">
            {buildSteps.map((step, index) => {
              const status = getStatusColor(step.status);
              return (
                <div key={index} className="text-xs flex flex-col items-center">
                  <span className={`w-6 h-6 ${status.status === 'pending' ? 'bg-neutral-300 dark:bg-neutral-600' : step.status === 'success' ? 'bg-success' : step.status === 'failed' ? 'bg-error' : 'bg-warning'} rounded-full flex items-center justify-center text-white`}>
                    <FontAwesomeIcon icon={status.icon} className={step.status === 'in_progress' ? 'fa-spin text-xs' : 'text-xs'} />
                  </span>
                  <span className={`mt-1 ${step.status === 'pending' ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-600 dark:text-neutral-300'}`}>{step.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const PipelineItem = ({ pipeline }: { pipeline: Pipeline }) => {
  // Fetch the most recent build for this pipeline
  const { data: builds = [], isLoading: isLoadingBuilds } = useQuery({
    queryKey: ['/api/pipelines', pipeline.id, 'builds'],
    queryFn: () => fetchBuildsByPipeline(pipeline.id),
  });
  
  const recentBuild = builds[0];
  
  // Fetch build steps for the most recent build
  const { data: buildSteps = [], isLoading: isLoadingSteps } = useQuery({
    queryKey: ['/api/builds', recentBuild?.id, 'steps'],
    queryFn: () => recentBuild ? fetchBuildSteps(recentBuild.id) : Promise.resolve([]),
    enabled: !!recentBuild,
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const handleSimulateBuild = async () => {
    if (!recentBuild) return;
    
    try {
      await simulateBuild(recentBuild.id);
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines', pipeline.id, 'builds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/builds', recentBuild.id, 'steps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      
      toast({
        title: "Build Simulated",
        description: "The build process has been simulated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to simulate build. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (isLoadingBuilds || isLoadingSteps) {
    return (
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 mb-4 hover:bg-neutral-50 dark:hover:bg-neutral-800">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-2 w-full rounded" />
          <div className="grid grid-cols-4 gap-1 w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-6 w-40" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!recentBuild) {
    return (
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">{pipeline.name}</h3>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{pipeline.branch} branch</span>
        </div>
        <div className="mt-4 text-neutral-500 dark:text-neutral-400 text-center py-6">
          No builds found for this pipeline.
          <div className="mt-2">
            <Button size="sm" onClick={handleSimulateBuild}>Start New Build</Button>
          </div>
        </div>
      </div>
    );
  }
  
  const statusBadgeClass = recentBuild.status === 'success'
    ? 'bg-success/10 text-success dark:bg-success/20'
    : recentBuild.status === 'failed'
      ? 'bg-error/10 text-error dark:bg-error/20'
      : 'bg-warning/10 text-warning dark:bg-warning/20';
  
  const timeText = recentBuild.status === 'in_progress'
    ? `Started ${timeFromNow(recentBuild.startedAt)}`
    : `${recentBuild.status === 'success' ? 'Completed' : 'Failed'} ${timeFromNow(recentBuild.completedAt || recentBuild.startedAt)}`;

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 mb-4 hover:bg-neutral-50 dark:hover:bg-neutral-800">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass}`}>
            {recentBuild.status === 'success' ? 'Success' : 
             recentBuild.status === 'failed' ? 'Failed' : 'In Progress'}
          </span>
          <h3 className="ml-2 text-base font-medium text-neutral-900 dark:text-neutral-100">{pipeline.name}</h3>
          <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">{pipeline.branch} branch</span>
        </div>
        <div className="flex mt-2 md:mt-0">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            <FontAwesomeIcon icon="clock" className="mr-1" /> {timeText}
          </span>
          <span className="ml-4 text-sm text-neutral-500 dark:text-neutral-400">
            <FontAwesomeIcon icon="code-commit" className="mr-1" /> #{recentBuild.buildNumber}
          </span>
        </div>
      </div>
      
      <PipelineStatus build={recentBuild} buildSteps={buildSteps} />
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            <FontAwesomeIcon icon="user-circle" className="mr-1 text-neutral-500 dark:text-neutral-400" /> {recentBuild.commitAuthor}
          </div>
          <div className="ml-4 text-sm text-neutral-500 dark:text-neutral-400">
            <FontAwesomeIcon icon="code-branch" className="mr-1" /> {recentBuild.commitMessage}
          </div>
        </div>
        <div>
          <Button variant="outline" size="sm" className="text-xs">
            <FontAwesomeIcon icon="history" className="mr-1" />
            Logs
          </Button>
          <Button variant="default" size="sm" className="ml-2 text-xs">
            <FontAwesomeIcon icon="external-link-alt" className="mr-1" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

const ActivePipelines = () => {
  const [filter, setFilter] = useState<string>("all");
  const { data: pipelines = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/pipelines'],
    staleTime: 30000, // 30 seconds
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
    queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
    
    toast({
      title: "Refreshed",
      description: "Pipeline data has been refreshed.",
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Active Pipelines</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Select defaultValue="all" onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Pipelines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Pipelines</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="failed">Failed Only</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <FontAwesomeIcon icon="sync-alt" className="mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 mb-4">
                <div className="animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-2 w-full rounded" />
                  <div className="grid grid-cols-4 gap-1 w-full">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-16 mt-1" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-40" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
            <p>Failed to load pipelines. Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : pipelines.length === 0 ? (
          <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
            <p>No active pipelines found.</p>
            <Button variant="default" className="mt-4">
              <FontAwesomeIcon icon="plus" className="-ml-1 mr-2 h-5 w-5" />
              Create Pipeline
            </Button>
          </div>
        ) : (
          <div>
            {pipelines.map((pipeline: Pipeline) => (
              <PipelineItem key={pipeline.id} pipeline={pipeline} />
            ))}
            
            <div className="text-center mt-6">
              <Button variant="outline">
                Load More
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivePipelines;
