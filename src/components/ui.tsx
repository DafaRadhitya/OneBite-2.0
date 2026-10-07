import type { ReactNode } from 'react'
import type { Dish } from '../data/types'
import { openState } from '../lib/time'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-card ${className}`}>{children}</div>
}

export function Segmented<T extends string | number | null>({
  label, value, options, onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-muted">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-bold transition-colors ${
                active ? 'border-terra bg-terra text-white' : 'border-line bg-card text-brown hover:border-terra/50'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function SpiceMeter({ level }: { level: Dish['spicy'] }) {
  if (level === 0) return <span className="text-xs font-bold text-muted">Not spicy</span>
  return (
    <span className="text-xs font-bold text-terra" title={`Spice ${level}/3`} aria-label={`Spice level ${level} of 3`}>
      {'🌶️'.repeat(level)}
    </span>
  )
}

export function OpenBadge({ hours }: { hours: string }) {
  const s = openState(hours)
  if (s.open && s.always) return <span className="font-bold text-ok">Open 24 hours</span>
  if (s.open)
    return (
      <span className={`font-bold ${s.closingSoon ? 'text-warn' : 'text-ok'}`}>
        {s.closingSoon ? 'Closing soon' : 'Open'} · until {s.closesAt}
      </span>
    )
  return <span className="font-bold text-muted">Closed · opens {s.opensAt}</span>
}

export function DishArt({ dish, size = 'lg' }: { dish: Dish; size?: 'sm' | 'lg' }) {
  // Emoji art instead of hotlinked photos: never breaks, no licensing questions.
  // Swap for real photos once the team has its own images.
  const big = size === 'lg'
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-br from-sand-soft to-sand ${
        big ? 'h-44 sm:h-52' : 'h-28'
      }`}
    >
      <div className="absolute -right-6 -top-6 size-32 rounded-full bg-terra/10" />
      <div className="absolute -bottom-10 -left-8 size-40 rounded-full bg-white/30" />
      <span className={`relative drop-shadow-sm ${big ? 'text-[88px] sm:text-[104px]' : 'text-6xl'}`}>{dish.emoji}</span>
    </div>
  )
}
