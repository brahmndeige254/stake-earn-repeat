import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  DollarSign, 
  Plus, 
  TrendingUp,
  Clock,
  Trophy,
  Wallet
} from "lucide-react";

const mockHabits = [
  {
    id: 1,
    name: "Morning Meditation",
    stake: 50,
    streak: 12,
    completed: true,
    daysLeft: 18,
    totalDays: 30,
  },
  {
    id: 2,
    name: "Read 30 minutes",
    stake: 25,
    streak: 7,
    completed: false,
    daysLeft: 23,
    totalDays: 30,
  },
  {
    id: 3,
    name: "No social media before noon",
    stake: 100,
    streak: 4,
    completed: false,
    daysLeft: 26,
    totalDays: 30,
  },
  {
    id: 4,
    name: "Gym workout",
    stake: 75,
    streak: 15,
    completed: true,
    daysLeft: 15,
    totalDays: 30,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const totalStaked = mockHabits.reduce((acc, h) => acc + h.stake, 0);
  const completedToday = mockHabits.filter(h => h.completed).length;
  const totalEarned = 847;

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-2 block">
            Live Preview
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Your <span className="text-gradient-money">dashboard</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Track your habits, see your stakes, and watch your earnings grow.
          </p>
        </div>

        {/* Dashboard Mock */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl overflow-hidden border border-border/50">
            {/* Top Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-secondary/30 border-b border-border/50">
              <div className="text-center p-4 rounded-xl bg-background/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-warning" />
                  <span className="number-display text-2xl font-bold">${totalStaked}</span>
                </div>
                <p className="text-xs text-muted-foreground">Total Staked</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="number-display text-2xl font-bold text-primary">${totalEarned}</span>
                </div>
                <p className="text-xs text-muted-foreground">Total Earned</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="number-display text-2xl font-bold">{completedToday}/{mockHabits.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Today's Progress</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-background/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="h-4 w-4 text-destructive" />
                  <span className="number-display text-2xl font-bold">15</span>
                </div>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>

            {/* Habits List */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold">Today's Habits</h3>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Habit
                </Button>
              </div>

              <div className="space-y-4">
                {mockHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      habit.completed 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-secondary/50 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        habit.completed ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {habit.completed ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className={`font-semibold truncate ${
                            habit.completed ? "line-through text-muted-foreground" : ""
                          }`}>
                            {habit.name}
                          </h4>
                          <div className="flex items-center gap-1 text-destructive">
                            <Flame className="h-3.5 w-3.5" />
                            <span className="text-sm font-medium">{habit.streak}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>${habit.stake} staked</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{habit.daysLeft} days left</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress 
                            value={((habit.totalDays - habit.daysLeft) / habit.totalDays) * 100} 
                            className="h-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 text-center">
                <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
                  Create Your Account
                </Button>
                <p className="text-sm text-muted-foreground mt-3">Get $100 free to start staking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
