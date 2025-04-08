import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: number;
  displayName: string;
  avatarUrl?: string;
}

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 md:hidden">FitTrack</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
              <Avatar className="h-8 w-8 border-2 border-gray-200">
                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                <AvatarFallback>{user.displayName.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="ml-2 hidden md:block">{user.displayName}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
