// Checks the food data for mistakes before it reaches the app.
// Run: pnpm check:data   (also runs in CI on every pull request)
import { readFileSync } from 'node:fs'

const dishes = JSON.parse(readFileSync(new URL('../src/data/dishes.json', import.meta.url)))
const { restaurants } = JSON.parse(readFileSync(new URL('../src/data/restaurants.json', import.meta.url)))

const errors = []
const warnings = []
const err = (m) => errors.push(m)

const dishIds = new Set()
for (const d of dishes) {
  if (!/^[a-z0-9-]+$/.test(d.id)) err(`dish "${d.id}": id must be lowercase-with-dashes`)
  if (dishIds.has(d.id)) err(`dish "${d.id}": duplicate id`)
  dishIds.add(d.id)
  for (const k of ['name', 'emoji', 'cuisine']) if (!d[k]) err(`dish "${d.id}": missing ${k}`)
  if (![0, 1, 2, 3].includes(d.spicy)) err(`dish "${d.id}": spicy must be 0–3`)
  if (!['light', 'medium', 'heavy'].includes(d.heaviness)) err(`dish "${d.id}": bad heaviness`)
  if (!Array.isArray(d.bestTimes) || !d.bestTimes.every((t) => ['breakfast', 'lunch', 'dinner', 'late'].includes(t)))
    err(`dish "${d.id}": bestTimes must use breakfast/lunch/dinner/late`)
  if (!Array.isArray(d.pitches) || d.pitches.length < 1) err(`dish "${d.id}": needs at least one pitch`)
}

const HOURS = /^([01]\d|2[0-4]):[0-5]\d-([01]\d|2[0-4]):[0-5]\d$/
const restIds = new Set()
const served = new Map()
for (const r of restaurants) {
  if (restIds.has(r.id)) err(`restaurant "${r.id}": duplicate id`)
  restIds.add(r.id)
  if (!r.name || !r.area) err(`restaurant "${r.id}": missing name/area`)
  // Rough box around Depok / South Jakarta — catches swapped lat/lng and typos.
  if (!(r.lat > -6.5 && r.lat < -6.2 && r.lng > 106.7 && r.lng < 106.95))
    err(`restaurant "${r.id}": coordinates ${r.lat},${r.lng} are outside the Depok area (lat/lng swapped?)`)
  if (!HOURS.test(r.hours)) err(`restaurant "${r.id}": hours must look like "10:00-22:00"`)
  if (!Array.isArray(r.menu) || r.menu.length === 0) err(`restaurant "${r.id}": empty menu`)
  for (const m of r.menu ?? []) {
    if (!Number.isInteger(m.price) || m.price < 1000 || m.price > 1000000)
      err(`restaurant "${r.id}", item "${m.name}": price must be whole Rupiah, e.g. 15000`)
    if (m.dishId) {
      if (!dishIds.has(m.dishId)) err(`restaurant "${r.id}", item "${m.name}": unknown dishId "${m.dishId}"`)
      served.set(m.dishId, (served.get(m.dishId) ?? 0) + 1)
    }
  }
}
for (const id of dishIds) {
  if (!served.has(id)) err(`dish "${id}": no restaurant serves it (it could be rolled with nowhere to go)`)
}
for (const id of dishIds) if ((served.get(id) ?? 0) === 1) warnings.push(`dish "${id}" is only on one menu item`)

for (const w of warnings) console.warn('warn:', w)
if (errors.length) {
  for (const e of errors) console.error('ERROR:', e)
  console.error(`\n${errors.length} data error(s).`)
  process.exit(1)
}
console.log(`Data OK: ${dishes.length} dishes, ${restaurants.length} restaurants.`)
