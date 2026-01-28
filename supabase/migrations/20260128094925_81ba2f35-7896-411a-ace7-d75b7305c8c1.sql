-- Add mpesa_phone column to profiles for M-Pesa withdrawals
ALTER TABLE public.profiles ADD COLUMN mpesa_phone TEXT;

-- Update the handle_new_user function to give 10000 KSH starting balance instead of $100
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 10000.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update sponsored habits rewards to KSH values
UPDATE public.sponsored_habits SET reward_amount = 2500.00 WHERE brand_name = 'FitBrew';
UPDATE public.sponsored_habits SET reward_amount = 5000.00 WHERE brand_name = 'ZenMind';
UPDATE public.sponsored_habits SET reward_amount = 7500.00 WHERE brand_name = 'StepUp';
UPDATE public.sponsored_habits SET reward_amount = 4000.00 WHERE brand_name = 'ReadMore';
UPDATE public.sponsored_habits SET reward_amount = 3500.00 WHERE brand_name = 'EarlyBird';