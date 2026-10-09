import { Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import VehicleCard from '../components/VehicleCard'
import { demoVehicles } from '../lib/demo'
import { supabase } from '../lib/supabase'
import type { Vehicle, VehicleCondition } from '../types'

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(demoVehicles)
  const [query, setQuery] = useState('')
  const [condition, setCondition] = useState<'all' | VehicleCondition>('all')
  const [fuel, setFuel] = useState('all')
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    if (!supabase) return
    supabase.from('vehicles').select('*').eq('published', true).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setVehicles(data as Vehicle[]) })
  }, [])

  const fuels = useMemo(() => [...new Set(vehicles.map(v => v.fuel))], [vehicles])
  const filtered = useMemo(() => {
    let result = vehicles.filter(v => {
      const text = `${v.brand} ${v.model} ${v.trim || ''}`.toLowerCase()
      return text.includes(query.toLowerCase()) && (condition === 'all' || v.condition === condition) && (fuel === 'all' || v.fuel === fuel)
    })
    result = [...result].sort((a, b) => sort === 'price-asc' ? a.price_ht - b.price_ht : sort === 'price-desc' ? b.price_ht - a.price_ht : b.year - a.year)
    return result
  }, [vehicles, query, condition, fuel, sort])

  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow orange">Showroom</span><h1>Nos véhicules</h1><p>Neufs et occasions disponibles à Marseille, avec présentation orientée export.</p></div></section>
    <section className="section container">
      <div className="filters">
        <label className="search-field"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Marque, modèle, finition…" /></label>
        <select value={condition} onChange={e => setCondition(e.target.value as typeof condition)}><option value="all">Neuf + occasion</option><option value="neuf">Neuf</option><option value="occasion">Occasion</option></select>
        <select value={fuel} onChange={e => setFuel(e.target.value)}><option value="all">Toutes motorisations</option>{fuels.map(x => <option key={x}>{x}</option>)}</select>
        <select value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Plus récents</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option></select>
      </div>
      <div className="results-line"><span><SlidersHorizontal size={17}/> {filtered.length} véhicule{filtered.length > 1 ? 's' : ''}</span></div>
      <div className="vehicle-grid">{filtered.map(v => <VehicleCard key={v.id} vehicle={v} />)}</div>
      {!filtered.length && <div className="empty-state"><h3>Aucun véhicule ne correspond.</h3><p>Modifiez les filtres ou contactez BY CARS pour votre recherche.</p></div>}
    </section>
  </main>
}
