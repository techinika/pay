import { pawaPayFetch } from "./client";
import type {
  InitiatePayoutRequest,
  InitiatePayoutResponse,
  CheckPayoutResponse,
} from "./types";

export async function initiatePayout(
  params: InitiatePayoutRequest,
): Promise<InitiatePayoutResponse> {
  return pawaPayFetch<InitiatePayoutResponse>("/v2/payouts", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function checkPayoutStatus(
  payoutId: string,
): Promise<CheckPayoutResponse> {
  return pawaPayFetch<CheckPayoutResponse>(`/v2/payouts/${payoutId}`);
}

export async function cancelEnqueuedPayout(
  payoutId: string,
): Promise<void> {
  await pawaPayFetch(`/v2/payouts/fail-enqueued/${payoutId}`, {
    method: "GET",
  });
}
