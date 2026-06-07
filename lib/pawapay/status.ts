import { pawaPayFetch } from "./client";
import type {
  ActiveConfResponse,
  PredictProviderResponse,
  ProviderAvailabilityEntry,
  WalletBalancesResponse,
} from "./types";

export async function getActiveConfiguration(
  country?: string,
  operationType?: string,
): Promise<ActiveConfResponse> {
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  if (operationType) params.set("operationType", operationType);
  const qs = params.toString();
  return pawaPayFetch<ActiveConfResponse>(
    `/v2/active-conf${qs ? `?${qs}` : ""}`,
  );
}

export async function predictProvider(
  phoneNumber: string,
): Promise<PredictProviderResponse> {
  return pawaPayFetch<PredictProviderResponse>("/v2/predict-provider", {
    method: "POST",
    body: JSON.stringify({ phoneNumber }),
  });
}

export async function getProviderAvailability(
  country?: string,
  operationType?: string,
): Promise<ProviderAvailabilityEntry[]> {
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  if (operationType) params.set("operationType", operationType);
  const qs = params.toString();
  return pawaPayFetch<ProviderAvailabilityEntry[]>(
    `/v2/availability${qs ? `?${qs}` : ""}`,
  );
}

export async function getWalletBalances(
  country?: string,
): Promise<WalletBalancesResponse> {
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  const qs = params.toString();
  return pawaPayFetch<WalletBalancesResponse>(
    `/v2/wallet-balances${qs ? `?${qs}` : ""}`,
  );
}

export function generatePawaPayId(): string {
  return crypto.randomUUID();
}
