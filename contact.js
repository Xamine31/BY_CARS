import { $, whatsappLink, siteSettingsReady } from './common.js'

const form = $('#contactForm')
const status = $('#formStatus')

form?.addEventListener('submit', async event => {
  event.preventDefault()
  const fd = new FormData(form)
  const name = String(fd.get('name') || '').trim()
  const phone = String(fd.get('phone') || '').trim()
  const email = String(fd.get('email') || '').trim()
  const message = String(fd.get('message') || '').trim()

  const lines = [
    'Bonjour BY CARS,',
    `Je m’appelle ${name}.`,
    `Téléphone : ${phone}`,
    email ? `Email : ${email}` : null,
    '',
    'Ma demande :',
    message
  ].filter(value => value !== null)

  status.textContent = 'Ouverture de WhatsApp…'
  await siteSettingsReady
  const url = whatsappLink(lines.join('\n'), 'form')
  window.location.href = url
})
