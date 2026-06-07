import { NextRequest, NextResponse } from "next/server";
import { predictProvider } from "@/lib/pawapay";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "phoneNumber is required" },
        { status: 400 },
      );
    }

    const result = await predictProvider(phoneNumber);

    return NextResponse.json({
      success: true,
      country: result.country,
      provider: result.provider,
      phoneNumber: result.phoneNumber,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("pawaPay predict provider failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
