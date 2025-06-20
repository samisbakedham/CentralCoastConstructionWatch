import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat, Lock, Mail } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/login', credentials);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      setLocation("/admin");
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Lock className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Admin Login
              </CardTitle>
              <p className="text-slate-600 mt-2">
                Access the Central Coast Construction Watch admin panel
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="pl-10"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10"
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <a 
                  href="/"
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  ← Back to Projects
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - Hero Section */}
        <div className="hidden lg:block">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-primary-600 rounded-full">
                <HardHat className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-slate-900">
                Central Coast Construction Watch
              </h1>
              <p className="text-xl text-slate-600 max-w-md mx-auto">
                Track and manage construction projects across Santa Barbara and San Luis Obispo Counties
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Project Management</h3>
                <p className="text-sm text-slate-600">
                  Add, edit, and track construction projects with detailed information and timelines
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Photo Documentation</h3>
                <p className="text-sm text-slate-600">
                  Upload and organize construction progress photos with milestone tracking
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Public Transparency</h3>
                <p className="text-sm text-slate-600">
                  Provide community access to construction project information and progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}