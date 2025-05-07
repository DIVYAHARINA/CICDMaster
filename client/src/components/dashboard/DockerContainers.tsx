import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCw, Trash, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

type DockerContainer = {
  id: number;
  name: string;
  status: "running" | "stopped" | "exited" | "created" | "restarting" | "paused";
  createdAt: string;
  buildId: number | null;
  imageId: number;
  cpuUsage: number;
  memoryUsage: number;
  ports: { internal: number; external: number }[];
};

function getStatusBadgeColor(status: string) {
  switch (status) {
    case "running":
      return "bg-green-500";
    case "stopped":
    case "exited":
      return "bg-red-500";
    case "created":
      return "bg-blue-500";
    case "restarting":
      return "bg-yellow-500";
    case "paused":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
}

export default function DockerContainers() {
  const [selectedContainerId, setSelectedContainerId] = useState<number | null>(null);
  
  const { data: containers, isLoading, isError } = useQuery<DockerContainer[]>({
    queryKey: ['/api/docker/containers'],
    queryFn: () => fetch('/api/docker/containers').then(res => res.json()),
    retry: 1,
  });
  
  const handleAction = async (containerId: number, action: string) => {
    let status: string;
    switch (action) {
      case 'start':
        status = 'running';
        break;
      case 'stop':
        status = 'stopped';
        break;
      case 'restart':
        status = 'restarting';
        break;
      default:
        return;
    }
    
    try {
      await apiRequest(`/api/docker/containers/${containerId}/status`, 'PATCH', { status });
      queryClient.invalidateQueries({ queryKey: ['/api/docker/containers'] });
    } catch (error) {
      console.error(`Failed to ${action} container:`, error);
    }
  };
  
  const handleDeleteContainer = async (containerId: number) => {
    try {
      await apiRequest(`/api/docker/containers/${containerId}`, 'DELETE');
      queryClient.invalidateQueries({ queryKey: ['/api/docker/containers'] });
      setSelectedContainerId(null);
    } catch (error) {
      console.error("Failed to delete container:", error);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Docker Containers</CardTitle>
          <CardDescription>Running containers in the environment</CardDescription>
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
          <CardTitle>Docker Containers</CardTitle>
          <CardDescription>Running containers in the environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-red-500">
            Failed to load Docker containers
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Docker Containers</CardTitle>
        <CardDescription>Running containers in the environment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CPU Usage</TableHead>
                <TableHead>Memory Usage</TableHead>
                <TableHead>Ports</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containers && containers.length > 0 ? (
                containers.map((container) => (
                  <TableRow key={container.id}>
                    <TableCell className="font-medium">{container.name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(container.status)}>
                        {container.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{(container.cpuUsage * 100).toFixed(1)}%</TableCell>
                    <TableCell>{Math.round(container.memoryUsage)}MB</TableCell>
                    <TableCell>
                      {container.ports && container.ports.length > 0 ? (
                        container.ports.map((port, index) => (
                          <div key={index}>
                            {port.internal}:{port.external}
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end space-x-2">
                      <TooltipProvider>
                        {container.status !== "running" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleAction(container.id, "start")}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Start</TooltipContent>
                          </Tooltip>
                        )}
                        
                        {container.status === "running" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleAction(container.id, "stop")}
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Stop</TooltipContent>
                          </Tooltip>
                        )}
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleAction(container.id, "restart")}
                            >
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Restart</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Details</TooltipContent>
                        </Tooltip>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedContainerId(container.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the container {container.name}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setSelectedContainerId(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteContainer(container.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No containers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}