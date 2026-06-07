import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/pesapal";
import { supabase } from "@/lib/supabase";

async function processPayment(orderTrackingId: string) {
  const status = await getTransactionStatus(orderTrackingId);

  const isCompleted =
    status.payment_status_description === "COMPLETED" ||
    status.status_code === 1;

  if (isCompleted) {
    const { data: invoice, error: findError } = await supabase
      .from("event_invoices")
      .select("id, registration_id")
      .eq("provider_reference", orderTrackingId)
      .single();

    if (findError || !invoice) {
      console.error("Invoice not found for PesaPal order:", orderTrackingId);
      return false;
    }

    await supabase
      .from("event_invoices")
      .update({
        status: "confirmed",
        provider_reference: status.confirmation_code || orderTrackingId,
        payment_metadata: {
          pesapal_confirmation_code: status.confirmation_code,
          pesapal_payment_account: status.payment_account,
          pesapal_payment_method: status.payment_method,
          ipn_received_at: new Date().toISOString(),
        },
      })
      .eq("id", invoice.id);

    if (invoice.registration_id) {
      await supabase
        .from("event_registrations")
        .update({ status: "confirmed" })
        .eq("id", invoice.registration_id);
    }

    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderTrackingId =
      body.orderTrackingId || body.OrderTrackingId || body.order_tracking_id;

    if (!orderTrackingId) {
      return NextResponse.json(
        { error: "Missing orderTrackingId" },
        { status: 400 },
      );
    }

    await processPayment(orderTrackingId);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PesaPal IPN error:", error);
    return NextResponse.json({ received: true });
  }
}

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderTrackingId = searchParams.get("OrderTrackingId");
  const merchantReference = searchParams.get("MerchantReference");

  const trackingId = orderTrackingId || merchantReference;

  if (!trackingId) {
    return NextResponse.redirect(
      `${APP_URL}?payment=error`,
    );
  }

  try {
    const paid = await processPayment(trackingId);

    if (paid) {
      return NextResponse.redirect(`${APP_URL}?payment=success`);
    }

    return NextResponse.redirect(`${APP_URL}?payment=failed`);
  } catch {
    return NextResponse.redirect(`${APP_URL}`);
  }
}
