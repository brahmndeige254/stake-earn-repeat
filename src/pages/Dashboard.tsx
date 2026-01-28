import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { useHabits, Habit } from "@/hooks/useHabits";
import { useSponsoredHabits } from "@/hooks/useSponsoredHabits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  LogOut,
  Plus,
  Wallet,
  TrendingUp,
  Trophy,
  Flame,
  CheckCircle2,
  Circle,
  DollarSign,
  Clock,
  Trash2,
  Star,
  Banknote,
} from "lucide-react";
import CreateHabitModal from "@/components/dashboard/CreateHabitModal";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
import ActivityLog from "@/components/dashboard/ActivityLog";

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { wallet, transactions, loading: walletLoading, updateBalance } = useWallet();
  const { habits, loading: habitsLoading, completeHabit, deleteHabit, refetch: refetchHabits } = useHabits();
  const { sponsoredHabits } = useSponsoredHabits();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleComplete = async (habit: Habit) => {
    if (habit.completedToday) {
      toast({
        title: "Already completed",
        description: "You've already checked in this habit today!",
      });
      return;
    }

    const result = await completeHabit(habit.id);
    if (result.success) {
      // Check if habit was fully completed
      if (result.habitCompleted && result.reward) {
        // Credit reward to wallet (stake + 20% bonus)
        await updateBalance(result.reward, "reward", `Completed habit: ${habit.name} - Stake returned + 20% bonus!`, habit.id);
        toast({
          title: "🎉 Habit Completed! You earned KSH " + result.reward.toLocaleString() + "!",
          description: `Congratulations! You've completed "${habit.name}" and earned your stake back plus a 20% bonus!`,
        });
      } else {
        toast({
          title: "Habit completed! 🎉",
          description: `You're on a ${habit.current_streak + 1} day streak! ${habit.duration_days - habit.current_streak - 1} days to go!`,
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to complete habit",
      });
    }
  };

  const handleDelete = async (habitId: string, habitName: string, stakeAmount: number) => {
    const result = await deleteHabit(habitId);
    if (result.success) {
      // Refund stake to wallet
      await updateBalance(stakeAmount, "withdrawal", `Refund from deleted habit: ${habitName}`);
      toast({
        title: "Habit deleted",
        description: `Stake of KSH ${stakeAmount} has been refunded to your wallet.`,
      });
    }
  };

  const handleHabitCreated = async (stakeAmount: number, habitName: string) => {
    // Deduct stake from wallet
    const result = await updateBalance(-stakeAmount, "stake", `Stake for habit: ${habitName}`);
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Insufficient funds",
        description: "You don't have enough balance to stake this amount.",
      });
      return false;
    }
    return true;
  };

  const handleWithdraw = async (amount: number) => {
    const result = await updateBalance(-amount, "withdrawal", `M-Pesa withdrawal`);
    return result.success;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getProgress = (habit: Habit) => {
    const daysLeft = getDaysLeft(habit.end_date);
    return ((habit.duration_days - daysLeft) / habit.duration_days) * 100;
  };

  if (authLoading || walletLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full gradient-money animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const activeHabits = habits.filter((h) => h.is_active && !h.is_completed);
  const completedHabits = habits.filter((h) => h.is_completed);
  const completedToday = activeHabits.filter((h) => h.completedToday).length;
  const totalStaked = activeHabits.reduce((acc, h) => acc + h.stake_amount, 0);
  const bestStreak = Math.max(...habits.map((h) => h.best_streak), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-money">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">StakeHabit</span>
            </a>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-display font-bold">KSH {wallet?.balance.toFixed(0) || "0"}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-warning" />
              <span className="text-sm text-muted-foreground">Balance</span>
            </div>
            <span className="number-display text-2xl font-bold">KSH {wallet?.balance.toFixed(0) || "0"}</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => setShowWithdrawModal(true)}
              disabled={!wallet || wallet.balance < 100}
            >
              <Banknote className="h-3 w-3 mr-1" />
              Withdraw
            </Button>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Earned</span>
            </div>
            <span className="number-display text-2xl font-bold text-primary">KSH {wallet?.total_earned.toFixed(0) || "0"}</span>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
            <span className="number-display text-2xl font-bold">{completedToday}/{activeHabits.length}</span>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Best Streak</span>
            </div>
            <span className="number-display text-2xl font-bold">{bestStreak}</span>
          </div>
        </div>

        {/* Habits Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">Your Habits</h2>
            <Button variant="hero" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>

          {activeHabits.length === 0 && completedHabits.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-6">Create your first habit and put some money on the line!</p>
              <Button variant="hero" onClick={() => setShowCreateModal(true)}>
                Create Your First Habit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Habits */}
              {activeHabits.map((habit) => (
                <div
                  key={habit.id}
                  className={`glass-card rounded-xl p-4 transition-all duration-300 ${
                    habit.completedToday ? "border-primary/30 bg-primary/5" : "hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleComplete(habit)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        habit.completedToday
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      {habit.completedToday ? (
                        <CheckCircle2 className="h-7 w-7" />
                      ) : (
                        <Circle className="h-7 w-7" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4
                          className={`font-semibold truncate ${
                            habit.completedToday ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {habit.name}
                        </h4>
                        <div className="flex items-center gap-1 text-destructive">
                          <Flame className="h-3.5 w-3.5" />
                          <span className="text-sm font-medium">{habit.current_streak}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>KSH {habit.stake_amount.toFixed(0)} staked</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{getDaysLeft(habit.end_date)} days left</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={getProgress(habit)} className="h-1.5" />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(habit.id, habit.name, habit.stake_amount)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Completed Habits Section */}
              {completedHabits.length > 0 && (
                <>
                  <div className="pt-4 border-t border-border/50">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      Completed Habits ({completedHabits.length})
                    </h3>
                  </div>
                  {completedHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="glass-card rounded-xl p-4 bg-primary/5 border-primary/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold truncate text-primary">{habit.name}</h4>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              Completed
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>🔥 {habit.best_streak} day streak</span>
                            <span>💰 Earned KSH {(habit.stake_amount * 1.2).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Activity Log and Sponsored Habits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Log */}
          <div className="lg:col-span-1">
            <ActivityLog transactions={transactions} loading={walletLoading} />
          </div>

          {/* Sponsored Habits */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold mb-6">Sponsored Challenges</h2>
          <h2 className="font-display text-2xl font-bold mb-6">Sponsored Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsoredHabits.slice(0, 3).map((habit) => (
              <div key={habit.id} className="glass-card rounded-xl overflow-hidden hover-lift">
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                      {habit.brand_logo}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sponsored by</p>
                      <p className="font-semibold text-sm">{habit.brand_name}</p>
                    </div>
                  </div>
                  <h3 className="font-display font-bold mb-1">{habit.title}</h3>
                  <p className="text-muted-foreground text-sm">{habit.description}</p>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="number-display text-xl font-bold text-primary">KSH {habit.reward_amount}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{habit.participants_count.toLocaleString()} joined</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      <span className="text-sm font-medium">{habit.rating}</span>
                    </div>
                    <Button size="sm" variant="hero" className="mt-2">
                      Join
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </main>

      <CreateHabitModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleHabitCreated}
        walletBalance={wallet?.balance || 0}
      />

      <WithdrawModal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={wallet?.balance || 0}
        onWithdraw={handleWithdraw}
      />
    </div>
  );
};

export default Dashboard;
