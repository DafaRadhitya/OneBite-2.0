import { Link } from 'react-router'
import type { Option } from '../lib/roll'
import { formatDistance } from '../lib/geo'
import { rupiah } from '../lib/format'
import { OpenBadge } from './ui'

export function PlaceRow({ option, note }: { option: Option; note?: string }) {
  const { restaurant: r, item, km } = option
  return (
    <Link
      to={`/place/${r.id}`}
      className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-terra/5"
    >
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[17px] font-bold leading-tight">{r.name}</div>
        <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted">
          <span>{r.area}</span>
          <span>· {formatDistance(km)}</span>
          <span>· <OpenBadge hours={r.hours} /></span>
        </div>
        <div className="mt-1 text-[13px] font-semibold text-brown">
          {item.name} · <span className="font-extrabold text-terra">{rupiah(item.price)}</span>
          {note && <span className="ml-2 rounded-full bg-muted/10 px-2 py-0.5 text-[11px] font-bold text-muted">{note}</span>}
        </div>
      </div>
      <span className="text-xl text-terra/60 transition-transform group-hover:translate-x-0.5" aria-hidden>›</span>
    </Link>
  )
}
