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

    const body = await req.json();
    const { invoice_number, status, transaction_id, metadata } = body;

    if (!invoice_number) {
      return new Response(JSON.stringify({ error: "Missing invoice_number" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let meta: any = {};
    try {
      meta = typeof metadata === "string" ? JSON.parse(metadata) : metadata || {};
    } catch { /* ignore */ }

    const paymentStatus = status === "success" || status === "completed" ? "completed" : "failed";

    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: paymentStatus,
        transaction_id: transaction_id || null,
        gateway_response: body,
      } as any)
      .eq("id", invoice_number);

    if (updateError) {
      console.error("Payment update error:", updateError);
    }

    // If completed and has subscription_plan_id, activate subscription
    if (paymentStatus === "completed" && meta.subscription_plan_id && meta.user_id) {
      const { data: plan } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", meta.subscription_plan_id)
        .single();

      if (plan) {
        const endsAt = new Date();
        endsAt.setDate(endsAt.getDate() + plan.duration_days);

        await supabase.from("subscriptions").insert({
          user_id: meta.user_id,
          plan_id: plan.id,
          ends_at: endsAt.toISOString(),
          status: "active",
          is_active: true,
        });

        // Update payment with subscription reference
        await supabase.from("payments").update({
          subscription_id: plan.id,
        } as any).eq("id", invoice_number);
      }
    }

    const redirectUrl = meta.redirect_url || body.success_url || "/dashboard";

    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: redirectUrl },
    });
  } catch (err) {
    console.error("recharge-server-callback error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
