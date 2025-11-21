import { getPaypackAccessToken } from "@/lib/paypack";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, phoneNumber } = await req.json();

    if (!orderId || !amount || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const accessToken = await getPaypackAccessToken();

    const response = await fetch(
      "https://payments.paypack.rw/api/transactions/cashin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          number: phoneNumber,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to initiate PayPack payment");
    }

    if (data.status === "pending") {
      return NextResponse.json({
        message: "Payment initiated successfully.",
        ref: data.ref,
      });
    } else {
      throw new Error(
        `Failed to initiate PayPack payment. Status: ${data.status}`
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("PayPack cashin failed:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
