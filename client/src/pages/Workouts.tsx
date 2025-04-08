import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Workout } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, useSearch } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Check, 
  ChevronRight,
  ClipboardCheck, 
  Dumbbell, 
  Plus, 
  Trash 
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import WorkoutForm from "@/components/workouts/WorkoutForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Workouts() {
  const userId = 1; // In a real app, this would come from auth context
  const [, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const action = searchParams.get('action');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const { data: workouts, isLoading } = useQuery<Workout[]>({
    queryKey: [`/api/users/${userId}/workouts`],
  });
  
  // Helper function to compare dates as strings (YYYY-MM-DD format)
  const isDateBeforeToday = (dateStr: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };
  
  const compareDates = (a: string, b: string): number => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };
  
  // Filter workouts by status
  const upcomingWorkouts = workouts?.filter(
    w => w.status === "scheduled" && !isDateBeforeToday(w.date)
  ).sort((a, b) => compareDates(a.date, b.date));
  
  const pastWorkouts = workouts?.filter(
    w => w.status === "completed" || isDateBeforeToday(w.date)
  ).sort((a, b) => compareDates(b.date, a.date));
  
  // Mark workout as completed
  const completeMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      const res = await apiRequest("PUT", `/api/workouts/${workoutId}`, {
        status: "completed",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/workouts`] });
      toast({
        title: "Workout completed",
        description: "Great job! Your workout has been marked as completed.",
      });
    },
  });
  
  // Delete workout mutation
  const deleteMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      await apiRequest("DELETE", `/api/workouts/${workoutId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/workouts`] });
      toast({
        title: "Workout deleted",
        description: "The workout has been removed from your schedule.",
      });
    },
  });
  
  // Handle workout completion
  const handleCompleteWorkout = (workoutId: number) => {
    completeMutation.mutate(workoutId);
  };
  
  // Handle workout deletion
  const handleDeleteWorkout = (workoutId: number) => {
    deleteMutation.mutate(workoutId);
  };
  
  // If action=new, show the workout form
  if (action === "new") {
    return <WorkoutForm userId={userId} />;
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map(i => (
              <div key={i} className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex justify-end space-x-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <Button onClick={() => setLocation("/workouts?action=new")}>
          <Plus className="mr-2 h-4 w-4" /> New Workout
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Workouts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {!upcomingWorkouts?.length ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No upcoming workouts</h3>
                  <p className="text-gray-500 mb-4">Schedule your next workout session</p>
                  <Button onClick={() => setLocation("/workouts?action=new")}>
                    <Plus className="mr-2 h-4 w-4" /> Schedule Workout
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingWorkouts.map(workout => (
                    <div key={workout.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold text-lg">{workout.name}</h3>
                        <span className="text-sm bg-blue-100 text-primary px-2 py-1 rounded-full">
                          {workout.date}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {workout.duration} minutes · {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                        {workout.notes && ` · ${workout.notes}`}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCompleteWorkout(workout.id)}
                        >
                          <Check className="mr-1 h-4 w-4" /> Complete
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/workouts/${workout.id}`)}
                        >
                          View <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-500 border-red-200">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Workout</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this workout? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteWorkout(workout.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Completed Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {!pastWorkouts?.length ? (
                <div className="text-center py-8">
                  <ClipboardCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No past workouts</h3>
                  <p className="text-gray-500">Complete your first workout to see it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastWorkouts.map(workout => (
                    <div key={workout.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold text-lg flex items-center">
                          {workout.name}
                          {workout.status === "completed" && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {workout.date}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {workout.duration} minutes · {workout.caloriesBurned} calories
                        {workout.notes && ` · ${workout.notes}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
