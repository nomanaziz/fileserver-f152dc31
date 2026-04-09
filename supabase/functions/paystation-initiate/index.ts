import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify user auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { payment_id, amount, cust_name, cust_email, cust_phone, product_id, vendor_id, subscription_plan_id, redirect_url } = body;

    if (!payment_id || !amount) {
      return new Response(JSON.stringify({ error: "Missing payment_id or amount" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read PayStation credentials from site_settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["paystation_merchant_id", "paystation_password", "paystation_enabled"]);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: any) => { settingsMap[s.key] = s.value || ""; });

    if (settingsMap.paystation_enabled !== "true") {
      return new Response(JSON.stringify({ error: "PayStation is not enabled" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const merchantId = settingsMap.paystation_merchant_id;
    const password = settingsMap.paystation_password;

    if (!merchantId || !password) {
      return new Response(JSON.stringify({ error: "PayStation credentials not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build callback URL
    const callbackUrl = `${supabaseUrl}/functions/v1/paystation-callback`;

    // Initiate payment with PayStation
    const paystationPayload = {
      merchantId,
      password,
      invoice_number: payment_id,
      payment_amount: amount,
      currency: "BDT",
      cust_name: cust_name || user.email || "Customer",
      cust_phone: cust_phone || "",
      cust_email: cust_email || user.email || "",
      callback_url: callbackUrl,
      opt_a: JSON.stringify({
        user_id: user.id,
        product_id: product_id || null,
        vendor_id: vendor_id || null,
        subscription_plan_id: subscription_plan_id || null,
        redirect_url: redirect_url || "",
      }),
    };

    const psResponse = await fetch("https://api.paystation.com.bd/initiate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paystationPayload),
    });

    const psData = await psResponse.json();

    if (!psResponse.ok || !psData.payment_url) {
      console.error("PayStation initiate error:", psData);
      return new Response(JSON.stringify({ error: "Payment initiation failed", details: psData }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ payment_url: psData.payment_url }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("paystation-initiate error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
