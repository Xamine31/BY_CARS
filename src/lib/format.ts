export const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)

export const formatKm = (km: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(km) + ' km'
