type PawaPayEnv = "sandbox" | "production";

export function getConfig(): { baseUrl: string; apiToken: string } {
  const env = (process.env.PAWAPAY_ENV || "sandbox") as PawaPayEnv;
  const baseUrl =
    env === "production"
      ? "https://api.pawapay.io"
      : "https://api.sandbox.pawapay.io";
  const apiToken = process.env.PAWAPAY_API_TOKEN || "";
  return { baseUrl, apiToken };
}
