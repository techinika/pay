import { getConfig } from "./config";

export async function pawaPayFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { baseUrl, apiToken } = getConfig();
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`pawaPay API error (${res.status}): ${errorBody}`);
  }
  return res.json();
}
