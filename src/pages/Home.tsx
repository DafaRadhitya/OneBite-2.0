import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useApp } from '../state/AppState'
import { getDish } from '../data/repo'
import { DEFAULT_FILTERS, candidates, optionFits, optionsFor, pick, reasonsFor, type Candidate } from '../lib/roll'
import { FilterPanel } from '../components/FilterPanel'
import { PlaceRow } from '../components/PlaceRow'
import { Card, DishArt, SpiceMeter } from '../components/ui'
import type { Dish } from '../data/types'

const SPIN_STEPS = [55, 55, 60, 65, 70, 80, 90, 105, 125, 150, 185, 230] // ms; slows down like a wheel

export function Home() {
  const { filters, origin, resultId, pitchIndex, setResult, recent, locStatus } = useApp()
  const pool = useMemo(() => candidates(filters, origin), [filters, origin])
  const [spinning, setSpinning] = useState<Dish | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const roll = () => {
    if (spinning || pool.length === 0) return
    const chosen = pick(pool, recent)
    if (!chosen) return
    if (reduceMotion || pool.length === 1) {
      setResult(chosen.dish.id)
      return
    }
    let t = 0
    SPIN_STEPS.forEach((ms, i) => {
      t += ms
      timers.current.push(
        window.setTimeout(() => setSpinning(pool[(i * 7 + Math.floor(Math.random() * pool.length)) % pool.length].dish), t),
      )
    })
    timers.current.push(
      window.setTimeout(() => {
        setSpinning(null)
        setResult(chosen.dish.id)
      }, t + 260),
    )
  }

  // Rebuild the shown result against current filters/location so the info is always consistent.
  const result: (Candidate & { stale: boolean }) | null = useMemo(() => {
    const dish = resultId ? getDish(resultId) : undefined
    if (!dish) return null
    const all = optionsFor(dish.id, origin)
    const fitting = all.filter((o) => optionFits(o, filters))
    // If filters changed after rolling and nothing fits anymore, still show the places,
    // but mark it so the "why" reasons don't claim things that are no longer true.
    return { dish, fitting: fitting.length ? fitting : all, stale: fitting.length === 0 }
  }, [resultId, origin, filters])

  const rollLabel = spinning ? 'Rolling…' : result ? 'Roll again' : 'What should I eat?'

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 md:grid-cols-[300px_minmax(0,1fr)] md:items-start md:py-8 lg:grid-cols-[330px_minmax(0,1fr)]">
      {/* Result column: first on phones (what you came for), right on wide screens */}
      <section className="md:order-2" aria-live="polite">
        {spinning ? (
          <SpinCard dish={spinning} />
        ) : result ? (
          <ResultCard key={`${result.dish.id}-${pitchIndex}`} c={result} stale={result.stale} pitchIndex={pitchIndex} usingDevice={locStatus === 'device'} />
        ) : (
          <EmptyCard nothing={pool.length === 0} />
        )}
      </section>

      {/* Preferences + roll button */}
      <aside className="md:order-1 lg:sticky lg:top-20">
        <Card className="p-5">
          <FilterPanel matchCount={pool.length} />
          <div className="roll-in-panel mt-5">
            <RollButton label={rollLabel} onClick={roll} disabled={pool.length === 0 || !!spinning} />
          </div>
        </Card>
      </aside>

      {/* Phones and short landscape screens: roll button pinned to the bottom, within thumb reach */}
      <div className="roll-bar fixed inset-x-0 bottom-0 z-[999] border-t border-line bg-cream/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <RollButton label={rollLabel} onClick={roll} disabled={pool.length === 0 || !!spinning} />
      </div>
    </div>
  )
}

function RollButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-terra px-6 py-4 text-base font-extrabold text-white shadow-[0_8px_24px_rgb(196_98_45/0.38)] transition hover:-translate-y-0.5 hover:bg-terra-hover active:translate-y-0 disabled:cursor-not-allowed disabled:bg-sand disabled:text-brown/60 disabled:shadow-none"
    >
      <span className="text-xl">🎲</span> {label}
    </button>
  )
}

function SpinCard({ dish }: { dish: Dish }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid h-64 place-items-center bg-gradient-to-br from-sand-soft to-sand sm:h-80">
        <div className="text-center">
          <div className="text-[96px] leading-none">{dish.emoji}</div>
          <div className="mt-3 font-display text-2xl font-bold text-brown/80">{dish.name}</div>
        </div>
      </div>
    </Card>
  )
}

function EmptyCard({ nothing }: { nothing: boolean }) {
  return (
    <Card className="border-dashed px-6 py-12 text-center sm:py-16">
      <div className="mb-4 animate-float text-5xl">🍜 🍛 🍢</div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{nothing ? 'Nothing fits right now' : "Can't decide what to eat?"}</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
        {nothing
          ? 'Every option is filtered out. Loosen the budget or distance, or turn off "Open now only".'
          : 'Set what matters, hit roll, and OneBite picks a dish, then shows you where around UI to get it and why it makes sense right now.'}
      </p>
    </Card>
  )
}

function ResultCard({ c, stale, pitchIndex, usingDevice }: { c: Candidate; stale: boolean; pitchIndex: number; usingDevice: boolean }) {
  const { filters } = useApp()
  const { dish, fitting } = c
  const pitch = dish.pitches[pitchIndex % dish.pitches.length]
  const reasons = reasonsFor(c, stale ? { ...DEFAULT_FILTERS, openNow: false } : filters, usingDevice)
  const top = fitting.slice(0, 3)

  return (
    <Card className="animate-pop-in overflow-hidden">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <DishArt dish={dish} />
          <div className="px-5 pb-4 pt-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted">You're eating</span>
              <span className="rounded-full bg-brown/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-brown">{dish.cuisine}</span>
              <SpiceMeter level={dish.spicy} />
            </div>
            <h1 className="mt-1 font-display text-4xl font-bold leading-tight sm:text-5xl">{dish.name}</h1>
            <blockquote className="mt-3 border-l-[3px] border-terra pl-3.5 font-display text-[17px] italic leading-relaxed text-ink/85">
              {pitch}
            </blockquote>
          </div>
        </div>

        <div className="border-t border-line px-5 py-4 sm:px-6 lg:border-l lg:border-t-0">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted">Why this, why now</h2>
          {stale && <p className="mt-1 text-xs font-bold text-warn">Your filters changed. This pick no longer fits them, so roll again.</p>}
          <ul className="mt-2 space-y-2">
            {reasons.map((r) => (
              <li key={r.text} className="flex gap-2.5 text-sm leading-snug">
                <span aria-hidden className="w-5 shrink-0 text-center">{r.icon}</span>
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line px-2 py-2 sm:px-3">
        <h2 className="px-3 pt-2 text-xs font-extrabold uppercase tracking-wider text-muted">Where to get it</h2>
        <div className="divide-y divide-line/70">
          {top.map((o) => <PlaceRow key={o.restaurant.id} option={o} />)}
        </div>
        <Link
          to={`/dish/${dish.id}`}
          className="m-2 flex items-center justify-center gap-1 rounded-full border-[1.5px] border-terra/30 py-2.5 text-sm font-extrabold text-terra hover:bg-terra/5"
        >
          🗺️ See all places on the map
        </Link>
      </div>
    </Card>
  )
}
