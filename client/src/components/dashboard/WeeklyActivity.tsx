import { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ActivityLog } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyActivityProps {
  userId: number;
}

declare global {
  interface Window {
    Chart: any;
  }
}

export default function WeeklyActivity({ userId }: WeeklyActivityProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  
  const { data: activityLogs, isLoading } = useQuery<ActivityLog[]>({
    queryKey: [`/api/users/${userId}/activity-logs`],
  });

  // Get the days of the week
  const getDayLabels = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const orderedDays = [...days.slice(today), ...days.slice(0, today)];
    return orderedDays;
  };

  // Mock data - in a real app would parse from activityLogs
  const caloriesData = [320, 280, 450, 380, 320, 520, 410];
  const minutesData = [45, 30, 60, 50, 45, 70, 55];

  useEffect(() => {
    if (!chartRef.current || isLoading) return;

    // Load Chart.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    script.onload = () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current?.getContext('2d');
      if (!ctx) return;

      chartInstance.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: getDayLabels(),
          datasets: [
            {
              label: 'Calories Burned',
              data: caloriesData,
              backgroundColor: 'hsl(217, 91%, 60%)',
              borderColor: 'hsl(217, 91%, 60%)',
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 16,
            },
            {
              label: 'Active Minutes',
              data: minutesData,
              backgroundColor: '#10B981',
              borderColor: '#10B981',
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 16,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                padding: 20
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                drawBorder: false,
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    };

    document.body.appendChild(script);
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      document.body.removeChild(script);
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader className="border-b border-gray-100 px-5 py-3">
          <CardTitle className="text-lg font-medium">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="border-b border-gray-100 px-5 py-3">
        <CardTitle className="text-lg font-medium">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="chart-container h-[200px] w-full">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
