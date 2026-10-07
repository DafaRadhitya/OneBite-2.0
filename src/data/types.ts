export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'late'

export interface Dish {
  id: string
  name: string
  emoji: string
  cuisine: string
  /** 0 = not spicy … 3 = very spicy */
  spicy: 0 | 1 | 2 | 3
  sweet: boolean
  soupy: boolean
  heaviness: 'light' | 'medium' | 'heavy'
  bestTimes: MealTime[]
  pitches: string[]
}

export interface MenuItem {
  name: string
  /** whole Rupiah */
  price: number
  /** links this menu item to a dish in dishes.json */
  dishId?: string
}

export interface Restaurant {
  id: string
  name: string
  area: string
  lat: number
  lng: number
  /** "HH:MM-HH:MM"; may cross midnight ("17:00-02:00"); "00:00-24:00" = open 24h */
  hours: string
  menu: MenuItem[]
}

export interface LatLng {
  lat: number
  lng: number
}
