import type { Dish, LatLng, MenuItem, Restaurant } from '../data/types'
import { getDishes, whereToEat } from '../data/repo'
import { distanceKm, formatDistance, walkMinutes } from './geo'
import { MEAL_LABEL, formatClock, mealTimeAt, nowMinutes, openState } from './time'
import { rupiah, rupiahShort } from './format'

export interface Filters {
  /** max price of the dish's menu item, in Rupiah; null = any */
  budget: number | null
  /** max straight-line distance in km; null = any */
  maxKm: number | null
  spice: 'any' | 'mild' | 'hot'
  openNow: boolean
}

export const DEFAULT_FILTERS: Filters = { budget: null, maxKm: null, spice: 'any', openNow: true }

export interface Option {
  restaurant: Restaurant
  item: MenuItem
  km: number
  open: boolean
}

/** Every (restaurant, menu item) pair for a dish, with distance and open status. Nearest first. */
export function optionsFor(dishId: string, origin: LatLng, now = nowMinutes()): Option[] {
  return whereToEat(dishId)
    .map(({ restaurant, items }) => ({
      restaurant,
      // one row per restaurant: its cheapest matching item
      item: items.reduce((a, b) => (b.price < a.price ? b : a)),
      km: distanceKm(origin, restaurant),
      open: openState(restaurant.hours, now).open,
    }))
    .sort((a, b) => a.km - b.km)
}

export function optionFits(o: Option, f: Filters): boolean {
  if (f.budget !== null && o.item.price > f.budget) return false
  if (f.maxKm !== null && o.km > f.maxKm) return false
  if (f.openNow && !o.open) return false
  return true
}

function dishFits(d: Dish, f: Filters): boolean {
  if (f.spice === 'mild' && d.spicy > 1) return false
  if (f.spice === 'hot' && d.spicy < 2) return false
  return true
}

export interface Candidate {
  dish: Dish
  fitting: Option[]
}

export function candidates(f: Filters, origin: LatLng, now = nowMinutes()): Candidate[] {
  return getDishes()
    .filter((d) => dishFits(d, f))
    .map((dish) => ({ dish, fitting: optionsFor(dish.id, origin, now).filter((o) => optionFits(o, f)) }))
    .filter((c) => c.fitting.length > 0)
}

/**
 * Weighted random pick.
 * - Dishes that suit the current time of day are 2.5× more likely.
 * - The last few dishes you rolled are skipped (when there's enough choice).
 */
export function pick(pool: Candidate[], recent: string[], now = nowMinutes()): Candidate | null {
  if (pool.length === 0) return null
  const avoid = new Set(recent.slice(0, Math.min(3, pool.length - 1)))
  const usable = pool.filter((c) => !avoid.has(c.dish.id))
  const meal = mealTimeAt(now)
  const weights = usable.map((c) => (c.dish.bestTimes.includes(meal) ? 2.5 : 1))
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < usable.length; i++) {
    r -= weights[i]
    if (r <= 0) return usable[i]
  }
  return usable[usable.length - 1]
}

export interface Reason {
  icon: string
  text: string
}

/** The "convince me" layer: concrete, true-to-the-data reasons this pick makes sense right now. */
export function reasonsFor(c: Candidate, f: Filters, usingDeviceLocation: boolean, now = nowMinutes()): Reason[] {
  const out: Reason[] = []
  const meal = mealTimeAt(now)
  const nearest = c.fitting[0]
  const cheapest = c.fitting.reduce((a, b) => (b.item.price < a.item.price ? b : a))
  const from = usingDeviceLocation ? 'from you' : 'from campus'

  if (c.dish.bestTimes.includes(meal)) {
    out.push({ icon: '🕒', text: `A proper ${MEAL_LABEL[meal]} pick — it's ${formatClock(now)}.` })
  }
  if (nearest.km <= 1.2) {
    out.push({ icon: '🚶', text: `${nearest.restaurant.name} is ${formatDistance(nearest.km)} ${from}, about ${walkMinutes(nearest.km)} min on foot.` })
  } else {
    out.push({ icon: '📍', text: `Nearest is ${nearest.restaurant.name}, ${formatDistance(nearest.km)} ${from}.` })
  }
  out.push({
    icon: '💸',
    text:
      f.budget !== null
        ? `From ${rupiah(cheapest.item.price)} at ${cheapest.restaurant.name} — inside your ${rupiahShort(f.budget)} budget.`
        : `From ${rupiah(cheapest.item.price)} at ${cheapest.restaurant.name}.`,
  })
  if (c.fitting.length > 1) {
    out.push({ icon: '🍽️', text: `${c.fitting.length} places ${f.openNow ? 'open right now ' : ''}serve it, so you've got backup.` })
  } else if (f.openNow) {
    out.push({ icon: '✅', text: `Open right now.` })
  }
  if (f.spice === 'hot' && c.dish.spicy >= 2) out.push({ icon: '🌶️', text: 'Properly spicy, like you asked.' })
  return out
}
