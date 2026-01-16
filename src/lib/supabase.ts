import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database tables
export interface DbProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  last_generated_html: string | null;
  last_generated_css: string | null;
  last_generated_js: string | null;
}

export interface DbMessage {
  id: string;
  project_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface DbProjectFile {
  id: string;
  project_id: string;
  name: string;
  content: string | null;
  type: "html" | "css" | "js";
  created_at: string;
}
