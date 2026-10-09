import type { Session } from '@supabase/supabase-js'
import { Edit3, LogOut, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import VehicleForm from '../components/VehicleForm'
import { formatPrice } from '../lib/format'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Vehicle } from '../types'

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [editing, setEditing] = useState<Vehicle | null | 'new'>(null)
  const [authError, setAuthError] = useState('')

  const checkAdmin = async (s: Session | null) => {
    setSession(s)
    if (!supabase || !s) { setIsAdmin(false); setChecking(false); return }
    const { data } = await supabase.from('admins').select('user_id').eq('user_id', s.user.id).maybeSingle()
    setIsAdmin(Boolean(data)); setChecking(false)
  }

  const loadVehicles = async () => {
    if (!supabase) return
    const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    setVehicles((data || []) as Vehicle[])
  }

  useEffect(() => {
    if (!supabase) { setChecking(false); return }
    supabase.auth.getSession().then(({ data }) => checkAdmin(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => checkAdmin(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => { if (isAdmin) loadVehicles() }, [isAdmin])

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setAuthError('')
    if (!supabase) return
    const fd = new FormData(e.currentTarget)
    const { error } = await supabase.auth.signInWithPassword({ email: String(fd.get('email')), password: String(fd.get('password')) })
    if (error) setAuthError('Identifiants incorrects ou compte non autorisé.')
  }

  const del = async (v: Vehicle) => {
    if (!supabase || !confirm(`Supprimer ${v.brand} ${v.model} ?`)) return
    await supabase.from('vehicles').delete().eq('id', v.id); loadVehicles()
  }

  if (!isSupabaseConfigured) return <main className="admin-page"><div className="admin-setup"><ShieldCheck size={42}/><h1>Connexion Supabase requise</h1><p>Copiez <code>.env.example</code> vers <code>.env</code>, renseignez l’URL et la clé anon, puis exécutez <code>supabase/schema.sql</code> dans l’éditeur SQL Supabase.</p></div></main>
  if (checking) return <main className="admin-page"><div className="admin-setup">Vérification de la session…</div></main>
  if (!session) return <main className="admin-page"><form className="login-card" onSubmit={login}><ShieldCheck size={36}/><span className="eyebrow orange">Espace sécurisé</span><h1>Administration BY CARS</h1><p>Connectez-vous avec le compte administrateur créé dans Supabase Auth.</p><label>Email<input name="email" type="email" required/></label><label>Mot de passe<input name="password" type="password" required/></label>{authError&&<p className="error">{authError}</p>}<button className="btn btn-orange full">Se connecter</button></form></main>
  if (!isAdmin) return <main className="admin-page"><div className="admin-setup"><h1>Compte non autorisé</h1><p>Ce compte existe dans Supabase Auth mais n’est pas présent dans la table <code>admins</code>.</p><button className="btn btn-dark" onClick={()=>supabase?.auth.signOut()}>Déconnexion</button></div></main>

  return <main className="admin-shell">
    <aside className="admin-sidebar"><div><span className="admin-brand">BY <b>CARS</b></span><small>Gestion du showroom</small></div><button onClick={()=>supabase?.auth.signOut()}><LogOut size={17}/> Déconnexion</button></aside>
    <section className="admin-content">
      {editing ? <VehicleForm vehicle={editing === 'new' ? null : editing} onCancel={()=>setEditing(null)} onSaved={()=>{setEditing(null);loadVehicles()}}/> : <>
        <div className="admin-top"><div><span className="eyebrow orange">Dashboard</span><h1>Véhicules</h1><p>{vehicles.length} entrée{vehicles.length>1?'s':''} dans le catalogue.</p></div><button className="btn btn-orange" onClick={()=>setEditing('new')}><Plus size={18}/> Ajouter une voiture</button></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Véhicule</th><th>État</th><th>Année</th><th>Prix HT</th><th>Statut</th><th></th></tr></thead><tbody>{vehicles.map(v=><tr key={v.id}><td><strong>{v.brand} {v.model}</strong><span>{v.trim}</span></td><td><span className="badge badge-soft">{v.condition}</span></td><td>{v.year}</td><td>{formatPrice(v.price_ht)}</td><td><span className={v.published?'status-label live':'status-label'}>{v.published?'Publié':'Brouillon'}</span></td><td className="table-actions"><button onClick={()=>setEditing(v)} title="Modifier"><Edit3 size={17}/></button><button onClick={()=>del(v)} title="Supprimer"><Trash2 size={17}/></button></td></tr>)}</tbody></table>{!vehicles.length&&<div className="empty-state compact"><h3>Aucun véhicule</h3><p>Ajoutez votre première voiture.</p></div>}</div>
      </>}
    </section>
  </main>
}
