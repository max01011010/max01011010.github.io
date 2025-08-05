import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddHabitPage from "./pages/AddHabitPage";
import Login from "./pages/Login";
import AchievementsPage from "./pages/AchievementsPage"; // Import AchievementsPage
import { SessionContextProvider, useSession } from "./components/SessionContextProvider";
import { MadeWithDyad } from "./components/made-with-dyad";

const queryClient = new QueryClient();

// A wrapper component to protect routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Loading application...</p>
      </div>
    );
  }

  if (!session) {
    // Redirect handled by SessionContextProvider, but this prevents rendering protected content
    return null;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-habit"
              element={
                <ProtectedRoute>
                  <AddHabitPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements" // New route for AchievementsPage
              element={
                <ProtectedRoute>
                  <AchievementsPage />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Free app by Max Abardo.</p>
            <p>
              Tip me on{' '}
              <a
                href="https://ko-fi.com/maxabardo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Ko-fi
              </a>{' '}
              if you'd like to see more!
            </p>
          </div>
          <MadeWithDyad />
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;