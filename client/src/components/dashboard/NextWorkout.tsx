import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Exercise, Workout } from "@shared/schema";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface NextWorkoutProps {
  userId: number;
}

export default function NextWorkout({ userId }: NextWorkoutProps) {
  const [, setLocation] = useLocation();
  
  const { data: workouts, isLoading: isLoadingWorkouts } = useQuery<Workout[]>({
    queryKey: [`/api/users/${userId}/workouts`],
  });
  
  // Find the next scheduled workout
  const nextWorkout = workouts?.find(w => 
    w.status === "scheduled" && new Date(w.date) > new Date()
  );
  
  const { data: exercises, isLoading: isLoadingExercises } = useQuery<Exercise[]>({
    queryKey: [`/api/workouts/${nextWorkout?.id}/exercises`],
    enabled: !!nextWorkout?.id,
  });
  
  const handleStartWorkout = () => {
    if (nextWorkout) {
      setLocation(`/workouts/${nextWorkout.id}`);
    }
  };
  
  if (isLoadingWorkouts || isLoadingExercises) {
    return (
      <Card>
        <CardHeader className="border-b border-gray-100 px-5 py-3">
          <CardTitle className="text-lg font-medium">Next Workout</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-4 w-36 mb-4" />
          
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
          
          <Skeleton className="h-10 w-full mt-6" />
        </CardContent>
      </Card>
    );
  }
  
  if (!nextWorkout) {
    return (
      <Card>
        <CardHeader className="border-b border-gray-100 px-5 py-3">
          <CardTitle className="text-lg font-medium">Next Workout</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No upcoming workouts scheduled</p>
            <Button 
              onClick={() => setLocation("/workouts?action=new")}
              className="bg-primary hover:bg-blue-600"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Schedule Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const workoutDate = new Date(nextWorkout.date);
  const isToday = new Date().toDateString() === workoutDate.toDateString();
  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === workoutDate.toDateString();
  
  let dateLabel = format(workoutDate, "MMM d");
  if (isToday) dateLabel = "Today";
  if (isTomorrow) dateLabel = "Tomorrow";
  
  return (
    <Card>
      <CardHeader className="border-b border-gray-100 px-5 py-3">
        <CardTitle className="text-lg font-medium">Next Workout</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-700">{nextWorkout.name}</h4>
            <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded-full">
              {dateLabel}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {nextWorkout.duration} minutes · {nextWorkout.type.charAt(0).toUpperCase() + nextWorkout.type.slice(1)} workout
          </p>
        </div>
        
        <div className="space-y-3">
          {exercises?.map(exercise => (
            <div key={exercise.id} className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{exercise.name}</p>
                <p className="text-xs text-gray-500">
                  {exercise.sets} sets × {exercise.reps} reps
                  {exercise.weight && ` · ${exercise.weight} lbs`}
                </p>
              </div>
            </div>
          ))}
          
          <div className="flex items-center text-gray-400">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Add exercise</p>
            </div>
          </div>
        </div>
        
        <Button 
          className="mt-6 w-full bg-primary hover:bg-blue-600"
          onClick={handleStartWorkout}
        >
          Start Workout
        </Button>
      </CardContent>
    </Card>
  );
}
