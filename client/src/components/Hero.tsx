import { Building, DollarSign, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ProjectStats {
  activeProjects: number;
  totalInvestment: string;
  newUnits: number;
}

export default function Hero() {
  const { data: stats } = useQuery<ProjectStats>({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      return response.json();
    },
  });

  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-12 text-[#0006a1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Track Construction Progress in Your Community
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Stay informed about residential, commercial, and infrastructure projects across Santa Barbara and San Luis Obispo Counties
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Building className="text-3xl mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">
                {stats?.activeProjects || 0} Active Projects
              </h3>
              <p className="text-primary-100">Currently under construction</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <DollarSign className="text-3xl mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">
                {stats?.totalInvestment || '$0'} Total Investment
              </h3>
              <p className="text-primary-100">In current projects</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Home className="text-3xl mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">
                {stats?.newUnits || 0} New Units
              </h3>
              <p className="text-primary-100">Residential units in development</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
