import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const paymentID = url.searchParams.get("paymentID");
    const status = url.searchParams.get("status");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (status !== "success" || !paymentID) {
      // Find payment by transaction_id and mark failed
      if (paymentID) {
        await supabaseAdmin.from("payments")
          .update({ status: "failed" })
          .eq("transaction_id", paymentID);
      }
      // Redirect to dashboard with error
      const { data: paymentRow } = paymentID
        ? await supabaseAdmin.from("payments").select("gateway_response").eq("transaction_id", paymentID).maybeSingle()
        : { data: null };
      const redirectUrl = (paymentRow?.gateway_response as any)?.redirect_url || "/dashboard";
      return Response.redirect(`${redirectUrl}?payment=failed`, 302);
    }

    // Get payment record
    const { data: payment } = await supabaseAdmin.from("payments")
      .select("*")
      .eq("transaction_id", paymentID)
      .maybeSingle();

    if (!payment) {
      return new Response("Payment not found", { status: 404 });
    }

    const gatewayResp = payment.gateway_response as any;
    const idToken = gatewayResp?.id_token;
    const redirectUrl = gatewayResp?.redirect_url || "/dashboard";
    const subscriptionPlanId = gatewayResp?.subscription_plan_id;

    // Get bKash credentials
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", ["bkash_app_key", "bkash_sandbox"]);

    const cfg: Record<string, string> = {};
    settings?.forEach((s: any) => { cfg[s.key] = s.value || ""; });

    const isSandbox = cfg.bkash_sandbox === "true";
    const baseURL = isSandbox
      ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
      : "https://tokenized.pay.bka.sh/v1.2.0-beta";

    // Execute Payment
    const execRes = await fetch(`${baseURL}/tokenized/checkout/execute`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: idToken,
        "x-app-key": cfg.bkash_app_key,
      },
      body: JSON.stringify({ paymentID }),
    });

    const execData = await execRes.json();

    if (execData.statusCode === "0000" && execData.transactionStatus === "Completed") {
      // Update payment to completed
      await supabaseAdmin.from("payments").update({
        status: "completed",
        gateway_response: { ...gatewayResp, execute_response: execData },
      }).eq("id", payment.id);

      // Handle subscription if applicable
      if (subscriptionPlanId) {
        const { data: plan } = await supabaseAdmin
          .from("subscription_plans")
          .select("*")
          .eq("id", subscriptionPlanId)
          .single();

        if (plan) {
          const endsAt = new Date();
          endsAt.setDate(endsAt.getDate() + plan.duration_days);
          await supabaseAdmin.from("subscriptions").insert({
            user_id: payment.user_id,
            plan_id: plan.id,
            ends_at: endsAt.toISOString(),
            is_active: true,
            status: "active",
          });
        }
      }

      return Response.redirect(`${redirectUrl}?payment=success`, 302);
    } else {
      await supabaseAdmin.from("payments").update({
        status: "failed",
        gateway_response: { ...gatewayResp, execute_response: execData },
      }).eq("id", payment.id);

      return Response.redirect(`${redirectUrl}?payment=failed`, 302);
    }
  } catch (e) {
    console.error("bkash-callback error:", e);
    return new Response("Internal error", { status: 500 });
  }
});
