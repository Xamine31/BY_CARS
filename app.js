import { getSupabase, isSupabaseConfigured } from './supabase-client.js'

const demoVehicles = [
  {id:'demo-1',brand:'Peugeot',model:'3008',trim:'Hybrid 136 e-DCS6',price_ht:28900,condition:'occasion',year:2025,mileage:12800,fuel:'Hybride essence',transmission:'Automatique',engine:'1.2 Hybrid',power_hp:136,color:'Gris',doors:5,seats:5,description:'SUV moderne et polyvalent, présenté ici en véhicule de démonstration. Connectez Supabase pour afficher votre vrai stock.',photos:['assets/car-placeholder-1.svg','assets/car-placeholder-2.svg'],featured:true,available:true,published:true,created_at:'2026-10-01'},
  {id:'demo-2',brand:'Renault',model:'Clio',trim:'Techno TCe 90',price_ht:16750,condition:'neuf',year:2026,mileage:20,fuel:'Essence',transmission:'Manuelle',engine:'1.0 TCe',power_hp:90,color:'Blanc',doors:5,seats:5,description:'Citadine récente, économique et pratique. Exemple de fiche neuve en attendant votre stock Supabase.',photos:['assets/car-placeholder-2.svg','assets/car-placeholder-3.svg'],featured:true,available:true,published:true,created_at:'2026-09-28'},
  {id:'demo-3',brand:'Dacia',model:'Duster',trim:'Journey ECO-G 100',price_ht:21900,condition:'occasion',year:2024,mileage:22400,fuel:'GPL / Essence',transmission:'Manuelle',engine:'ECO-G 100',power_hp:100,color:'Noir',doors:5,seats:5,description:'SUV robuste et polyvalent. Exemple de présentation avant connexion de la base de données.',photos:['assets/car-placeholder-3.svg','assets/car-placeholder-1.svg'],featured:true,available:true,published:true,created_at:'2026-09-20'},
  {id:'demo-4',brand:'Citroën',model:'C3',trim:'Plus PureTech 100',price_ht:15400,condition:'neuf',year:2026,mileage:12,fuel:'Essence',transmission:'Manuelle',engine:'1.2 PureTech',power_hp:100,color:'Bleu',doors:5,seats:5,description:'Exemple de véhicule neuf pour visualiser le catalogue.',photos:['assets/car-placeholder-1.svg'],featured:false,available:true,published:true,created_at:'2026-09-15'},
  {id:'demo-5',brand:'Volkswagen',model:'T-Roc',trim:'Life 1.5 TSI DSG',price_ht:27600,condition:'occasion',year:2024,mileage:18500,fuel:'Essence',transmission:'Automatique',engine:'1.5 TSI',power_hp:150,color:'Noir',doors:5,seats:5,description:'Exemple de SUV compact avec boîte automatique.',photos:['assets/car-placeholder-2.svg'],featured:false,available:true,published:true,created_at:'2026-09-12'},
  {id:'demo-6',brand:'Toyota',model:'Yaris Cross',trim:'Design Hybrid',price_ht:24300,condition:'occasion',year:2025,mileage:9100,fuel:'Hybride',transmission:'Automatique',engine:'1.5 Hybrid',power_hp:116,color:'Gris',doors:5,seats:5,description:'Exemple de véhicule hybride pour le catalogue.',photos:['assets/car-placeholder-3.svg'],featured:false,available:true,published:true,created_at:'2026-09-09'}
]

let vehicles = [...demoVehicles]
let activeVehicle = null
let activePhotoIndex = 0
let touchStartX = 0

const $ = (selector, root=document) => root.querySelector(selector)
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)]
const cfg = window.BY_CARS_CONFIG || {}
const fmtPrice = value => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(value || 0))
const fmtKm = value => `${new Intl.NumberFormat('fr-FR').format(Number(value || 0))} km`
const safePhotos = v => Array.isArray(v.photos) && v.photos.length ? v.photos.filter(Boolean) : ['assets/car-placeholder-1.svg']
const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))

