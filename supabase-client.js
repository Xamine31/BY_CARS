let clientPromise = null

export function isSupabaseConfigured() {
  const cfg = window.BY_CARS_CONFIG || {}
  const key = cfg.supabasePublishableKey || cfg.supabaseAnonKey || ''
  return Boolean(
    cfg.supabaseUrl &&
    key &&
    !cfg.supabaseUrl.includes('YOUR_PROJECT') &&
    !key.includes('REPLACE_ME')
  )
}

export async function getSupabase() {
  if (!isSupabaseConfigured()) return null
  if (!clientPromise) {
    clientPromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm').then(({ createClient }) => {
      const cfg = window.BY_CARS_CONFIG || {}
      const key = cfg.supabasePublishableKey || cfg.supabaseAnonKey
      return createClient(cfg.supabaseUrl, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
    })
  }
  return clientPromise
}
