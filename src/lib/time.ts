import type { MealTime } from '../data/types'

const TIME_KEY = 'onebite:timeOverride'

/**
 * Demo helper: add ?time=21:30 to any URL to pretend it's that time
 * (great for presenting at 10 a.m. a feature that shines at night).
 * ?time=off clears it.
 */
function readOverride(): number | null {
  try {
    const q = new URLSearchParams(window.location.search).get('time')
    if (q === 'off') sessionStorage.removeItem(TIME_KEY)
    else if (q && /^\d{1,2}:\d{2}$/.test(q)) sessionStorage.setItem(TIME_KEY, q)
    const v = sessionStorage.getItem(TIME_KEY)
    return v ? toMinutes(v) : null
  } catch {
    return null
  }
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Minutes since midnight in Jakarta time (where the restaurants are), not the device's zone. */
export function nowMinutes(): number {
  const o = readOverride()
  if (o !== null) return o
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date())
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return h * 60 + m
}

export function isTimeOverridden(): boolean {
  return readOverride() !== null
}

export function formatClock(min: number): string {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function mealTimeAt(min: number): MealTime {
  if (min >= 5 * 60 && min < 10 * 60 + 30) return 'breakfast'
  if (min >= 10 * 60 + 30 && min < 15 * 60) return 'lunch'
  if (min >= 15 * 60 && min < 21 * 60 + 30) return 'dinner'
  return 'late'
}

export const MEAL_LABEL: Record<MealTime, string> = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
  late: 'late-night',
}

export type OpenState =
  | { open: true; closesAt: string; closingSoon: boolean; always: boolean }
  | { open: false; opensAt: string }

export function openState(hours: string, now = nowMinutes()): OpenState {
  const [o, c] = hours.split('-')
  const open = toMinutes(o)
  const close = toMinutes(c)
  if (open === 0 && close === 24 * 60) return { open: true, closesAt: '', closingSoon: false, always: true }
  const isOpen = open < close ? now >= open && now < close : now >= open || now < close
  if (!isOpen) return { open: false, opensAt: o }
  const left = (close - now + 24 * 60) % (24 * 60)
  return { open: true, closesAt: c === '24:00' ? '00:00' : c, closingSoon: left <= 45, always: false }
}
