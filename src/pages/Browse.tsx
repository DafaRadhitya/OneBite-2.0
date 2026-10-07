import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getDishes, whereToEat } from '../data/repo'
import { rupiah } from '../lib/format'
import { Card, DishArt, SpiceMeter } from '../components/ui'

export function Browse() {
  const dishes = getDishes()
  const [q, setQ] = useState('')
  const [cuisine, setCuisine] = useState('All')
  const cuisines = useMemo(() => ['All', ...[...new Set(dishes.map((d) => d.cuisine))].sort()], [dishes])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return dishes
      .filter((d) => cuisine === 'All' || d.cuisine === cuisine)
      .filter((d) => !s || d.name.toLowerCase().includes(s) || d.cuisine.toLowerCase().includes(s))
      .map((d) => {
        const places = whereToEat(d.id)
        const min = Math.min(...places.flatMap((p) => p.items.map((i) => i.price)))
        return { d, count: places.length, min }
      })
      .sort((a, b) => a.d.name.localeCompare(b.d.name))
  }, [dishes, q, cuisine])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8">
      <h1 className="font-display text-3xl font-bold">All dishes</h1>
      <p className="mt-1 text-sm text-muted">{dishes.length} dishes in the pool. Tap one to see where to get it.</p>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search dish or cuisine…"
        aria-label="Search dishes"
        className="mt-4 w-full rounded-full border border-line bg-card px-4 py-2.5 text-sm font-semibold outline-none focus:border-terra sm:max-w-sm"
      />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {cuisines.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={c === cuisine}
            onClick={() => setCuisine(c)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
              c === cuisine ? 'border-terra bg-terra text-white' : 'border-line bg-card text-brown'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">No dishes match “{q}”.</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {list.map(({ d, count, min }) => (
            <Link key={d.id} to={`/dish/${d.id}`} className="transition-transform hover:-translate-y-0.5">
              <Card className="h-full overflow-hidden">
                <DishArt dish={d} size="sm" />
                <div className="p-3 sm:p-4">
                  <div className="font-display text-[17px] font-bold leading-tight">{d.name}</div>
                  <div className="mt-1 text-xs text-muted">{d.cuisine} · <SpiceMeter level={d.spicy} /></div>
                  <div className="mt-1.5 text-xs font-bold text-brown">
                    from <span className="text-terra">{rupiah(min)}</span> · {count} {count === 1 ? 'place' : 'places'}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
