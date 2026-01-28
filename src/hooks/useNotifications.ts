import { useState, useEffect, useCallback } from "react";
import { Habit } from "./useHabits";

interface NotificationState {
  permission: NotificationPermission | "unsupported";
  isSupported: boolean;
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    permission: "default",
    isSupported: false,
  });

  useEffect(() => {
    const isSupported = "Notification" in window;
    setState({
      permission: isSupported ? Notification.permission : "unsupported",
      isSupported,
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.log("Notifications not supported");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [state.isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!state.isSupported || state.permission !== "granted") {
        return null;
      }

      try {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });
        return notification;
      } catch (error) {
        console.error("Error sending notification:", error);
        return null;
      }
    },
    [state.isSupported, state.permission]
  );

  const scheduleHabitReminder = useCallback(
    (habits: Habit[], reminderHour: number = 20) => {
      if (!state.isSupported || state.permission !== "granted") {
        return null;
      }

      const incompleteHabits = habits.filter(
        (h) => h.is_active && !h.is_completed && !h.completedToday
      );

      if (incompleteHabits.length === 0) {
        return null;
      }

      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(reminderHour, 0, 0, 0);

      // If reminder time has passed, schedule for tomorrow
      if (now >= reminderTime) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      const timeoutId = setTimeout(() => {
        const habitNames = incompleteHabits
          .slice(0, 3)
          .map((h) => h.name)
          .join(", ");
        const moreText =
          incompleteHabits.length > 3
            ? ` and ${incompleteHabits.length - 3} more`
            : "";

        sendNotification("⏰ Don't lose your streak!", {
          body: `You have ${incompleteHabits.length} pending habit${incompleteHabits.length > 1 ? "s" : ""}: ${habitNames}${moreText}. Complete them before midnight!`,
          tag: "habit-reminder",
          requireInteraction: true,
        });
      }, timeUntilReminder);

      return timeoutId;
    },
    [state.isSupported, state.permission, sendNotification]
  );

  const sendImmediateReminder = useCallback(
    (habits: Habit[]) => {
      const incompleteHabits = habits.filter(
        (h) => h.is_active && !h.is_completed && !h.completedToday
      );

      if (incompleteHabits.length === 0) {
        return sendNotification("🎉 All done!", {
          body: "You've completed all your habits for today. Great job!",
          tag: "habit-complete",
        });
      }

      const totalStake = incompleteHabits.reduce(
        (acc, h) => acc + h.stake_amount,
        0
      );
      const habitNames = incompleteHabits
        .slice(0, 3)
        .map((h) => h.name)
        .join(", ");

      return sendNotification(
        `🔥 ${incompleteHabits.length} habit${incompleteHabits.length > 1 ? "s" : ""} pending`,
        {
          body: `KSH ${totalStake.toLocaleString()} at stake! Complete: ${habitNames}`,
          tag: "habit-reminder",
        }
      );
    },
    [sendNotification]
  );

  return {
    permission: state.permission,
    isSupported: state.isSupported,
    requestPermission,
    sendNotification,
    scheduleHabitReminder,
    sendImmediateReminder,
  };
};
