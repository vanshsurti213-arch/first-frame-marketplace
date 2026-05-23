import { createBrowserClient } from "@supabase/ssr";

// Singleton for client components
let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}

export function getSupabase() {
  return createClient();
}

export const supabase = createClient();
