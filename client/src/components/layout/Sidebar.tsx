import { Link } from "wouter";
import { 
  Home, 
  BarChart2, 
  FileText, 
  Zap, 
  User 
} from "lucide-react";

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/workouts", label: "Workouts", icon: BarChart2 },
    { path: "/nutrition", label: "Nutrition", icon: FileText },
    { path: "/goals", label: "Goals", icon: Zap },
    { path: "/profile", label: "Profile", icon: User }
  ];

  return (
    <aside className="w-64 bg-white shadow-md hidden md:block">
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-primary">FitTrack</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = item.path === "/" + currentPath;
            const IconComponent = item.icon;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={`flex items-center p-2 rounded-lg ${
                    isActive 
                      ? 'bg-blue-50 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                    <IconComponent className="h-5 w-5 mr-3" />
                    {item.label}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
