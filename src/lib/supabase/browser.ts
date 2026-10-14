import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_KEY } from "./clave";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