function renderCard(v){
  const photos=safePhotos(v)
  return `<article class="vehicle-card">
    <div class="vehicle-photo">
      <img src="${esc(photos[0])}" alt="${esc(v.brand)} ${esc(v.model)}" loading="lazy" />
      <span class="badge ${v.condition==='neuf'?'new':''}">${v.condition==='neuf'?'Neuf':'Occasion'}</span>
      <span class="availability ${v.available===false?'off':''}">${v.available===false?'Indisponible':'Disponible'}</span>
      ${photos.length>1?`<span class="photo-count">${photos.length} photos</span>`:''}
    </div>
    <div class="vehicle-body">
      <div class="vehicle-micro"><span>${esc(v.brand)}</span><span>${esc(v.year || '')}</span></div>
      <h3>${esc(v.model)}</h3>
      <p class="vehicle-trim">${esc(v.trim || 'Finition à préciser')}</p>
      <div class="vehicle-specs"><span>${esc(v.fuel || '—')}</span><span>${esc(v.transmission || '—')}</span><span>${fmtKm(v.mileage)}</span></div>
      <div class="vehicle-bottom"><div class="price"><small>Prix HT</small><strong>${fmtPrice(v.price_ht)}</strong></div><button class="open-vehicle" data-vehicle-id="${esc(v.id)}">Voir le véhicule</button></div>
    </div>
  </article>`
}

function renderAll(){
  const q=($('#searchInput')?.value||'').trim().toLowerCase()
  const condition=$('#conditionFilter')?.value||'all'
  const fuel=$('#fuelFilter')?.value||'all'
  const sort=$('#sortFilter')?.value||'recent'
  let list=vehicles.filter(v=>{
    const hay=`${v.brand||''} ${v.model||''} ${v.trim||''} ${v.fuel||''}`.toLowerCase()
    return hay.includes(q)&&(condition==='all'||v.condition===condition)&&(fuel==='all'||v.fuel===fuel)
  })
  list=[...list].sort((a,b)=>{
    if(sort==='price-asc')return Number(a.price_ht||0)-Number(b.price_ht||0)
    if(sort==='price-desc')return Number(b.price_ht||0)-Number(a.price_ht||0)
    if(sort==='year-desc')return Number(b.year||0)-Number(a.year||0)
    return String(b.created_at||'').localeCompare(String(a.created_at||''))
  })
  const grid=$('#vehicleGrid')
  if(grid)grid.innerHTML=list.map(renderCard).join('')
  if($('#vehicleCount'))$('#vehicleCount').textContent=String(list.length)
  if($('#vehicleCountTop'))$('#vehicleCountTop').textContent=`${vehicles.length} véhicule${vehicles.length>1?'s':''}`
  if($('#emptyState'))$('#emptyState').hidden=list.length!==0
  bindCardButtons()
}

function renderFeatured(){
  const list=vehicles.filter(v=>v.featured).slice(0,3)
  const fallback=vehicles.slice(0,3)
  const chosen=list.length?list:fallback
  const grid=$('#featuredGrid')
  if(grid)grid.innerHTML=chosen.map(renderCard).join('')
  bindCardButtons()
}

