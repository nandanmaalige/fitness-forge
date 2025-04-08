import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertWorkoutSchema, insertExerciseSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extend workout schema with validation rules
const workoutFormSchema = insertWorkoutSchema.extend({
  date: z.coerce.date(),
  name: z.string().min(3, "Workout name must be at least 3 characters"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  caloriesBurned: z.coerce.number().optional(),
});

// Define types for exercises
type ExerciseForm = {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
};

// Create exercise form schema
const exerciseFormSchema = insertExerciseSchema.omit({
  workoutId: true,
}).extend({
  sets: z.coerce.number().optional(),
  reps: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  distance: z.coerce.number().optional(),
});

type WorkoutFormData = z.infer<typeof workoutFormSchema>;

interface WorkoutFormProps {
  userId: number;
}

export default function WorkoutForm({ userId }: WorkoutFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [exercises, setExercises] = useState<ExerciseForm[]>([]);
  const [exerciseForm, setExerciseForm] = useState<ExerciseForm>({
    name: "",
    sets: 3,
    reps: 10,
  });
  
  // Initialize the form
  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      userId,
      name: "",
      type: "strength",
      duration: 45,
      caloriesBurned: 0,
      date: new Date(),
      notes: "",
      status: "scheduled",
    },
  });
  
  // Handle workout submission
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: WorkoutFormData) => {
      const workout = await apiRequest("POST", "/api/workouts", data);
      const workoutData = await workout.json();
      
      // Create exercises for this workout
      if (exercises.length > 0) {
        for (const exercise of exercises) {
          await apiRequest("POST", "/api/exercises", {
            ...exercise,
            workoutId: workoutData.id,
          });
        }
      }
      
      return workoutData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/workouts`] });
      toast({
        title: "Workout scheduled",
        description: "Your workout has been added to your schedule.",
      });
      setLocation("/workouts");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create workout. " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submit handler
  const onSubmit = (data: WorkoutFormData) => {
    createWorkoutMutation.mutate(data);
  };
  
  // Handle exercise form changes
  const handleExerciseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExerciseForm({
      ...exerciseForm,
      [name]: value,
    });
  };
  
  // Add exercise to the list
  const addExercise = () => {
    try {
      // Validate exercise data
      exerciseFormSchema.parse(exerciseForm);
      setExercises([...exercises, exerciseForm]);
      setExerciseForm({ name: "", sets: 3, reps: 10 });
    } catch (error) {
      toast({
        title: "Invalid exercise",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
    }
  };
  
  // Remove exercise from the list
  const removeExercise = (index: number) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Schedule New Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Upper Body Strength" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="hiit">HIIT</SelectItem>
                        <SelectItem value="flexibility">Flexibility</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="caloriesBurned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Calories</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="skipped">Skipped</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your workout plan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Exercise section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-4">Exercises</h3>
              
              {exercises.length > 0 && (
                <div className="space-y-2 mb-4">
                  {exercises.map((exercise, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-gray-500">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.weight ? ` · ${exercise.weight} lbs` : ''}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeExercise(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Exercise name"
                    name="name"
                    value={exerciseForm.name}
                    onChange={handleExerciseChange}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Sets"
                    name="sets"
                    value={exerciseForm.sets || ''}
                    onChange={handleExerciseChange}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Reps"
                    name="reps"
                    value={exerciseForm.reps || ''}
                    onChange={handleExerciseChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    placeholder="Weight (lbs)"
                    name="weight"
                    value={exerciseForm.weight || ''}
                    onChange={handleExerciseChange}
                  />
                </div>
                <div className="md:col-span-2 flex">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addExercise}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Exercise
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/workouts")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createWorkoutMutation.isPending}
              >
                {createWorkoutMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Workout
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
