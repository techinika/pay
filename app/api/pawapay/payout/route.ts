import { NextRequest, NextResponse } from "next/server";
import {
  initiatePayout,
  generatePawaPayId,
} from "@/lib/pawapay";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, amount, currency, phoneNumber, provider } =
      await req.json();

    if (!invoiceId || !amount || !currency || !phoneNumber || !provider) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const payoutId = generatePawaPayId();

    await supabase
      .from("event_invoices")
      .update({
        provider_payout_id: payoutId,
        phone_number: phoneNumber,
        payment_provider: "pawapay",
        payment_metadata: {
          payout_initiated_at: new Date().toISOString(),
          provider,
          currency,
        },
      })
      .eq("id", invoiceId);

    const result = await initiatePayout({
      payoutId,
      amount: String(amount),
      currency,
      recipient: {
        type: "MMO",
        accountDetails: {
          phoneNumber,
          provider,
        },
      },
      customerMessage: `Payout Invoice ${invoiceId.slice(0, 8)}`,
    });

    if (result.status === "ACCEPTED") {
      return NextResponse.json({
        success: true,
        payoutId: result.payoutId,
        status: result.status,
        message: "Payout initiated successfully.",
      });
    }

    return NextResponse.json(
      {
        error:
          result.failureReason?.failureMessage || "Payout initiation failed",
        failureCode: result.failureReason?.failureCode,
      },
      { status: 422 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("pawaPay payout failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
