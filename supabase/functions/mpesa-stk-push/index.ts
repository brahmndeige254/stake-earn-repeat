import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface STKPushRequest {
  phone: string;
  amount: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User verification failed:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { phone, amount }: STKPushRequest = await req.json();
    console.log(`STK Push request - Phone: ${phone}, Amount: ${amount}, User: ${user.id}`);

    // Validate inputs
    if (!phone || !amount) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone and amount are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (amount < 10) {
      return new Response(
        JSON.stringify({ success: false, error: "Minimum deposit is KSH 10" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get M-Pesa credentials from environment
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const passkey = Deno.env.get("MPESA_PASSKEY");
    const shortcode = Deno.env.get("MPESA_SHORTCODE") || "174379"; // Sandbox default
    const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL");

    // Check if M-Pesa is configured
    if (!consumerKey || !consumerSecret || !passkey) {
      console.log("M-Pesa not configured - simulating deposit for demo");
      
      // Demo mode: directly credit the wallet
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (wallet) {
        const newBalance = wallet.balance + amount;
        
        await supabase
          .from("wallets")
          .update({ balance: newBalance })
          .eq("user_id", user.id);

        await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            type: "deposit",
            amount: amount,
            description: `M-Pesa deposit (Demo) - ${phone}`,
          });

        console.log(`Demo deposit successful - Credited KSH ${amount} to user ${user.id}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          demo: true,
          message: "Demo deposit credited to your wallet",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Production mode: Call Daraja API
    // Step 1: Get OAuth token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      console.error("Failed to get M-Pesa token:", await tokenResponse.text());
      return new Response(
        JSON.stringify({ success: false, error: "M-Pesa authentication failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { access_token } = await tokenResponse.json();
    console.log("Got M-Pesa access token");

    // Step 2: Generate timestamp and password
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Step 3: Send STK Push
    const stkResponse = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.round(amount),
          PartyA: phone,
          PartyB: shortcode,
          PhoneNumber: phone,
          CallBackURL: callbackUrl || `${supabaseUrl}/functions/v1/mpesa-callback`,
          AccountReference: "StakeHabit",
          TransactionDesc: `Deposit to StakeHabit wallet`,
        }),
      }
    );

    const stkResult = await stkResponse.json();
    console.log("STK Push result:", stkResult);

    if (stkResult.ResponseCode === "0") {
      // Store pending transaction
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "deposit",
        amount: amount,
        description: `M-Pesa deposit pending - ${stkResult.CheckoutRequestID}`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          checkoutRequestId: stkResult.CheckoutRequestID,
          message: "STK push sent to your phone",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: stkResult.errorMessage || "STK push failed",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("STK Push error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
