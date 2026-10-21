import { getSupabase, isSupabaseConfigured } from './supabase-client.js'

const $ = (s,r=document)=>r.querySelector(s)
const $$ = (s,r=document)=>[...r.querySelectorAll(s)]
const fmtPrice=v=>(v===null||v===undefined||v==='')?'Sur devis':new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(v))
const esc=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))
let supabase=null
let vehicles=[]
let editingVehicle=null
let selectedPhotoFiles=[]
let previewObjectUrls=[]

function showOnly(id){['setupScreen','loginScreen','deniedScreen','dashboard'].forEach(x=>$('#'+x).hidden=x!==id)}
function status(el,msg,error=false){if(!el)return;el.textContent=msg;el.classList.toggle('is-error',error)}
function photoList(v){return Array.isArray(v?.photos)?v.photos.filter(Boolean):[]}
function firstPhoto(v){return photoList(v)[0]||'assets/car-placeholder-1.svg'}

async function init(){
  if(!isSupabaseConfigured()){
    showOnly('setupScreen')
    return
  }
  try{
    supabase=await getSupabase()
    const {data,error}=await supabase.auth.getSession()
    if(error) throw error
    if(!data.session){showOnly('loginScreen');return}
    await verifyAdmin(data.session.user)
  }catch(error){
    console.error(error)
    showOnly('setupScreen')
  }
}

async function verifyAdmin(user){
  const {data,error}=await supabase.from('admins').select('user_id').eq('user_id',user.id).maybeSingle()
  if(error||!data){showOnly('deniedScreen');return}
  showOnly('dashboard')
  await loadVehicles()
  showVehiclesView()
}

$('#loginForm')?.addEventListener('submit',async e=>{
  e.preventDefault()
  const s=$('#loginStatus')
  status(s,'Connexion en cours…')
  try{
    const {data,error}=await supabase.auth.signInWithPassword({
      email:$('#loginEmail').value.trim(),
      password:$('#loginPassword').value
    })
    if(error)throw error
    await verifyAdmin(data.user)
  }catch(error){
    status(s,'Email ou mot de passe incorrect.',true)
  }
})

async function logout(){if(supabase)await supabase.auth.signOut();location.reload()}
$('#logoutBtn')?.addEventListener('click',logout)
$('#deniedLogout')?.addEventListener('click',logout)

