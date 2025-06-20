import { db } from "./db";
import { projects, residentialDetails, milestones, photos } from "@shared/schema";

const sampleProjects = [
  {
    name: "Santa Barbara Affordable Housing Complex",
    location: "123 State Street, Santa Barbara, CA",
    county: "Santa Barbara",
    city: "Santa Barbara",
    type: "residential",
    status: "under-construction",
    estimatedCost: "25000000",
    contractor: "Central Coast Construction Co.",
    developer: "Santa Barbara Housing Authority",
    estimatedCompletion: "Q2 2025",
    description: "A 120-unit affordable housing complex designed to address the housing crisis in downtown Santa Barbara. Features include solar panels, electric vehicle charging stations, and community garden spaces."
  },
  {
    name: "Pacific Coast Highway Bridge Replacement",
    location: "PCH Mile Marker 45, Goleta, CA",
    county: "Santa Barbara",
    city: "Goleta",
    type: "infrastructure",
    status: "planning",
    estimatedCost: "45000000",
    contractor: "CalTrans Engineering",
    developer: "California Department of Transportation",
    estimatedCompletion: "Q4 2026",
    description: "Complete replacement of the aging Pacific Coast Highway bridge with seismic upgrades and expanded pedestrian walkways. Project includes environmental mitigation measures for local wildlife."
  },
  {
    name: "Downtown SLO Mixed-Use Development",
    location: "456 Higuera Street, San Luis Obispo, CA",
    county: "San Luis Obispo",
    city: "San Luis Obispo",
    type: "mixed-use",
    status: "under-construction",
    estimatedCost: "18500000",
    contractor: "Central Valley Builders",
    developer: "SLO Urban Development LLC",
    estimatedCompletion: "Q3 2024",
    description: "Four-story mixed-use building featuring ground-floor retail spaces and 45 residential units above. Includes underground parking and rooftop amenities."
  },
  {
    name: "Paso Robles Wine Country Resort",
    location: "789 Vineyard Drive, Paso Robles, CA",
    county: "San Luis Obispo",
    city: "Paso Robles",
    type: "commercial",
    status: "planning",
    estimatedCost: "62000000",
    contractor: "Luxury Hospitality Builders",
    developer: "Wine Country Resorts Inc.",
    estimatedCompletion: "Q1 2027",
    description: "Luxury resort and conference center featuring 180 guest rooms, spa facilities, multiple restaurants, and event spaces. Designed to complement the local wine industry aesthetic."
  },
  {
    name: "Carpinteria Seaside Condominiums",
    location: "321 Ocean View Lane, Carpinteria, CA",
    county: "Santa Barbara",
    city: "Carpinteria",
    type: "residential",
    status: "complete",
    estimatedCost: "32000000",
    contractor: "Coastal Construction Group",
    developer: "Seaside Living Properties",
    estimatedCompletion: "Q4 2023",
    description: "Luxury oceanfront condominium complex with 65 units ranging from studios to three-bedroom penthouses. Features include beach access, pool, and fitness center."
  }
];

const sampleResidentialDetails = [
  {
    projectId: 1, // Santa Barbara Affordable Housing Complex
    totalUnits: 120,
    studioUnits: 25,
    studioRent: "1200",
    oneBedroomUnits: 45,
    oneBedroomRent: "1500",
    twoBedroomUnits: 35,
    twoBedroomRent: "1800",
    threeBedroomUnits: 15,
    threeBedroomRent: "2200",
    isAffordableHousing: true
  },
  {
    projectId: 3, // Downtown SLO Mixed-Use Development
    totalUnits: 45,
    studioUnits: 8,
    studioRent: "2200",
    oneBedroomUnits: 20,
    oneBedroomRent: "2800",
    twoBedroomUnits: 17,
    twoBedroomRent: "3500",
    threeBedroomUnits: 0,
    threeBedroomRent: null,
    isAffordableHousing: false
  },
  {
    projectId: 5, // Carpinteria Seaside Condominiums
    totalUnits: 65,
    studioUnits: 10,
    studioRent: "3500",
    oneBedroomUnits: 25,
    oneBedroomRent: "4200",
    twoBedroomUnits: 20,
    twoBedroomRent: "5800",
    threeBedroomUnits: 10,
    threeBedroomRent: "7500",
    isAffordableHousing: false
  }
];

const sampleMilestones = [
  // Santa Barbara Affordable Housing Complex milestones
  {
    projectId: 1,
    title: "Ground Breaking Ceremony",
    description: "Official groundbreaking ceremony with city officials and community members",
    date: new Date("2024-01-15")
  },
  {
    projectId: 1,
    title: "Foundation Complete",
    description: "All foundation work completed including underground utilities",
    date: new Date("2024-03-20")
  },
  {
    projectId: 1,
    title: "Frame Construction Started",
    description: "Steel frame construction has begun for the main building structure",
    date: new Date("2024-05-10")
  },
  // Downtown SLO Mixed-Use Development milestones
  {
    projectId: 3,
    title: "Excavation Complete",
    description: "Site excavation and preparation completed for underground parking",
    date: new Date("2024-02-01")
  },
  {
    projectId: 3,
    title: "Underground Parking Structure",
    description: "Concrete work for underground parking levels completed",
    date: new Date("2024-04-15")
  },
  {
    projectId: 3,
    title: "First Floor Retail Framing",
    description: "Steel framing for ground-floor retail spaces is underway",
    date: new Date("2024-06-01")
  },
  // Carpinteria Seaside Condominiums milestones (completed project)
  {
    projectId: 5,
    title: "Project Completion",
    description: "Final inspections passed and certificate of occupancy received",
    date: new Date("2023-12-15")
  },
  {
    projectId: 5,
    title: "Interior Finishing",
    description: "All interior finishing work completed including flooring and fixtures",
    date: new Date("2023-11-20")
  }
];

export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");

    // Insert projects
    const insertedProjects = await db.insert(projects).values(sampleProjects).returning();
    console.log(`Inserted ${insertedProjects.length} projects`);

    // Insert residential details
    const insertedResidentialDetails = await db.insert(residentialDetails).values(sampleResidentialDetails).returning();
    console.log(`Inserted ${insertedResidentialDetails.length} residential details`);

    // Insert milestones
    const insertedMilestones = await db.insert(milestones).values(sampleMilestones).returning();
    console.log(`Inserted ${insertedMilestones.length} milestones`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}