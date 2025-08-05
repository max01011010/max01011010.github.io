import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from 'lucide-react';

const WalkthroughModal: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-6 text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700">
          <HelpCircle className="mr-2 h-4 w-4" /> How does this work?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">How This App Works</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            A quick guide to help you get started with building new habits!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <h4 className="font-semibold text-lg mb-1">1. Add a New Habit</h4>
            <p>Click the <span className="font-bold text-blue-600 dark:text-blue-400">+</span> button at the bottom right. Just tell our AI your end goal, and it will suggest incremental milestones and custom achievements for you!</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-1">2. Track Your Progress</h4>
            <p>On the main screen, mark a habit as 'Completed' for the day to build your streak and progress through its milestones.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-1">3. Understand Streaks & Milestones</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-bold">Streaks:</span> Keep completing your habits daily to grow your streak! Missing a day will reset it.</li>
              <li><span className="font-bold">Milestones:</span> Each habit has smaller, achievable steps. Complete the target days for a milestone to unlock it and move to the next step towards your main goal.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-1">4. Earn Achievements</h4>
            <p>Unlock special achievements by reaching certain milestones or completing specific actions across your habits. Check them out on the <span className="font-bold text-blue-600 dark:text-blue-400">Achievements</span> page (top left button)!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalkthroughModal;