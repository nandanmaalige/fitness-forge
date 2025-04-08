import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Workouts from "@/pages/Workouts";
import Nutrition from "@/pages/Nutrition";
import Goals from "@/pages/Goals";
import Profile from "@/pages/Profile";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

// Mock user for demo purposes
const defaultUser = {
  id: 1,
  displayName: "Alex Johnson",
  username: "alex",
  email: "alex@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
};

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const currentPath = location.split("/")[1] || "dashboard";

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar currentPath={currentPath} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={defaultUser} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <MobileNav currentPath={currentPath} />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/nutrition" component={Nutrition} />
      <Route path="/goals" component={Goals} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentUser] = useState(defaultUser);

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Router />
      </AppLayout>
    </QueryClientProvider>
  );
}

export default App;
