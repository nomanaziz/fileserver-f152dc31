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
    const { payment_id, amount, product_id, vendor_id, subscription_plan_id, redirect_url } = body;

    if (!payment_id || !amount) {
      return new Response(JSON.stringify({ error: "Missing payment_id or amount" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read Recharge Server credentials from site_settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["recharge_server_brand_key", "recharge_server_enabled"]);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: any) => { settingsMap[s.key] = s.value || ""; });

    if (settingsMap.recharge_server_enabled !== "true") {
      return new Response(JSON.stringify({ error: "Recharge Server is not enabled" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const brandKey = settingsMap.recharge_server_brand_key;
    if (!brandKey) {
      return new Response(JSON.stringify({ error: "Recharge Server brand key not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callbackUrl = `${supabaseUrl}/functions/v1/recharge-server-callback`;

    const payload = {
      brand_key: brandKey,
      invoice_number: payment_id,
      amount: String(amount),
      currency: "BDT",
      callback_url: callbackUrl,
      success_url: redirect_url || `${supabaseUrl.replace('supabase.co', 'lovable.app')}/dashboard`,
      cancel_url: redirect_url || `${supabaseUrl.replace('supabase.co', 'lovable.app')}/checkout`,
      metadata: JSON.stringify({
        user_id: user.id,
        product_id: product_id || null,
        vendor_id: vendor_id || null,
        subscription_plan_id: subscription_plan_id || null,
      }),
    };

    const rsResponse = await fetch("https://rechargeserver.com/api/initiate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const rsData = await rsResponse.json();

    if (!rsResponse.ok || !rsData.payment_url) {
      console.error("Recharge Server initiate error:", rsData);
      return new Response(JSON.stringify({ error: "Payment initiation failed", details: rsData }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ payment_url: rsData.payment_url }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("recharge-server-initiate error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
