import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_PROJECT_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) throw new Error("Missing env: NEXT_PUBLIC_PROJECT_URL");
if (!supabaseServiceKey) throw new Error("Missing env: SUPABASE_SERVICE_KEY");

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
