import { getConfig } from "./config";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

  const { baseUrl, consumerKey, consumerSecret } = getConfig();
  const auth = btoa(`${consumerKey}:${consumerSecret}`);

  const res = await fetch(`${baseUrl}/Auth/RequestToken`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
  });

  if (!res.ok) {
    throw new Error(`PesaPal auth failed: ${res.status} ${await res.text()}`);
  }

  const data: TokenResponse = await res.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

export async function pesaPalFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { baseUrl } = getConfig();
  const token = await getAccessToken();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`PesaPal API error (${res.status}): ${await res.text()}`);
  }

  return res.json();
}
