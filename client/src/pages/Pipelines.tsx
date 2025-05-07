import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNavbar from "@/components/MobileNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPipelines, createPipeline } from "@/lib/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Pipeline } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Pipelines() {
  const [open, setOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [repoInput, setRepoInput] = useState("");
  const [branchInput, setBranchInput] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ['/api/pipelines'],
    staleTime: 30000,
  });
  
  const createPipelineMutation = useMutation({
    mutationFn: createPipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
      setOpen(false);
      setNameInput("");
      setRepoInput("");
      setBranchInput("");
      toast({
        title: "Pipeline created",
        description: "Your pipeline has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create pipeline. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleCreatePipeline = () => {
    if (!nameInput || !repoInput || !branchInput) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    createPipelineMutation.mutate({
      name: nameInput,
      repository: repoInput,
      branch: branchInput,
    });
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
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Pipelines</h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Manage your CI/CD pipelines and workflow automations
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <FontAwesomeIcon icon="plus" className="-ml-1 mr-2 h-5 w-5" />
                      New Pipeline
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Pipeline</DialogTitle>
                      <DialogDescription>
                        Configure your repository for CI/CD automation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="my-service"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="repository" className="text-right">
                          Repository
                        </Label>
                        <Input
                          id="repository"
                          value={repoInput}
                          onChange={(e) => setRepoInput(e.target.value)}
                          placeholder="username/repository"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="branch" className="text-right">
                          Branch
                        </Label>
                        <Input
                          id="branch"
                          value={branchInput}
                          onChange={(e) => setBranchInput(e.target.value)}
                          placeholder="main"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleCreatePipeline} disabled={createPipelineMutation.isPending}>
                        {createPipelineMutation.isPending ? "Creating..." : "Create Pipeline"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Repository</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Last Build</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [...Array(3)].map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : pipelines.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-neutral-500 dark:text-neutral-400">
                            <p>No pipelines found.</p>
                            <p className="mt-2 text-sm">Click "New Pipeline" to create your first CI/CD pipeline.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        pipelines.map((pipeline: Pipeline) => (
                          <TableRow key={pipeline.id}>
                            <TableCell className="font-medium">{pipeline.name}</TableCell>
                            <TableCell>{pipeline.repository}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{pipeline.branch}</Badge>
                            </TableCell>
                            <TableCell>
                              {/* This would be fetched from real data */}
                              {pipeline.id === 1 ? "#127 (Success)" : 
                               pipeline.id === 2 ? "#89 (In Progress)" : 
                               pipeline.id === 3 ? "#56 (Failed)" : "N/A"}
                            </TableCell>
                            <TableCell className="text-neutral-500 dark:text-neutral-400">
                              {new Date(pipeline.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline">
                                <FontAwesomeIcon icon="code-branch" className="mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <MobileNavbar />
    </div>
  );
}
