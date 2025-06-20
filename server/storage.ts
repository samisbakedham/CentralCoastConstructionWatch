import {
  users,
  projects,
  residentialDetails,
  milestones,
  photos,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type ProjectWithDetails,
  type ResidentialDetails,
  type InsertResidentialDetails,
  type Milestone,
  type InsertMilestone,
  type Photo,
  type InsertPhoto,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getProjects(filters?: ProjectFilters): Promise<ProjectWithDetails[]>;
  getProject(id: number): Promise<ProjectWithDetails | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Residential details operations
  createResidentialDetails(details: InsertResidentialDetails): Promise<ResidentialDetails>;
  updateResidentialDetails(projectId: number, details: Partial<InsertResidentialDetails>): Promise<ResidentialDetails | undefined>;
  
  // Milestone operations
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: number): Promise<boolean>;
  
  // Photo operations
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number): Promise<boolean>;
  
  // Statistics
  getProjectStats(): Promise<ProjectStats>;
}

export interface ProjectFilters {
  search?: string;
  county?: string;
  city?: string;
  type?: string;
  status?: string;
  costMin?: number;
  costMax?: number;
  limit?: number;
  offset?: number;
}

export interface ProjectStats {
  activeProjects: number;
  totalInvestment: string;
  newUnits: number;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getProjects(filters: ProjectFilters = {}): Promise<ProjectWithDetails[]> {
    const conditions = [];
    
    if (filters.search) {
      conditions.push(
        ilike(projects.name, `%${filters.search}%`),
      );
    }
    
    if (filters.county) {
      conditions.push(eq(projects.county, filters.county));
    }
    
    if (filters.city) {
      conditions.push(eq(projects.city, filters.city));
    }
    
    if (filters.type) {
      conditions.push(eq(projects.type, filters.type));
    }
    
    if (filters.status) {
      conditions.push(eq(projects.status, filters.status));
    }

    const baseQuery = db
      .select()
      .from(projects)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(projects.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    const projectList = await baseQuery;

    // Fetch related data for each project
    const projectsWithDetails: ProjectWithDetails[] = [];
    
    for (const project of projectList) {
      const [residentialDetail] = await db
        .select()
        .from(residentialDetails)
        .where(eq(residentialDetails.projectId, project.id));

      const projectMilestones = await db
        .select()
        .from(milestones)
        .where(eq(milestones.projectId, project.id))
        .orderBy(desc(milestones.date));

      const projectPhotos = await db
        .select()
        .from(photos)
        .where(eq(photos.projectId, project.id))
        .orderBy(desc(photos.uploadedAt));

      // Get photos for each milestone
      const milestonesWithPhotos = await Promise.all(
        projectMilestones.map(async (milestone) => {
          const milestonePhotos = await db
            .select()
            .from(photos)
            .where(eq(photos.milestoneId, milestone.id))
            .orderBy(desc(photos.uploadedAt));
          
          return {
            ...milestone,
            photos: milestonePhotos,
          };
        })
      );

      projectsWithDetails.push({
        ...project,
        residentialDetails: residentialDetail || undefined,
        milestones: milestonesWithPhotos,
        photos: projectPhotos,
      });
    }

    return projectsWithDetails;
  }

  async getProject(id: number): Promise<ProjectWithDetails | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) return undefined;

    const [residentialDetail] = await db
      .select()
      .from(residentialDetails)
      .where(eq(residentialDetails.projectId, id));

    const projectMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.projectId, id))
      .orderBy(desc(milestones.date));

    const projectPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.projectId, id))
      .orderBy(desc(photos.uploadedAt));

    const milestonesWithPhotos = await Promise.all(
      projectMilestones.map(async (milestone) => {
        const milestonePhotos = await db
          .select()
          .from(photos)
          .where(eq(photos.milestoneId, milestone.id))
          .orderBy(desc(photos.uploadedAt));
        
        return {
          ...milestone,
          photos: milestonePhotos,
        };
      })
    );

    return {
      ...project,
      residentialDetails: residentialDetail || undefined,
      milestones: milestonesWithPhotos,
      photos: projectPhotos,
    };
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    // Delete related data first
    await db.delete(photos).where(eq(photos.projectId, id));
    await db.delete(milestones).where(eq(milestones.projectId, id));
    await db.delete(residentialDetails).where(eq(residentialDetails.projectId, id));
    
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  // Residential details operations
  async createResidentialDetails(details: InsertResidentialDetails): Promise<ResidentialDetails> {
    const [newDetails] = await db.insert(residentialDetails).values(details).returning();
    return newDetails;
  }

  async updateResidentialDetails(projectId: number, details: Partial<InsertResidentialDetails>): Promise<ResidentialDetails | undefined> {
    const [updatedDetails] = await db
      .update(residentialDetails)
      .set(details)
      .where(eq(residentialDetails.projectId, projectId))
      .returning();
    return updatedDetails;
  }

  // Milestone operations
  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const [newMilestone] = await db.insert(milestones).values(milestone).returning();
    return newMilestone;
  }

  async updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const [updatedMilestone] = await db
      .update(milestones)
      .set(milestone)
      .where(eq(milestones.id, id))
      .returning();
    return updatedMilestone;
  }

  async deleteMilestone(id: number): Promise<boolean> {
    // Delete associated photos first
    await db.delete(photos).where(eq(photos.milestoneId, id));
    
    const result = await db.delete(milestones).where(eq(milestones.id, id));
    return result.rowCount > 0;
  }

  // Photo operations
  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }

  async deletePhoto(id: number): Promise<boolean> {
    const result = await db.delete(photos).where(eq(photos.id, id));
    return result.rowCount > 0;
  }

  // Statistics
  async getProjectStats(): Promise<ProjectStats> {
    const [activeProjectsResult] = await db
      .select({ count: projects.id })
      .from(projects)
      .where(eq(projects.status, 'under-construction'));

    const [totalInvestmentResult] = await db
      .select()
      .from(projects);

    const totalInvestment = totalInvestmentResult.reduce((sum, project) => {
      const cost = project.estimatedCost ? parseFloat(project.estimatedCost) : 0;
      return sum + cost;
    }, 0);

    const [newUnitsResult] = await db
      .select()
      .from(residentialDetails);

    const newUnits = newUnitsResult.reduce((sum, detail) => {
      return sum + (detail.totalUnits || 0);
    }, 0);

    return {
      activeProjects: activeProjectsResult.count || 0,
      totalInvestment: `$${(totalInvestment / 1000000000).toFixed(1)}B`,
      newUnits,
    };
  }
}

export const storage = new DatabaseStorage();
