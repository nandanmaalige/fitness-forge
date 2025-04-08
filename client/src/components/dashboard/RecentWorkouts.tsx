import { Card, CardContent } from "@/components/ui/card";
import { BarChart2, Mic, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Workout } from "@shared/schema";
import { useLocation } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentWorkoutsProps {
  userId: number;
}

export default function RecentWorkouts({ userId }: RecentWorkoutsProps) {
  const [, setLocation] = useLocation();
  
  const { data: workouts, isLoading } = useQuery<Workout[]>({
    queryKey: [`/api/users/${userId}/workouts`],
  });
  
  // Filter to only show completed workouts
  const completedWorkouts = workouts?.filter(w => w.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const handleViewAll = () => {
    setLocation("/workouts");
  };
  
  if (isLoading) {
    return (
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Recent Workouts</h3>
          <Skeleton className="h-5 w-16" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workout</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-24" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="ml-4">
                            <Skeleton className="h-5 w-24 mb-1" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-12" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }
  
  if (!completedWorkouts?.length) {
    return (
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Recent Workouts</h3>
          <button 
            onClick={handleViewAll}
            className="text-sm font-medium text-primary hover:text-blue-600"
          >
            View all
          </button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No completed workouts yet.</p>
            <button 
              onClick={() => setLocation("/workouts?action=new")}
              className="mt-4 inline-flex items-center text-primary hover:text-blue-600"
            >
              Start tracking your workouts
            </button>
          </CardContent>
        </Card>
      </section>
    );
  }
  
  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'cardio':
        return <Mic className="h-4 w-4" />;
      case 'strength':
        return <BarChart2 className="h-4 w-4" />;
      case 'hiit':
        return <Play className="h-4 w-4" />;
      default:
        return <BarChart2 className="h-4 w-4" />;
    }
  };
  
  const getWorkoutIconColor = (type: string) => {
    switch (type) {
      case 'cardio':
        return 'bg-indigo-100 text-indigo-500';
      case 'strength':
        return 'bg-red-100 text-red-500';
      case 'hiit':
        return 'bg-blue-100 text-blue-500';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };
  
  const formatDate = (date: string | Date) => {
    const workoutDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (workoutDate.toDateString() === today.toDateString()) {
      return `Today, ${format(workoutDate, 'h:mm a')}`;
    } else if (workoutDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(workoutDate, 'h:mm a')}`;
    } else {
      return format(workoutDate, 'MMM d, h:mm a');
    }
  };
  
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Recent Workouts</h3>
        <button 
          onClick={handleViewAll}
          className="text-sm font-medium text-primary hover:text-blue-600"
        >
          View all
        </button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workout</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedWorkouts.map((workout) => (
                  <tr key={workout.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(workout.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getWorkoutIconColor(workout.type)}`}>
                          {getWorkoutIcon(workout.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{workout.name}</div>
                          <div className="text-xs text-gray-500">{workout.notes}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {workout.duration} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {workout.caloriesBurned}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
