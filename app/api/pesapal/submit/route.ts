import { NextRequest, NextResponse } from "next/server";
import { submitOrder } from "@/lib/pesapal";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, amount, currency, email, phoneNumber, firstName, lastName } =
      await req.json();

    if (!invoiceId || !amount || !currency) {
      return NextResponse.json(
        { error: "invoiceId, amount, and currency are required" },
        { status: 400 },
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const result = await submitOrder({
      id: `INV-${invoiceId.slice(0, 8)}-${Date.now()}`,
      currency,
      amount: Number(amount),
      description: `Payment for invoice ${invoiceId.slice(0, 8)}`,
      callbackUrl: `${appUrl}/api/pesapal/ipn`,
      billingAddress: {
        emailAddress: email || "customer@example.com",
        phoneNumber: phoneNumber || "",
        firstName,
        lastName,
      },
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 422 },
      );
    }

    await supabase
      .from("event_invoices")
      .update({
        payment_method: "card",
        payment_provider: "pesapal",
        payment_link: result.redirectUrl,
        provider_reference: result.orderTrackingId,
        payment_metadata: {
          pesapal_order_tracking_id: result.orderTrackingId,
          merchant_reference: result.merchantReference,
          submitted_at: new Date().toISOString(),
        },
      })
      .eq("id", invoiceId);

    return NextResponse.json({
      success: true,
      redirectUrl: result.redirectUrl,
      orderTrackingId: result.orderTrackingId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("PesaPal submit order failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
