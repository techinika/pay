import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_PROJECT_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl) throw new Error("Missing env: NEXT_PUBLIC_PROJECT_URL");
    if (!supabaseServiceKey) throw new Error("Missing env: SUPABASE_SERVICE_KEY");
    _client = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getClient() as any)[prop];
  },
});
