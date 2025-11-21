interface Token {
  access: string;
  refresh: string;
  expires: number;
}

let cachedToken: Token | null = null;

export async function getPaypackAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now() + 60000) {
    return cachedToken.access;
  }

  try {
    const response = await fetch(
      "https://payments.paypack.rw/api/auth/agents/authorize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.PAYPACK_CLIENT_ID!,
          client_secret: process.env.PAYPACK_CLIENT_SECRET!,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to authenticate with PayPack");
    }

    const expiresIn = 900;
    const expires = Date.now() + expiresIn * 1000;

    cachedToken = {
      access: data.access,
      refresh: data.refresh,
      expires: expires,
    };

    return cachedToken.access;
  } catch (error) {
    console.error("Error fetching PayPack access token:", error);
    throw new Error("Could not retrieve PayPack access token.");
  }
}
