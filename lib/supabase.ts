import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_PROJECT_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_API_KEY;
    if (!supabaseUrl) throw new Error("Missing env: NEXT_PUBLIC_PROJECT_URL");
    if (!supabaseAnonKey) throw new Error("Missing env: NEXT_PUBLIC_API_KEY");
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getClient() as any)[prop];
  },
});

export interface EventInvoice {
  id: string;
  registration_id: string;
  amount: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled";
  payment_link: string | null;
  created_at: string;
  payment_method?: "mobile_money" | "card" | null;
  payment_provider?: "pawapay" | "pesapal" | null;
  provider_deposit_id?: string | null;
  provider_payout_id?: string | null;
  provider_refund_id?: string | null;
  provider_reference?: string | null;
  phone_number?: string | null;
  payment_metadata?: Record<string, unknown>;
  registration?: EventRegistration;
  event?: EventInfo;
  user?: UserInfo;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  ticket_id: string | null;
  status: "confirmed" | "pending_payment" | "pending_approval" | "cancelled";
  answers: Record<string, unknown>;
  created_at: string;
  event?: EventInfo;
  user?: UserInfo;
}

export interface EventInfo {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  image_url: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  image_url: string | null;
  username: string | null;
}

export type InvoiceWithDetails = {
  id: string;
  registration_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_link: string | null;
  created_at: string;
  payment_method?: string | null;
  payment_provider?: string | null;
  provider_deposit_id?: string | null;
  provider_payout_id?: string | null;
  provider_refund_id?: string | null;
  provider_reference?: string | null;
  phone_number?: string | null;
  payment_metadata?: Record<string, unknown>;
  registration: {
    id: string;
    status: string;
    answers: Record<string, unknown>;
    created_at: string;
    event: {
      id: string;
      title: string;
      description: string;
      start_date: string;
      end_date: string;
      location: string;
      image_url: string;
    } | null;
    user: {
      id: string;
      name: string;
      email: string;
      image_url: string | null;
      username: string | null;
    } | null;
  } | null;
};
