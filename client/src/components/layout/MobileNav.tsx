import { Link } from "wouter";
import { 
  Home, 
  BarChart2, 
  FileText, 
  Zap, 
  User,
  PlusCircle
} from "lucide-react";

interface MobileNavProps {
  currentPath: string;
}

export default function MobileNav({ currentPath }: MobileNavProps) {
  const menuItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/workouts", label: "Workouts", icon: BarChart2 },
    { path: "/add-workout", label: "Add", icon: PlusCircle },
    { path: "/nutrition", label: "Nutrition", icon: FileText },
    { path: "/profile", label: "Profile", icon: User }
  ];

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-20 md:hidden">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between">
          {menuItems.map((item) => {
            const isActive = item.path === "/" + currentPath;
            const IconComponent = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <a className={`group flex flex-col items-center justify-center w-full py-2 ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}>
                  <IconComponent className="h-6 w-6" />
                  <span className="text-xs mt-1">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
