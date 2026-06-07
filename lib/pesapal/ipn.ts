import { getConfig } from "./config";
import { getAccessToken, pesaPalFetch } from "./client";
import type {
  RegisteredIpn,
  RegisterIpnRequest,
  RegisterIpnResponse,
} from "./types";

export async function getIpnList(): Promise<RegisteredIpn[]> {
  const { baseUrl } = getConfig();
  const token = await getAccessToken();

  const res = await fetch(`${baseUrl}/URLSetup/GetIpnList`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `PesaPal IPN list error (${res.status}): ${await res.text()}`,
    );
  }

  return res.json();
}

export async function registerIpn(
  params: RegisterIpnRequest,
): Promise<RegisterIpnResponse> {
  return pesaPalFetch<RegisterIpnResponse>("/URLSetup/RegisterIPN", {
    method: "POST",
    body: JSON.stringify({
      url: params.url,
      ipn_notification_type: params.notificationType,
    }),
  });
}
