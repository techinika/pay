import { pawaPayFetch } from "./client";
import type {
  InitiateRefundRequest,
  InitiateRefundResponse,
  CheckRefundResponse,
} from "./types";

export async function initiateRefund(
  params: InitiateRefundRequest,
): Promise<InitiateRefundResponse> {
  return pawaPayFetch<InitiateRefundResponse>("/v2/refunds", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function checkRefundStatus(
  refundId: string,
): Promise<CheckRefundResponse> {
  return pawaPayFetch<CheckRefundResponse>(`/v2/refunds/${refundId}`);
}
