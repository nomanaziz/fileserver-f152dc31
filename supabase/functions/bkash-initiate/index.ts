import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { payment_id, amount, cust_name, cust_email, cust_phone, product_id, vendor_id, subscription_plan_id, redirect_url } = await req.json();

    if (!payment_id || !amount || !redirect_url) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get bKash credentials from site_settings
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", ["bkash_app_key", "bkash_app_secret", "bkash_username", "bkash_password", "bkash_sandbox"]);

    const cfg: Record<string, string> = {};
    settings?.forEach((s: any) => { cfg[s.key] = s.value || ""; });

    if (!cfg.bkash_app_key || !cfg.bkash_app_secret || !cfg.bkash_username || !cfg.bkash_password) {
      return new Response(JSON.stringify({ error: "bKash credentials not configured" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isSandbox = cfg.bkash_sandbox === "true";
    const baseURL = isSandbox
      ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
      : "https://tokenized.pay.bka.sh/v1.2.0-beta";

    // Step 1: Grant Token
    const tokenRes = await fetch(`${baseURL}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: cfg.bkash_username,
        password: cfg.bkash_password,
      },
      body: JSON.stringify({
        app_key: cfg.bkash_app_key,
        app_secret: cfg.bkash_app_secret,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.id_token) {
      console.error("bKash token error:", tokenData);
      return new Response(JSON.stringify({ error: "Failed to get bKash token", details: tokenData }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callbackURL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/bkash-callback`;

    // Step 2: Create Payment
    const createRes = await fetch(`${baseURL}/tokenized/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: tokenData.id_token,
        "x-app-key": cfg.bkash_app_key,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: cust_phone || cust_email || "N/A",
        callbackURL,
        amount: String(amount),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: payment_id,
      }),
    });

    const createData = await createRes.json();

    if (!createData.bkashURL) {
      console.error("bKash create error:", createData);
      return new Response(JSON.stringify({ error: "Failed to create bKash payment", details: createData }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store bKash paymentID and redirect_url in gateway_response for callback
    await supabaseAdmin.from("payments").update({
      transaction_id: createData.paymentID,
      gateway_response: {
        bkash_payment_id: createData.paymentID,
        id_token: tokenData.id_token,
        redirect_url,
        subscription_plan_id: subscription_plan_id || null,
      },
    }).eq("id", payment_id);

    return new Response(JSON.stringify({ payment_url: createData.bkashURL }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("bkash-initiate error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
