import { $, siteSettingsReady } from './common.js'
import { getSupabase, isSupabaseConfigured } from './supabase-client.js'

const DESTINATION = 'info@by-cars.fr'
const form = $('#contactForm')
const status = $('#formStatus')
const fallback = $('#formEmailFallback')
const button = $('#submitContact')
const deliveryEnabled = () => window.BY_CARS_CONFIG?.contactEmailDelivery === 'supabase'

function composeEmail(data){
  const subject = `Demande depuis BY CARS — ${data.name}`
  const body = [
    'Bonjour BY CARS,', '', `Nom : ${data.name}`, `Téléphone : ${data.phone}`,
    `E-mail : ${data.email || 'Non renseigné'}`, '', 'Ma demande :', data.message,
    '', 'Envoyé depuis https://www.by-cars.fr/contact.html'
  ].join('\n')
  return `mailto:${DESTINATION}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function fallbackEmail(url){
  fallback.replaceChildren()
  const link = document.createElement('a')
  link.href = url
  link.textContent = 'Ouvrir votre messagerie pour envoyer la demande ↗'
  link.className = 'mail-fallback-link'
  fallback.append(link)
  fallback.hidden = false
}

form?.addEventListener('submit', async event => {
  event.preventDefault()
  if (button.disabled) return
  const fd = new FormData(form)
  const data = {
    name: String(fd.get('name') || '').trim(),
    phone: String(fd.get('phone') || '').trim(),
    email: String(fd.get('email') || '').trim(),
    message: String(fd.get('message') || '').trim(),
    website: String(fd.get('website') || '').trim()
  }
  if (!data.name || !data.phone || !data.message) {
    status.textContent = 'Complétez les champs obligatoires.'
    return
  }
  if(data.website) { status.textContent='Votre demande ne peut pas être envoyée.'; return }
  const url = composeEmail(data)
  fallback.hidden = true
  button.disabled = true
  try {
    await siteSettingsReady
    if (deliveryEnabled()) {
      if (!isSupabaseConfigured()) throw Error('La connexion au service de contact n’est pas configurée.')
      status.textContent = 'Envoi de votre demande en cours…'
      const client = await getSupabase()
      const { data: result, error } = await client.functions.invoke('send-contact-email', { body: data })
      if(error || result?.ok !== true) throw Error('Le service d’envoi est indisponible pour le moment.')
      status.textContent = 'Votre demande a été envoyée à info@by-cars.fr. Merci !'
      form.reset()
    } else {
      status.textContent = 'Votre messagerie va s’ouvrir. Cliquez sur « Envoyer » pour transmettre votre demande.'
      fallbackEmail(url)
      window.location.href = url
    }
  } catch(error) {
    console.warn('Contact BY CARS :', error?.message || error)
    status.textContent = 'Envoi direct indisponible. Vous pouvez envoyer votre demande depuis votre messagerie.'
    fallbackEmail(url)
  } finally {
    button.disabled = false
  }
})

if (deliveryEnabled()) {
  button.textContent = 'Envoyer ma demande'
  status.textContent = 'Votre demande sera envoyée à info@by-cars.fr.'
}
