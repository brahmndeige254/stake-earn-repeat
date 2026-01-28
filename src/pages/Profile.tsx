import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
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
  Banknote,
  ArrowDownCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  mpesa_phone: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bestStreak, setBestStreak] = useState(0);
  const [habitsCompleted, setHabitsCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { wallet, transactions, loading: walletLoading, updateBalance } = useWallet();

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

  const handleWithdraw = async (amount: number): Promise<boolean> => {
    const result = await updateBalance(
      -amount,
      "withdrawal",
      `M-Pesa withdrawal to ${mpesaPhone || profile?.mpesa_phone}`
    );
    return result.success;
  };

  // Filter withdrawal transactions
  const withdrawalTransactions = transactions.filter((t) => t.type === "withdrawal");

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

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        <h1 className="font-display text-3xl font-bold">Your Profile</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Withdrawals Section */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">M-Pesa Withdrawals</h2>
                <p className="text-sm text-muted-foreground">
                  Withdraw your earnings to M-Pesa
                </p>
              </div>
            </div>
            <Button
              variant="hero"
              onClick={() => setWithdrawOpen(true)}
              disabled={!wallet || wallet.balance < 100}
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>

          {/* Registered M-Pesa Number */}
          <div className="p-4 rounded-lg bg-secondary/50 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Registered M-Pesa Number</p>
                  <p className="font-medium text-lg">
                    {profile?.mpesa_phone || mpesaPhone || "Not set"}
                  </p>
                </div>
              </div>
              {!profile?.mpesa_phone && !mpesaPhone && (
                <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded">
                  Required for withdrawals
                </span>
              )}
            </div>
          </div>

          {/* Withdrawal History */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Withdrawals
            </h3>
            {withdrawalTransactions.length > 0 ? (
              <div className="space-y-2">
                {withdrawalTransactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div>
                      <p className="text-sm font-medium">M-Pesa Withdrawal</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <span className="font-bold text-destructive">
                      -KSH {Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No withdrawals yet. Complete habits to earn rewards!
              </p>
            )}
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

      {/* Withdraw Modal */}
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        walletBalance={wallet?.balance || 0}
        onWithdraw={handleWithdraw}
      />
    </div>
  );
};

export default Profile;
