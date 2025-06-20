import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, Building, User } from "lucide-react";
import type { ProjectWithDetails } from "@shared/schema";

interface ProjectModalProps {
  project: ProjectWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
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

  const getTimelineImage = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100',
    ];
    return images[index % images.length];
  };

  const sortedMilestones = [...project.milestones].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
                {project.name}
              </DialogTitle>
              <p className="text-slate-600 flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {project.location}
              </p>
            </div>
            <Badge 
              className={`${getStatusColor(project.status)} text-white border-0`}
            >
              {project.status === 'under-construction' ? 'Under Construction' : 
               project.status === 'planning' ? 'Planning' : 'Complete'}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project Description */}
          {project.description && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600">{project.description}</p>
            </div>
          )}

          {/* Construction Timeline */}
          {sortedMilestones.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Construction Timeline</h3>
              <div className="space-y-4">
                {sortedMilestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <img 
                        src={getTimelineImage(index)}
                        alt="Construction progress" 
                        className="w-24 h-16 object-cover rounded-lg" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-900">{milestone.title}</h4>
                        <span className="text-sm text-slate-500 flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(milestone.date).toLocaleDateString()}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-slate-600 text-sm">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Type:</span>
                    <span className="font-medium ml-2">
                      {project.type === 'mixed-use' ? 'Mixed Use' : 
                       project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Estimated Cost:</span>
                    <span className="font-medium ml-2">{formatCost(project.estimatedCost)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Completion Date:</span>
                    <span className="font-medium ml-2">{project.estimatedCompletion || 'TBD'}</span>
                  </div>
                </div>
                
                {project.contractor && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-slate-600">Contractor:</span>
                      <span className="font-medium ml-2">{project.contractor}</span>
                    </div>
                  </div>
                )}
                
                {project.developer && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-slate-600">Developer:</span>
                      <span className="font-medium ml-2">{project.developer}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {project.residentialDetails && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Residential Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Units:</span>
                    <span className="font-medium">{project.residentialDetails.totalUnits || 0}</span>
                  </div>
                  
                  {project.residentialDetails.studioUnits && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Studios:</span>
                      <span className="font-medium">
                        {project.residentialDetails.studioUnits} units
                        {project.residentialDetails.studioRent && 
                          ` ($${project.residentialDetails.studioRent}/mo)`
                        }
                      </span>
                    </div>
                  )}
                  
                  {project.residentialDetails.oneBedroomUnits && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">1 Bedroom:</span>
                      <span className="font-medium">
                        {project.residentialDetails.oneBedroomUnits} units
                        {project.residentialDetails.oneBedroomRent && 
                          ` ($${project.residentialDetails.oneBedroomRent}/mo)`
                        }
                      </span>
                    </div>
                  )}
                  
                  {project.residentialDetails.twoBedroomUnits && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">2 Bedroom:</span>
                      <span className="font-medium">
                        {project.residentialDetails.twoBedroomUnits} units
                        {project.residentialDetails.twoBedroomRent && 
                          ` ($${project.residentialDetails.twoBedroomRent}/mo)`
                        }
                      </span>
                    </div>
                  )}
                  
                  {project.residentialDetails.threeBedroomUnits && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">3 Bedroom:</span>
                      <span className="font-medium">
                        {project.residentialDetails.threeBedroomUnits} units
                        {project.residentialDetails.threeBedroomRent && 
                          ` ($${project.residentialDetails.threeBedroomRent}/mo)`
                        }
                      </span>
                    </div>
                  )}
                  
                  {project.residentialDetails.isAffordableHousing && (
                    <div className="mt-4">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Affordable Housing
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
