import type { LatLng } from '../data/types'

/** Straight-line distance in km (haversine). Real walking routes are ~20–40% longer. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Rough walking minutes: straight line × 1.3 detour factor, 75 m/min. */
export function walkMinutes(km: number): number {
  return Math.max(1, Math.round((km * 1.3 * 1000) / 75))
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round((km * 1000) / 10) * 10} m` : `${km.toFixed(1)} km`
}

export function directionsUrl(p: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
}
