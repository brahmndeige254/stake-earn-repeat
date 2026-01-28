import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  stake_amount: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_completed: boolean;
  current_streak: number;
  best_streak: number;
  created_at: string;
  completedToday?: boolean;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_at: string;
  notes: string | null;
}

export const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    if (!user) return;

    const { data: habitsData, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching habits:", error);
      return;
    }

    // Get today's logs
    const today = new Date().toISOString().split("T")[0];
    const { data: logsData } = await supabase
      .from("habit_logs")
      .select("habit_id")
      .eq("user_id", user.id)
      .gte("completed_at", `${today}T00:00:00`)
      .lt("completed_at", `${today}T23:59:59`);

    const completedTodayIds = new Set(logsData?.map((l) => l.habit_id) || []);

    setHabits(
      (habitsData || []).map((h) => ({
        ...h,
        stake_amount: Number(h.stake_amount),
        completedToday: completedTodayIds.has(h.id),
      }))
    );
  };

  const createHabit = async (
    name: string,
    description: string,
    stakeAmount: number,
    durationDays: number
  ) => {
    if (!user) return { success: false };

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const { error } = await supabase.from("habits").insert({
      user_id: user.id,
      name,
      description: description || null,
      stake_amount: stakeAmount,
      duration_days: durationDays,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    });

    if (error) {
      console.error("Error creating habit:", error);
      return { success: false, error: error.message };
    }

    await fetchHabits();
    return { success: true };
  };

  const completeHabit = async (habitId: string) => {
    if (!user) return { success: false };

    // Check if already completed today
    const today = new Date().toISOString().split("T")[0];
    const { data: existingLog } = await supabase
      .from("habit_logs")
      .select("id")
      .eq("habit_id", habitId)
      .eq("user_id", user.id)
      .gte("completed_at", `${today}T00:00:00`)
      .lt("completed_at", `${today}T23:59:59`)
      .maybeSingle();

    if (existingLog) {
      return { success: false, error: "Already completed today" };
    }

    // Add log
    const { error: logError } = await supabase.from("habit_logs").insert({
      habit_id: habitId,
      user_id: user.id,
    });

    if (logError) {
      return { success: false, error: logError.message };
    }

    // Update streak
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      const newStreak = habit.current_streak + 1;
      const { error: updateError } = await supabase
        .from("habits")
        .update({
          current_streak: newStreak,
          best_streak: Math.max(newStreak, habit.best_streak),
        })
        .eq("id", habitId);

      if (updateError) {
        console.error("Error updating streak:", updateError);
      }
    }

    await fetchHabits();
    return { success: true };
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return { success: false };

    const { error } = await supabase
      .from("habits")
      .delete()
      .eq("id", habitId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    await fetchHabits();
    return { success: true };
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchHabits();
      setLoading(false);
    };

    if (user) {
      load();
    }
  }, [user]);

  return { habits, loading, createHabit, completeHabit, deleteHabit, refetch: fetchHabits };
};
