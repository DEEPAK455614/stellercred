// ============================================================
// StellarCred — Supabase Client (Mock/Ready)
// ============================================================

// When Supabase is connected, uncomment the following:
// import { createClient } from "@supabase/supabase-js";
//
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
//
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For now, all data operations go through the Next.js API routes.
// This file is a placeholder for future Supabase client integration.
// The API routes will handle database operations via fetch or direct DB connection.

/**
 * Placeholder for fetching data from API route.
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(endpoint, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}
