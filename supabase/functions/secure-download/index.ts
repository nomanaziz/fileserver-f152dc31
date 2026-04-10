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
      return new Response(JSON.stringify({ error: "অনুগ্রহ করে লগইন করুন" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "অনুগ্রহ করে লগইন করুন" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { product_id, download_id } = body;

    if (!product_id || !download_id) {
      return new Response(JSON.stringify({ error: "Missing product_id or download_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get product info
    const { data: product } = await supabase
      .from("products")
      .select("id, is_paid, is_active")
      .eq("id", product_id)
      .single();

    if (!product) {
      return new Response(JSON.stringify({ error: "প্রোডাক্ট পাওয়া যায়নি" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check access
    let hasAccess = false;

    // Free products — everyone can download
    if (!product.is_paid) {
      hasAccess = true;
    }

    // Check if user has a completed payment for this product
    if (!hasAccess) {
      const { data: payment } = await supabase
        .from("payments")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product_id)
        .eq("status", "completed")
        .limit(1)
        .maybeSingle();

      if (payment) hasAccess = true;
    }

    // Check active subscription
    if (!hasAccess) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id, ends_at")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .gte("ends_at", new Date().toISOString())
        .limit(1)
        .maybeSingle();

      if (sub) hasAccess = true;
    }

    // Check if user is admin
    if (!hasAccess) {
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (isAdmin) hasAccess = true;
    }

    if (!hasAccess) {
      return new Response(JSON.stringify({ error: "ডাউনলোড অ্যাক্সেস নেই। প্রোডাক্ট কিনুন অথবা সাবস্ক্রাইব করুন।" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get download URL
    const { data: download } = await supabase
      .from("product_downloads")
      .select("download_url, file_name")
      .eq("id", download_id)
      .eq("product_id", product_id)
      .single();

    if (!download) {
      return new Response(JSON.stringify({ error: "ডাউনলোড লিংক পাওয়া যায়নি" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record download history
    await supabase.from("download_history").insert({
      user_id: user.id,
      product_id: product_id,
    });

    // Increment download count
    await supabase.rpc("has_role", { _user_id: user.id, _role: "user" }); // just to keep it simple
    await supabase
      .from("products")
      .update({ download_count: (product as any).download_count + 1 } as any)
      .eq("id", product_id);

    return new Response(JSON.stringify({ download_url: download.download_url, file_name: download.file_name }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("secure-download error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
