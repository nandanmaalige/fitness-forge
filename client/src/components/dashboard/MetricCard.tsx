import { TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  changePercent: number;
  max: number;
  currentPercent: number;
  unit?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  changePercent, 
  max, 
  currentPercent,
  unit = ""
}: MetricCardProps) {
  const isPositive = changePercent >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="text-accent">{icon}</div>
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold">
          {value}
          {unit && <span className="text-lg font-normal ml-1">{unit}</span>}
        </p>
        <p className="mt-1 text-sm text-gray-500 flex items-center">
          <span className={`flex items-center ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {Math.abs(changePercent)}%
          </span>
          <span className="ml-1">vs last week</span>
        </p>
      </div>
      <div className="mt-4 h-2 bg-gray-100 rounded">
        <div 
          className="h-2 bg-primary rounded" 
          style={{ width: `${currentPercent}%` }}
        ></div>
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>0</span>
        <span>Goal: {max}</span>
      </div>
    </div>
  );
}
