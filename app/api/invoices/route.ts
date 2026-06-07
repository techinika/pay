import { NextRequest, NextResponse } from "next/server";
import { searchInvoices } from "@/lib/services/invoice-search";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    const invoices = await searchInvoices(query);
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search invoices" },
      { status: 500 },
    );
  }
}
