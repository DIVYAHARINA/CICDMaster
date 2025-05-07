import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNavbar from "@/components/MobileNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchBuilds, fetchPipelines } from "@/lib/api";
import { Build, Pipeline } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { timeFromNow, formatDuration, statusColors } from "@/lib/githubActions";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

// Combine build with its pipeline info
interface BuildWithPipeline extends Build {
  pipelineName?: string;
}

export default function BuildHistory() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: pipelines = [] } = useQuery({
    queryKey: ['/api/pipelines'],
    staleTime: 30000,
  });
  
  // Fetch all builds for this simplified demo
  // In a real app, we'd have pagination and server-side filtering
  const { data: rawBuilds = [], isLoading } = useQuery({
    queryKey: ['/api/pipelines', 'all-builds'],
    queryFn: async () => {
      // In a real app, this would be a dedicated API endpoint
      // For this demo, we'll simulate by fetching builds from each pipeline
      const allBuilds: Build[] = [];
      
      // Simplified demo: get builds from first 3 pipelines
      for (let i = 1; i <= 3 && i <= pipelines.length; i++) {
        const pipelineBuilds = await fetchBuildsByPipeline(i);
        allBuilds.push(...pipelineBuilds);
      }
      
      return allBuilds;
    },
    enabled: pipelines.length > 0,
  });
  
  // Combine builds with pipeline info and apply filters
  const builds: BuildWithPipeline[] = rawBuilds.map(build => {
    const pipeline = pipelines.find(p => p.id === build.pipelineId);
    return {
      ...build,
      pipelineName: pipeline?.name
    };
  }).filter(build => {
    if (statusFilter === "all") return true;
    return build.status === statusFilter;
  });
  
  const getPipelineName = (pipelineId: number): string => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    return pipeline?.name || "Unknown Pipeline";
  };
  
  const getStatusBadge = (status: string) => {
    let variant: "default" | "destructive" | "outline" | "secondary" = "outline";
    let statusText = status;
    
    switch (status) {
      case "success":
        variant = "default";
        statusText = "Success";
        break;
      case "failed":
        variant = "destructive";
        statusText = "Failed";
        break;
      case "in_progress":
        variant = "secondary";
        statusText = "In Progress";
        break;
      default:
        statusText = "Pending";
    }
    
    return <Badge variant={variant}>{statusText}</Badge>;
  };

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 font-sans text-neutral-900 dark:text-neutral-100 min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Build History</h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  View and analyze your CI/CD build history
                </p>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <Input 
                      className="max-w-xs" 
                      placeholder="Search builds..."
                    />
                    <Select defaultValue="all" onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm">
                    <FontAwesomeIcon icon="sync-alt" className="mr-2" />
                    Refresh
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Build</TableHead>
                        <TableHead>Pipeline</TableHead>
                        <TableHead>Commit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [...Array(5)].map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : builds.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                            <p>No builds found with the current filter.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        builds.map((build) => (
                          <TableRow key={build.id}>
                            <TableCell className="font-medium">#{build.buildNumber}</TableCell>
                            <TableCell>{build.pipelineName || getPipelineName(build.pipelineId)}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              <div className="flex items-center">
                                <FontAwesomeIcon icon="code-commit" className="mr-2 text-neutral-500 dark:text-neutral-400" />
                                <span className="truncate" title={build.commitMessage}>
                                  {build.commitMessage}
                                </span>
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                <FontAwesomeIcon icon="user-circle" className="mr-1" />
                                {build.commitAuthor}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(build.status)}</TableCell>
                            <TableCell className="text-neutral-500 dark:text-neutral-400">
                              {timeFromNow(build.startedAt)}
                            </TableCell>
                            <TableCell>
                              {build.duration ? formatDuration(build.duration) : 
                               build.status === 'in_progress' ? 'Running...' : '-'}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" variant="outline">
                                <FontAwesomeIcon icon="history" className="mr-2" />
                                Logs
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {!isLoading && builds.length > 0 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Showing {builds.length} builds
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" disabled>Previous</Button>
                      <Button variant="outline" size="sm">Next</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <MobileNavbar />
    </div>
  );
}

async function fetchBuildsByPipeline(pipelineId: number) {
  try {
    return await fetchBuilds(pipelineId);
  } catch (error) {
    return [];
  }
}
