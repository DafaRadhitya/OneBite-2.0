import { Link, useNavigate, useParams } from 'react-router'
import { getDish } from '../data/repo'
import { useApp } from '../state/AppState'
import { optionFits, optionsFor, type Option } from '../lib/roll'
import { rupiahShort } from '../lib/format'
import { Card, DishArt, SpiceMeter } from '../components/ui'
import { PlaceRow } from '../components/PlaceRow'
import { MapView } from '../components/MapView'
import { NotFound } from './NotFound'

function whyNot(o: Option, f: ReturnType<typeof useApp>['filters']): string {
  if (f.openNow && !o.open) return 'closed now'
  if (f.budget !== null && o.item.price > f.budget) return `over ${rupiahShort(f.budget)}`
  if (f.maxKm !== null && o.km > f.maxKm) return `over ${f.maxKm} km`
  return ''
}

export function DishPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { origin, filters, locStatus, setResult } = useApp()
  const dish = getDish(id)
  if (!dish) return <NotFound />

  const all = optionsFor(dish.id, origin)
  const fit = all.filter((o) => optionFits(o, filters))
  const rest = all.filter((o) => !optionFits(o, filters))

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 md:py-8">
      <button type="button" onClick={() => navigate(-1)} className="mb-3 text-[13px] font-extrabold text-terra">← Back</button>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-start">
        <Card className="overflow-hidden">
          <DishArt dish={dish} />
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-brown/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-brown">{dish.cuisine}</span>
              <SpiceMeter level={dish.spicy} />
              {dish.sweet && <span className="text-xs font-bold text-muted">· sweet</span>}
              {dish.soupy && <span className="text-xs font-bold text-muted">· soupy</span>}
            </div>
            <h1 className="mt-1 font-display text-4xl font-bold">{dish.name}</h1>
            <p className="mt-2 font-display text-[17px] italic leading-relaxed text-ink/85">{dish.pitches[0]}</p>
            <button
              type="button"
              onClick={() => { setResult(dish.id); navigate('/') }}
              className="mt-4 rounded-full bg-terra px-5 py-2.5 text-sm font-extrabold text-white hover:bg-terra-hover"
            >
              ✓ Make this today's pick
            </button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <MapView
              origin={origin}
              pins={all.map((o) => ({ ...o.restaurant, id: o.restaurant.id, label: o.restaurant.name, emoji: dish.emoji, muted: !optionFits(o, filters) }))}
              height={280}
            />
            <p className="px-4 py-2.5 text-xs text-muted">
              Blue dot: {locStatus === 'device' ? 'you' : 'UI campus'} · Tap a pin to open the place
            </p>
          </Card>

          <Card className="px-2 py-2 sm:px-3">
            <h2 className="px-3 pt-2 text-xs font-extrabold uppercase tracking-wider text-muted">
              {fit.length} {fit.length === 1 ? 'place fits' : 'places fit'} your preferences
            </h2>
            <div className="divide-y divide-line/70">
              {fit.map((o) => <PlaceRow key={o.restaurant.id} option={o} />)}
            </div>
            {rest.length > 0 && (
              <>
                <h2 className="px-3 pt-4 text-xs font-extrabold uppercase tracking-wider text-muted">Outside your filters</h2>
                <div className="divide-y divide-line/70 opacity-75">
                  {rest.map((o) => <PlaceRow key={o.restaurant.id} option={o} note={whyNot(o, filters)} />)}
                </div>
              </>
            )}
          </Card>
          <p className="text-center text-xs text-muted">
            Not feeling it? <Link to="/" className="font-bold text-terra underline">Roll something else</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
