import { NextRequest, NextResponse } from "next/server";
import {
  initiateDeposit,
  checkDepositStatus,
  generatePawaPayId,
} from "@/lib/pawapay";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, amount, currency, phoneNumber, provider } =
      await req.json();

    if (!invoiceId || !amount || !currency || !phoneNumber || !provider) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: invoiceId, amount, currency, phoneNumber, provider",
        },
        { status: 400 },
      );
    }

    const depositId = generatePawaPayId();

    const { error: updateError } = await supabase
      .from("event_invoices")
      .update({
        provider_deposit_id: depositId,
        phone_number: phoneNumber,
        payment_method: "mobile_money",
        payment_provider: "pawapay",
        payment_metadata: {
          deposit_initiated_at: new Date().toISOString(),
          provider,
          currency,
        },
      })
      .eq("id", invoiceId);

    if (updateError) {
      console.error("Failed to update invoice with deposit ID:", updateError);
    }

    const result = await initiateDeposit({
      depositId,
      amount: String(amount),
      currency,
      payer: {
        type: "MMO",
        accountDetails: {
          phoneNumber,
          provider,
        },
      },
      customerMessage: `Invoice ${invoiceId.slice(0, 8)}`,
    });

    if (result.status === "ACCEPTED") {
      return NextResponse.json({
        success: true,
        depositId: result.depositId,
        status: result.status,
        nextStep: result.nextStep,
        message:
          "Payment request sent. Please check your phone and enter your PIN to approve.",
      });
    }

    if (result.status === "DUPLICATE_IGNORED") {
      const checkResult = await checkDepositStatus(depositId);
      if (checkResult.status === "FOUND" && checkResult.data) {
        return NextResponse.json({
          success: true,
          depositId: result.depositId,
          status: checkResult.data.status,
          message: "This payment was already initiated.",
        });
      }
    }

    return NextResponse.json(
      {
        error:
          result.failureReason?.failureMessage || "Payment initiation failed",
        failureCode: result.failureReason?.failureCode,
      },
      { status: 422 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("pawaPay deposit failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
