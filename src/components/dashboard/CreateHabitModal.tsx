import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHabits } from "@/hooks/useHabits";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Calendar, Target } from "lucide-react";

interface CreateHabitModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (stakeAmount: number, habitName: string) => Promise<boolean>;
  walletBalance: number;
}

const stakeOptions = [5, 10, 25, 50, 100];
const durationOptions = [
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 21, label: "3 weeks" },
  { value: 30, label: "30 days" },
];

const CreateHabitModal = ({ open, onClose, onCreated, walletBalance }: CreateHabitModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stakeAmount, setStakeAmount] = useState(25);
  const [duration, setDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  
  const { createHabit } = useHabits();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter a name for your habit.",
      });
      return;
    }

    if (stakeAmount > walletBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: `You need $${stakeAmount} but only have $${walletBalance.toFixed(2)}.`,
      });
      return;
    }

    setIsLoading(true);
    
    // First deduct from wallet
    const walletSuccess = await onCreated(stakeAmount, name);
    if (!walletSuccess) {
      setIsLoading(false);
      return;
    }

    // Then create the habit
    const result = await createHabit(name, description, stakeAmount, duration);
    
    if (result.success) {
      toast({
        title: "Habit created! 💪",
        description: `You've staked $${stakeAmount} on "${name}". Let's do this!`,
      });
      setName("");
      setDescription("");
      setStakeAmount(25);
      setDuration(30);
      onClose();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to create habit",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create New Habit</DialogTitle>
          <DialogDescription>
            Put money on the line and make your habit stick.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="habit-name" className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Habit Name
            </Label>
            <Input
              id="habit-name"
              placeholder="e.g., Morning meditation, Read 30 minutes..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="habit-description">Description (optional)</Label>
            <Textarea
              id="habit-description"
              placeholder="What's your goal? Any specific rules?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary border-border resize-none"
              rows={2}
            />
          </div>

          {/* Stake Amount */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-warning" />
              Stake Amount
            </Label>
            <div className="flex gap-2">
              {stakeOptions.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setStakeAmount(amount)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    stakeAmount === amount
                      ? "gradient-money text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Balance: ${walletBalance.toFixed(2)}
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Duration
            </Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {durationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-sm text-center">
              You're staking <span className="font-bold text-primary">${stakeAmount}</span> that you'll complete this habit daily for{" "}
              <span className="font-bold">{duration} days</span>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={isLoading || stakeAmount > walletBalance}
            >
              {isLoading ? "Creating..." : "Stake & Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateHabitModal;
