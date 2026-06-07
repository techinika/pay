import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data: invoiceData, error: invoiceError } = await supabase
      .from("event_invoices")
      .select("id, registration_id, amount, currency, status, payment_link, created_at")
      .eq("id", id)
      .single();

    if (invoiceError) {
      if (invoiceError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 },
        );
      }
      console.error("Invoice fetch error:", invoiceError);
      return NextResponse.json(
        { error: "Failed to fetch invoice" },
        { status: 500 },
      );
    }

    if (!invoiceData) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 },
      );
    }

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

    const invoice = {
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

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Fetch invoice error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 },
    );
  }
}
