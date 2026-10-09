export type VehicleCondition = 'neuf' | 'occasion'

export interface Vehicle {
  id: string
  brand: string
  model: string
  trim: string | null
  price_ht: number
  condition: VehicleCondition
  year: number
  mileage: number
  fuel: string
  transmission: string
  engine: string | null
  power_hp: number | null
  color: string | null
  doors: number | null
  seats: number | null
  description: string | null
  photos: string[]
  featured: boolean
  available: boolean
  published: boolean
  created_at?: string
  updated_at?: string
}

export type VehiclePayload = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>