async function loadVehicles(){
  const {data,error}=await supabase.from('vehicles').select('*').order('created_at',{ascending:false})
  if(error){toast('Impossible de charger le stock.');console.error(error);return}
  vehicles=data||[]
  renderStats()
  renderAdminList()
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
    <div class="admin-vehicle-name"><b>${esc(v.brand)} ${esc(v.model)}</b><span>${esc(v.trim||'')}</span></div>
    <div class="admin-row-meta"><b>${v.price_ht==null?'Sur devis':`${fmtPrice(v.price_ht)} HT`}</b><span>${esc(v.year||'')} · ${new Intl.NumberFormat('fr-FR').format(Number(v.mileage||0))} km</span></div>
    <div><span class="admin-status-pill ${v.published?'':'draft'}">${v.published?'Publié':'Brouillon'}</span></div>
    <div class="row-actions"><button data-edit="${esc(v.id)}">Modifier</button><button class="delete" data-delete="${esc(v.id)}">Supprimer</button></div>
  </div>`).join('')
  $$('[data-edit]').forEach(b=>b.onclick=()=>editVehicle(b.dataset.edit))
  $$('[data-delete]').forEach(b=>b.onclick=()=>deleteVehicle(b.dataset.delete))
}
$('#adminSearch')?.addEventListener('input',renderAdminList)

function showVehiclesView(){
  $('#vehiclesView').hidden=false
  $('#formView').hidden=true
  $('#adminTitle').textContent='Véhicules'
  $$('.admin-nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='vehicles'))
}
function showFormView(edit=false){
  $('#vehiclesView').hidden=true
  $('#formView').hidden=false
  $('#adminTitle').textContent=edit?'Modifier le véhicule':'Ajouter un véhicule'
  $$('.admin-nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='form'))
  if(!edit)resetForm()
}
$$('.admin-nav-item').forEach(b=>b.onclick=()=>b.dataset.view==='form'?showFormView(false):showVehiclesView())
$('#quickAdd')?.addEventListener('click',()=>showFormView(false))
$('#cancelEdit')?.addEventListener('click',showVehiclesView)

function clearSelectedPhotoPreview(){
  previewObjectUrls.forEach(url=>URL.revokeObjectURL(url))
  previewObjectUrls=[]
  selectedPhotoFiles=[]
  const input=$('#photos')
  if(input) input.value=''
  const preview=$('#selectedPhotosPreview')
  if(preview) preview.innerHTML=''
  const block=$('#selectedPhotosBlock')
  if(block) block.hidden=true
  const count=$('#selectedPhotosCount')
  if(count) count.textContent=''
}

function syncSelectedFilesInput(){
  const input=$('#photos')
  if(!input || typeof DataTransfer==='undefined') return
  const transfer=new DataTransfer()
  selectedPhotoFiles.forEach(file=>transfer.items.add(file))
  input.files=transfer.files
}

function renderSelectedPhotoPreview(){
  previewObjectUrls.forEach(url=>URL.revokeObjectURL(url))
  previewObjectUrls=selectedPhotoFiles.map(file=>URL.createObjectURL(file))
  const preview=$('#selectedPhotosPreview')
  const block=$('#selectedPhotosBlock')
  const count=$('#selectedPhotosCount')
  if(!preview||!block||!count)return
  block.hidden=selectedPhotoFiles.length===0
  count.textContent=selectedPhotoFiles.length?`${selectedPhotoFiles.length} photo${selectedPhotoFiles.length>1?'s':''} sélectionnée${selectedPhotoFiles.length>1?'s':''}`:''
  preview.innerHTML=selectedPhotoFiles.map((file,index)=>`<figure class="selected-photo-card"><img src="${esc(previewObjectUrls[index])}" alt="Aperçu ${index+1}" /><figcaption>${esc(file.name)}</figcaption><button type="button" data-remove-photo="${index}" aria-label="Retirer cette photo">×</button></figure>`).join('')
  $$('[data-remove-photo]',preview).forEach(button=>button.addEventListener('click',()=>{
    const index=Number(button.dataset.removePhoto)
    selectedPhotoFiles.splice(index,1)
    syncSelectedFilesInput()
    renderSelectedPhotoPreview()
  }))
}

$('#photos')?.addEventListener('change',event=>{
  selectedPhotoFiles=[...(event.target.files||[])]
  renderSelectedPhotoPreview()
})

function resetForm(){
  editingVehicle=null
  $('#vehicleForm').reset()
  $('#vehicleId').value=''
  $('#condition').value='occasion'
  $('#transmission').value='Automatique'
  $('#yearInput').value=new Date().getFullYear()
  $('#mileage').value='0'
  $('#doors').value='5'
  $('#seats').value='5'
  $('#available').checked=true
  $('#published').checked=true
  $('#featured').checked=false
  $('#formKicker').textContent='Nouveau véhicule'
  $('#formTitle').textContent='Ajouter au stock'
  $('#saveVehicle').textContent='Enregistrer le véhicule'
  clearSelectedPhotoPreview()
  $('#existingPhotos').innerHTML=''
  $('#existingPhotosBlock').hidden=true
  $('#clearPhotos').checked=false
  $('#clearPhotosWrap').hidden=true
  status($('#vehicleFormStatus'),'')
}

function editVehicle(id){
  const v=vehicles.find(x=>String(x.id)===String(id));if(!v)return
  editingVehicle=v
  showFormView(true)
  $('#vehicleId').value=v.id
  $('#brand').value=v.brand||''
  $('#model').value=v.model||''
  $('#trim').value=v.trim||''
  $('#price_ht').value=v.price_ht??''
  $('#condition').value=v.condition||'occasion'
  $('#yearInput').value=v.year||new Date().getFullYear()
  $('#mileage').value=v.mileage||0
  $('#fuel').value=v.fuel||''
  $('#transmission').value=v.transmission||''
  $('#engine').value=v.engine||''
  $('#power_hp').value=v.power_hp||''
  $('#color').value=v.color||''
  $('#doors').value=v.doors||5
  $('#seats').value=v.seats||5
  $('#description').value=v.description||''
  $('#available').checked=v.available!==false
  $('#published').checked=v.published!==false
  $('#featured').checked=Boolean(v.featured)
  $('#formKicker').textContent='Modification'
  $('#formTitle').textContent=`${v.brand} ${v.model}`
  $('#saveVehicle').textContent='Mettre à jour'
  clearSelectedPhotoPreview()
  const photos=photoList(v)
  $('#existingPhotos').innerHTML=photos.map((p,index)=>`<figure><img src="${esc(p)}" alt="Photo enregistrée ${index+1}" /></figure>`).join('')
  $('#existingPhotosBlock').hidden=photos.length===0
  $('#clearPhotosWrap').hidden=photos.length===0
  $('#clearPhotos').checked=false
  window.scrollTo({top:0,behavior:'smooth'})
}

async function uploadPhotos(files,vehicleId){
  const urls=[]
  for(const file of files){
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg'
    const path=`${vehicleId}/${Date.now()}-${crypto.randomUUID()}.${ext}`
    const {error}=await supabase.storage.from('vehicle-photos').upload(path,file,{
      cacheControl:'3600',upsert:false,contentType:file.type||undefined
    })
    if(error)throw error
    const {data}=supabase.storage.from('vehicle-photos').getPublicUrl(path)
    urls.push(data.publicUrl)
  }
  return urls
}

$('#vehicleForm')?.addEventListener('submit',async e=>{
  e.preventDefault()
  const s=$('#vehicleFormStatus')
  const button=$('#saveVehicle')
  button.disabled=true
  status(s,'Enregistrement…')
  try{
    const id=$('#vehicleId').value||crypto.randomUUID()
    let photos=editingVehicle&&!$('#clearPhotos').checked?photoList(editingVehicle):[]
    const files=[...selectedPhotoFiles]
    if(files.length){status(s,`Envoi de ${files.length} photo(s)…`);photos=photos.concat(await uploadPhotos(files,id))}
    const payload={
      id,
      brand:$('#brand').value.trim(),
      model:$('#model').value.trim(),
      trim:$('#trim').value.trim()||null,
      price_ht:$('#price_ht').value.trim()===''?null:Number($('#price_ht').value),
      condition:$('#condition').value,
      year:Number($('#yearInput').value),
      mileage:Number($('#mileage').value||0),
      fuel:$('#fuel').value.trim()||null,
      transmission:$('#transmission').value||null,
      engine:$('#engine').value.trim()||null,
      power_hp:$('#power_hp').value?Number($('#power_hp').value):null,
      color:$('#color').value.trim()||null,
      doors:$('#doors').value?Number($('#doors').value):null,
      seats:$('#seats').value?Number($('#seats').value):null,
      description:$('#description').value.trim()||null,
      photos,
      available:$('#available').checked,
      published:$('#published').checked,
      featured:$('#featured').checked
    }
    const {error}=await supabase.from('vehicles').upsert(payload,{onConflict:'id'})
    if(error)throw error
    toast(editingVehicle?'Véhicule mis à jour.':'Véhicule ajouté.')
    resetForm()
    await loadVehicles()
    showVehiclesView()
  }catch(error){
    console.error(error)
    status(s,error?.message||'Enregistrement impossible.',true)
  }finally{button.disabled=false}
})

async function deleteVehicle(id){
  const v=vehicles.find(x=>String(x.id)===String(id));if(!v)return
  if(!confirm(`Supprimer ${v.brand} ${v.model} ?`))return
  const {error}=await supabase.from('vehicles').delete().eq('id',id)
  if(error){toast('Suppression impossible.');console.error(error);return}
  toast('Véhicule supprimé.')
  await loadVehicles()
}

function toast(message){
  const el=document.createElement('div')
  el.className='admin-toast'
  el.textContent=message
  document.body.appendChild(el)
  setTimeout(()=>el.remove(),2600)
}

init()
