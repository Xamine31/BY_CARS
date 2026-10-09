import { ArrowUpRight, Gauge, CalendarDays, Fuel } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Vehicle } from '../types'
import { formatKm, formatPrice } from '../lib/format'

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const cover = vehicle.photos?.[0]
  return (
    <article className="vehicle-card">
      <Link to={`/vehicules/${vehicle.id}`} className="vehicle-image-wrap">
        {cover ? <img src={cover} className="vehicle-image" alt={`${vehicle.brand} ${vehicle.model}`} /> : (
          <div className="vehicle-placeholder"><span>BY</span><strong>CARS</strong></div>
        )}
        <div className="vehicle-badges">
          <span className="badge badge-orange">{vehicle.condition === 'neuf' ? 'Neuf' : 'Occasion'}</span>
          {vehicle.available && <span className="badge badge-light">Disponible</span>}
        </div>
      </Link>
      <div className="vehicle-card-body">
        <div className="vehicle-title-row">
          <div><p className="eyebrow">{vehicle.brand}</p><h3>{vehicle.model}</h3></div>
          <Link to={`/vehicules/${vehicle.id}`} aria-label="Voir le véhicule" className="round-link"><ArrowUpRight size={20} /></Link>
        </div>
        <p className="vehicle-trim">{vehicle.trim || 'Configuration à préciser'}</p>
        <div className="vehicle-meta">
          <span><CalendarDays size={16} />{vehicle.year}</span>
          <span><Gauge size={16} />{formatKm(vehicle.mileage)}</span>
          <span><Fuel size={16} />{vehicle.fuel}</span>
        </div>
        <div className="price-row"><span>Prix HT</span><strong>{formatPrice(vehicle.price_ht)}</strong></div>
      </div>
    </article>
  )
}
