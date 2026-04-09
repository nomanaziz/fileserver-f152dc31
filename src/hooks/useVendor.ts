import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useVendorProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["vendor-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useVendorProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["vendor-products", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("vendor_id", user!.id)
        .eq("is_vendor_product", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useVendorEarnings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["vendor-earnings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_earnings")
        .select("*, products(title)")
        .eq("vendor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useVendorPayouts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["vendor-payouts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_payouts")
        .select("*")
        .eq("vendor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateVendorProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (profile: { store_name: string; store_description?: string; logo_url?: string }) => {
      const { error } = await supabase.from("vendor_profiles").insert({
        id: user!.id,
        ...profile,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-profile"] }),
  });
}

export function useUpdateVendorProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (profile: { store_name?: string; store_description?: string; logo_url?: string }) => {
      const { error } = await supabase
        .from("vendor_profiles")
        .update(profile)
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-profile"] }),
  });
}

export function useRequestPayout() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payout: { amount: number; payment_method: string; account_details: any }) => {
      const { error } = await supabase.from("vendor_payouts").insert({
        vendor_id: user!.id,
        ...payout,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-payouts"] });
      qc.invalidateQueries({ queryKey: ["vendor-profile"] });
    },
  });
}
