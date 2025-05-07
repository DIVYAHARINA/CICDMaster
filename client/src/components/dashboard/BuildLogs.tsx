import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { fetchBuilds, fetchBuildsByPipeline } from '@/lib/api';
import { Build } from '@shared/schema';
import { getBuildLogs } from '@/lib/githubActions';
import { Skeleton } from '@/components/ui/skeleton';

const BuildLogs = () => {
  // Fetch the most recent successful build
  const { data: builds = [], isLoading } = useQuery({
    queryKey: ['/api/pipelines', 1, 'builds'], // Hardcoded to pipeline ID 1 for demo simplicity
    queryFn: () => fetchBuildsByPipeline(1),
  });
  
  const recentBuild = builds.find(build => build.status === 'success');
  const buildLogs = recentBuild ? getBuildLogs(recentBuild.id) : '';
  
  // Format logs with colors
  const formatLogs = (logs: string) => {
    return logs
      .replace(/\[✓\]/g, '<span class="text-green-400">[✓]</span>')
      .replace(/PASS/g, '<span class="text-green-400">PASS</span>')
      .replace(/Successfully/g, '<span class="text-green-400">Successfully</span>')
      .replace(/success/g, '<span class="text-green-400">success</span>');
  };

  return (
    <Card className="overflow-hidden shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">Latest Build Logs</h2>
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-72 w-full" />
          </div>
        ) : !recentBuild ? (
          <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
            <p>No recent successful builds found.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">express-api-service</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Build #{recentBuild.buildNumber}</div>
            </div>
            <div className="bg-neutral-900 rounded-md p-4 text-white font-mono text-sm h-72 overflow-y-auto">
              <pre className="text-neutral-300 dark:text-neutral-300 text-xs whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatLogs(buildLogs) }} />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                View Full Logs
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BuildLogs;
