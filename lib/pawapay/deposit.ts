import { pawaPayFetch } from "./client";
import type {
  InitiateDepositRequest,
  InitiateDepositResponse,
  CheckDepositResponse,
} from "./types";
export async function initiateDeposit(
  params: InitiateDepositRequest,
): Promise<InitiateDepositResponse> {
  return pawaPayFetch<InitiateDepositResponse>("/v2/deposits", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function checkDepositStatus(
  depositId: string,
): Promise<CheckDepositResponse> {
  return pawaPayFetch<CheckDepositResponse>(`/v2/deposits/${depositId}`);
}

export async function resendDepositCallback(
  depositId: string,
): Promise<void> {
  await pawaPayFetch(`/v2/deposits/resend-callback/${depositId}`);
}
