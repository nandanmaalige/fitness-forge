import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Goal } from "@shared/schema";

interface GoalCardProps {
  goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
  const progress = (goal.currentValue / goal.targetValue) * 100;
  const formattedProgress = Math.round(progress);
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-gray-800">{goal.name}</h4>
            <p className="text-sm text-gray-500 mt-1">
              Target date: {format(new Date(goal.targetDate), 'MMMM d')}
            </p>
          </div>
          <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full bg-blue-100 text-primary">
            {goal.status === 'in-progress' ? 'In Progress' : goal.status}
          </span>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Current: {goal.currentValue} {goal.unit}</span>
            <span>Target: {goal.targetValue} {goal.unit}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded">
            <div 
              className={`h-2 rounded ${goal.status === 'completed' ? 'bg-secondary' : 'bg-accent'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {goal.currentValue} of {goal.targetValue} {goal.unit} goal ({formattedProgress}%)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
