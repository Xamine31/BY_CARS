import { getSupabase, isSupabaseConfigured } from './supabase-client.js'
import { demoVehicles } from './data.js'
import { DEMO_STORAGE_KEY, loadDemoVehicles, saveDemoVehicles } from './common.js'

const $ = (s,r=document)=>r.querySelector(s)
const $$ = (s,r=document)=>[...r.querySelectorAll(s)]
const fmtPrice=v=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(v||0))
const esc=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))
let supabase=null
let vehicles=[]
let editingVehicle=null
let demoMode=false

function showOnly(id){['setupScreen','loginScreen','deniedScreen','dashboard'].forEach(x=>$('#'+x).hidden=x!==id)}
function status(el,msg,error=false){if(!el)return;el.textContent=msg;el.style.color=error?'#ff765f':''}
function photoList(v){return Array.isArray(v?.photos)?v.photos.filter(Boolean):[]}
function firstPhoto(v){return photoList(v)[0]||'assets/car-placeholder-1.svg'}

async function init(){
  if(!isSupabaseConfigured()){
    demoMode=true
    showOnly('dashboard')
    $('#demoModeBanner').hidden=false
    $('#logoutBtn').hidden=true
    await loadVehicles()
    showVehiclesView()
    return
  }
  try{supabase=await getSupabase()}catch(e){console.error(e);showOnly('setupScreen');return}
  const {data}=await supabase.auth.getSession()
  if(!data.session){showOnly('loginScreen');return}
  await verifyAdmin(data.session.user)
}

async function verifyAdmin(user){
  const {data,error}=await supabase.from('admins').select('user_id').eq('user_id',user.id).maybeSingle()
  if(error||!data){showOnly('deniedScreen');return}
  showOnly('dashboard');await loadVehicles();showVehiclesView()
}

$('#loginForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const s=$('#loginStatus');status(s,'Connexion…')
  try{
    const {data,error}=await supabase.auth.signInWithPassword({email:$('#loginEmail').value.trim(),password:$('#loginPassword').value})
    if(error)throw error
    await verifyAdmin(data.user)
  }catch(err){status(s,err?.message||'Connexion impossible.',true)}
})

async function logout(){if(supabase)await supabase.auth.signOut();location.reload()}
$('#logoutBtn')?.addEventListener('click',logout);$('#deniedLogout')?.addEventListener('click',logout)

$('#resetDemo')?.addEventListener('click',()=>{
  if(!confirm('Réinitialiser le stock de démonstration ?'))return
  localStorage.removeItem(DEMO_STORAGE_KEY)
  vehicles=JSON.parse(JSON.stringify(demoVehicles))
  renderStats();renderAdminList();toast('Démo réinitialisée.')
})

async function loadVehicles(){
  if(demoMode){vehicles=loadDemoVehicles();renderStats();renderAdminList();return}
  const {data,error}=await supabase.from('vehicles').select('*').order('created_at',{ascending:false})
  if(error){toast('Impossible de charger le stock.');console.error(error);return}
  vehicles=data||[];renderStats();renderAdminList()
}

function renderStats(){
  $('#statTotal').textContent=vehicles.length
  $('#statPublished').textContent=vehicles.filter(v=>v.published).length
  $('#statAvailable').textContent=vehicles.filter(v=>v.available).length
  $('#statFeatured').textContent=vehicles.filter(v=>v.featured).length
}

