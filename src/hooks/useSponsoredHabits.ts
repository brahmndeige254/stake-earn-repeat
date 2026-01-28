import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SponsoredHabit {
  id: string;
  brand_name: string;
  brand_logo: string | null;
  title: string;
  description: string | null;
  reward_amount: number;
  duration_days: number;
  participants_count: number;
  rating: number;
  is_active: boolean;
}

export const useSponsoredHabits = () => {
  const [sponsoredHabits, setSponsoredHabits] = useState<SponsoredHabit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSponsoredHabits = async () => {
    const { data, error } = await supabase
      .from("sponsored_habits")
      .select("*")
      .eq("is_active", true)
      .order("participants_count", { ascending: false });

    if (error) {
      console.error("Error fetching sponsored habits:", error);
      return;
    }

    setSponsoredHabits(
      (data || []).map((h) => ({
        ...h,
        reward_amount: Number(h.reward_amount),
        rating: Number(h.rating),
      }))
    );
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchSponsoredHabits();
      setLoading(false);
    };
    load();
  }, []);

  return { sponsoredHabits, loading, refetch: fetchSponsoredHabits };
};
