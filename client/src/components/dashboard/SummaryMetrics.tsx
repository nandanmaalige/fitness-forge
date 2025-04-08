import MetricCard from "./MetricCard";
import { Activity, LineChart, Footprints } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ActivityLog } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryMetricsProps {
  userId: number;
}

export default function SummaryMetrics({ userId }: SummaryMetricsProps) {
  const { data: activityLog, isLoading } = useQuery<ActivityLog>({
    queryKey: [`/api/users/${userId}/activity-logs/today`],
  });

  if (isLoading) {
    return (
      <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-10 w-20 mt-2" />
            <Skeleton className="h-4 w-36 mt-2" />
            <Skeleton className="h-2 w-full mt-4 rounded" />
            <div className="mt-1 flex justify-between">
              <Skeleton className="h-3 w-5" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  const metrics = [
    {
      title: "Today's Calories",
      value: activityLog?.caloriesBurned || 0,
      icon: <LineChart className="h-5 w-5" />,
      changePercent: 3,
      max: 2400,
      currentPercent: ((activityLog?.caloriesBurned || 0) / 2400) * 100,
    },
    {
      title: "Active Minutes",
      value: activityLog?.activeMinutes || 0,
      icon: <Activity className="h-5 w-5 text-secondary" />,
      changePercent: -5,
      max: 150,
      currentPercent: ((activityLog?.activeMinutes || 0) / 150) * 100,
    },
    {
      title: "Steps",
      value: activityLog?.steps || 0,
      icon: <Footprints className="h-5 w-5 text-accent" />,
      changePercent: 12,
      max: 10000,
      currentPercent: ((activityLog?.steps || 0) / 10000) * 100,
    },
  ];

  return (
    <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </section>
  );
}
