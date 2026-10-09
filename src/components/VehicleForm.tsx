import { FormEvent, useMemo, useState } from 'react'
import { ImagePlus, Loader2, Save, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Vehicle, VehiclePayload } from '../types'

type Props = { vehicle?: Vehicle | null; onSaved: () => void; onCancel: () => void }

const empty: VehiclePayload = {
  brand: '', model: '', trim: '', price_ht: 0, condition: 'occasion', year: new Date().getFullYear(), mileage: 0,
  fuel: 'Essence', transmission: 'Automatique', engine: '', power_hp: null, color: '', doors: 5, seats: 5,
  description: '', photos: [], featured: false, available: true, published: true,
}

export default function VehicleForm({ vehicle, onSaved, onCancel }: Props) {
  const initial = useMemo<VehiclePayload>(() => vehicle ? {
    brand: vehicle.brand, model: vehicle.model, trim: vehicle.trim, price_ht: vehicle.price_ht, condition: vehicle.condition,
    year: vehicle.year, mileage: vehicle.mileage, fuel: vehicle.fuel, transmission: vehicle.transmission, engine: vehicle.engine,
    power_hp: vehicle.power_hp, color: vehicle.color, doors: vehicle.doors, seats: vehicle.seats, description: vehicle.description,
    photos: vehicle.photos || [], featured: vehicle.featured, available: vehicle.available, published: vehicle.published,
  } : empty, [vehicle])
  const [form, setForm] = useState<VehiclePayload>(initial)
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = <K extends keyof VehiclePayload>(key: K, value: VehiclePayload[K]) => setForm(f => ({ ...f, [key]: value }))

  const uploadPhotos = async () => {
    if (!supabase || !files.length) return [] as string[]
    const session = (await supabase.auth.getSession()).data.session
    if (!session) throw new Error('Session admin expirée')
    const urls: string[] = []
    for (const file of files) {
      const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')
      const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2,7)}-${safe}`
      const { error } = await supabase.storage.from('vehicle-images').upload(path, file, { upsert: false })
      if (error) throw error
      urls.push(supabase.storage.from('vehicle-images').getPublicUrl(path).data.publicUrl)
    }
    return urls
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (!supabase) throw new Error('Supabase n’est pas configuré.')
      const newPhotos = await uploadPhotos()
      const payload = { ...form, photos: [...form.photos, ...newPhotos] }
      const req = vehicle ? supabase.from('vehicles').update(payload).eq('id', vehicle.id) : supabase.from('vehicles').insert(payload)
      const { error } = await req
      if (error) throw error
      onSaved()
    } catch (err) { setError(err instanceof Error ? err.message : 'Erreur inconnue') }
    finally { setSaving(false) }
  }

  return <form className="admin-form" onSubmit={submit}>
    <div className="admin-form-head"><div><span className="eyebrow orange">Catalogue</span><h2>{vehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h2></div><button type="button" className="icon-btn" onClick={onCancel}><X/></button></div>
    <div className="form-grid three"><label>Marque<input required value={form.brand} onChange={e=>set('brand',e.target.value)} /></label><label>Modèle<input required value={form.model} onChange={e=>set('model',e.target.value)} /></label><label>Finition<input value={form.trim || ''} onChange={e=>set('trim',e.target.value)} /></label></div>
    <div className="form-grid four"><label>Prix HT (€)<input required type="number" min="0" value={form.price_ht} onChange={e=>set('price_ht',Number(e.target.value))}/></label><label>État<select value={form.condition} onChange={e=>set('condition',e.target.value as VehiclePayload['condition'])}><option value="neuf">Neuf</option><option value="occasion">Occasion</option></select></label><label>Année<input required type="number" min="1990" max="2100" value={form.year} onChange={e=>set('year',Number(e.target.value))}/></label><label>Kilométrage<input required type="number" min="0" value={form.mileage} onChange={e=>set('mileage',Number(e.target.value))}/></label></div>
    <div className="form-grid three"><label>Carburant<input required value={form.fuel} onChange={e=>set('fuel',e.target.value)} placeholder="Diesel, Essence, Hybride…"/></label><label>Boîte<input required value={form.transmission} onChange={e=>set('transmission',e.target.value)} placeholder="Automatique"/></label><label>Motorisation<input value={form.engine || ''} onChange={e=>set('engine',e.target.value)} placeholder="2.0 BlueHDi"/></label></div>
    <div className="form-grid four"><label>Puissance (ch)<input type="number" value={form.power_hp ?? ''} onChange={e=>set('power_hp',e.target.value ? Number(e.target.value) : null)}/></label><label>Couleur<input value={form.color || ''} onChange={e=>set('color',e.target.value)}/></label><label>Portes<input type="number" value={form.doors ?? ''} onChange={e=>set('doors',e.target.value ? Number(e.target.value) : null)}/></label><label>Places<input type="number" value={form.seats ?? ''} onChange={e=>set('seats',e.target.value ? Number(e.target.value) : null)}/></label></div>
    <label>Description<textarea rows={5} value={form.description || ''} onChange={e=>set('description',e.target.value)} placeholder="État, équipements, historique, points forts…" /></label>
    <div className="photo-manager">
      <label className="file-drop"><ImagePlus/><strong>Ajouter des photos</strong><span>JPG, PNG, WEBP — sélection multiple</span><input type="file" accept="image/*" multiple onChange={e=>setFiles(Array.from(e.target.files || []))}/></label>
      {!!form.photos.length && <div className="existing-photos">{form.photos.map((url,i)=><div key={url}><img src={url} alt=""/><button type="button" onClick={()=>set('photos',form.photos.filter((_,j)=>j!==i))}><X size={14}/></button></div>)}</div>}
      {!!files.length && <p className="microcopy">{files.length} nouvelle(s) photo(s) sélectionnée(s).</p>}
    </div>
    <div className="toggle-row"><label><input type="checkbox" checked={form.featured} onChange={e=>set('featured',e.target.checked)}/> À la une</label><label><input type="checkbox" checked={form.available} onChange={e=>set('available',e.target.checked)}/> Disponible</label><label><input type="checkbox" checked={form.published} onChange={e=>set('published',e.target.checked)}/> Publié</label></div>
    {error && <p className="error">{error}</p>}
    <div className="form-actions"><button type="button" className="btn btn-outline" onClick={onCancel}>Annuler</button><button className="btn btn-orange" disabled={saving}>{saving ? <><Loader2 className="spin" size={17}/> Enregistrement…</> : <><Save size={17}/> Enregistrer</>}</button></div>
  </form>
}
