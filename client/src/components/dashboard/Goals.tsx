import { useQuery } from "@tanstack/react-query";
import { Goal } from "@shared/schema";
import { useLocation } from "wouter";
import GoalCard from "./GoalCard";
import { Skeleton } from "@/components/ui/skeleton";

interface GoalsProps {
  userId: number;
}

export default function Goals({ userId }: GoalsProps) {
  const [, setLocation] = useLocation();
  
  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: [`/api/users/${userId}/goals`],
  });
  
  const handleAddGoal = () => {
    setLocation("/goals?action=new");
  };
  
  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Your Goals</h3>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
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
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  if (!goals?.length) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Your Goals</h3>
          <button 
            onClick={handleAddGoal}
            className="text-sm font-medium text-primary hover:text-blue-600"
          >
            Add goal
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't set any goals yet</p>
          <button 
            onClick={handleAddGoal}
            className="inline-flex items-center text-primary hover:text-blue-600"
          >
            Set your first fitness goal
          </button>
        </div>
      </section>
    );
  }
  
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Your Goals</h3>
        <button 
          onClick={handleAddGoal}
          className="text-sm font-medium text-primary hover:text-blue-600"
        >
          Add goal
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </section>
  );
}
