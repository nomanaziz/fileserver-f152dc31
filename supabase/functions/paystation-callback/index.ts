import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // PayStation sends callback as GET or POST with query/body params
    let params: Record<string, string> = {};

    if (req.method === "GET") {
      const url = new URL(req.url);
      url.searchParams.forEach((v, k) => { params[k] = v; });
    } else if (req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        params = await req.json();
      } else {
        const formData = await req.formData();
        formData.forEach((v, k) => { params[k] = String(v); });
      }
    }

    const status = params.status || params.pay_status || "";
    const invoiceNumber = params.invoice_number || params.mer_txnid || "";
    const trxId = params.trx_id || params.SP_transaction_id || "";
    const optA = params.opt_a || "";

    console.log("PayStation callback:", { status, invoiceNumber, trxId, optA });

    if (!invoiceNumber) {
      return new Response("Missing invoice_number", { status: 400 });
    }

    // Parse metadata
    let metadata: any = {};
    try { metadata = JSON.parse(optA); } catch { /* ignore */ }

    const redirectBase = metadata.redirect_url || "";

    // Verify transaction with PayStation
    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["paystation_merchant_id", "paystation_password"]);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: any) => { settingsMap[s.key] = s.value || ""; });

    let verified = false;
    if (settingsMap.paystation_merchant_id && settingsMap.paystation_password && trxId) {
      try {
        const verifyRes = await fetch("https://api.paystation.com.bd/transaction-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantId: settingsMap.paystation_merchant_id,
            password: settingsMap.paystation_password,
            trx_id: trxId,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.status === "Successful" || verifyData.pay_status === "Successful") {
          verified = true;
        }
        console.log("PayStation verify:", verifyData);
      } catch (e) {
        console.error("PayStation verify error:", e);
      }
    }

    const isSuccess = verified || status === "Successful";

    if (isSuccess) {
      // Update payment to completed — this triggers handle_vendor_payment()
      const { error } = await supabase
        .from("payments")
        .update({
          status: "completed",
          transaction_id: trxId,
          payment_method: "paystation",
          gateway_response: params,
        })
        .eq("id", invoiceNumber);

      if (error) console.error("Payment update error:", error);

      // Handle subscription if applicable
      if (metadata.subscription_plan_id && metadata.user_id) {
        const { data: plan } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", metadata.subscription_plan_id)
          .single();

        if (plan) {
          const endsAt = new Date();
          endsAt.setDate(endsAt.getDate() + plan.duration_days);
          await supabase.from("subscriptions").insert({
            user_id: metadata.user_id,
            plan_id: plan.id,
            ends_at: endsAt.toISOString(),
            is_active: true,
            status: "active",
          });
        }
      }

      // Redirect user to success page
      const successUrl = redirectBase
        ? `${redirectBase}?payment=success`
        : `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/dashboard?payment=success`;

      return Response.redirect(successUrl, 302);
    } else {
      // Payment failed/cancelled
      await supabase
        .from("payments")
        .update({
          status: "failed",
          gateway_response: params,
        })
        .eq("id", invoiceNumber);

      const failUrl = redirectBase
        ? `${redirectBase}?payment=failed`
        : `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/dashboard?payment=failed`;

      return Response.redirect(failUrl, 302);
    }
  } catch (err) {
    console.error("paystation-callback error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
