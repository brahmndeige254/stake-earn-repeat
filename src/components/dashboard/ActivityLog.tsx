import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Coins, 
  Trophy, 
  XCircle,
  Clock,
  Banknote
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

interface ActivityLogProps {
  transactions: Transaction[];
  loading?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "deposit":
      return <ArrowDownCircle className="h-4 w-4 text-primary" />;
    case "withdrawal":
      return <Banknote className="h-4 w-4 text-warning" />;
    case "stake":
      return <Coins className="h-4 w-4 text-orange-500" />;
    case "reward":
      return <Trophy className="h-4 w-4 text-primary" />;
    case "loss":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getActivityLabel = (type: string) => {
  switch (type) {
    case "deposit":
      return "Deposit";
    case "withdrawal":
      return "Withdrawal";
    case "stake":
      return "Habit Stake";
    case "reward":
      return "Reward Earned";
    case "loss":
      return "Stake Lost";
    default:
      return "Transaction";
  }
};

const getActivityColor = (type: string, amount: number) => {
  if (amount > 0) return "text-primary";
  if (type === "loss") return "text-destructive";
  return "text-muted-foreground";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
  });
};

const ActivityLog = ({ transactions, loading }: ActivityLogProps) => {
  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-display text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-secondary rounded" />
                <div className="h-2 w-32 bg-secondary rounded" />
              </div>
              <div className="h-4 w-16 bg-secondary rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-display text-lg font-bold mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No activity yet</p>
          <p className="text-muted-foreground text-xs mt-1">
            Create a habit to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-display text-lg font-bold mb-4">Recent Activity</h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                {getActivityIcon(tx.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{getActivityLabel(tx.type)}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {tx.description || "No description"}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${getActivityColor(tx.type, tx.amount)}`}>
                  {tx.amount > 0 ? "+" : ""}KSH {Math.abs(tx.amount).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ActivityLog;
