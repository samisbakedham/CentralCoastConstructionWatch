import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Camera, Milestone } from "lucide-react";
import type { ProjectWithDetails, InsertProject, InsertResidentialDetails, InsertMilestone } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectWithDetails | null>(null);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      return response.json();
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: InsertProject) => {
      await apiRequest('POST', '/api/projects', projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsProjectDialogOpen(false);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProject> }) => {
      await apiRequest('PUT', `/api/projects/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setEditingProject(null);
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  // Create milestone mutation
  const createMilestoneMutation = useMutation({
    mutationFn: async ({ projectId, milestone }: { projectId: number; milestone: Omit<InsertMilestone, 'projectId'> }) => {
      await apiRequest('POST', `/api/projects/${projectId}/milestones`, milestone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsMilestoneDialogOpen(false);
      setSelectedProject(null);
      toast({
        title: "Success",
        description: "Milestone added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add milestone",
        variant: "destructive",
      });
    },
  });

  const handleSubmitProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const projectData: InsertProject = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      county: formData.get('county') as string,
      city: formData.get('city') as string,
      type: formData.get('type') as string,
      status: formData.get('status') as string,
      estimatedCost: formData.get('estimatedCost') ? formData.get('estimatedCost') as string : undefined,
      contractor: formData.get('contractor') as string,
      developer: formData.get('developer') as string,
      estimatedCompletion: formData.get('estimatedCompletion') as string,
      description: formData.get('description') as string,
    };

    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: projectData });
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  const handleSubmitMilestone = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;

    const formData = new FormData(e.currentTarget);
    
    const milestoneData: Omit<InsertMilestone, 'projectId'> = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date: new Date(formData.get('date') as string),
    };

    createMilestoneMutation.mutate({
      projectId: selectedProject.id,
      milestone: milestoneData,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'planning': return 'secondary';
      case 'under-construction': return 'default';
      case 'complete': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProject ? 'Edit Project' : 'Add New Project'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitProject} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Project Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        required 
                        defaultValue={editingProject?.name}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Project Type</Label>
                      <Select name="type" defaultValue={editingProject?.type || 'residential'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="mixed-use">Mixed Use</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        required 
                        defaultValue={editingProject?.location}
                      />
                    </div>
                    <div>
                      <Label htmlFor="county">County</Label>
                      <Select name="county" defaultValue={editingProject?.county || 'Santa Barbara'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Santa Barbara">Santa Barbara</SelectItem>
                          <SelectItem value="San Luis Obispo">San Luis Obispo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        required 
                        defaultValue={editingProject?.city}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={editingProject?.status || 'planning'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="under-construction">Under Construction</SelectItem>
                          <SelectItem value="complete">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimatedCost">Estimated Cost</Label>
                      <Input 
                        id="estimatedCost" 
                        name="estimatedCost" 
                        placeholder="12500000"
                        defaultValue={editingProject?.estimatedCost}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedCompletion">Estimated Completion</Label>
                      <Input 
                        id="estimatedCompletion" 
                        name="estimatedCompletion" 
                        placeholder="Q3 2024"
                        defaultValue={editingProject?.estimatedCompletion}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contractor">Contractor</Label>
                      <Input 
                        id="contractor" 
                        name="contractor" 
                        defaultValue={editingProject?.contractor}
                      />
                    </div>
                    <div>
                      <Label htmlFor="developer">Developer</Label>
                      <Input 
                        id="developer" 
                        name="developer" 
                        defaultValue={editingProject?.developer}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      defaultValue={editingProject?.description}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                    >
                      {editingProject ? 'Update Project' : 'Create Project'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsProjectDialogOpen(false);
                        setEditingProject(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      <p className="text-slate-600 mt-1">{project.location}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{project.county}</Badge>
                        <Badge variant="outline">{project.type}</Badge>
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsMilestoneDialogOpen(true);
                        }}
                      >
                        <Milestone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProject(project);
                          setIsProjectDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this project?')) {
                            deleteProjectMutation.mutate(project.id);
                          }
                        }}
                        disabled={deleteProjectMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-500">Estimated Cost</p>
                      <p className="font-medium">
                        {project.estimatedCost ? 
                          `$${(parseFloat(project.estimatedCost) / 1000000).toFixed(1)}M` : 
                          'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Contractor</p>
                      <p className="font-medium">{project.contractor || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Completion</p>
                      <p className="font-medium">{project.estimatedCompletion || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {project.milestones.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Recent Milestones</h4>
                      <div className="space-y-2">
                        {project.milestones.slice(0, 3).map((milestone) => (
                          <div key={milestone.id} className="flex justify-between items-center text-sm">
                            <span>{milestone.title}</span>
                            <span className="text-slate-500">
                              {new Date(milestone.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Milestone Dialog */}
        <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Milestone</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitMilestone} className="space-y-4">
              <div>
                <Label htmlFor="title">Milestone Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createMilestoneMutation.isPending}
                >
                  Add Milestone
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsMilestoneDialogOpen(false);
                    setSelectedProject(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
}
