// Leaflet map. The three classic "Leaflet doesn't work in React" bugs are handled here:
//  1. leaflet.css is imported (without it tiles render scattered / broken)
//  2. the container always gets an explicit height (0px height = blank map)
//  3. markers use divIcon (CSS), so the default PNG marker icons that break under bundlers are never used
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router'
import type { LatLng } from '../data/types'

export interface Pin extends LatLng {
  id: string
  label: string
  emoji: string
  muted?: boolean
}

const pinIcon = (emoji: string, muted?: boolean) =>
  L.divIcon({
    className: '',
    html: `<div class="ob-pin${muted ? ' is-muted' : ''}"><span>${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    tooltipAnchor: [0, -30],
  })

const meIcon = L.divIcon({ className: '', html: '<div class="ob-me"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap()
  const key = points.map((p) => `${p.lat},${p.lng}`).join('|')
  useEffect(() => {
    if (points.length === 1) map.setView(points[0], 16, { animate: false })
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [36, 36], maxZoom: 16, animate: false })
    // animate:false avoids Leaflet's '_leaflet_pos' crash when you navigate away mid-zoom.
    // Re-fits only when the set of points actually changes.
  }, [key, map])
  return null
}

export function MapView({
  pins, origin, height = 260, linkPins = true,
}: {
  pins: Pin[]
  origin?: LatLng
  height?: number
  linkPins?: boolean
}) {
  const navigate = useNavigate()
  const all = useMemo(() => [...pins, ...(origin ? [origin] : [])], [pins, origin])
  const center = all[0] ?? { lat: -6.3628, lng: 106.8269 }

  return (
    <div style={{ height }} className="relative z-0 w-full">
      <MapContainer center={center} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {origin && (
          <Marker position={origin} icon={meIcon}>
            <Tooltip>You / starting point</Tooltip>
          </Marker>
        )}
        {pins.map((p) => (
          <Marker
            key={p.id}
            position={p}
            icon={pinIcon(p.emoji, p.muted)}
            eventHandlers={linkPins ? { click: () => navigate(`/place/${p.id}`) } : undefined}
          >
            <Tooltip>{p.label}</Tooltip>
          </Marker>
        ))}
        <FitBounds points={all} />
      </MapContainer>
    </div>
  )
}
