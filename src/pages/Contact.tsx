import { CheckCircle2, MapPin, Phone, Send } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Contact() {
  const [status, setStatus] = useState<'idle'|'sending'|'done'|'error'>('idle')
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setStatus('sending')
    const fd = new FormData(e.currentTarget)
    if (!supabase) { setTimeout(() => setStatus('done'), 400); e.currentTarget.reset(); return }
    const { error } = await supabase.from('inquiries').insert({
      name: String(fd.get('name') || ''), phone: String(fd.get('phone') || ''), email: String(fd.get('email') || ''), message: String(fd.get('message') || '')
    })
    if (error) setStatus('error'); else { setStatus('done'); e.currentTarget.reset() }
  }

  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow orange">Contact</span><h1>Votre projet automobile.</h1><p>Demandez une disponibilité ou parlez-nous du véhicule que vous recherchez pour l’export.</p></div></section>
    <section className="section container contact-grid">
      <div>
        <span className="eyebrow orange">BY CARS</span><h2>Échangez avec notre équipe.</h2>
        <p className="lead">Nous sommes basés à Marseille et spécialisés dans l’export de véhicules de France vers l’Algérie.</p>
        <div className="contact-card"><Phone/><div><span>Téléphone</span><a href="tel:+33618175911">06 18 17 59 11</a></div></div>
        <div className="contact-card"><MapPin/><div><span>Localisation</span><strong>Marseille, France</strong></div></div>
      </div>
      <form className="contact-form panel" onSubmit={submit}>
        <div className="form-row"><label>Nom<input name="name" required placeholder="Votre nom" /></label><label>Téléphone<input name="phone" required placeholder="06…" /></label></div>
        <label>Email<input name="email" type="email" placeholder="email@exemple.fr" /></label>
        <label>Votre demande<textarea name="message" rows={6} required placeholder="Modèle recherché, budget HT, année, motorisation…" /></label>
        <button className="btn btn-orange" disabled={status==='sending'}>{status==='sending' ? 'Envoi…' : <>Envoyer la demande <Send size={17}/></>}</button>
        {status==='done' && <p className="success"><CheckCircle2 size={17}/> Demande enregistrée.</p>}
        {status==='error' && <p className="error">Impossible d’envoyer pour le moment.</p>}
      </form>
    </section>
  </main>
}
