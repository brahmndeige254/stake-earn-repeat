import { useState } from "react";
import { Bell, BellOff, Clock, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { Habit } from "@/hooks/useHabits";

interface NotificationSettingsProps {
  habits: Habit[];
}

const NotificationSettings = ({ habits }: NotificationSettingsProps) => {
  const { permission, isSupported, requestPermission, sendImmediateReminder } =
    useNotifications();
  const { toast } = useToast();
  const [reminderTime, setReminderTime] = useState("20:00");
  const [loading, setLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setLoading(true);
    const granted = await requestPermission();
    setLoading(false);

    if (granted) {
      toast({
        title: "Notifications enabled! 🔔",
        description: "You'll receive habit reminders at your scheduled time.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Enable notifications in your browser settings.",
      });
    }
  };

  const handleTestNotification = () => {
    sendImmediateReminder(habits);
    toast({
      title: "Test notification sent!",
      description: "Check your notifications.",
    });
  };

  if (!isSupported) {
    return (
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <BellOff className="h-5 w-5" />
          <span className="text-sm">
            Notifications are not supported in this browser.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Notification Settings</h3>
      </div>

      <div className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="notifications-enabled">Push Notifications</Label>
            {permission === "granted" && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Enabled
              </span>
            )}
          </div>
          {permission === "granted" ? (
            <Switch id="notifications-enabled" checked disabled />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnableNotifications}
              disabled={loading}
            >
              {loading ? "Enabling..." : "Enable"}
            </Button>
          )}
        </div>

        {/* Reminder Time */}
        {permission === "granted" && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label>Daily Reminder Time</Label>
              </div>
              <Select value={reminderTime} onValueChange={setReminderTime}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="19:00">7:00 PM</SelectItem>
                  <SelectItem value="20:00">8:00 PM</SelectItem>
                  <SelectItem value="21:00">9:00 PM</SelectItem>
                  <SelectItem value="22:00">10:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Test Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleTestNotification}
            >
              <TestTube className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          {permission === "granted"
            ? "You'll be reminded about incomplete habits at your scheduled time."
            : "Enable notifications to receive daily reminders about pending habits."}
        </p>
      </div>
    </div>
  );
};

export default NotificationSettings;
