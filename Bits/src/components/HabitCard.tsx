import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trash2, ListChecks } from 'lucide-react';
import { Habit, markHabitCompleted, deleteHabit, updateHabit } from '@/lib/habit-store';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components
import { useSession } from '@/components/SessionContextProvider'; // Import useSession

interface HabitCardProps {
  habit: Habit;
  onHabitUpdate: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onHabitUpdate }) => {
  const { user } = useSession(); // Get user from session context

  const handleMarkCompleted = async () => {
    if (!user) {
      toast.error("You must be logged in to mark habits completed.");
      return;
    }
    const success = await markHabitCompleted(habit.id, user.id);
    if (success) {
      onHabitUpdate();
      toast.success(`Habit "${habit.name}" marked as completed for today!`);
    }
  };

  const handleDelete = async () => {
    const success = await deleteHabit(habit.id);
    if (success) {
      onHabitUpdate();
      toast.info(`Habit "${habit.name}" deleted.`);
    }
  };

  const currentMilestone = habit.milestones.find(m => !m.isCompleted);
  const nextMilestoneIndex = habit.milestones.findIndex(m => !m.isCompleted);

  React.useEffect(() => {
    const checkAndCompleteMilestone = async () => {
      if (currentMilestone && currentMilestone.completedDays >= currentMilestone.targetDays) {
        const updatedMilestones = habit.milestones.map((m, index) =>
          index === nextMilestoneIndex ? { ...m, isCompleted: true } : m
        );
        const updatedHabitData = { ...habit, milestones: updatedMilestones };
        const success = await updateHabit(updatedHabitData);
        if (success) {
          onHabitUpdate();
          toast.success(`Milestone "${currentMilestone.goal}" completed for "${habit.name}"!`);
        }
      }
    };
    checkAndCompleteMilestone();
  }, [currentMilestone, habit, nextMilestoneIndex, onHabitUpdate]);

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.last_completed_date === today; // Use last_completed_date

  const progressValue = currentMilestone
    ? (currentMilestone.completedDays / currentMilestone.targetDays) * 100
    : 100; // If no current milestone, all are completed

  return (
    <Card className="w-full max-w-sm bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">{habit.name}</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your habit
                "{habit.name}" and all its associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600">
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Current Streak: <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{habit.current_streak} days</span>
        </p>
        {currentMilestone ? (
          <div className="mb-4">
            <p className="text-md font-medium text-gray-700 dark:text-gray-300">
              Current Goal: {currentMilestone.goal}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Completed {currentMilestone.completedDays} of {currentMilestone.targetDays} days
            </p>
            <Progress value={progressValue} className="w-full h-2 bg-gray-200 dark:bg-gray-700" />
          </div>
        ) : (
          <p className="text-md font-medium text-green-600 dark:text-green-400 mb-4">
            All milestones completed! Keep up the great work!
          </p>
        )}

        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleMarkCompleted}
            className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
            disabled={isCompletedToday}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Completed {isCompletedToday && "(Today)"}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700">
                <ListChecks className="mr-2 h-4 w-4" /> View Milestones
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <DialogHeader>
                <DialogTitle>Milestones for "{habit.name}"</DialogTitle>
                <DialogDescription>
                  Track your progress through each step of your habit.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <ul className="space-y-3">
                  {habit.milestones.map((milestone, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      {milestone.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-400 rounded-full flex-shrink-0"></div>
                      )}
                      <p className="text-base">
                        <span className={`font-medium ${milestone.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                          {milestone.goal}
                        </span>
                        {!milestone.isCompleted && (
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            ({milestone.completedDays} / {milestone.targetDays} days)
                          </span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;