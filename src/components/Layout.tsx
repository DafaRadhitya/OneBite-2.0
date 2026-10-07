import { NavLink, Outlet } from 'react-router'
import { DATA_IS_SAMPLE } from '../data/repo'
import { isTimeOverridden, formatClock, nowMinutes } from '../lib/time'

const navCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3.5 py-1.5 text-[13px] font-extrabold transition-colors ${
    isActive ? 'bg-terra text-white' : 'text-brown hover:bg-terra/10'
  }`

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-[1000] border-b border-line bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2" aria-label="OneBite home">
            <span className="text-2xl leading-none">🍽️</span>
            <span className="font-display text-xl font-bold leading-none">OneBite</span>
          </NavLink>
          <nav className="ml-auto flex gap-1">
            <NavLink to="/" end className={navCls}>Roll</NavLink>
            <NavLink to="/dishes" className={navCls}>All dishes</NavLink>
          </nav>
        </div>
      </header>

      {isTimeOverridden() && (
        <div className="bg-warn/15 px-4 py-1.5 text-center text-xs font-bold text-brown">
          Demo time: {formatClock(nowMinutes())} · <a className="underline" href="?time=off">use real time</a>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="site-footer mx-auto w-full max-w-6xl px-4 pt-6 text-center text-[11px] leading-relaxed text-muted sm:px-6">
        {DATA_IS_SAMPLE && (
          <p className="mb-1 font-bold">
            Sample data: places, prices and locations around UI Depok are illustrative, not real businesses.
          </p>
        )}
        <p>
          build {__GIT_SHA__} · {new Date(__BUILD_TIME__).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </footer>
    </div>
  )
}
