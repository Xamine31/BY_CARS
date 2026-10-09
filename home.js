import { $, loadVehicles, vehicleCard } from './common.js'

const vehicles = await loadVehicles()
const featured = vehicles.filter(v=>v.featured).slice(0,3)
const selection = featured.length ? featured : vehicles.slice(0,3)
const grid = $('#featuredGrid')
if(grid) grid.innerHTML = selection.map(vehicleCard).join('')
if($('#homeStockCount')) $('#homeStockCount').textContent = String(vehicles.length)

$('#heroSearch')?.addEventListener('submit', event=>{
  event.preventDefault()
  const query = $('#heroSearchInput')?.value.trim() || ''
  location.href = query ? `stock.html?q=${encodeURIComponent(query)}` : 'stock.html'
})
