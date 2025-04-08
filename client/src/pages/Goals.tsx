import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Goal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, useSearch } from "wouter";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Plus,
  Target,
  Trash,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import GoalForm from "@/components/goals/GoalForm";
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

export default function Goals() {
  const userId = 1; // In a real app, this would come from auth context
  const [, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const action = searchParams.get('action');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: [`/api/users/${userId}/goals`],
  });
  
  // Complete goal mutation
  const completeGoalMutation = useMutation({
    mutationFn: async (goalId: number) => {
      const res = await apiRequest("PUT", `/api/goals/${goalId}`, {
        status: "completed"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/goals`] });
      toast({
        title: "Goal completed!",
        description: "Congratulations on achieving your fitness goal!",
      });
    },
  });
  
  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: number) => {
      await apiRequest("DELETE", `/api/goals/${goalId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/goals`] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been removed.",
      });
    },
  });
  
  const handleCompleteGoal = (goalId: number) => {
    completeGoalMutation.mutate(goalId);
  };
  
  const handleDeleteGoal = (goalId: number) => {
    deleteGoalMutation.mutate(goalId);
  };
  
  // If action=new, show the goal form
  if (action === "new") {
    return <GoalForm userId={userId} />;
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Skeleton className="h-5 w-36 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-2 w-full rounded mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fitness Goals</h1>
        <Button onClick={() => setLocation("/goals?action=new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </div>
      
      {!goals?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No goals set yet</h3>
            <p className="text-gray-500 mb-4">Setting goals is the first step toward fitness success</p>
            <Button onClick={() => setLocation("/goals?action=new")}>
              <Plus className="mr-2 h-4 w-4" /> Set Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const progress = (goal.currentValue / goal.targetValue) * 100;
            const formattedProgress = Math.round(progress);
            const isCompleted = goal.status === "completed";
            
            return (
              <Card key={goal.id}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{goal.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Target date: {format(new Date(goal.targetDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${
                      isCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-primary'
                    }`}>
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Current: {goal.currentValue} {goal.unit}</span>
                      <span>Target: {goal.targetValue} {goal.unit}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded">
                      <div 
                        className={`h-2 rounded ${
                          isCompleted ? 'bg-green-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {goal.currentValue} of {goal.targetValue} {goal.unit} goal ({formattedProgress}%)
                    </p>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <span className="text-sm text-gray-500">{goal.description}</span>
                    <div className="flex space-x-2">
                      {!isCompleted && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCompleteGoal(goal.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this goal? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Goal Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-800">Make goals specific and measurable</h4>
              <p className="text-sm text-gray-600">
                Instead of "get in shape," try "run a 5K in under 30 minutes" or "lose 10 pounds by July."
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-800">Break larger goals into smaller milestones</h4>
              <p className="text-sm text-gray-600">
                If you want to lose 20 pounds, set mini-goals of 5 pounds each to keep motivated.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Target className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-800">Set realistic and achievable goals</h4>
              <p className="text-sm text-gray-600">
                Ensure your goals challenge you but are still within reach given your current fitness level.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
