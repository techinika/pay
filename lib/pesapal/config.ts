interface PesaPalConfig {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export function getConfig(): PesaPalConfig {
  const env = process.env.PESAPAL_ENV || "sandbox";
  const baseUrl =
    env === "production"
      ? "https://pay.pesapal.com/v3/api"
      : "https://cybqa.pesapal.com/pesapalv3/api";
  return {
    baseUrl,
    consumerKey: process.env.PESAPAL_CONSUMER_KEY || "",
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || "",
  };
}
