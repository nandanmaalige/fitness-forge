import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useLocation } from "wouter";

interface WelcomeSectionProps {
  name: string;
}

export default function WelcomeSection({ name }: WelcomeSectionProps) {
  const [, setLocation] = useLocation();
  
  const handleLogWorkout = () => {
    setLocation("/workouts?action=new");
  };

  return (
    <section className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {name}!</h2>
          <p className="mt-1 text-gray-600">Let's check your fitness progress</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleLogWorkout} className="bg-primary hover:bg-blue-600">
            <PlusIcon className="h-5 w-5 mr-2" />
            Log Workout
          </Button>
        </div>
      </div>
    </section>
  );
}
