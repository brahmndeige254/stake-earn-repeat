import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Wallet {
  id: string;
  balance: number;
  total_earned: number;
  total_staked: number;
  total_lost: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (!error && data) {
      setWallet({
        ...data,
        balance: Number(data.balance),
        total_earned: Number(data.total_earned),
        total_staked: Number(data.total_staked),
        total_lost: Number(data.total_lost),
      });
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setTransactions(data.map(t => ({
        ...t,
        amount: Number(t.amount),
      })));
    }
  };

  const updateBalance = async (amount: number, type: 'deposit' | 'withdrawal' | 'stake' | 'reward' | 'loss', description: string, habitId?: string) => {
    if (!user || !wallet) return { success: false };
    
    const newBalance = wallet.balance + amount;
    if (newBalance < 0) return { success: false, error: "Insufficient balance" };

    const updates: Partial<Wallet> = { balance: newBalance };
    
    if (type === 'stake') {
      updates.total_staked = wallet.total_staked + Math.abs(amount);
    } else if (type === 'reward') {
      updates.total_earned = wallet.total_earned + amount;
    } else if (type === 'loss') {
      updates.total_lost = wallet.total_lost + Math.abs(amount);
    }

    const { error: walletError } = await supabase
      .from("wallets")
      .update(updates)
      .eq("user_id", user.id);
    
    if (walletError) return { success: false, error: walletError.message };

    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        habit_id: habitId || null,
        type,
        amount,
        description,
      });
    
    if (txError) return { success: false, error: txError.message };

    await fetchWallet();
    await fetchTransactions();
    return { success: true };
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchWallet();
      await fetchTransactions();
      setLoading(false);
    };
    
    if (user) {
      load();
    }
  }, [user]);

  return { wallet, transactions, loading, updateBalance, refetch: fetchWallet };
};
