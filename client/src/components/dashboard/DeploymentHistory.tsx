import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { fetchDeployments } from '@/lib/api';
import { timeFromNow, environmentColors, deploymentStatusColors } from '@/lib/githubActions';
import { Skeleton } from '@/components/ui/skeleton';
import { Deployment } from "@shared/schema";

const DeploymentHistory = () => {
  const { data: deployments = [], isLoading, error } = useQuery({
    queryKey: ['/api/deployments'],
    staleTime: 30000, // 30 seconds
  });

  return (
    <Card className="overflow-hidden shadow rounded-lg md:col-span-2">
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">Recent Deployments</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Service
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Environment
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Time
                </TableHead>
                <TableHead className="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Version
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {isLoading ? (
                [...Array(4)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap text-sm font-medium">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      <Skeleton className="h-4 w-24 rounded-full" />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-neutral-600 dark:text-neutral-400">
                    Failed to load deployments. Please try again.
                  </TableCell>
                </TableRow>
              ) : deployments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-neutral-600 dark:text-neutral-400">
                    No deployments found.
                  </TableCell>
                </TableRow>
              ) : (
                deployments.map((deployment: Deployment) => {
                  const envColors = environmentColors[deployment.environment as keyof typeof environmentColors] || 
                    environmentColors["Replit (Dev)"];
                  
                  const statusColors = deploymentStatusColors[deployment.status as keyof typeof deploymentStatusColors] ||
                    deploymentStatusColors.pending;
                  
                  return (
                    <TableRow key={deployment.id}>
                      <TableCell className="whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {/* Service name would typically come from the associated build/pipeline */}
                        {deployment.buildId === 1 ? "express-api-service" : 
                          deployment.buildId === 123 ? "auth-service" :
                          deployment.buildId === 124 ? "payment-gateway" : "frontend-app"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${envColors.bg} ${envColors.text}`}>
                          {deployment.environment}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors.bg} ${statusColors.text}`}>
                          {deployment.status === 'success' ? 'Success' : 
                           deployment.status === 'failed' ? 'Failed' : 
                           deployment.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {timeFromNow(deployment.deployedAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {deployment.version}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeploymentHistory;
