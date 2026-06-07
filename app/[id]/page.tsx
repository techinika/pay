import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Receipt, Search, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import InvoiceDetailClient from "./InvoiceDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fetchInvoice(id: string) {
  const { data: invoiceData, error: invoiceError } = await supabase
    .from("event_invoices")
    .select("id, registration_id, amount, currency, status, payment_link, created_at")
    .eq("id", id)
    .single();

  if (invoiceError || !invoiceData) return null;

  const { data: regData } = await supabase
    .from("event_registrations")
    .select("id, event_id, user_id, ticket_id, status, answers, created_at")
    .eq("id", invoiceData.registration_id)
    .single();

  let eventData = null;
  let ticketData = null;
  let authorData = null;

  if (regData) {
    const { data: eventResult } = await supabase
      .from("events")
      .select("id, title, full_description, start_date, end_date, location, image_url")
      .eq("id", regData.event_id)
      .single();
    eventData = eventResult;

    if (regData.ticket_id) {
      const { data: ticketResult } = await supabase
        .from("event_tickets")
        .select("id, currency")
        .eq("id", regData.ticket_id)
        .single();
      ticketData = ticketResult;
    }

    const { data: authorResult } = await supabase
      .from("authors")
      .select("id, name, image_url, username, email")
      .eq("id", regData.user_id)
      .single();
    authorData = authorResult;
  }

  const currency = ticketData?.currency || invoiceData.currency;

  return {
    id: invoiceData.id,
    registration_id: invoiceData.registration_id,
    amount: Number(invoiceData.amount),
    currency,
    status: invoiceData.status,
    payment_link: invoiceData.payment_link,
    created_at: invoiceData.created_at,
    registration: regData
      ? {
          id: regData.id,
          status: regData.status,
          answers: regData.answers,
          created_at: regData.created_at,
          event: eventData
            ? {
                id: eventData.id,
                title: eventData.title,
                description: eventData.full_description,
                start_date: eventData.start_date,
                end_date: eventData.end_date,
                location: eventData.location,
                image_url: eventData.image_url,
              }
            : undefined,
        }
      : undefined,
    userDetails: authorData
      ? {
          name: authorData.name,
          email: authorData.email || "",
          image_url: authorData.image_url,
          username: authorData.username,
        }
      : undefined,
  };
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <Receipt className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Invoice Not Found
          </h1>
          <p className="text-slate-600 mb-8">
            We couldn&apos;t find an invoice with this ID. The invoice may have
            been removed or the link may be incorrect.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" />
              Search for Invoice
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function InvoicePage({ params }: PageProps) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-6">
              <AlertTriangle className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              Invalid Invoice ID
            </h1>
            <p className="text-slate-600 mb-8">
              The invoice ID format is invalid. Please check your link and try
              again.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const invoice = await fetchInvoice(id);

  if (!invoice) {
    return <NotFound />;
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading invoice...</p>
          </div>
        </div>
      }
    >
      <InvoiceDetailClient invoice={invoice} />
    </Suspense>
  );
}
