import { HardHat, Menu, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-3">
            <HardHat className="text-2xl text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">Central Coast Construction Watch</h1>
              <p className="text-sm text-slate-600">Santa Barbara & San Luis Obispo Counties</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
              Projects
            </Link>
            <a href="#about" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
              About
            </a>
            
            {isAuthenticated ? (
              <>
                <Link href="/admin" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
                  Admin
                </Link>
                <a href="/api/logout" className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                  Logout
                </a>
              </>
            ) : (
              <a href="/api/login" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                <Lock className="mr-2 h-4 w-4 inline" />
                Admin Login
              </a>
            )}
          </nav>
          
          <button className="md:hidden text-slate-600">
            <Menu className="text-xl" />
          </button>
        </div>
      </div>
    </header>
  );
}
