import { NextRequest, NextResponse } from "next/server";
import {
  initiateRefund,
  generatePawaPayId,
} from "@/lib/pawapay";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, amount, currency } = await req.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "invoiceId is required" },
        { status: 400 },
      );
    }

    const { data: invoice } = await supabase
      .from("event_invoices")
      .select("provider_deposit_id, amount, currency")
      .eq("id", invoiceId)
      .single();

    if (!invoice?.provider_deposit_id) {
      return NextResponse.json(
        { error: "No deposit found for this invoice" },
        { status: 404 },
      );
    }

    const refundId = generatePawaPayId();

    const { error: updateError } = await supabase
      .from("event_invoices")
      .update({
        provider_refund_id: refundId,
        payment_metadata: {
          refund_initiated_at: new Date().toISOString(),
        },
      })
      .eq("id", invoiceId);

    if (updateError) {
      console.error("Failed to update invoice with refund ID:", updateError);
    }

    const result = await initiateRefund({
      refundId,
      depositId: invoice.provider_deposit_id,
      amount: amount ? String(amount) : undefined,
      currency: currency || invoice.currency,
    });

    if (result.status === "ACCEPTED") {
      return NextResponse.json({
        success: true,
        refundId: result.refundId,
        status: result.status,
        message: "Refund initiated successfully.",
      });
    }

    return NextResponse.json(
      {
        error:
          result.failureReason?.failureMessage || "Refund initiation failed",
        failureCode: result.failureReason?.failureCode,
      },
      { status: 422 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("pawaPay refund failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
