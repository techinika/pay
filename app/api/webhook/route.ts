import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const webhookSecret = process.env.PAYPACK_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const signature = req.headers.get("x-paypack-signature") as string;

  const hash = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(body))
    .digest("base64");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