function populateFuelFilter(){
  const select=$('#fuelFilter')
  if(!select)return
  const current=select.value
  const fuels=[...new Set(vehicles.map(v=>v.fuel).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'))
  select.innerHTML='<option value="all">Toutes motorisations</option>'+fuels.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join('')
  if(fuels.includes(current))select.value=current
}

function bindCardButtons(){
  $$('[data-vehicle-id]').forEach(btn=>{
    btn.onclick=()=>openVehicle(btn.dataset.vehicleId)
  })
}

function openVehicle(id){
  activeVehicle=vehicles.find(v=>String(v.id)===String(id))
  if(!activeVehicle)return
  activePhotoIndex=0
  $('#modalCondition').textContent=activeVehicle.condition==='neuf'?'Véhicule neuf':'Véhicule d’occasion'
  $('#modalTitle').textContent=`${activeVehicle.brand||''} ${activeVehicle.model||''}`.trim()
  $('#modalTrim').textContent=activeVehicle.trim||''
  $('#modalPrice').textContent=fmtPrice(activeVehicle.price_ht)
  const specs=[['Année',activeVehicle.year||'—'],['Kilométrage',fmtKm(activeVehicle.mileage)],['Motorisation',activeVehicle.fuel||'—'],['Boîte',activeVehicle.transmission||'—'],['Moteur',activeVehicle.engine||'—'],['Puissance',activeVehicle.power_hp?`${activeVehicle.power_hp} ch`:'—'],['Couleur',activeVehicle.color||'—'],['Places',activeVehicle.seats||'—']]
  $('#modalSpecs').innerHTML=specs.map(([k,v])=>`<div class="spec"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')
  $('#modalDescription').textContent=activeVehicle.description||'Contactez BY CARS pour obtenir plus d’informations sur ce véhicule.'
  const msg=`Bonjour BY CARS, je suis intéressé(e) par le véhicule ${activeVehicle.brand||''} ${activeVehicle.model||''} ${activeVehicle.trim||''} affiché à ${fmtPrice(activeVehicle.price_ht)} HT.`
  $('#modalWhatsApp').href=`https://wa.me/${cfg.phoneIntl||'33618175911'}?text=${encodeURIComponent(msg)}`
  updateGallery()
  const modal=$('#vehicleModal')
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open')
}

function updateGallery(){
  if(!activeVehicle)return
  const photos=safePhotos(activeVehicle)
  activePhotoIndex=(activePhotoIndex+photos.length)%photos.length
  $('#modalImage').src=photos[activePhotoIndex]
  $('#modalImage').alt=`${activeVehicle.brand||''} ${activeVehicle.model||''} — photo ${activePhotoIndex+1}`
  $('#galleryCount').textContent=`${activePhotoIndex+1} / ${photos.length}`
  $('#galleryPrev').style.display=photos.length>1?'grid':'none'
  $('#galleryNext').style.display=photos.length>1?'grid':'none'
}
function changePhoto(step){if(!activeVehicle)return;activePhotoIndex+=step;updateGallery()}
function closeModal(){const m=$('#vehicleModal');m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');activeVehicle=null}

async function loadVehicles(){
  if(!isSupabaseConfigured()){renderFeatured();populateFuelFilter();renderAll();return}
  try{
    const supabase=await getSupabase()
    const {data,error}=await supabase.from('vehicles').select('*').eq('published',true).order('created_at',{ascending:false})
    if(error)throw error
    vehicles=Array.isArray(data)?data:[]
  }catch(err){
    console.error('BY CARS: chargement Supabase impossible, mode démonstration utilisé.',err)
    vehicles=[...demoVehicles]
  }
  renderFeatured();populateFuelFilter();renderAll()
}

function setupMenu(){
  const button=$('#menuToggle'),menu=$('#mobileMenu')
  if(!button||!menu)return
  button.addEventListener('click',()=>{
    const open=!menu.classList.contains('open')
    menu.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('menu-open',open)
  })
  $$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');button.setAttribute('aria-expanded','false');menu.setAttribute('aria-hidden','true');document.body.classList.remove('menu-open')}))
}

function setupFilters(){
  ;['searchInput','conditionFilter','fuelFilter','sortFilter'].forEach(id=>{
    const el=$(`#${id}`);if(!el)return;el.addEventListener(id==='searchInput'?'input':'change',renderAll)
  })
}

function setupModal(){
  $$('[data-close-modal]').forEach(x=>x.addEventListener('click',closeModal))
  $('#galleryPrev')?.addEventListener('click',()=>changePhoto(-1))
  $('#galleryNext')?.addEventListener('click',()=>changePhoto(1))
  $('#modalImage')?.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0]?.screenX||0},{passive:true})
  $('#modalImage')?.addEventListener('touchend',e=>{const dx=(e.changedTouches[0]?.screenX||0)-touchStartX;if(Math.abs(dx)>45)changePhoto(dx<0?1:-1)},{passive:true})
  document.addEventListener('keydown',e=>{if(!$('#vehicleModal')?.classList.contains('open'))return;if(e.key==='Escape')closeModal();if(e.key==='ArrowLeft')changePhoto(-1);if(e.key==='ArrowRight')changePhoto(1)})
}

function setupContact(){
  const form=$('#contactForm'),status=$('#formStatus')
  if(!form)return
  form.addEventListener('submit',async e=>{
    e.preventDefault();status.textContent='Envoi en cours…'
    const fd=new FormData(form);const payload={name:fd.get('name'),phone:fd.get('phone'),email:fd.get('email')||null,message:fd.get('message')}
    if(isSupabaseConfigured()){
      try{const supabase=await getSupabase();const {error}=await supabase.from('contact_requests').insert(payload);if(error)throw error;status.textContent='Merci. Votre demande a bien été envoyée.';form.reset();return}catch(err){console.error(err)}
    }
    const msg=`Bonjour BY CARS, je m'appelle ${payload.name}. Téléphone : ${payload.phone}. Ma recherche : ${payload.message}`
    status.textContent='Ouverture de WhatsApp…'
    window.open(`https://wa.me/${cfg.phoneIntl||'33618175911'}?text=${encodeURIComponent(msg)}`,'_blank','noopener')
  })
}

$('#year').textContent=String(new Date().getFullYear())
setupMenu();setupFilters();setupModal();setupContact();loadVehicles()
