import {
  User, InsertUser, users,
  Workout, InsertWorkout, workouts,
  Exercise, InsertExercise, exercises,
  Goal, InsertGoal, goals,
  NutritionEntry, InsertNutritionEntry, nutritionEntries,
  ActivityLog, InsertActivityLog, activityLogs
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Workouts
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getWorkout(id: number): Promise<Workout | undefined>;
  getWorkoutsByUserId(userId: number): Promise<Workout[]>;
  updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined>;
  deleteWorkout(id: number): Promise<boolean>;

  // Exercises
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]>;
  updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise | undefined>;
  deleteExercise(id: number): Promise<boolean>;

  // Goals
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  // Nutrition
  createNutritionEntry(entry: InsertNutritionEntry): Promise<NutritionEntry>;
  getNutritionEntriesByUserId(userId: number): Promise<NutritionEntry[]>;
  updateNutritionEntry(id: number, entry: Partial<InsertNutritionEntry>): Promise<NutritionEntry | undefined>;
  deleteNutritionEntry(id: number): Promise<boolean>;

  // Activity Logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogsByUserId(userId: number): Promise<ActivityLog[]>;
  updateActivityLog(id: number, log: Partial<InsertActivityLog>): Promise<ActivityLog | undefined>;
  getActivityLogByUserIdAndDate(userId: number, date: Date): Promise<ActivityLog | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Workout methods
  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db.insert(workouts).values(workout).returning();
    return newWorkout;
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout;
  }

  async getWorkoutsByUserId(userId: number): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId))
      .orderBy(desc(workouts.date));
  }

  async updateWorkout(id: number, workoutData: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const [updatedWorkout] = await db
      .update(workouts)
      .set(workoutData)
      .where(eq(workouts.id, id))
      .returning();
    return updatedWorkout;
  }

  async deleteWorkout(id: number): Promise<boolean> {
    const result = await db.delete(workouts).where(eq(workouts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Exercise methods
  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [newExercise] = await db.insert(exercises).values(exercise).returning();
    return newExercise;
  }

  async getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]> {
    return await db
      .select()
      .from(exercises)
      .where(eq(exercises.workoutId, workoutId));
  }

  async updateExercise(id: number, exerciseData: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const [updatedExercise] = await db
      .update(exercises)
      .set(exerciseData)
      .where(eq(exercises.id, id))
      .returning();
    return updatedExercise;
  }

  async deleteExercise(id: number): Promise<boolean> {
    const result = await db.delete(exercises).where(eq(exercises.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Goal methods
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId));
  }

  async updateGoal(id: number, goalData: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updatedGoal] = await db
      .update(goals)
      .set(goalData)
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Nutrition methods
  async createNutritionEntry(entry: InsertNutritionEntry): Promise<NutritionEntry> {
    const [newEntry] = await db.insert(nutritionEntries).values(entry).returning();
    return newEntry;
  }

  async getNutritionEntriesByUserId(userId: number): Promise<NutritionEntry[]> {
    return await db
      .select()
      .from(nutritionEntries)
      .where(eq(nutritionEntries.userId, userId))
      .orderBy(desc(nutritionEntries.date));
  }

  async updateNutritionEntry(id: number, entryData: Partial<InsertNutritionEntry>): Promise<NutritionEntry | undefined> {
    const [updatedEntry] = await db
      .update(nutritionEntries)
      .set(entryData)
      .where(eq(nutritionEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteNutritionEntry(id: number): Promise<boolean> {
    const result = await db.delete(nutritionEntries).where(eq(nutritionEntries.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Activity Log methods
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async getActivityLogsByUserId(userId: number): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.date));
  }

  async updateActivityLog(id: number, logData: Partial<InsertActivityLog>): Promise<ActivityLog | undefined> {
    const [updatedLog] = await db
      .update(activityLogs)
      .set(logData)
      .where(eq(activityLogs.id, id))
      .returning();
    return updatedLog;
  }

  async getActivityLogByUserIdAndDate(userId: number, date: Date): Promise<ActivityLog | undefined> {
    const dateStr = date.toISOString().split('T')[0];
    
    // Use SQL to handle date comparison
    const [log] = await db
      .select()
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.userId, userId),
          sql`DATE(${activityLogs.date}) = ${dateStr}`
        )
      );
    
    return log;
  }

  // Initialization method to create default data
  async initializeDefaultData(): Promise<void> {
    // Check if default user exists
    const existingUser = await this.getUserByUsername("alex");
    if (existingUser) {
      return; // Data already initialized
    }

    // Create default user
    const user = await this.createUser({
      username: "alex",
      password: "password123",
      displayName: "Alex Johnson",
      email: "alex@example.com",
      weight: "165",
      height: "72",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });

    const userId = user.id;

    // Create workouts
    const workout1 = await this.createWorkout({
      userId,
      name: "Cardio Session",
      type: "cardio",
      duration: 45,
      caloriesBurned: 320,
      date: new Date(),
      notes: "Treadmill, Cycling",
      status: "completed"
    });

    await this.createWorkout({
      userId,
      name: "Lower Body",
      type: "strength",
      duration: 60,
      caloriesBurned: 420,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      notes: "Squats, Lunges, Deadlifts",
      status: "completed"
    });

    await this.createWorkout({
      userId,
      name: "HIIT Session",
      type: "hiit",
      duration: 30,
      caloriesBurned: 380,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // two days ago
      notes: "Circuit training",
      status: "completed"
    });

    const workout4 = await this.createWorkout({
      userId,
      name: "Upper Body Strength",
      type: "strength",
      duration: 45,
      caloriesBurned: 350,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      notes: "Chest, shoulders, arms",
      status: "scheduled"
    });

    // Add exercises
    await this.createExercise({ 
      workoutId: workout4.id, 
      name: "Bench Press", 
      sets: 3, 
      reps: 10, 
      weight: "135"
    });
    
    await this.createExercise({ 
      workoutId: workout4.id, 
      name: "Shoulder Press", 
      sets: 3, 
      reps: 12, 
      weight: "85"
    });
    
    await this.createExercise({ 
      workoutId: workout4.id, 
      name: "Bicep Curls", 
      sets: 3, 
      reps: 15, 
      weight: "35"
    });

    // Create goals
    await this.createGoal({
      userId,
      name: "Lose 5 lbs",
      description: "Weight loss goal",
      targetDate: new Date("2023-07-30"),
      currentValue: "165",
      targetValue: "160",
      unit: "lbs",
      status: "in-progress"
    });

    await this.createGoal({
      userId,
      name: "Run 5K",
      description: "Running distance goal",
      targetDate: new Date("2023-08-15"),
      currentValue: "3.2",
      targetValue: "5",
      unit: "K",
      status: "in-progress"
    });

    // Create activity log
    await this.createActivityLog({
      userId,
      date: new Date(),
      steps: 8243,
      activeMinutes: 68,
      caloriesBurned: 1872
    });
  }
}

// Initialize the database storage
export const storage = new DatabaseStorage();

// Initialize default data in the background
(async () => {
  try {
    await storage.initializeDefaultData();
    console.log("Database initialized with default data");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
})();
