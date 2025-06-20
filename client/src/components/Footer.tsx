import { HardHat, Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <HardHat className="text-2xl text-primary-400" />
              <div>
                <h3 className="text-xl font-bold">Central Coast Construction Watch</h3>
                <p className="text-slate-400">Open Source Community Project</p>
              </div>
            </div>
            <p className="text-slate-300 mb-4">
              Transparent tracking of construction projects across Santa Barbara and San Luis Obispo Counties. 
              Built by the community, for the community.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-slate-400 hover:text-white transition-colors">
                <Github className="text-xl" />
              </a>
              <a href="https://twitter.com" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="text-xl" />
              </a>
              <a href="mailto:contact@example.com" className="text-slate-400 hover:text-white transition-colors">
                <Mail className="text-xl" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="/" className="hover:text-white transition-colors">All Projects</a></li>
              <li><a href="#map" className="hover:text-white transition-colors">Map View</a></li>
              <li><a href="/" className="hover:text-white transition-colors">Search</a></li>
              <li><a href="/admin" className="hover:text-white transition-colors">Admin Panel</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="https://github.com" className="hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="https://github.com" className="hover:text-white transition-colors">GitHub Repository</a></li>
              <li><a href="mailto:contact@example.com" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 Central Coast Construction Watch. Open source project under MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
