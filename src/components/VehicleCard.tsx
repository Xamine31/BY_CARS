import { ArrowUpRight, CalendarDays, Fuel, Gauge, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Vehicle } from '../types'
import { formatKm, formatPrice } from '../lib/format'

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const cover = vehicle.photos?.[0]
  return (
    <article className="vehicle-card">
      <Link to={`/vehicules/${vehicle.id}`} className="vehicle-image-wrap" aria-label={`Voir ${vehicle.brand} ${vehicle.model}`}>
        {cover ? <img src={cover} className="vehicle-image" alt={`${vehicle.brand} ${vehicle.model}`} /> : (
          <div className="vehicle-placeholder"><span>BY</span><strong>CARS</strong></div>
        )}
        <div className="vehicle-image-shade" />
        <div className="vehicle-badges">
          <span className="badge badge-orange">{vehicle.condition === 'neuf' ? 'Neuf' : 'Occasion'}</span>
          {vehicle.available && <span className="badge badge-light"><i className="availability-dot"/> Disponible</span>}
        </div>
        <span className="vehicle-open"><ArrowUpRight size={19}/></span>
      </Link>
      <div className="vehicle-card-body">
        <div className="vehicle-title-row">
          <div><p className="eyebrow">{vehicle.brand}</p><h3>{vehicle.model}</h3></div>
          <div className="card-price"><span>Prix HT</span><strong>{formatPrice(vehicle.price_ht)}</strong></div>
        </div>
        <p className="vehicle-trim">{vehicle.trim || 'Configuration disponible'}</p>
        <div className="vehicle-meta">
          <span><CalendarDays size={15}/>{vehicle.year}</span>
          <span><Gauge size={15}/>{formatKm(vehicle.mileage)}</span>
          <span><Fuel size={15}/>{vehicle.fuel}</span>
          <span><Settings2 size={15}/>{vehicle.transmission}</span>
        </div>
        <Link className="vehicle-card-link" to={`/vehicules/${vehicle.id}`}>Voir le véhicule <ArrowUpRight size={16}/></Link>
      </div>
    </article>
  )
}
