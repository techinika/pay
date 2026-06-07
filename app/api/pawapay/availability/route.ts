import { NextRequest, NextResponse } from "next/server";
import { getProviderAvailability } from "@/lib/pawapay/status";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || undefined;
    const operationType = searchParams.get("operationType") || undefined;

    const availability = await getProviderAvailability(country, operationType);

    return NextResponse.json({ success: true, data: availability });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("pawaPay availability fetch failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
