import { getConfig } from "./config";
import { getAccessToken, pesaPalFetch } from "./client";
import type {
  SubmitOrderRequest,
  SubmitOrderResponse,
  TransactionStatus,
} from "./types";

export async function submitOrder(
  params: SubmitOrderRequest,
): Promise<SubmitOrderResponse> {
  const { baseUrl } = getConfig();
  const token = await getAccessToken();

  const ipnRes = await fetch(`${baseUrl}/URLSetup/GetIpnList`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  let ipnId: string | undefined = params.notificationId;

  if (!ipnId && ipnRes.ok) {
    const ipns: { url: string; ipnId: string }[] = await ipnRes.json();
    const callbackUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const match = ipns.find((i) => i.url.includes(callbackUrl));
    if (match) {
      ipnId = match.ipnId;
    }
  }

  return pesaPalFetch<SubmitOrderResponse>(
    "/Transactions/SubmitOrderRequest",
    {
      method: "POST",
      body: JSON.stringify({
        id: params.id,
        currency: params.currency,
        amount: params.amount,
        description: params.description,
        callback_url: params.callbackUrl,
        notification_id: ipnId,
        billing_address: params.billingAddress,
      }),
    },
  );
}

export async function getTransactionStatus(
  orderTrackingId: string,
): Promise<TransactionStatus> {
  return pesaPalFetch<TransactionStatus>(
    `/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
  );
}
