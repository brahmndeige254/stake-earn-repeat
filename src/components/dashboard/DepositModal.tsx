import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mpesaPhone: string | null;
  onSuccess: () => void;
}

type DepositStep = "amount" | "processing" | "success" | "failed";

const DepositModal = ({ open, onOpenChange, mpesaPhone, onSuccess }: DepositModalProps) => {
  const [step, setStep] = useState<DepositStep>("amount");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState(mpesaPhone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const formatPhone = (phoneNumber: string) => {
    let formatted = phoneNumber.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    if (formatted.startsWith("0")) {
      formatted = "254" + formatted.substring(1);
    }
    if (!formatted.startsWith("254")) {
      formatted = "254" + formatted;
    }
    return formatted;
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < 10) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Minimum deposit is KSH 10",
      });
      return;
    }

    if (!phone || phone.length < 9) {
      toast({
        variant: "destructive",
        title: "Invalid phone number",
        description: "Please enter a valid M-Pesa phone number",
      });
      return;
    }

    setLoading(true);
    setStep("processing");
    setError(null);

    try {
      const formattedPhone = formatPhone(phone);
      
      const { data, error: fnError } = await supabase.functions.invoke("mpesa-stk-push", {
        body: {
          phone: formattedPhone,
          amount: depositAmount,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.success) {
        setStep("success");
        toast({
          title: "STK Push Sent!",
          description: "Check your phone and enter your M-Pesa PIN to complete the deposit.",
        });
        // Poll for confirmation or wait
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          resetModal();
        }, 5000);
      } else {
        throw new Error(data?.error || "Failed to initiate deposit");
      }
    } catch (err) {
      console.error("Deposit error:", err);
      setError(err instanceof Error ? err.message : "Deposit failed");
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep("amount");
    setAmount("");
    setError(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetModal();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === "amount" && "Deposit via M-Pesa"}
            {step === "processing" && "Processing..."}
            {step === "success" && "Check Your Phone"}
            {step === "failed" && "Deposit Failed"}
          </DialogTitle>
          <DialogDescription>
            {step === "amount" && "Enter amount and confirm your M-Pesa number"}
            {step === "processing" && "Sending STK push to your phone"}
            {step === "success" && "Enter your M-Pesa PIN to complete"}
            {step === "failed" && "Something went wrong"}
          </DialogDescription>
        </DialogHeader>

        {step === "amount" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="0712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Format: 07XXXXXXXX or 254XXXXXXXXX
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KSH)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={10}
                step={10}
              />
              <p className="text-xs text-muted-foreground">
                Minimum: KSH 10
              </p>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 5000].map((amt) => (
                <Button
                  key={amt}
                  variant={amount === String(amt) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(String(amt))}
                >
                  {amt}
                </Button>
              ))}
            </div>

            <Button
              variant="hero"
              className="w-full"
              onClick={handleDeposit}
              disabled={!amount || !phone}
            >
              Deposit KSH {amount || "0"}
            </Button>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Sending payment request to your phone...
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <p className="font-medium mb-2">STK Push Sent!</p>
            <p className="text-sm text-muted-foreground">
              Check your phone and enter your M-Pesa PIN to complete the deposit.
              Your balance will update automatically.
            </p>
          </div>
        )}

        {step === "failed" && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="font-medium mb-2">Deposit Failed</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={resetModal}>
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
