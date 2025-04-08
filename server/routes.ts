import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertWorkoutSchema,
  insertExerciseSchema,
  insertGoalSchema,
  insertNutritionEntrySchema,
  insertActivityLogSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Helper for handling zod validation errors
const validateRequest = (req: Request, schema: any) => {
  try {
    console.log("Validating with schema:", schema);
    console.log("Request body before validation:", req.body);
    
    // No special handling for date fields - keep them as strings
    // Just validate directly with the schema that accepts strings
    const validatedData = schema.parse(req.body);
    console.log("Validation successful:", validatedData);
    return { data: validatedData, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("ZodError encountered:", error.errors);
      return { data: null, error: fromZodError(error).message };
    }
    console.error("Unknown validation error:", error);
    return { data: null, error: "Invalid request data" };
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Auth routes (simplified for demo purposes)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  });

  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  });

  // Workout routes
  app.post("/api/workouts", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(req, insertWorkoutSchema);
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    const workout = await storage.createWorkout(data);
    return res.status(201).json(workout);
  });

  app.get("/api/workouts/:id", async (req: Request, res: Response) => {
    const workoutId = parseInt(req.params.id);
    const workout = await storage.getWorkout(workoutId);
    
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    
    return res.status(200).json(workout);
  });

  app.get("/api/users/:userId/workouts", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const workouts = await storage.getWorkoutsByUserId(userId);
    return res.status(200).json(workouts);
  });

  app.put("/api/workouts/:id", async (req: Request, res: Response) => {
    const workoutId = parseInt(req.params.id);
    const existingWorkout = await storage.getWorkout(workoutId);
    
    if (!existingWorkout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    
    // Partial update, allow undefined fields
    const updatedWorkout = await storage.updateWorkout(workoutId, req.body);
    return res.status(200).json(updatedWorkout);
  });

  app.delete("/api/workouts/:id", async (req: Request, res: Response) => {
    const workoutId = parseInt(req.params.id);
    const deleted = await storage.deleteWorkout(workoutId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Workout not found" });
    }
    
    return res.status(204).send();
  });

  // Exercise routes
  app.post("/api/exercises", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(req, insertExerciseSchema);
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    const exercise = await storage.createExercise(data);
    return res.status(201).json(exercise);
  });

  app.get("/api/workouts/:workoutId/exercises", async (req: Request, res: Response) => {
    const workoutId = parseInt(req.params.workoutId);
    const exercises = await storage.getExercisesByWorkoutId(workoutId);
    return res.status(200).json(exercises);
  });

  // Goal routes
  app.post("/api/goals", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(req, insertGoalSchema);
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    const goal = await storage.createGoal(data);
    return res.status(201).json(goal);
  });

  app.get("/api/users/:userId/goals", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const goals = await storage.getGoalsByUserId(userId);
    return res.status(200).json(goals);
  });

  app.put("/api/goals/:id", async (req: Request, res: Response) => {
    const goalId = parseInt(req.params.id);
    const existingGoal = await storage.updateGoal(goalId, req.body);
    
    if (!existingGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    
    return res.status(200).json(existingGoal);
  });

  // Nutrition routes
  app.post("/api/nutrition", async (req: Request, res: Response) => {
    console.log("Received nutrition data:", req.body);
    
    try {
      console.log("Starting nutrition validation process");
      const { data, error } = validateRequest(req, insertNutritionEntrySchema);
      
      if (error) {
        console.error("Validation error:", error);
        console.error("Original request body:", JSON.stringify(req.body));
        return res.status(400).json({ message: error });
      }
      
      console.log("Validated nutrition data:", JSON.stringify(data));
      
      try {
        const entry = await storage.createNutritionEntry(data);
        console.log("Created nutrition entry:", JSON.stringify(entry));
        return res.status(201).json(entry);
      } catch (storageError) {
        console.error("Error in storage.createNutritionEntry:", storageError);
        return res.status(500).json({ message: storageError instanceof Error ? storageError.message : "Unknown storage error" });
      }
    } catch (err) {
      console.error("Error in nutrition POST endpoint:", err);
      return res.status(500).json({ message: err instanceof Error ? err.message : "Unknown error" });
    }
  });

  app.get("/api/users/:userId/nutrition", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const entries = await storage.getNutritionEntriesByUserId(userId);
    return res.status(200).json(entries);
  });

  // Activity log routes
  app.post("/api/activity-logs", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(req, insertActivityLogSchema);
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    const log = await storage.createActivityLog(data);
    return res.status(201).json(log);
  });

  app.get("/api/users/:userId/activity-logs", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const logs = await storage.getActivityLogsByUserId(userId);
    return res.status(200).json(logs);
  });

  app.get("/api/users/:userId/activity-logs/today", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const today = new Date();
    const log = await storage.getActivityLogByUserIdAndDate(userId, today);
    
    if (!log) {
      return res.status(404).json({ message: "No activity log found for today" });
    }
    
    return res.status(200).json(log);
  });

  return httpServer;
}
