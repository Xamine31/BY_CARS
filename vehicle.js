import { $, esc, fmtKm, fmtPrice, loadVehicle, safePhotos, whatsappLink } from './common.js'

const id = new URLSearchParams(location.search).get('id')
const vehicle = await loadVehicle(id)

if(!vehicle){
  $('#vehiclePage').innerHTML = `<section class="not-found"><div class="container narrow"><span class="eyebrow">Véhicule introuvable</span><h1>Cette fiche n’est plus disponible.</h1><p>Le véhicule a peut-être été vendu ou retiré du catalogue.</p><a class="btn btn-primary" href="stock.html">Retour au stock</a></div></section>`
}else{
  const photos = safePhotos(vehicle)
  let index = 0
  document.title = `${vehicle.brand} ${vehicle.model} — BY CARS`
  const title = `${vehicle.brand||''} ${vehicle.model||''}`.trim()
  $('#vehicleBreadcrumbName').textContent = title
  $('#vehicleCondition').textContent = vehicle.condition==='neuf' ? 'Véhicule neuf' : 'Véhicule d’occasion'
  $('#vehicleAvailability').textContent = vehicle.available===false ? 'Indisponible' : 'Disponible'
  $('#vehicleAvailability').classList.toggle('is-off',vehicle.available===false)
  $('#vehicleTitle').textContent = title
  $('#vehicleTrim').textContent = vehicle.trim || 'Finition à préciser'
  $('#vehiclePrice').textContent = fmtPrice(vehicle.price_ht)
  $('#vehicleDescription').textContent = vehicle.description || 'Contactez BY CARS pour obtenir toutes les informations sur ce véhicule.'

  const specs = [
    ['Année',vehicle.year||'—','calendar'],['Kilométrage',fmtKm(vehicle.mileage),'road'],['Motorisation',vehicle.fuel||'—','engine'],
    ['Boîte',vehicle.transmission||'—','gear'],['Moteur',vehicle.engine||'—','bolt'],['Puissance',vehicle.power_hp?`${vehicle.power_hp} ch`:'—','gauge'],
    ['Couleur',vehicle.color||'—','color'],['Portes',vehicle.doors||'—','door'],['Places',vehicle.seats||'—','seat']
  ]
  $('#vehicleSpecs').innerHTML = specs.map(([label,value])=>`<div class="detail-spec"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')

  const mainImage = $('#vehicleMainImage')
  const counter = $('#galleryCounter')
  const thumbs = $('#vehicleThumbs')
  function setPhoto(next){
    index = (next + photos.length) % photos.length
    mainImage.src = photos[index]
    mainImage.alt = `${title} — photo ${index+1}`
    counter.textContent = `${index+1} / ${photos.length}`
    thumbs.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('active',i===index))
  }
  thumbs.innerHTML = photos.map((url,i)=>`<button type="button" aria-label="Voir la photo ${i+1}"><img src="${esc(url)}" alt="" /></button>`).join('')
  thumbs.querySelectorAll('button').forEach((button,i)=>button.addEventListener('click',()=>setPhoto(i)))
  $('#galleryPrev')?.addEventListener('click',()=>setPhoto(index-1))
  $('#galleryNext')?.addEventListener('click',()=>setPhoto(index+1))
  let touchStart = 0
  mainImage.addEventListener('touchstart',e=>touchStart=e.changedTouches[0]?.screenX||0,{passive:true})
  mainImage.addEventListener('touchend',e=>{const dx=(e.changedTouches[0]?.screenX||0)-touchStart;if(Math.abs(dx)>45)setPhoto(index+(dx<0?1:-1))},{passive:true})
  setPhoto(0)

  const message = `Bonjour BY CARS, je suis intéressé(e) par le véhicule ${title} ${vehicle.trim||''} affiché à ${fmtPrice(vehicle.price_ht)} HT.`
  $('#vehicleWhatsapp').href = whatsappLink(message)
  $('#vehicleWhatsappMobile').href = whatsappLink(message)
}
