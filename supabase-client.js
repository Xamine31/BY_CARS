let clientPromise = null

export function isSupabaseConfigured() {
  const cfg = window.BY_CARS_CONFIG || {}
  return Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && !cfg.supabaseUrl.includes('YOUR_PROJECT'))
}

export async function getSupabase() {
  if (!isSupabaseConfigured()) return null
  if (!clientPromise) {
    clientPromise = import('https://esm.sh/@supabase/supabase-js@2.57.4').then(({ createClient }) => {
      const cfg = window.BY_CARS_CONFIG
      return createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    })
  }
  return clientPromise
}
