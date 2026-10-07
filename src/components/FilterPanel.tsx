import { useApp } from '../state/AppState'
import { DEFAULT_FILTERS, type Filters } from '../lib/roll'
import { Segmented } from './ui'

export function FilterPanel({ matchCount }: { matchCount: number }) {
  const { filters: f, setFilters, locStatus, requestLocation, resetToCampus } = useApp()
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters({ ...f, [k]: v })
  const changed = JSON.stringify(f) !== JSON.stringify(DEFAULT_FILTERS)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold">Preferences</h2>
        {changed && (
          <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="text-xs font-bold text-terra underline underline-offset-2">
            Reset
          </button>
        )}
      </div>

      <Segmented
        label="Budget (per dish)"
        value={f.budget}
        onChange={(v) => set('budget', v)}
        options={[
          { value: null, label: 'Any' },
          { value: 15000, label: '≤ 15k' },
          { value: 25000, label: '≤ 25k' },
          { value: 40000, label: '≤ 40k' },
        ]}
      />
      <Segmented
        label="Distance"
        value={f.maxKm}
        onChange={(v) => set('maxKm', v)}
        options={[
          { value: null, label: 'Any' },
          { value: 1, label: '🚶 ≤ 1 km' },
          { value: 2, label: '≤ 2 km' },
          { value: 5, label: '≤ 5 km' },
        ]}
      />
      <Segmented
        label="Spice"
        value={f.spice}
        onChange={(v) => set('spice', v)}
        options={[
          { value: 'any', label: 'Any' },
          { value: 'mild', label: 'Mild' },
          { value: 'hot', label: '🌶️ Spicy' },
        ]}
      />

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-line bg-card px-3.5 py-2.5">
        <span>
          <span className="block text-sm font-bold">Open now only</span>
          <span className="block text-xs text-muted">Hide places that are closed</span>
        </span>
        <input
          type="checkbox"
          checked={f.openNow}
          onChange={(e) => set('openNow', e.target.checked)}
          className="size-5 accent-[var(--color-terra)]"
        />
      </label>

      <div className="rounded-2xl bg-terra/5 px-3.5 py-2.5 text-xs text-brown">
        <div className="font-bold">
          📍 Distances from{' '}
          {locStatus === 'device' ? 'your location' : 'UI campus (centre)'}
        </div>
        <div className="mt-1">
          {locStatus === 'device' ? (
            <button type="button" onClick={resetToCampus} className="font-bold text-terra underline underline-offset-2">Use campus instead</button>
          ) : locStatus === 'asking' ? (
            <span>Asking your browser…</span>
          ) : (
            <>
              <button type="button" onClick={requestLocation} className="font-bold text-terra underline underline-offset-2">Use my location</button>
              {locStatus === 'denied' && <span className="ml-1 text-muted">(permission was blocked)</span>}
              {locStatus === 'unavailable' && <span className="ml-1 text-muted">(couldn't get location)</span>}
            </>
          )}
        </div>
      </div>

      <p className="text-center text-xs font-bold text-muted" aria-live="polite">
        {matchCount > 0 ? (
          <><span className="text-terra">{matchCount}</span> {matchCount === 1 ? 'dish fits' : 'dishes fit'}</>
        ) : (
          'Nothing fits. Try loosening a filter.'
        )}
      </p>
    </div>
  )
}
