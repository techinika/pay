import { NextRequest, NextResponse } from "next/server";
import { checkDepositStatus } from "@/lib/pawapay";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const depositId = searchParams.get("depositId");

    if (!depositId) {
      return NextResponse.json(
        { error: "depositId query parameter is required" },
        { status: 400 },
      );
    }

    const result = await checkDepositStatus(depositId);

    if (result.status === "FOUND") {
      return NextResponse.json({ success: true, data: result.data });
    }

    return NextResponse.json({ success: true, status: "NOT_FOUND" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Check deposit status failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
