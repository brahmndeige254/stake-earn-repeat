import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Save,
  Wallet,
  TrendingUp,
  Trophy,
  Flame,
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  mpesa_phone: string | null;
  avatar_url: string | null;
}

interface WalletData {
  balance: number;
  total_earned: number;
  total_staked: number;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [bestStreak, setBestStreak] = useState(0);
  const [habitsCompleted, setHabitsCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username || "");
        setMpesaPhone(profileData.mpesa_phone || "");
      }

      // Fetch wallet
      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance, total_earned, total_staked")
        .eq("user_id", user.id)
        .single();

      if (walletData) {
        setWallet(walletData);
      }

      // Fetch habits stats
      const { data: habitsData } = await supabase
        .from("habits")
        .select("best_streak, is_completed")
        .eq("user_id", user.id);

      if (habitsData) {
        const maxStreak = Math.max(...habitsData.map((h) => h.best_streak), 0);
        const completed = habitsData.filter((h) => h.is_completed).length;
        setBestStreak(maxStreak);
        setHabitsCompleted(completed);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        username: username || null,
        mpesa_phone: mpesaPhone || null,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } else {
      toast({
        title: "Profile updated! ✓",
        description: "Your changes have been saved.",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full gradient-money animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <a href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-money">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-bold">StakeHabit</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-8">Your Profile</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-4 text-center">
            <Wallet className="h-5 w-5 text-warning mx-auto mb-2" />
            <span className="number-display text-xl font-bold block">
              KSH {wallet?.balance.toFixed(0) || "0"}
            </span>
            <span className="text-xs text-muted-foreground">Balance</span>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
            <span className="number-display text-xl font-bold text-primary block">
              KSH {wallet?.total_earned.toFixed(0) || "0"}
            </span>
            <span className="text-xs text-muted-foreground">Total Earned</span>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Trophy className="h-5 w-5 text-primary mx-auto mb-2" />
            <span className="number-display text-xl font-bold block">
              {habitsCompleted}
            </span>
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Flame className="h-5 w-5 text-destructive mx-auto mb-2" />
            <span className="number-display text-xl font-bold block">
              {bestStreak}
            </span>
            <span className="text-xs text-muted-foreground">Best Streak</span>
          </div>
        </div>

        {/* Profile Form */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">
                {username || "Set your username"}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-secondary"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* M-Pesa Phone */}
            <div className="space-y-2">
              <Label htmlFor="mpesa" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                M-Pesa Phone Number
              </Label>
              <Input
                id="mpesa"
                placeholder="e.g. 0712345678"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Used for withdrawals. Format: 07XXXXXXXX or 254XXXXXXXXX
              </p>
            </div>

            <Button
              variant="hero"
              className="w-full mt-6"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
