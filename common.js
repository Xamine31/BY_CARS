import { getSupabase, isSupabaseConfigured } from './supabase-client.js'
import { demoVehicles } from './data.js'

export const cfg = window.BY_CARS_CONFIG || {}
export const DEMO_STORAGE_KEY = 'bycars_demo_vehicles_v3'
export const $ = (selector, root=document) => root.querySelector(selector)
export const $$ = (selector, root=document) => [...root.querySelectorAll(selector)]
export const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))
export const fmtPrice = value => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(value || 0))
export const fmtKm = value => `${new Intl.NumberFormat('fr-FR').format(Number(value || 0))} km`
export const safePhotos = vehicle => Array.isArray(vehicle?.photos) && vehicle.photos.filter(Boolean).length ? vehicle.photos.filter(Boolean) : ['assets/car-placeholder-1.svg']

export function loadDemoVehicles(){
  try{
    const saved = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || 'null')
    if(Array.isArray(saved) && saved.length) return saved
  }catch(error){ console.warn('Stock démo illisible, restauration du stock exemple.', error) }
  return typeof structuredClone === 'function' ? structuredClone(demoVehicles) : JSON.parse(JSON.stringify(demoVehicles))
}

export function saveDemoVehicles(vehicles){
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(vehicles))
}

export async function loadVehicles(){
  if(!isSupabaseConfigured()) return loadDemoVehicles().filter(v=>v.published!==false)
  try{
    const supabase = await getSupabase()
    const { data, error } = await supabase.from('vehicles').select('*').eq('published',true).order('created_at',{ascending:false})
    if(error) throw error
    return Array.isArray(data) ? data : []
  }catch(error){
    console.error('BY CARS : impossible de charger Supabase, affichage du stock de démonstration.', error)
    return loadDemoVehicles().filter(v=>v.published!==false)
  }
}

export async function loadVehicle(id){
  if(!id) return null
  if(!isSupabaseConfigured()) return loadDemoVehicles().find(v=>String(v.id)===String(id) && v.published!==false) || null
  try{
    const supabase = await getSupabase()
    const { data, error } = await supabase.from('vehicles').select('*').eq('id',id).eq('published',true).maybeSingle()
    if(error) throw error
    return data || null
  }catch(error){
    console.error('BY CARS : impossible de charger la fiche Supabase.', error)
    return loadDemoVehicles().find(v=>String(v.id)===String(id) && v.published!==false) || null
  }
}

export function vehicleUrl(vehicle){
  return `vehicule.html?id=${encodeURIComponent(vehicle.id)}`
}

export function vehicleCard(vehicle){
  const photos = safePhotos(vehicle)
  const available = vehicle.available !== false
  return `<article class="car-card">
    <a class="car-media" href="${vehicleUrl(vehicle)}" aria-label="Voir ${esc(vehicle.brand)} ${esc(vehicle.model)}">
      <img src="${esc(photos[0])}" alt="${esc(vehicle.brand)} ${esc(vehicle.model)}" loading="lazy" />
      <div class="car-badges">
        <span class="tag ${vehicle.condition==='neuf'?'tag-new':''}">${vehicle.condition==='neuf'?'Neuf':'Occasion'}</span>
        <span class="tag tag-availability ${available?'':'is-off'}">${available?'Disponible':'Indisponible'}</span>
      </div>
      ${photos.length>1?`<span class="photo-pill">${photos.length} photos</span>`:''}
    </a>
    <div class="car-content">
      <div class="car-overline"><span>${esc(vehicle.brand)}</span><span>${esc(vehicle.year || '')}</span></div>
      <h3><a href="${vehicleUrl(vehicle)}">${esc(vehicle.model)}</a></h3>
      <p class="car-trim">${esc(vehicle.trim || 'Finition à préciser')}</p>
      <div class="car-specs">
        <span>${esc(vehicle.fuel || '—')}</span><span>${esc(vehicle.transmission || '—')}</span><span>${fmtKm(vehicle.mileage)}</span>
      </div>
      <div class="car-footer">
        <div><small>Prix HT</small><strong>${fmtPrice(vehicle.price_ht)}</strong></div>
        <a class="arrow-link" href="${vehicleUrl(vehicle)}" aria-label="Ouvrir la fiche">↗</a>
      </div>
    </div>
  </article>`
}

export function whatsappLink(message){
  return `https://wa.me/${cfg.phoneIntl || '33618175911'}?text=${encodeURIComponent(message)}`
}

function initNavigation(){
  const toggle = $('#menuToggle')
  const panel = $('#mobileNav')
  if(toggle && panel){
    toggle.addEventListener('click',()=>{
      const open = !panel.classList.contains('open')
      panel.classList.toggle('open',open)
      toggle.classList.toggle('open',open)
      toggle.setAttribute('aria-expanded',String(open))
      panel.setAttribute('aria-hidden',String(!open))
      document.body.classList.toggle('nav-open',open)
    })
    $$('#mobileNav a').forEach(link=>link.addEventListener('click',()=>{
      panel.classList.remove('open'); toggle.classList.remove('open'); document.body.classList.remove('nav-open')
    }))
  }
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase()
  $$('[data-nav]').forEach(link=>{
    const target = (link.getAttribute('href')||'').split('?')[0].toLowerCase()
    if(target===current || (current==='vehicule.html' && target==='stock.html')) link.classList.add('active')
  })
}

function initGlobal(){
  $$('.js-year').forEach(el=>el.textContent=String(new Date().getFullYear()))
  $$('.js-phone-display').forEach(el=>el.textContent=cfg.phoneDisplay || '06 18 17 59 11')
  $$('.js-phone-link').forEach(el=>el.href=`tel:+${cfg.phoneIntl || '33618175911'}`)
  $$('.js-whatsapp-link').forEach(el=>{
    if(!el.href || el.getAttribute('href')==='#') el.href=whatsappLink('Bonjour BY CARS, je souhaite avoir des informations sur vos véhicules et votre service d’export vers l’Algérie, le Maroc et la Tunisie.')
  })
  initNavigation()
}

initGlobal()