function renderAdminList(){
  const q=($('#adminSearch')?.value||'').toLowerCase().trim()
  const list=vehicles.filter(v=>`${v.brand||''} ${v.model||''} ${v.trim||''}`.toLowerCase().includes(q))
  $('#adminEmpty').hidden=list.length!==0
  $('#adminVehicleList').innerHTML=list.map(v=>`<div class="admin-vehicle-row">
    <img class="admin-thumb" src="${esc(firstPhoto(v))}" alt="" />
    <div class="admin-vehicle-name"><b>${esc(v.brand)} ${esc(v.model)}</b><span>${esc(v.trim||'Sans finition')}</span></div>
    <div class="admin-row-meta"><b>${fmtPrice(v.price_ht)} HT</b><span>${esc(v.year||'')} · ${new Intl.NumberFormat('fr-FR').format(Number(v.mileage||0))} km</span></div>
    <div><span class="admin-status-pill ${v.published?'':'draft'}">${v.published?'Publié':'Brouillon'}</span></div>
    <div class="row-actions"><button data-edit="${esc(v.id)}">Modifier</button><button class="delete" data-delete="${esc(v.id)}">Supprimer</button></div>
  </div>`).join('')
  $$('[data-edit]').forEach(b=>b.onclick=()=>editVehicle(b.dataset.edit))
  $$('[data-delete]').forEach(b=>b.onclick=()=>deleteVehicle(b.dataset.delete))
}
$('#adminSearch')?.addEventListener('input',renderAdminList)

function showVehiclesView(){
  $('#vehiclesView').hidden=false;$('#formView').hidden=true;$('#adminTitle').textContent='Véhicules'
  $$('.admin-nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='vehicles'))
}
function showFormView(edit=false){
  $('#vehiclesView').hidden=true;$('#formView').hidden=false;$('#adminTitle').textContent=edit?'Modifier le véhicule':'Ajouter un véhicule'
  $$('.admin-nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='form'))
  if(!edit)resetForm()
}
$$('.admin-nav-item').forEach(b=>b.onclick=()=>b.dataset.view==='form'?showFormView(false):showVehiclesView())
$('#quickAdd')?.addEventListener('click',()=>showFormView(false))
$('#cancelEdit')?.addEventListener('click',showVehiclesView)

function resetForm(){
  editingVehicle=null;$('#vehicleForm').reset();$('#vehicleId').value='';$('#condition').value='occasion';$('#transmission').value='Automatique';$('#yearInput').value=new Date().getFullYear();$('#mileage').value='0';$('#doors').value='5';$('#seats').value='5';$('#available').checked=true;$('#published').checked=true;$('#featured').checked=false;$('#formKicker').textContent='Nouveau véhicule';$('#formTitle').textContent='Ajouter au stock';$('#saveVehicle').textContent='Enregistrer le véhicule';$('#existingPhotos').innerHTML='';$('#clearPhotos').checked=false;$('#clearPhotosWrap').hidden=true;status($('#vehicleFormStatus'),'')
}

function editVehicle(id){
  const v=vehicles.find(x=>String(x.id)===String(id));if(!v)return
  editingVehicle=v;showFormView(true)
  $('#vehicleId').value=v.id;$('#brand').value=v.brand||'';$('#model').value=v.model||'';$('#trim').value=v.trim||'';$('#price_ht').value=v.price_ht??'';$('#condition').value=v.condition||'occasion';$('#yearInput').value=v.year||new Date().getFullYear();$('#mileage').value=v.mileage||0;$('#fuel').value=v.fuel||'';$('#transmission').value=v.transmission||'';$('#engine').value=v.engine||'';$('#power_hp').value=v.power_hp||'';$('#color').value=v.color||'';$('#doors').value=v.doors||5;$('#seats').value=v.seats||5;$('#description').value=v.description||'';$('#available').checked=v.available!==false;$('#published').checked=v.published!==false;$('#featured').checked=Boolean(v.featured);$('#formKicker').textContent='Modification';$('#formTitle').textContent=`${v.brand} ${v.model}`;$('#saveVehicle').textContent='Mettre à jour'
  const photos=photoList(v);$('#existingPhotos').innerHTML=photos.map(p=>`<img src="${esc(p)}" alt="Photo existante" />`).join('');$('#clearPhotosWrap').hidden=photos.length===0;$('#clearPhotos').checked=false;window.scrollTo({top:0,behavior:'smooth'})
}

async function uploadPhotos(files,vehicleId){
  const urls=[]
  for(const file of files){
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg'
    const path=`${vehicleId}/${Date.now()}-${crypto.randomUUID()}.${ext}`
    const {error}=await supabase.storage.from('vehicle-photos').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined})
    if(error)throw error
    const {data}=supabase.storage.from('vehicle-photos').getPublicUrl(path)
    urls.push(data.publicUrl)
  }
  return urls
}

function fileToCompressedDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader()
    reader.onerror=()=>reject(reader.error)
    reader.onload=()=>{
      const img=new Image()
      img.onerror=()=>resolve(reader.result)
      img.onload=()=>{
        const max=1400
        const scale=Math.min(1,max/Math.max(img.width,img.height))
        const canvas=document.createElement('canvas')
        canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale))
        const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height)
        resolve(canvas.toDataURL('image/jpeg',.76))
      }
      img.src=reader.result
    }
    reader.readAsDataURL(file)
  })
}
async function demoPhotos(files){
  const urls=[]
  for(const file of files) urls.push(await fileToCompressedDataUrl(file))
  return urls
}

$('#vehicleForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const s=$('#vehicleFormStatus');const button=$('#saveVehicle');button.disabled=true;status(s,'Enregistrement…')
  try{
    const id=$('#vehicleId').value||crypto.randomUUID()
    let photos=editingVehicle&&!$('#clearPhotos').checked?photoList(editingVehicle):[]
    const files=[...$('#photos').files]
    if(files.length){status(s,`Traitement de ${files.length} photo(s)…`);photos=photos.concat(demoMode?await demoPhotos(files):await uploadPhotos(files,id))}
    const payload={id,brand:$('#brand').value.trim(),model:$('#model').value.trim(),trim:$('#trim').value.trim()||null,price_ht:Number($('#price_ht').value),condition:$('#condition').value,year:Number($('#yearInput').value),mileage:Number($('#mileage').value||0),fuel:$('#fuel').value.trim()||null,transmission:$('#transmission').value||null,engine:$('#engine').value.trim()||null,power_hp:$('#power_hp').value?Number($('#power_hp').value):null,color:$('#color').value.trim()||null,doors:$('#doors').value?Number($('#doors').value):null,seats:$('#seats').value?Number($('#seats').value):null,description:$('#description').value.trim()||null,photos,available:$('#available').checked,published:$('#published').checked,featured:$('#featured').checked,updated_at:new Date().toISOString(),created_at:editingVehicle?.created_at||new Date().toISOString()}
    if(demoMode){
      const idx=vehicles.findIndex(v=>String(v.id)===String(id))
      if(idx>=0)vehicles[idx]=payload;else vehicles.unshift(payload)
      try{saveDemoVehicles(vehicles)}catch(err){throw new Error('Le stockage local est plein. Essayez avec moins de photos ou des images plus légères.')}
    }else{
      const {error}=await supabase.from('vehicles').upsert(payload,{onConflict:'id'})
      if(error)throw error
    }
    toast(editingVehicle?'Véhicule mis à jour.':'Véhicule ajouté.');resetForm();await loadVehicles();showVehiclesView()
  }catch(err){console.error(err);status(s,err?.message||'Enregistrement impossible.',true)}finally{button.disabled=false}
})

async function deleteVehicle(id){
  const v=vehicles.find(x=>String(x.id)===String(id));if(!v)return
  if(!confirm(`Supprimer ${v.brand} ${v.model} ?`))return
  if(demoMode){vehicles=vehicles.filter(x=>String(x.id)!==String(id));saveDemoVehicles(vehicles)}
  else{const {error}=await supabase.from('vehicles').delete().eq('id',id);if(error){toast('Suppression impossible.');console.error(error);return}}
  toast('Véhicule supprimé.');await loadVehicles()
}

function toast(message){const el=document.createElement('div');el.className='admin-toast';el.textContent=message;document.body.appendChild(el);setTimeout(()=>el.remove(),2600)}

init()
