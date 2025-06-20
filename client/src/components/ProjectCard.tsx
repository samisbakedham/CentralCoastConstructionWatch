import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProjectModal from "./ProjectModal";
import { useState } from "react";
import type { ProjectWithDetails } from "@shared/schema";

interface ProjectCardProps {
  project: ProjectWithDetails;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'planning': 
        return 'secondary';
      case 'under-construction': 
        return 'default';
      case 'complete': 
        return 'outline';
      default: 
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': 
        return 'bg-yellow-500';
      case 'under-construction': 
        return 'bg-green-500';
      case 'complete': 
        return 'bg-slate-600';
      default: 
        return 'bg-slate-400';
    }
  };

  const formatCost = (cost: string | null) => {
    if (!cost) return 'Not specified';
    const numCost = parseFloat(cost);
    if (numCost >= 1000000000) {
      return `$${(numCost / 1000000000).toFixed(1)}B`;
    } else if (numCost >= 1000000) {
      return `$${(numCost / 1000000).toFixed(1)}M`;
    } else if (numCost >= 1000) {
      return `$${(numCost / 1000).toFixed(0)}K`;
    }
    return `$${numCost.toLocaleString()}`;
  };

  const getProjectImage = () => {
    // Return appropriate stock images based on project type
    switch (project.type) {
      case 'residential':
        return 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300';
      case 'commercial':
        return 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300';
      case 'infrastructure':
        return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300';
      default:
        return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300';
    }
  };

  const getLatestMilestone = () => {
    if (project.milestones.length === 0) return null;
    return project.milestones.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  };

  const latestMilestone = getLatestMilestone();

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <div className="relative">
          <img 
            src={getProjectImage()} 
            alt={`${project.name} construction site`} 
            className="w-full h-48 object-cover" 
          />
          <div className="absolute top-4 left-4">
            <Badge 
              variant={getStatusBadgeVariant(project.status)}
              className={`${getStatusColor(project.status)} text-white border-0`}
            >
              {project.status === 'under-construction' ? 'Under Construction' : 
               project.status === 'planning' ? 'Planning' : 'Complete'}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-700">
              {project.type === 'mixed-use' ? 'Mixed Use' : 
               project.type.charAt(0).toUpperCase() + project.type.slice(1)}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg text-slate-900 mb-2">
            {project.name}
          </h3>
          <p className="text-slate-600 mb-3 flex items-center">
            <MapPin className="mr-1 h-4 w-4" />
            {project.location}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-500">Estimated Cost</p>
              <p className="font-semibold text-slate-900">
                {formatCost(project.estimatedCost)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Completion</p>
              <p className="font-semibold text-slate-900">
                {project.estimatedCompletion || 'TBD'}
              </p>
            </div>
          </div>
          
          {project.residentialDetails && (
            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-1">Units</p>
              <div className="flex flex-wrap gap-2">
                {project.residentialDetails.studioUnits && (
                  <Badge variant="outline" className="text-xs">
                    {project.residentialDetails.studioUnits} Studios
                  </Badge>
                )}
                {project.residentialDetails.oneBedroomUnits && (
                  <Badge variant="outline" className="text-xs">
                    {project.residentialDetails.oneBedroomUnits} 1BR
                  </Badge>
                )}
                {project.residentialDetails.twoBedroomUnits && (
                  <Badge variant="outline" className="text-xs">
                    {project.residentialDetails.twoBedroomUnits} 2BR
                  </Badge>
                )}
                {project.residentialDetails.threeBedroomUnits && (
                  <Badge variant="outline" className="text-xs">
                    {project.residentialDetails.threeBedroomUnits} 3BR
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {latestMilestone && (
            <div className="mb-4">
              <p className="text-sm text-slate-500">Latest Milestone</p>
              <p className="font-medium text-slate-900">{latestMilestone.title}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">
              {project.contractor && `Contractor: ${project.contractor}`}
              {project.developer && !project.contractor && `Developer: ${project.developer}`}
              {!project.contractor && !project.developer && 'No contractor listed'}
            </p>
            <span className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              View Details →
            </span>
          </div>
        </CardContent>
      </Card>

      <ProjectModal 
        project={project}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
