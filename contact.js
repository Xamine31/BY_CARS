import { $, cfg, whatsappLink } from './common.js'
import { getSupabase, isSupabaseConfigured } from './supabase-client.js'

const form = $('#contactForm')
const status = $('#formStatus')
form?.addEventListener('submit',async event=>{
  event.preventDefault()
  status.textContent='Envoi en cours…'
  const fd = new FormData(form)
  const payload = {name:fd.get('name'),phone:fd.get('phone'),email:fd.get('email')||null,message:fd.get('message')}
  if(isSupabaseConfigured()){
    try{
      const supabase = await getSupabase()
      const { error } = await supabase.from('contact_requests').insert(payload)
      if(error) throw error
      form.reset(); status.textContent='Merci, votre demande a bien été envoyée.'; return
    }catch(error){console.error(error)}
  }
  status.textContent='Ouverture de WhatsApp…'
  window.open(whatsappLink(`Bonjour BY CARS, je m'appelle ${payload.name}. Téléphone : ${payload.phone}. Ma demande : ${payload.message}`),'_blank','noopener')
})
