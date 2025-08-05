import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { addHabit, Milestone } from '@/lib/habit-store';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';

// Define the structure for AI-generated achievements
interface GeneratedAchievement {
  name: string;
  description: string;
  icon_name: string; // Changed from lucide_icon_name to icon_name to match Edge Function output
}

const AddHabitPage: React.FC = () => {
  const [endGoal, setEndGoal] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<Milestone[]>([]);
  const [aiAchievements, setAiAchievements] = useState<GeneratedAchievement[]>([]); // New state for achievements
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSession();

  const handleGenerateSuggestions = async () => {
    if (!endGoal.trim()) {
      toast.error("Please enter your end goal.");
      return;
    }

    setIsLoading(true);
    setShowSuggestions(false); // Hide previous suggestions while loading
    setAiSuggestions([]); // Clear previous milestones
    setAiAchievements([]); // Clear previous achievements
    const loadingToastId = toast.loading("Generating AI suggestions...");

    try {
      const { data, error } = await supabase.functions.invoke('generate-milestones', {
        body: { endGoal },
      });

      if (error) {
        console.error("Error invoking Edge Function:", error);
        toast.error(`Failed to generate suggestions: ${error.message}`, { id: loadingToastId });
      } else {
        // Assuming data now contains both milestones and achievements
        setAiSuggestions(data.milestones as Milestone[]);
        setAiAchievements(data.achievements as GeneratedAchievement[]);
        setShowSuggestions(true);
        toast.success("AI suggestions generated!", { id: loadingToastId });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred.", { id: loadingToastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = async () => {
    if (!endGoal.trim() || aiSuggestions.length === 0) {
      toast.error("Please generate AI suggestions first.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to add a habit.");
      navigate('/login');
      return;
    }

    const addedHabit = await addHabit(user.id, endGoal, aiSuggestions);
    if (addedHabit) {
      // Now, save the AI-generated achievements
      if (aiAchievements.length > 0) {
        const achievementsToInsert = aiAchievements.map(ach => ({
          user_id: user.id,
          habit_id: addedHabit.id, // Link achievement to the newly created habit
          name: ach.name,
          description: ach.description,
          icon_name: ach.icon_name, // Corrected: Use ach.icon_name to match Edge Function output
          is_unlocked: false,
          unlocked_at: null,
        }));

        const { error: achievementsError } = await supabase
          .from('user_achievements')
          .insert(achievementsToInsert);

        if (achievementsError) {
          console.error('Error inserting AI-generated achievements:', achievementsError);
          toast.error('Failed to save some achievements.');
        } else {
          toast.success(`Habit "${endGoal}" and its achievements added successfully!`);
        }
      } else {
        toast.success(`Habit "${endGoal}" added successfully!`);
      }
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">Define Your Goal</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Tell our AI your end goal, and we'll help you break it down into achievable steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="endGoal" className="text-lg font-medium text-gray-800 dark:text-gray-200">What is your end goal?</Label>
              <Textarea
                id="endGoal"
                placeholder="e.g., Walk 7000 steps a day, Read 1 book a month, Exercise 5 times a week"
                value={endGoal}
                onChange={(e) => setEndGoal(e.target.value)}
                className="min-h-[100px] text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <Button
              onClick={handleGenerateSuggestions}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate AI Suggestions"}
            </Button>

            {showSuggestions && (
              <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Suggested Milestones:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  {aiSuggestions.map((milestone, index) => (
                    <li key={index}>
                      <span className="font-medium">{milestone.goal}</span> (Target: {milestone.targetDays} days)
                    </li>
                  ))}
                </ul>

                {aiAchievements.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Suggested Achievements:</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                      {aiAchievements.map((ach, index) => (
                        <li key={index}>
                          <span className="font-medium">{ach.name}:</span> {ach.description} (Icon: {ach.icon_name})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <strong className="text-red-500">Note:</strong> This uses a Supabase Edge Function to call a free AI API. Ensure you've set your Hugging Face API token as a secret in Supabase.
                </p>
                <Button
                  onClick={handleAddHabit}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
                >
                  Add Habit
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddHabitPage;