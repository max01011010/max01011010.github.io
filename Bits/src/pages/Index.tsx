import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Trophy } from 'lucide-react'; // Import Trophy icon
import { useNavigate } from 'react-router-dom';
import { getHabits, Habit } from '@/lib/habit-store';
import HabitCard from '@/components/HabitCard';
import { useSession } from '@/components/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import WalkthroughModal from '@/components/WalkthroughModal'; // Import the new WalkthroughModal

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useSession();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isHabitsLoading, setIsHabitsLoading] = useState(true);

  const loadHabits = useCallback(async () => {
    if (user) {
      setIsHabitsLoading(true);
      const fetchedHabits = await getHabits(user.id);
      setHabits(fetchedHabits);
      setIsHabitsLoading(false);
    } else {
      setHabits([]);
      setIsHabitsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading) {
      loadHabits();
    }
  }, [isLoading, loadHabits]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Logout failed: ${error.message}`);
    } else {
      toast.info("You have been logged out.");
      navigate('/login');
    }
  };

  if (isLoading || isHabitsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Loading habits...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-4 relative">
      {/* Logout button remains in top right */}
      <div className="absolute top-4 right-4">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full w-12 h-12 border-red-500 text-red-500 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-gray-700 shadow-lg"
          onClick={handleLogout}
        >
          <LogOut className="h-6 w-6" />
        </Button>
      </div>

      {/* Achievements button in top left */}
      <div className="absolute top-4 left-4">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full w-12 h-12 border-blue-500 text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 shadow-lg"
          onClick={() => navigate('/achievements')}
        >
          <Trophy className="h-6 w-6" />
        </Button>
      </div>

      {/* Add button moved to bottom right */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          onClick={() => navigate('/add-habit')}
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>

      <div className="text-center mt-12 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Habits</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Track your progress and build new routines!
        </p>
      </div>

      {/* "How does this work?" link */}
      <WalkthroughModal />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl pb-20">
        {habits.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400 text-lg">
            No habits yet. Click the '+' button to add your first habit!
          </p>
        ) : (
          habits.map(habit => (
            <HabitCard key={habit.id} habit={habit} onHabitUpdate={loadHabits} />
          ))
        )}
      </div>
    </div>
  );
};

export default Index;