import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Milestone {
  goal: string; // e.g., "Walk 1000 steps"
  targetDays: number; // e.g., 3 days a week
  completedDays: number; // how many days completed for this milestone
  isCompleted: boolean;
}

export interface Habit {
  id: string;
  user_id: string; // Added user_id to link to Supabase auth.users
  name: string; // The end goal, e.g., "Walk 7000 steps a day"
  current_streak: number; // Renamed to match snake_case for Supabase
  last_completed_date: string | null; // ISO date string, renamed for Supabase
  milestones: Milestone[];
  created_at: string; // ISO date string, renamed for Supabase
}

export const getHabits = async (userId: string): Promise<Habit[]> => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching habits:', error);
    toast.error('Failed to load habits.');
    return [];
  }
  return data as Habit[];
};

export const addHabit = async (userId: string, name: string, milestones: Milestone[]): Promise<Habit | null> => {
  const newHabit = {
    user_id: userId,
    name,
    current_streak: 0,
    last_completed_date: null,
    milestones,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('habits')
    .insert([newHabit])
    .select()
    .single();

  if (error) {
    console.error('Error adding habit:', error);
    toast.error('Failed to add habit.');
    return null;
  }
  return data as Habit;
};

export const updateHabit = async (updatedHabit: Habit): Promise<Habit | null> => {
  const { data, error } = await supabase
    .from('habits')
    .update(updatedHabit)
    .eq('id', updatedHabit.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating habit:', error);
    toast.error('Failed to update habit.');
    return null;
  }
  return data as Habit;
};

export const deleteHabit = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting habit:', error);
    toast.error('Failed to delete habit.');
    return false;
  }
  return true;
};

export const markHabitCompleted = async (habitId: string, userId: string): Promise<boolean> => {
  const { data: habits, error: fetchError } = await supabase
    .from('habits')
    .select('*')
    .eq('id', habitId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !habits) {
    console.error('Error fetching habit to mark completed:', fetchError);
    toast.error('Failed to find habit to mark completed.');
    return false;
  }

  const habit = habits as Habit;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const lastCompletionDay = habit.last_completed_date ? new Date(habit.last_completed_date).toISOString().split('T')[0] : null;

  if (lastCompletionDay === today) {
    // Already marked for today, do nothing
    toast.info('Habit already marked completed for today.');
    return true;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];

  let newStreak = habit.current_streak;
  if (lastCompletionDay === yesterdayString) {
    newStreak += 1;
  } else if (lastCompletionDay !== today) {
    // If not completed yesterday and not today, reset streak
    newStreak = 1;
  }

  // Update current milestone's completed days
  const updatedMilestones = habit.milestones.map((milestone, index) => {
    if (!milestone.isCompleted && index === 0) { // Assuming the first incomplete milestone is the current one
      return { ...milestone, completedDays: milestone.completedDays + 1 };
    }
    return milestone;
  });

  const { error: updateError } = await supabase
    .from('habits')
    .update({
      current_streak: newStreak,
      last_completed_date: today,
      milestones: updatedMilestones,
    })
    .eq('id', habitId)
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating habit completion:', updateError);
    toast.error('Failed to mark habit completed.');
    return false;
  }
  return true;
};