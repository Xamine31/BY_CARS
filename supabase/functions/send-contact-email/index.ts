// BY CARS — email handler, to deploy as Supabase Edge Function.
// Secrets RESEND_API_KEY and MAIL_FROM stay on the Supabase server.
// This endpoint intentionally accepts contact forms from the public website;
// a server-side quota, basic validation, honeypot, and origin allowlist restrict abuse.
const ALLOWED_ORIGINS = new Set([
  'https://www.by-cars.fr',
  'https://by-cars.fr',
  'https://xamine31.github.io',
  'http://localhost:8000',
  'http://localhost:5173'
])
const TO_EMAIL = 'info@by-cars.fr'
const maxBodyBytes = 12000

function respond(body: Record<string, unknown>, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(origin && ALLOWED_ORIGINS.has(origin) ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
      } : {})
    }
  })
}

function validEmail(raw: string) {
  return !raw || /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(raw)
}

Deno.serve(async request => {
  const origin = request.headers.get('origin')
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return respond({ ok: false, message: 'Origine refusée.' }, 403, null)
  if (request.method === 'OPTIONS') return respond({ ok: true }, 200, origin)
  if (request.method !== 'POST') return respond({ ok: false, message: 'Méthode non autorisée.' }, 405, origin)
  const length = Number(request.headers.get('content-length') || 0)
  if (length > maxBodyBytes) return respond({ ok: false, message: 'Message trop volumineux.' }, 413, origin)

  let payload: Record<string, unknown>
  try { payload = await request.json() } catch { return respond({ ok: false }, 400, origin) }
  const name = String(payload.name ?? '').trim().slice(0, 101)
  const phone = String(payload.phone ?? '').trim().slice(0, 41)
  const email = String(payload.email ?? '').trim().slice(0, 201)
  const message = String(payload.message ?? '').trim().slice(0, 4001)
  const website = String(payload.website ?? '').trim()
  // Quietly discard form spam targeting the hidden field.
  if (website) return respond({ ok: true }, 200, origin)
  if (!name || name.length > 100 || !phone || phone.length > 40 || !validEmail(email) || email.length > 200 || !message || message.length > 4000) {
    return respond({ ok: false, message: 'Veuillez vérifier les champs du formulaire.' }, 422, origin)
  }

  const apiKey = Deno.env.get('RESEND_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const mailFrom = Deno.env.get('MAIL_FROM') || 'BY CARS <contact@by-cars.fr>'
  if (!apiKey || !supabaseUrl || !serviceRoleKey) return respond({ ok: false, message: 'Service e-mail non configuré.' }, 503, origin)

  try {
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const salted = `${Deno.env.get('CONTACT_RATE_SALT') || apiKey}:${ip}`
    const bytes = new TextEncoder().encode(salted)
    const hashBytes = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
    const fingerprint = Array.from(hashBytes, b => b.toString(16).padStart(2, '0')).join('')
    const quotaRes = await fetch(`${supabaseUrl}/rest/v1/rpc/claim_contact_email_quota`, {
      method: 'POST',
      headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_fingerprint: fingerprint })
    })
    if (!quotaRes.ok) throw Error('Quota unavailable')
    const allowed = await quotaRes.json()
    if (!allowed) return respond({ ok: false, message: 'Trop de demandes. Veuillez réessayer plus tard.' }, 429, origin)

    const text = [
      'Nouvelle demande depuis www.by-cars.fr', '',
      `Nom : ${name}`, `Téléphone : ${phone}`, `E-mail : ${email || 'Non renseigné'}`, '',
      'Message :', message
    ].join('\n')
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: mailFrom,
        to: [TO_EMAIL],
        ...(email ? { reply_to: email } : {}),
        subject: `BY CARS — demande de ${name.replace(/[\r\n]/g, ' ').slice(0, 70)}`,
        text
      })
    })
    if (!sent.ok) throw Error(`Resend status ${sent.status}`)

    // Backup to the existing database (email delivery success doesn't depend on it).
    try {
      await fetch(`${supabaseUrl}/rest/v1/contact_requests`, {
        method: 'POST',
        headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ name, phone, email: email || null, message })
      })
    } catch { /* email already delivered */ }

    return respond({ ok: true }, 200, origin)
  } catch (error) {
    console.error('BY CARS: email delivery failed:', error instanceof Error ? error.message : 'unknown')
    return respond({ ok: false, message: 'Envoi indisponible.' }, 503, origin)
  }
})
