import { createBrowserClient } from "@supabase/ssr";

export type SupabaseClient = ReturnType<typeof createBrowserClient>;

// Singleton for client components
let client: SupabaseClient | null | undefined;

// Validate environment variables exist and are not placeholders
function validateSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  console.log('[v0] Supabase URL:', url ? `${url.substring(0, 20)}...` : 'NOT SET');
  console.log('[v0] Supabase Key:', key ? `${key.substring(0, 20)}...` : 'NOT SET');
  
  const isValid = url && key && 
    url.includes('supabase.co') && 
    !url.includes('your-project') &&
    key.length > 20 &&
    !key.includes('your-anon-key');
  
  console.log('[v0] Config valid:', isValid);
  
  return isValid;
}

export function createClient(): SupabaseClient | null {
  // Return cached client if already initialized
  if (client !== undefined) {
    return client;
  }
  
  // Validate before trying to create client
  if (!validateSupabaseConfig()) {
    console.warn("[v0] Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
    client = null;
    return null;
  }
  
  try {
    // At this point, we know the config is valid
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    
    // Only create the client if we have valid-looking credentials
    if (!url || !key) {
      client = null;
      return null;
    }
    
    client = createBrowserClient(url, key);
    return client;
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error);
    client = null;
    return null;
  }
}

export function getSupabase() {
  return createClient();
}

// Export a getter that lazily initializes
export function getSupabaseClient() {
  return createClient();
}
