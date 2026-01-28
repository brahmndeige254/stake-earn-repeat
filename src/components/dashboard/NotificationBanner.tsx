import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

interface NotificationBannerProps {
  onPermissionGranted?: () => void;
}

const NotificationBanner = ({ onPermissionGranted }: NotificationBannerProps) => {
  const { permission, isSupported, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if banner was previously dismissed
  useEffect(() => {
    const wasDismissed = localStorage.getItem("notification-banner-dismissed");
    if (wasDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    const granted = await requestPermission();
    setLoading(false);

    if (granted) {
      toast({
        title: "Notifications enabled! 🔔",
        description: "You'll receive reminders for pending habits before the day ends.",
      });
      onPermissionGranted?.();
      setDismissed(true);
    } else {
      toast({
        variant: "destructive",
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings to receive reminders.",
      });
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("notification-banner-dismissed", "true");
  };

  // Don't show if not supported, already granted, or dismissed
  if (!isSupported || permission === "granted" || dismissed) {
    return null;
  }

  return (
    <div className="glass-card rounded-xl p-4 mb-6 border-primary/20 bg-primary/5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1">Never miss a habit!</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Enable notifications to get reminded about pending habits before the day ends.
            Protect your stake and keep your streaks alive!
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="hero"
              size="sm"
              onClick={handleEnableNotifications}
              disabled={loading}
            >
              {loading ? (
                "Enabling..."
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Reminders
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <BellOff className="h-4 w-4 mr-2" />
              Not now
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NotificationBanner;
