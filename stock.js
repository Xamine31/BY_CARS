import { $, esc, loadVehicles, vehicleCard } from './common.js'

let vehicles = await loadVehicles()
const search = $('#stockSearch')
const condition = $('#conditionFilter')
const fuel = $('#fuelFilter')
const sort = $('#sortFilter')

function initFilters(){
  const params = new URLSearchParams(location.search)
  const initialQuery = params.get('q') || ''
  if(search) search.value = initialQuery
  const fuels = [...new Set(vehicles.map(v=>v.fuel).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'))
  if(fuel) fuel.innerHTML = '<option value="all">Toutes motorisations</option>' + fuels.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')
}

function render(){
  const q = (search?.value || '').trim().toLowerCase()
  const c = condition?.value || 'all'
  const f = fuel?.value || 'all'
  const s = sort?.value || 'recent'
  let list = vehicles.filter(v=>{
    const haystack = `${v.brand||''} ${v.model||''} ${v.trim||''} ${v.fuel||''} ${v.transmission||''} ${v.year||''}`.toLowerCase()
    return haystack.includes(q) && (c==='all'||v.condition===c) && (f==='all'||v.fuel===f)
  })
  list = [...list].sort((a,b)=>{
    if(s==='price-asc') return Number(a.price_ht||0)-Number(b.price_ht||0)
    if(s==='price-desc') return Number(b.price_ht||0)-Number(a.price_ht||0)
    if(s==='year-desc') return Number(b.year||0)-Number(a.year||0)
    if(s==='km-asc') return Number(a.mileage||0)-Number(b.mileage||0)
    return String(b.created_at||'').localeCompare(String(a.created_at||''))
  })
  $('#stockGrid').innerHTML = list.map(vehicleCard).join('')
  $('#stockResultCount').textContent = `${list.length} véhicule${list.length>1?'s':''}`
  $('#stockEmpty').hidden = list.length !== 0
}

initFilters()
;[search,condition,fuel,sort].filter(Boolean).forEach(el=>el.addEventListener(el===search?'input':'change',render))
$('#clearFilters')?.addEventListener('click',()=>{search.value='';condition.value='all';fuel.value='all';sort.value='recent';render()})
render()
