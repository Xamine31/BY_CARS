import { ArrowLeft, CalendarDays, Car, Fuel, Gauge, MessageCircle, Palette, Phone, Settings2, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PhotoCarousel from '../components/PhotoCarousel'
import { demoVehicles } from '../lib/demo'
import { formatKm, formatPrice } from '../lib/format'
import { supabase } from '../lib/supabase'
import type { Vehicle } from '../types'

export default function VehicleDetail() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(demoVehicles.find(v => v.id === id) || null)
  const [loading, setLoading] = useState(Boolean(supabase && !vehicle))

  useEffect(() => {
    if (!supabase || !id || id.startsWith('demo-')) return
    setLoading(true)
    supabase.from('vehicles').select('*').eq('id', id).eq('published', true).single()
      .then(({ data }) => { setVehicle(data as Vehicle | null); setLoading(false) })
  }, [id])

  if (loading) return <div className="section container">Chargement…</div>
  if (!vehicle) return <div className="section container empty-state"><h2>Véhicule introuvable</h2><Link to="/vehicules" className="btn btn-dark">Retour au stock</Link></div>

  const specs = [
    [CalendarDays, 'Année', vehicle.year],
    [Gauge, 'Kilométrage', formatKm(vehicle.mileage)],
    [Fuel, 'Carburant', vehicle.fuel],
    [Settings2, 'Boîte', vehicle.transmission],
    [Car, 'Motorisation', vehicle.engine || '—'],
    [Palette, 'Couleur', vehicle.color || '—'],
    [UsersRound, 'Places', vehicle.seats || '—'],
  ] as const

  return <main className="detail-page container">
    <Link className="back-link" to="/vehicules"><ArrowLeft size={17}/> Retour au stock</Link>
    <div className="detail-grid">
      <div><PhotoCarousel photos={vehicle.photos || []} alt={`${vehicle.brand} ${vehicle.model}`} /></div>
      <aside className="detail-summary">
        <span className="badge badge-orange">{vehicle.condition === 'neuf' ? 'Neuf' : 'Occasion'}</span>
        <p className="eyebrow">{vehicle.brand}</p><h1>{vehicle.model}</h1><p className="detail-trim">{vehicle.trim}</p>
        <div className="detail-price"><span>Prix HT</span><strong>{formatPrice(vehicle.price_ht)}</strong></div>
        <div className="detail-status"><span className={vehicle.available ? 'status-dot green' : 'status-dot'} />{vehicle.available ? 'Disponible' : 'Indisponible'}</div>
        <a href="tel:+33618175911" className="btn btn-orange full">Appeler BY CARS</a>
        <a href={`https://wa.me/33618175911?text=${encodeURIComponent(`Bonjour BY CARS, je souhaite des informations sur ${vehicle.brand} ${vehicle.model} ${vehicle.year}.`)}`} className="btn btn-outline full" target="_blank" rel="noreferrer">Demander sur WhatsApp</a>
        <p className="microcopy">Référence du véhicule : {vehicle.id.slice(0, 8).toUpperCase()}</p>
      </aside>
    </div>
    <section className="detail-content">
      <div><span className="eyebrow orange">Caractéristiques</span><h2>Fiche technique</h2><div className="spec-grid">{specs.map(([Icon, label, value]) => <div className="spec" key={label}><Icon/><span>{label}</span><strong>{value}</strong></div>)}</div></div>
      <div className="description-card"><span className="eyebrow orange">Présentation</span><h2>À propos du véhicule</h2><p>{vehicle.description || 'Contactez BY CARS pour obtenir plus de détails sur ce véhicule.'}</p>{vehicle.power_hp && <p><strong>Puissance :</strong> {vehicle.power_hp} ch</p>}</div>
    </section>
    <div className="mobile-contact-bar">
      <a href="tel:+33618175911" className="mobile-contact-call"><Phone size={19}/><span>Appeler</span></a>
      <a href={`https://wa.me/33618175911?text=${encodeURIComponent(`Bonjour BY CARS, je souhaite des informations sur ${vehicle.brand} ${vehicle.model} ${vehicle.year}.`)}`} className="mobile-contact-whatsapp" target="_blank" rel="noreferrer"><MessageCircle size={19}/><span>WhatsApp</span></a>
    </div>
  </main>
}
