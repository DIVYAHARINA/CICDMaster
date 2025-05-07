import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { fetchStatistics } from '@/lib/api';
import { formatDuration } from '@/lib/githubActions';
import { Skeleton } from '@/components/ui/skeleton';

const StatusOverview = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/statistics'],
    staleTime: 60000 // 1 minute
  });

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">Pipeline Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="ml-3 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="mb-6">
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="text-center text-neutral-600 dark:text-neutral-400">
            <p>Failed to load statistics. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusItems = [
    {
      icon: "check",
      label: "Successful Builds",
      value: stats.successfulBuilds,
      bgColor: "bg-success/20",
      textColor: "text-success"
    },
    {
      icon: "times",
      label: "Failed Builds",
      value: stats.failedBuilds,
      bgColor: "bg-error/20",
      textColor: "text-error"
    },
    {
      icon: "rocket",
      label: "Deployments",
      value: stats.totalDeployments,
      bgColor: "bg-primary/20",
      textColor: "text-primary"
    },
    {
      icon: "clock",
      label: "Avg. Build Time",
      value: formatDuration(stats.averageBuildTime),
      bgColor: "bg-warning/20",
      textColor: "text-warning"
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">Pipeline Status Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {statusItems.map((item, index) => (
            <div key={index} className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-md ${item.bgColor} flex items-center justify-center`}>
                    <FontAwesomeIcon icon={item.icon} className={item.textColor} />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.label}</div>
                  <div className="text-lg font-semibold">{item.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusOverview;
