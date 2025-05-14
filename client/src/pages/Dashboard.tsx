import WelcomeSection from "@/components/dashboard/WelcomeSection";
import SummaryMetrics from "@/components/dashboard/SummaryMetrics";
import WeeklyActivity from "@/components/dashboard/WeeklyActivity";
import NextWorkout from "@/components/dashboard/NextWorkout";
import RecentWorkouts from "@/components/dashboard/RecentWorkouts";
import Goals from "@/components/dashboard/Goals";

export default function Dashboard() {
  // In a real app, this would be fetched from auth context/state
  const userId = 1;
  
  return (
    <div>
      <WelcomeSection name="Alex Johnson" />
      
      <SummaryMetrics userId={userId} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <WeeklyActivity userId={userId} />
        <NextWorkout userId={userId} />
      </div>
      
      <RecentWorkouts userId={userId} />
      
      <Goals userId={userId} />
    </div>
  );
}
