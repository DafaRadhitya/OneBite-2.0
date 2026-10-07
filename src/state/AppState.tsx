import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { LatLng } from '../data/types'
import { AREA_CENTER } from '../data/repo'
import { DEFAULT_FILTERS, type Filters } from '../lib/roll'

// Small wrappers: browser storage can be blocked (private mode etc.) — never let that crash the app.
function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? { ...fallback, ...JSON.parse(v) } : fallback
  } catch {
    return fallback
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

type LocStatus = 'default' | 'asking' | 'device' | 'denied' | 'unavailable'

interface AppState {
  filters: Filters
  setFilters: (f: Filters) => void
  /** currently shown rolled dish (kept here so it survives navigating away and back) */
  resultId: string | null
  pitchIndex: number
  setResult: (dishId: string | null) => void
  recent: string[]
  origin: LatLng
  locStatus: LocStatus
  requestLocation: () => void
  resetToCampus: () => void
}

const Ctx = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersRaw] = useState<Filters>(() => load('onebite:filters', DEFAULT_FILTERS))
  const [resultId, setResultId] = useState<string | null>(null)
  const [pitchIndex, setPitchIndex] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const [origin, setOrigin] = useState<LatLng>(AREA_CENTER)
  const [locStatus, setLocStatus] = useState<LocStatus>('default')

  const setFilters = useCallback((f: Filters) => {
    setFiltersRaw(f)
    save('onebite:filters', f)
  }, [])

  const setResult = useCallback((id: string | null) => {
    setResultId(id)
    setPitchIndex(Math.floor(Math.random() * 1000))
    if (id) setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 6))
  }, [])

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocStatus('unavailable')
      return
    }
    setLocStatus('asking')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocStatus('device')
      },
      (e) => setLocStatus(e.code === e.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    )
  }, [])

  const resetToCampus = useCallback(() => {
    setOrigin(AREA_CENTER)
    setLocStatus('default')
  }, [])

  const value = useMemo(
    () => ({ filters, setFilters, resultId, pitchIndex, setResult, recent, origin, locStatus, requestLocation, resetToCampus }),
    [filters, setFilters, resultId, pitchIndex, setResult, recent, origin, locStatus, requestLocation, resetToCampus],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside <AppStateProvider>')
  return v
}
