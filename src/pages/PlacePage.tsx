import { Link, useNavigate, useParams } from 'react-router'
import { DATA_IS_SAMPLE, getDish, getRestaurant } from '../data/repo'
import { useApp } from '../state/AppState'
import { directionsUrl, distanceKm, formatDistance, walkMinutes } from '../lib/geo'
import { rupiah } from '../lib/format'
import { Card, OpenBadge } from '../components/ui'
import { MapView } from '../components/MapView'
import { NotFound } from './NotFound'

export function PlacePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { origin, resultId, locStatus } = useApp()
  const r = getRestaurant(id)
  if (!r) return <NotFound />

  const km = distanceKm(origin, r)
  const [open, close] = r.hours.split('-')
  const firstDish = r.menu.find((m) => m.dishId)?.dishId
  const pinEmoji = (firstDish && getDish(firstDish)?.emoji) || '🍽️'

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 md:py-8">
      <button type="button" onClick={() => navigate(-1)} className="mb-3 text-[13px] font-extrabold text-terra">← Back</button>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-muted">{r.area}</div>
            <h1 className="mt-0.5 font-display text-3xl font-bold leading-tight sm:text-4xl">{r.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
              <OpenBadge hours={r.hours} />
              <span className="text-muted">🕒 {r.hours === '00:00-24:00' ? '24 hours' : `${open}–${close}`}</span>
              <span className="text-muted">
                📍 {formatDistance(km)} from {locStatus === 'device' ? 'you' : 'campus'}
                {km <= 2 && ` · ~${walkMinutes(km)} min walk`}
              </span>
            </div>
            <a
              href={directionsUrl(r)}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-terra px-5 py-3 text-sm font-extrabold text-white shadow-[0_6px_20px_rgb(196_98_45/0.35)] hover:bg-terra-hover"
            >
              🧭 Get directions
            </a>
            {DATA_IS_SAMPLE && (
              <p className="mt-2 text-xs text-muted">Sample place: directions go to an illustrative pin, not a real restaurant.</p>
            )}
          </Card>

          <Card className="overflow-hidden">
            <MapView origin={origin} pins={[{ id: r.id, lat: r.lat, lng: r.lng, label: r.name, emoji: pinEmoji }]} linkPins={false} height={260} />
          </Card>
        </div>

        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Menu</h2>
          <ul className="mt-2">
            {r.menu.map((m, i) => {
              const dish = m.dishId ? getDish(m.dishId) : undefined
              const isPick = !!dish && dish.id === resultId
              return (
                <li key={m.name} className={`flex items-center justify-between gap-3 py-3 ${i ? 'border-t border-dashed border-line' : ''}`}>
                  <div className="min-w-0">
                    <div className={`font-bold ${isPick ? 'text-terra' : ''}`}>
                      {m.name}
                      {isPick && <span className="ml-2 rounded-full bg-terra/10 px-2 py-0.5 text-[11px] font-extrabold">your pick</span>}
                    </div>
                    {dish && (
                      <Link to={`/dish/${dish.id}`} className="text-xs font-semibold text-muted hover:text-terra">
                        {dish.emoji} {dish.name} · compare places →
                      </Link>
                    )}
                  </div>
                  <span className="shrink-0 font-extrabold text-terra">{rupiah(m.price)}</span>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </div>
  )
}
