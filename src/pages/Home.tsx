import { ArrowRight, BadgeCheck, Check, Globe2, MessageCircle, ShieldCheck, Sparkles, Truck } from 'lucide-react'
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
    <section className="hero" style={{ backgroundImage: `linear-gradient(96deg, rgba(5,13,30,.97) 0%, rgba(5,13,30,.84) 46%, rgba(5,13,30,.30) 100%), url(${heroImage})` }}>
      <div className="hero-glow" />
      <div className="container hero-layout">
        <div className="hero-content">
          <span className="hero-kicker"><span className="pulse-dot" /> Showroom automobile • Marseille</span>
          <h1>Votre voiture.<br/><em>Notre route vers l’Algérie.</em></h1>
          <p>Véhicules neufs et d’occasion sélectionnés en France, prix HT transparents et accompagnement pensé pour l’export.</p>
          <div className="hero-actions">
            <Link className="btn btn-orange btn-lg" to="/vehicules">Découvrir le stock <ArrowRight size={18} /></Link>
            <a className="btn btn-glass btn-lg" href="https://wa.me/33618175911" target="_blank" rel="noreferrer"><MessageCircle size={18}/> WhatsApp</a>
          </div>
          <div className="hero-proof">
            <span><Check size={15}/> Prix HT affichés</span>
            <span><Check size={15}/> Neuf & occasion</span>
            <span><Check size={15}/> Contact direct</span>
          </div>
        </div>

        <aside className="hero-card">
          <div className="hero-card-icon"><Sparkles size={20}/></div>
          <span className="eyebrow orange">BY CARS EXPORT</span>
          <h2>France <b>→</b> Algérie</h2>
          <p>Un showroom simple, rapide et transparent pour choisir votre prochain véhicule depuis Marseille.</p>
          <div className="hero-card-list">
            <div><span>01</span><div><strong>Choisissez</strong><small>Parcourez le stock disponible</small></div></div>
            <div><span>02</span><div><strong>Contactez-nous</strong><small>Vérifiez le véhicule et les modalités</small></div></div>
            <div><span>03</span><div><strong>Préparez l’export</strong><small>Échange direct avec BY CARS</small></div></div>
          </div>
        </aside>
      </div>
    </section>

    {!isSupabaseConfigured && <div className="demo-banner">Mode démonstration — le vrai stock apparaîtra après connexion à Supabase.</div>}

    <section className="section container featured-section">
      <div className="section-heading split-heading">
        <div><span className="eyebrow orange">En ce moment</span><h2>Les véhicules à la une.</h2><p className="section-intro">Une sélection claire, avec les informations essentielles avant même de nous appeler.</p></div>
        <Link to="/vehicules" className="text-link">Voir tout le stock <ArrowRight size={17} /></Link>
      </div>
      <div className="vehicle-grid">{vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}</div>
    </section>

    <section className="dark-section">
      <div className="dark-orb dark-orb-one"/><div className="dark-orb dark-orb-two"/>
      <div className="container dark-section-inner">
        <div className="section-heading center-heading"><span className="eyebrow orange">Pensé pour l’export</span><h2>Moins de complications.<br/>Plus de visibilité.</h2><p>Tout ce dont vous avez besoin pour prendre votre décision rapidement.</p></div>
        <div className="service-grid">
          <div className="service-card"><div className="service-icon"><BadgeCheck /></div><span>01</span><h3>Stock qualifié</h3><p>Année, kilométrage, motorisation, équipements et photos détaillées.</p></div>
          <div className="service-card"><div className="service-icon"><Globe2 /></div><span>02</span><h3>Orientation export</h3><p>Une présentation adaptée aux clients qui achètent depuis ou pour l’Algérie.</p></div>
          <div className="service-card"><div className="service-icon"><ShieldCheck /></div><span>03</span><h3>Prix HT visible</h3><p>Une information tarifaire mise en avant sans détour sur chaque véhicule.</p></div>
          <div className="service-card"><div className="service-icon"><Truck /></div><span>04</span><h3>Équipe joignable</h3><p>Téléphone ou WhatsApp pour vérifier rapidement la disponibilité du véhicule.</p></div>
        </div>
      </div>
    </section>

    <section className="cta-strip container">
      <div><span className="eyebrow orange">Recherche personnalisée</span><h2>Vous avez déjà un modèle en tête ?</h2><p>Dites-nous ce que vous recherchez et votre budget HT.</p></div>
      <div className="cta-actions"><Link to="/contact" className="btn btn-dark btn-lg">Faire une demande <ArrowRight size={18}/></Link><a href="tel:+33618175911" className="cta-phone">06 18 17 59 11</a></div>
    </section>
  </>
}
