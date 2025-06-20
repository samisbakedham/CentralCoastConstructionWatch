import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectFilters {
  search?: string;
  county?: string;
  city?: string;
  type?: string;
  status?: string;
  costMin?: number;
  costMax?: number;
}

interface SearchFiltersProps {
  filters: ProjectFilters;
  onFilterChange: (filters: ProjectFilters) => void;
  onResetFilters: () => void;
  totalProjects: number;
}

export default function SearchFilters({ 
  filters, 
  onFilterChange, 
  onResetFilters, 
  totalProjects 
}: SearchFiltersProps) {
  
  const handleFilterChange = (key: keyof ProjectFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === '' || value === 'all') {
      delete newFilters[key];
    } else {
      newFilters[key] = value as any;
    }
    onFilterChange(newFilters);
  };

  return (
    <section className="mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-2">
              <Label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
                Search Projects
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by name, location, or contractor..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">County</Label>
              <Select 
                value={filters.county || 'all'} 
                onValueChange={(value) => handleFilterChange('county', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Counties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  <SelectItem value="Santa Barbara">Santa Barbara</SelectItem>
                  <SelectItem value="San Luis Obispo">San Luis Obispo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Project Type</Label>
              <Select 
                value={filters.type || 'all'} 
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="mixed-use">Mixed Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Status</Label>
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="under-construction">Under Construction</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">City</Label>
              <Select 
                value={filters.city || 'all'} 
                onValueChange={(value) => handleFilterChange('city', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="Santa Barbara">Santa Barbara</SelectItem>
                  <SelectItem value="San Luis Obispo">San Luis Obispo</SelectItem>
                  <SelectItem value="Goleta">Goleta</SelectItem>
                  <SelectItem value="Paso Robles">Paso Robles</SelectItem>
                  <SelectItem value="Atascadero">Atascadero</SelectItem>
                  <SelectItem value="Carpinteria">Carpinteria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Cost Range</Label>
              <Select 
                value={
                  filters.costMin === undefined && filters.costMax === undefined 
                    ? 'all' 
                    : filters.costMax === 1000000 
                      ? 'under-1m'
                      : filters.costMin === 1000000 && filters.costMax === 10000000
                        ? '1m-10m'
                        : filters.costMin === 10000000 && filters.costMax === 50000000
                          ? '10m-50m'
                          : filters.costMin === 50000000
                            ? 'over-50m'
                            : 'all'
                }
                onValueChange={(value) => {
                  const newFilters = { ...filters };
                  delete newFilters.costMin;
                  delete newFilters.costMax;
                  
                  switch (value) {
                    case 'under-1m':
                      newFilters.costMax = 1000000;
                      break;
                    case '1m-10m':
                      newFilters.costMin = 1000000;
                      newFilters.costMax = 10000000;
                      break;
                    case '10m-50m':
                      newFilters.costMin = 10000000;
                      newFilters.costMax = 50000000;
                      break;
                    case 'over-50m':
                      newFilters.costMin = 50000000;
                      break;
                  }
                  
                  onFilterChange(newFilters);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Ranges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranges</SelectItem>
                  <SelectItem value="under-1m">Under $1M</SelectItem>
                  <SelectItem value="1m-10m">$1M - $10M</SelectItem>
                  <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                  <SelectItem value="over-50m">Over $50M</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <p className="text-slate-600">
              Showing {totalProjects} projects
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onResetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
