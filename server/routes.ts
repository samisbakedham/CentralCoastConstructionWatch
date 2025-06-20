import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertResidentialDetailsSchema, insertMilestoneSchema, insertPhotoSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Simple admin credentials
const ADMIN_EMAIL = "samsafahi@gmail.com";
const ADMIN_PASSWORD_HASH = "c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6.abc123def456ghi789"; // This will be replaced with actual hash

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Simple middleware to check if user is authenticated
function isAuthenticated(req: any, res: any, next: any) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || 'construction-watch-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Generate admin password hash on startup
  const adminPasswordHash = await hashPassword("Admin1024$$");
  console.log("Admin credentials ready");

  // Auth routes
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (email === ADMIN_EMAIL && await comparePasswords(password, adminPasswordHash)) {
        (req.session as any).isAdmin = true;
        res.json({ 
          email: ADMIN_EMAIL,
          role: 'admin'
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if ((req.session as any)?.isAdmin) {
      res.json({ 
        email: ADMIN_EMAIL,
        role: 'admin'
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        county: req.query.county as string,
        city: req.query.city as string,
        type: req.query.type as string,
        status: req.query.status as string,
        costMin: req.query.costMin ? parseInt(req.query.costMin as string) : undefined,
        costMax: req.query.costMax ? parseInt(req.query.costMax as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      const projects = await storage.getProjects(filters);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, projectData);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Residential details routes
  app.post('/api/projects/:id/residential-details', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const detailsData = insertResidentialDetailsSchema.parse({
        ...req.body,
        projectId,
      });
      
      const details = await storage.createResidentialDetails(detailsData);
      res.status(201).json(details);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid residential details data", errors: error.errors });
      }
      console.error("Error creating residential details:", error);
      res.status(500).json({ message: "Failed to create residential details" });
    }
  });

  app.put('/api/projects/:id/residential-details', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const detailsData = insertResidentialDetailsSchema.partial().parse(req.body);
      
      const details = await storage.updateResidentialDetails(projectId, detailsData);
      
      if (!details) {
        return res.status(404).json({ message: "Residential details not found" });
      }
      
      res.json(details);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid residential details data", errors: error.errors });
      }
      console.error("Error updating residential details:", error);
      res.status(500).json({ message: "Failed to update residential details" });
    }
  });

  // Milestone routes
  app.post('/api/projects/:id/milestones', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const milestoneData = insertMilestoneSchema.parse({
        ...req.body,
        projectId,
      });
      
      const milestone = await storage.createMilestone(milestoneData);
      res.status(201).json(milestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid milestone data", errors: error.errors });
      }
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  app.put('/api/milestones/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const milestoneData = insertMilestoneSchema.partial().parse(req.body);
      
      const milestone = await storage.updateMilestone(id, milestoneData);
      
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      res.json(milestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid milestone data", errors: error.errors });
      }
      console.error("Error updating milestone:", error);
      res.status(500).json({ message: "Failed to update milestone" });
    }
  });

  app.delete('/api/milestones/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMilestone(id);
      
      if (!success) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting milestone:", error);
      res.status(500).json({ message: "Failed to delete milestone" });
    }
  });

  // Photo routes
  app.post('/api/projects/:id/photos', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const photoData = insertPhotoSchema.parse({
        ...req.body,
        projectId,
      });
      
      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid photo data", errors: error.errors });
      }
      console.error("Error creating photo:", error);
      res.status(500).json({ message: "Failed to create photo" });
    }
  });

  app.delete('/api/photos/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePhoto(id);
      
      if (!success) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Statistics route
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getProjectStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
