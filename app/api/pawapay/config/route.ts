import { NextRequest, NextResponse } from "next/server";
import { getActiveConfiguration } from "@/lib/pawapay";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || undefined;
    const operationType = searchParams.get("operationType") || undefined;

    const config = await getActiveConfiguration(country, operationType);

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("pawaPay config fetch failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
