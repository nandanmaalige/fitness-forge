import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  weight: numeric("weight"), // in pounds
  height: numeric("height"), // in inches
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  weight: true,
  height: true,
  avatarUrl: true,
});

// Workout schema
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // cardio, strength, hiit, etc.
  duration: integer("duration").notNull(), // in minutes
  caloriesBurned: integer("calories_burned"),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  status: text("status").notNull(), // scheduled, completed, skipped
});

// Apply date handling for workouts
export const insertWorkoutSchema = createInsertSchema(workouts)
  .pick({
    userId: true,
    name: true,
    type: true,
    duration: true,
    caloriesBurned: true,
    date: true,
    notes: true,
    status: true,
  })
  .extend({
    // Override the date field to accept both string and Date objects
    date: z.union([z.string(), z.date()]).transform((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }),
  });

// Exercise schema
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull(),
  name: text("name").notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: numeric("weight"), // in pounds
  duration: integer("duration"), // in minutes, for cardio exercises
  distance: numeric("distance"), // in miles, for cardio exercises
});

export const insertExerciseSchema = createInsertSchema(exercises).pick({
  workoutId: true,
  name: true,
  sets: true,
  reps: true,
  weight: true,
  duration: true,
  distance: true,
});

// Goal schema
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  targetDate: timestamp("target_date").notNull(),
  currentValue: numeric("current_value").notNull(),
  targetValue: numeric("target_value").notNull(),
  unit: text("unit").notNull(), // lbs, miles, etc.
  status: text("status").notNull(), // in-progress, completed, abandoned
});

// Apply date handling for goals
export const insertGoalSchema = createInsertSchema(goals)
  .pick({
    userId: true,
    name: true,
    description: true,
    targetDate: true,
    currentValue: true,
    targetValue: true,
    unit: true,
    status: true,
  })
  .extend({
    // Override the date field to accept both string and Date objects
    targetDate: z.union([z.string(), z.date()]).transform((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }),
  });

// Nutrition schema
export const nutritionEntries = pgTable("nutrition_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  calories: integer("calories").notNull(),
  protein: numeric("protein"), // in grams
  carbs: numeric("carbs"), // in grams
  fat: numeric("fat"), // in grams
  notes: text("notes"),
});

// Create base schema then customize the date field to handle both string and Date
export const insertNutritionEntrySchema = createInsertSchema(nutritionEntries)
  .pick({
    userId: true,
    date: true,
    calories: true,
    protein: true,
    carbs: true,
    fat: true,
    notes: true,
  })
  .extend({
    // Override the date field to accept both string and Date objects
    date: z.union([z.string(), z.date()]).transform((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }),
  });

// Daily activity logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  steps: integer("steps"),
  activeMinutes: integer("active_minutes"),
  caloriesBurned: integer("calories_burned"),
});

// Also apply the same date handling for activity logs
export const insertActivityLogSchema = createInsertSchema(activityLogs)
  .pick({
    userId: true,
    date: true,
    steps: true,
    activeMinutes: true,
    caloriesBurned: true,
  })
  .extend({
    // Override the date field to accept both string and Date objects
    date: z.union([z.string(), z.date()]).transform((val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    }),
  });

// Relations
export const userRelations = relations(users, ({ many }) => ({
  workouts: many(workouts),
  goals: many(goals),
  nutritionEntries: many(nutritionEntries),
  activityLogs: many(activityLogs),
}));

export const workoutRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  exercises: many(exercises),
}));

export const exerciseRelations = relations(exercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
}));

export const goalRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const nutritionEntryRelations = relations(nutritionEntries, ({ one }) => ({
  user: one(users, {
    fields: [nutritionEntries.userId],
    references: [users.id],
  }),
}));

export const activityLogRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertNutritionEntry = z.infer<typeof insertNutritionEntrySchema>;
export type NutritionEntry = typeof nutritionEntries.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
