import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlayCircle, Eye, CodeXml, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

type JenkinsJob = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  pipelineId: number | null;
  url: string;
  lastBuildStatus: "success" | "failed" | "in_progress" | "cancelled" | "pending" | null;
  lastBuildNumber: number | null;
  lastBuildTime: string | null;
  jenkinsJobDefinition: string;
  enabled: boolean;
};

function getStatusBadgeColor(status: string | null) {
  if (!status) return "bg-gray-500";
  
  switch (status) {
    case "success":
      return "bg-green-500";
    case "failed":
      return "bg-red-500";
    case "in_progress":
      return "bg-blue-500";
    case "cancelled":
      return "bg-yellow-500";
    case "pending":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
}

export default function JenkinsJobs() {
  const [selectedJob, setSelectedJob] = useState<JenkinsJob | null>(null);
  const [jobDefinitionDialogOpen, setJobDefinitionDialogOpen] = useState(false);
  
  const { data: jobs, isLoading, isError } = useQuery<JenkinsJob[]>({
    queryKey: ['/api/jenkins/jobs'],
    queryFn: () => fetch('/api/jenkins/jobs').then(res => res.json()),
    retry: 1,
  });
  
  const handleToggleEnabled = async (jobId: number, enabled: boolean) => {
    try {
      await apiRequest(`/api/jenkins/jobs/${jobId}/toggle-enabled`, 'PATCH', { enabled });
      queryClient.invalidateQueries({ queryKey: ['/api/jenkins/jobs'] });
    } catch (error) {
      console.error("Failed to toggle job enabled status:", error);
    }
  };
  
  const handleTriggerBuild = async (jobId: number) => {
    try {
      await apiRequest(`/api/jenkins/jobs/${jobId}/trigger`, 'POST');
      queryClient.invalidateQueries({ queryKey: ['/api/jenkins/jobs'] });
    } catch (error) {
      console.error("Failed to trigger job build:", error);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jenkins Jobs</CardTitle>
          <CardDescription>CI/CD pipeline jobs configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jenkins Jobs</CardTitle>
          <CardDescription>CI/CD pipeline jobs configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-red-500">
            Failed to load Jenkins jobs
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jenkins Jobs</CardTitle>
        <CardDescription>CI/CD pipeline jobs configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Last Build</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.name}</TableCell>
                    <TableCell>
                      {job.lastBuildNumber ? `#${job.lastBuildNumber}` : "Never run"}
                    </TableCell>
                    <TableCell>
                      {job.lastBuildStatus ? (
                        <Badge className={getStatusBadgeColor(job.lastBuildStatus)}>
                          {job.lastBuildStatus}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.lastBuildTime ? (
                        format(new Date(job.lastBuildTime), "MMM dd, yyyy HH:mm")
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={job.enabled}
                        onCheckedChange={(checked) => handleToggleEnabled(job.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="flex justify-end space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleTriggerBuild(job.id)}
                              disabled={!job.enabled}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Run Job</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => window.open(job.url, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View in Jenkins</TooltipContent>
                        </Tooltip>
                        
                        <Dialog open={jobDefinitionDialogOpen && selectedJob?.id === job.id} 
                          onOpenChange={(open) => {
                            setJobDefinitionDialogOpen(open)
                            if (!open) setSelectedJob(null);
                          }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedJob(job);
                                setJobDefinitionDialogOpen(true);
                              }}
                            >
                              <CodeXml className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Jenkins Job Definition</DialogTitle>
                              <DialogDescription>
                                Pipeline configuration for {job.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 rounded-md bg-secondary p-4 overflow-auto h-96">
                              <pre className="text-xs">
                                {selectedJob?.jenkinsJobDefinition}
                              </pre>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {
                                setJobDefinitionDialogOpen(false);
                                setSelectedJob(null);
                              }}>
                                Close
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No Jenkins jobs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="jobs-help">
            <AccordionTrigger>How to configure Jenkins jobs</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 text-sm">
                <p>
                  Jenkins jobs are configured using the Jenkinsfile in your repository. The Jenkinsfile defines the stages and steps that will be executed during a build.
                </p>
                <p>
                  You can use the Jenkins UI to edit the pipeline definition, or you can update the Jenkinsfile in your repository.
                </p>
                <p>
                  Jobs can be triggered manually by clicking the Run button, or automatically by configuring webhooks in your repository.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}