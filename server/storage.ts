import {
  User, InsertUser, users,
  Workout, InsertWorkout, workouts,
  Exercise, InsertExercise, exercises,
  Goal, InsertGoal, goals,
  NutritionEntry, InsertNutritionEntry, nutritionEntries,
  ActivityLog, InsertActivityLog, activityLogs
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workouts: Map<number, Workout>;
  private exercises: Map<number, Exercise>;
  private goals: Map<number, Goal>;
  private nutritionEntries: Map<number, NutritionEntry>;
  private activityLogs: Map<number, ActivityLog>;
  
  private userIdCounter: number;
  private workoutIdCounter: number;
  private exerciseIdCounter: number;
  private goalIdCounter: number;
  private nutritionIdCounter: number;
  private activityLogIdCounter: number;

  constructor() {
    this.users = new Map();
    this.workouts = new Map();
    this.exercises = new Map();
    this.goals = new Map();
    this.nutritionEntries = new Map();
    this.activityLogs = new Map();
    
    this.userIdCounter = 1;
    this.workoutIdCounter = 1;
    this.exerciseIdCounter = 1;
    this.goalIdCounter = 1;
    this.nutritionIdCounter = 1;
    this.activityLogIdCounter = 1;

    // Add a default user
    this.createUser({
      username: "alex",
      password: "password123",
      displayName: "Alex Johnson",
      email: "alex@example.com",
      weight: 165,
      height: 72,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });

    // Add some sample data for the default user
    const userId = 1;
    
    // Create some workouts
    const workout1 = this.createWorkout({
      userId,
      name: "Cardio Session",
      type: "cardio",
      duration: 45,
      caloriesBurned: 320,
      date: new Date(),
      notes: "Treadmill, Cycling",
      status: "completed"
    });

    const workout2 = this.createWorkout({
      userId,
      name: "Lower Body",
      type: "strength",
      duration: 60,
      caloriesBurned: 420,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      notes: "Squats, Lunges, Deadlifts",
      status: "completed"
    });

    const workout3 = this.createWorkout({
      userId,
      name: "HIIT Session",
      type: "hiit",
      duration: 30,
      caloriesBurned: 380,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // two days ago
      notes: "Circuit training",
      status: "completed"
    });

    const workout4 = this.createWorkout({
      userId,
      name: "Upper Body Strength",
      type: "strength",
      duration: 45,
      caloriesBurned: 350,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      notes: "Chest, shoulders, arms",
      status: "scheduled"
    });

    // Add exercises to the workouts
    this.createExercise({ workoutId: workout4.id, name: "Bench Press", sets: 3, reps: 10, weight: 135 });
    this.createExercise({ workoutId: workout4.id, name: "Shoulder Press", sets: 3, reps: 12, weight: 85 });
    this.createExercise({ workoutId: workout4.id, name: "Bicep Curls", sets: 3, reps: 15, weight: 35 });

    // Create some goals
    this.createGoal({
      userId,
      name: "Lose 5 lbs",
      description: "Weight loss goal",
      targetDate: new Date("2023-07-30"),
      currentValue: 165,
      targetValue: 160,
      unit: "lbs",
      status: "in-progress"
    });

    this.createGoal({
      userId,
      name: "Run 5K",
      description: "Running distance goal",
      targetDate: new Date("2023-08-15"),
      currentValue: 3.2,
      targetValue: 5,
      unit: "K",
      status: "in-progress"
    });

    // Create activity logs
    this.createActivityLog({
      userId,
      date: new Date(),
      steps: 8243,
      activeMinutes: 68,
      caloriesBurned: 1872
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Workout methods
  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const id = this.workoutIdCounter++;
    const newWorkout: Workout = { ...workout, id };
    this.workouts.set(id, newWorkout);
    return newWorkout;
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async getWorkoutsByUserId(userId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async updateWorkout(id: number, workoutData: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;
    
    const updatedWorkout = { ...workout, ...workoutData };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async deleteWorkout(id: number): Promise<boolean> {
    return this.workouts.delete(id);
  }

  // Exercise methods
  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = this.exerciseIdCounter++;
    const newExercise: Exercise = { ...exercise, id };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  async getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]> {
    return Array.from(this.exercises.values())
      .filter(exercise => exercise.workoutId === workoutId);
  }

  async updateExercise(id: number, exerciseData: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const exercise = this.exercises.get(id);
    if (!exercise) return undefined;
    
    const updatedExercise = { ...exercise, ...exerciseData };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }

  async deleteExercise(id: number): Promise<boolean> {
    return this.exercises.delete(id);
  }

  // Goal methods
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const id = this.goalIdCounter++;
    const newGoal: Goal = { ...goal, id };
    this.goals.set(id, newGoal);
    return newGoal;
  }

  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId);
  }

  async updateGoal(id: number, goalData: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...goalData };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Nutrition methods
  async createNutritionEntry(entry: InsertNutritionEntry): Promise<NutritionEntry> {
    const id = this.nutritionIdCounter++;
    const newEntry: NutritionEntry = { ...entry, id };
    this.nutritionEntries.set(id, newEntry);
    return newEntry;
  }

  async getNutritionEntriesByUserId(userId: number): Promise<NutritionEntry[]> {
    return Array.from(this.nutritionEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async updateNutritionEntry(id: number, entryData: Partial<InsertNutritionEntry>): Promise<NutritionEntry | undefined> {
    const entry = this.nutritionEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...entryData };
    this.nutritionEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteNutritionEntry(id: number): Promise<boolean> {
    return this.nutritionEntries.delete(id);
  }

  // Activity Log methods
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogIdCounter++;
    const newLog: ActivityLog = { ...log, id };
    this.activityLogs.set(id, newLog);
    return newLog;
  }

  async getActivityLogsByUserId(userId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async updateActivityLog(id: number, logData: Partial<InsertActivityLog>): Promise<ActivityLog | undefined> {
    const log = this.activityLogs.get(id);
    if (!log) return undefined;
    
    const updatedLog = { ...log, ...logData };
    this.activityLogs.set(id, updatedLog);
    return updatedLog;
  }

  async getActivityLogByUserIdAndDate(userId: number, date: Date): Promise<ActivityLog | undefined> {
    const dateStr = date.toISOString().split('T')[0];
    return Array.from(this.activityLogs.values())
      .find(log => {
        const logDateStr = new Date(log.date).toISOString().split('T')[0];
        return log.userId === userId && logDateStr === dateStr;
      });
  }
}

export const storage = new MemStorage();
