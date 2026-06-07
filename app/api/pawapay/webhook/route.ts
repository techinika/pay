import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "node:crypto";

function verifySignature(
  body: string,
  signature: string | null,
): boolean {
  if (!signature) return false;
  const secret = process.env.PAWAPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature =
      req.headers.get("x-pawapay-signature") ||
      req.headers.get("X-PawaPay-Signature");

    if (!verifySignature(bodyText, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    const body = JSON.parse(bodyText);
    const { depositId, payoutId, refundId, status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Invalid callback payload" },
        { status: 400 },
      );
    }

    if (depositId) {
      const invoiceStatus =
        status === "COMPLETED"
          ? "confirmed"
          : status === "FAILED"
            ? "pending"
            : "pending";

      const { error: updateError } = await supabase
        .from("event_invoices")
        .update({
          status: invoiceStatus,
          provider_reference: body.providerTransactionId || null,
          payment_metadata: {
            deposit_callback: body,
            callback_received_at: new Date().toISOString(),
          },
        })
        .eq("provider_deposit_id", depositId);

      if (updateError) {
        console.error(
          "Failed to update invoice from deposit callback:",
          updateError,
        );
      }

      if (invoiceStatus === "confirmed") {
        const { data: invoice } = await supabase
          .from("event_invoices")
          .select("registration_id")
          .eq("provider_deposit_id", depositId)
          .single();

        if (invoice?.registration_id) {
          await supabase
            .from("event_registrations")
            .update({ status: "confirmed" })
            .eq("id", invoice.registration_id);
        }
      }
    }

    if (payoutId) {
      const payoutStatus =
        status === "COMPLETED" ? "confirmed" : "pending";

      const { error: payoutError } = await supabase
        .from("event_invoices")
        .update({
          status: payoutStatus,
          provider_reference: body.providerTransactionId || null,
          payment_metadata: {
            payout_callback: body,
            callback_received_at: new Date().toISOString(),
          },
        })
        .eq("provider_payout_id", payoutId);

      if (payoutError) {
        console.error("Failed to update invoice from payout callback:", payoutError);
      }
    }

    if (refundId) {
      const { error: refundError } = await supabase
        .from("event_invoices")
        .update({
          provider_refund_id: refundId,
          provider_reference: body.providerTransactionId || null,
          payment_metadata: {
            refund_callback: body,
            callback_received_at: new Date().toISOString(),
          },
        })
        .eq("provider_refund_id", refundId);

      if (refundError) {
        console.error("Failed to update invoice from refund callback:", refundError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("pawaPay webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
