import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_PROJECT_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface EventInvoice {
  id: string;
  registration_id: string;
  amount: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled";
  payment_link: string | null;
  created_at: string;
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