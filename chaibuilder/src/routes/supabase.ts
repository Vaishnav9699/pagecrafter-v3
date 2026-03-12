import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { worker: true },
});
