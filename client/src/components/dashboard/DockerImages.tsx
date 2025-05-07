import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

type DockerImage = {
  id: number;
  name: string;
  repository: string;
  createdAt: string;
  tag: string;
  pullCount: number;
  size: number;
  description: string | null;
};

export default function DockerImages() {
  const { data: images, isLoading, isError } = useQuery<DockerImage[]>({
    queryKey: ['/api/docker/images'],
    queryFn: () => fetch('/api/docker/images').then(res => res.json()),
    retry: 1,
  });
  
  // Format size in MB or GB
  const formatSize = (sizeInMB: number) => {
    if (sizeInMB >= 1000) {
      return `${(sizeInMB / 1000).toFixed(2)} GB`;
    }
    return `${sizeInMB} MB`;
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Docker Images</CardTitle>
          <CardDescription>Available Docker images in the registry</CardDescription>
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
          <CardTitle>Docker Images</CardTitle>
          <CardDescription>Available Docker images in the registry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-red-500">
            Failed to load Docker images
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Docker Images</CardTitle>
        <CardDescription>Available Docker images in the registry</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Pull Count</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images && images.length > 0 ? (
                images.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell className="font-medium">{image.name}</TableCell>
                    <TableCell>{image.tag}</TableCell>
                    <TableCell>{image.repository}</TableCell>
                    <TableCell>{formatSize(image.size)}</TableCell>
                    <TableCell>{image.pullCount}</TableCell>
                    <TableCell>
                      {format(new Date(image.createdAt), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No Docker images found
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