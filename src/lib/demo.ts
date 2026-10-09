import type { Vehicle } from '../types'

export const demoVehicles: Vehicle[] = [
  {
    id: 'demo-1', brand: 'Peugeot', model: '3008', trim: 'Hybrid 136 e-DCS6', price_ht: 28900,
    condition: 'occasion', year: 2025, mileage: 12800, fuel: 'Hybride essence', transmission: 'Automatique',
    engine: '1.2 Hybrid', power_hp: 136, color: 'Gris', doors: 5, seats: 5,
    description: 'Exemple de véhicule pour prévisualiser le showroom avant connexion à Supabase.', photos: [],
    featured: true, available: true, published: true,
  },
  {
    id: 'demo-2', brand: 'Renault', model: 'Clio', trim: 'Techno TCe 90', price_ht: 16750,
    condition: 'neuf', year: 2026, mileage: 20, fuel: 'Essence', transmission: 'Manuelle',
    engine: '1.0 TCe', power_hp: 90, color: 'Blanc', doors: 5, seats: 5,
    description: 'Exemple de fiche véhicule neuve.', photos: [], featured: true, available: true, published: true,
  },
  {
    id: 'demo-3', brand: 'Dacia', model: 'Duster', trim: 'Journey', price_ht: 21900,
    condition: 'occasion', year: 2024, mileage: 22400, fuel: 'GPL / Essence', transmission: 'Manuelle',
    engine: 'ECO-G 100', power_hp: 100, color: 'Noir', doors: 5, seats: 5,
    description: 'Exemple de SUV disponible à l’export.', photos: [], featured: false, available: true, published: true,
  },
]
