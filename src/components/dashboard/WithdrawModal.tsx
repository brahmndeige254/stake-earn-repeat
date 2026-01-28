import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Phone, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  walletBalance: number;
  onWithdraw: (amount: number) => Promise<boolean>;
}

const mpesaPhoneSchema = z.string().regex(
  /^(?:254|\+254|0)?([17][0-9]{8})$/,
  "Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)"
);

const WithdrawModal = ({ open, onClose, walletBalance, onWithdraw }: WithdrawModalProps) => {
  const [amount, setAmount] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "amount" | "confirm">("phone");
  const [errors, setErrors] = useState<{ phone?: string; amount?: string }>({});
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchSavedPhone();
    }
  }, [open, user]);

  const fetchSavedPhone = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("mpesa_phone")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data?.mpesa_phone) {
      setSavedPhone(data.mpesa_phone);
      setMpesaPhone(data.mpesa_phone);
      setStep("amount");
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");
    
    // Convert to 254 format
    if (digits.startsWith("0")) {
      return "254" + digits.slice(1);
    } else if (digits.startsWith("254")) {
      return digits;
    } else if (digits.length === 9) {
      return "254" + digits;
    }
    return digits;
  };

  const validatePhone = () => {
    const result = mpesaPhoneSchema.safeParse(mpesaPhone);
    if (!result.success) {
      setErrors({ phone: result.error.errors[0].message });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSavePhone = async () => {
    if (!validatePhone() || !user) return;
    
    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(mpesaPhone);
    
    const { error } = await supabase
      .from("profiles")
      .update({ mpesa_phone: formattedPhone })
      .eq("user_id", user.id);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save M-Pesa number. Please try again.",
      });
    } else {
      setSavedPhone(formattedPhone);
      setMpesaPhone(formattedPhone);
      setStep("amount");
      toast({
        title: "M-Pesa number saved! ✓",
        description: "Your withdrawals will be sent to this number.",
      });
    }
    
    setIsLoading(false);
  };

  const handleAmountSubmit = () => {
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setErrors({ amount: "Please enter a valid amount" });
      return;
    }
    
    if (withdrawAmount < 100) {
      setErrors({ amount: "Minimum withdrawal is KSH 100" });
      return;
    }
    
    if (withdrawAmount > walletBalance) {
      setErrors({ amount: `Insufficient balance. You have KSH ${walletBalance.toFixed(0)}` });
      return;
    }
    
    setErrors({});
    setStep("confirm");
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    
    const withdrawAmount = parseFloat(amount);
    const success = await onWithdraw(withdrawAmount);
    
    if (success) {
      toast({
        title: "Withdrawal initiated! 💸",
        description: `KSH ${withdrawAmount.toLocaleString()} will be sent to your M-Pesa (${savedPhone}) shortly.`,
      });
      setAmount("");
      setStep("amount");
      onClose();
    } else {
      toast({
        variant: "destructive",
        title: "Withdrawal failed",
        description: "Please try again or contact support.",
      });
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setStep(savedPhone ? "amount" : "phone");
    setAmount("");
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Withdraw to M-Pesa
          </DialogTitle>
          <DialogDescription>
            {step === "phone" && "Add your M-Pesa number for secure withdrawals."}
            {step === "amount" && "Enter the amount you want to withdraw."}
            {step === "confirm" && "Confirm your withdrawal details."}
          </DialogDescription>
        </DialogHeader>

        {step === "phone" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mpesa-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                M-Pesa Phone Number
              </Label>
              <Input
                id="mpesa-phone"
                type="tel"
                placeholder="e.g., 0712345678"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                className="bg-secondary border-border"
              />
              {errors.phone && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter your Safaricom M-Pesa registered number
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={handleSavePhone}
                className="flex-1"
                disabled={isLoading || !mpesaPhone}
              >
                {isLoading ? "Saving..." : "Save Number"}
              </Button>
            </div>
          </div>
        )}

        {step === "amount" && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/50 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm">Sending to: <span className="font-medium">{savedPhone}</span></span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-xs"
                onClick={() => setStep("phone")}
              >
                Change
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-warning" />
                Withdrawal Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  KSH
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-secondary border-border pl-14 text-lg font-bold"
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amount}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Available balance: KSH {walletBalance.toFixed(0)} • Minimum: KSH 100
              </p>
            </div>

            <div className="flex gap-2">
              {[1000, 2500, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground transition-all"
                  disabled={preset > walletBalance}
                >
                  KSH {preset.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={handleAmountSubmit}
                className="flex-1"
                disabled={!amount}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-lg">KSH {parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">M-Pesa Number</span>
                <span className="font-medium">{savedPhone}</span>
              </div>
              <div className="border-t border-primary/20 pt-3 flex justify-between items-center">
                <span className="text-muted-foreground">You'll receive</span>
                <span className="font-bold text-xl text-primary">KSH {parseFloat(amount).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Funds will be sent to your M-Pesa within 1-5 minutes
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("amount")} className="flex-1">
                Back
              </Button>
              <Button
                variant="hero"
                onClick={handleWithdraw}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Confirm Withdrawal"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
