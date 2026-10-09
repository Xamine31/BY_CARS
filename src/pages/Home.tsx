import { ArrowRight, BadgeCheck, Globe2, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/showroom.jpg'
import VehicleCard from '../components/VehicleCard'
import { demoVehicles } from '../lib/demo'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Vehicle } from '../types'

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(demoVehicles.filter(v => v.featured))

  useEffect(() => {
    if (!supabase) return
    supabase.from('vehicles').select('*').eq('published', true).eq('featured', true).order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => { if (data?.length) setVehicles(data as Vehicle[]) })
  }, [])

  return <>
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,15,35,.94), rgba(5,15,35,.48) 58%, rgba(5,15,35,.16)), url(${heroImage})` }}>
      <div className="container hero-content">
        <span className="hero-kicker"><span className="pulse-dot" /> Marseille → Algérie</span>
        <h1>Votre prochain véhicule,<br/><em>prêt pour l’export.</em></h1>
        <p>BY CARS sélectionne des véhicules neufs et d’occasion avec des tarifs HT clairs et une présentation pensée pour l’export.</p>
        <div className="hero-actions">
          <Link className="btn btn-orange" to="/vehicules">Voir le stock <ArrowRight size={18} /></Link>
          <a className="btn btn-glass" href="tel:+33618175911">06 18 17 59 11</a>
        </div>
        <div className="hero-stats">
          <div><strong>FR → DZ</strong><span>Spécialiste export</span></div>
          <div><strong>HT</strong><span>Tarifs affichés</span></div>
          <div><strong>Marseille</strong><span>Showroom France</span></div>
        </div>
      </div>
    </section>

    {!isSupabaseConfigured && <div className="demo-banner">Mode démo : connectez Supabase avec le fichier <code>.env</code> pour afficher votre vrai stock.</div>}

    <section className="section container">
      <div className="section-heading split-heading">
        <div><span className="eyebrow orange">Sélection BY CARS</span><h2>Véhicules à la une</h2></div>
        <Link to="/vehicules" className="text-link">Tout le stock <ArrowRight size={17} /></Link>
      </div>
      <div className="vehicle-grid">{vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}</div>
    </section>

    <section className="dark-section">
      <div className="container">
        <div className="section-heading center-heading"><span className="eyebrow orange">Export simplifié</span><h2>Une expérience claire de Marseille à l’Algérie.</h2></div>
        <div className="service-grid">
          <div className="service-card"><BadgeCheck /><h3>Stock qualifié</h3><p>Des fiches complètes : motorisation, kilométrage, année, équipements et photos.</p></div>
          <div className="service-card"><Globe2 /><h3>Orientation export</h3><p>Un showroom pensé pour les clients qui recherchent un véhicule destiné à l’export.</p></div>
          <div className="service-card"><ShieldCheck /><h3>Prix HT lisible</h3><p>Le prix hors taxes est mis en avant directement sur chaque fiche véhicule.</p></div>
          <div className="service-card"><Truck /><h3>Contact direct</h3><p>Un échange simple avec l’équipe BY CARS pour vérifier disponibilité et modalités.</p></div>
        </div>
      </div>
    </section>

    <section className="cta-strip container">
      <div><span className="eyebrow orange">Vous avez un modèle en tête ?</span><h2>Parlez-nous de votre recherche.</h2></div>
      <Link to="/contact" className="btn btn-dark">Nous contacter <ArrowRight size={18}/></Link>
    </section>
  </>
}
