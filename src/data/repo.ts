// The ONLY place the app reads food data from.
// Today it reads the bundled JSON files. Later (real data / backend) only this
// file needs to change — every screen goes through these functions.
import dishesJson from './dishes.json'
import restaurantsJson from './restaurants.json'
import type { Dish, Restaurant, LatLng } from './types'

const dishes = dishesJson as Dish[]
const restaurants = restaurantsJson.restaurants as Restaurant[]

export const DATA_IS_SAMPLE: boolean = restaurantsJson.meta.sample
export const AREA_NAME: string = restaurantsJson.meta.area
export const AREA_CENTER: LatLng = restaurantsJson.meta.center

const dishById = new Map(dishes.map((d) => [d.id, d]))
const restaurantById = new Map(restaurants.map((r) => [r.id, r]))

export function getDishes(): Dish[] {
  return dishes
}

export function getDish(id: string): Dish | undefined {
  return dishById.get(id)
}

export function getRestaurants(): Restaurant[] {
  return restaurants
}

export function getRestaurant(id: string): Restaurant | undefined {
  return restaurantById.get(id)
}

/** Restaurants that have at least one menu item for this dish, with those items. */
export function whereToEat(dishId: string) {
  return restaurants
    .map((r) => ({ restaurant: r, items: r.menu.filter((m) => m.dishId === dishId) }))
    .filter((x) => x.items.length > 0)
}
