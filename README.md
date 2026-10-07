# OneBite 🍽️

Can't decide what to eat? OneBite picks a **dish** for you, shows **where around UI Depok** you can get it,
the **rest of that place's menu**, and **why it makes sense right now** (time of day, distance, price, what's open).

> ⚠️ The current data is **sample data**: places, prices and coordinates are illustrative, not real businesses.
> See [DECISIONS.md](./DECISIONS.md) → Data.

## Run it on your laptop

You need **Node.js 22** and **pnpm**. Install them once:

1. Install Node.js 22 LTS from https://nodejs.org (or `nvm install` inside this folder; it reads `.nvmrc`).
2. Turn on pnpm: `corepack enable` (comes with Node; on Windows run the terminal as Administrator once).

Then:

```bash
git clone <this repo url>
cd OneBite-2.0
pnpm install
pnpm dev
```

Open http://localhost:5173.

**Is the browser running the code I just edited?** Look at the footer: `build <commit> · <time>`.
If you change code and that doesn't match what you expect, you're running a different copy or an old server.
Stop every terminal running `pnpm dev` and start one again.
This is the guard against the "ghost" that killed attempt #1.

## Useful commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start the app with live reload (port 5173, fails loudly if already in use) |
| `pnpm check` | Typecheck + data check + production build. **Run before every pull request.** CI runs the same thing. |
| `pnpm check:data` | Only check the food data for mistakes (unknown dish ids, bad prices, swapped lat/lng…) |
| `pnpm build` / `pnpm preview` | Build and serve the production version locally |

**Demo trick:** add `?time=21:30` to the URL to pretend it's 21:30 (to show the late-night picks during a daytime demo).
`?time=off` goes back to real time.

## Where things are

```
src/
  data/
    dishes.json        ← the dishes (name, emoji, spice, best times, "pitch" lines)
    restaurants.json   ← places + menus. menu items link to dishes via "dishId"
    repo.ts            ← the ONLY code that reads data. Swap this for a real backend later.
  lib/
    roll.ts            ← filters, weighted random pick, "why this, why now" reasons
    time.ts            ← open/closed (Jakarta time), meal times, demo time override
    geo.ts             ← distances, walk time, directions link
  pages/               ← Home (roll), DishPage (/dish/:id), PlacePage (/place/:id), Browse (/dishes)
  components/          ← MapView (Leaflet), FilterPanel, PlaceRow, small UI pieces
  state/AppState.tsx   ← filters, current pick, location (shared across pages)
scripts/validate-data.mjs
```

## Adding or editing food data

1. Edit `src/data/dishes.json` or `src/data/restaurants.json`.
2. Prices are **whole Rupiah** (`15000`, not `15k`). Hours are `"10:00-22:00"`, can cross midnight (`"17:00-02:00"`), `"00:00-24:00"` = 24h.
3. Link a menu item to a dish with `"dishId": "nasi-goreng"`. Items without `dishId` show on the menu but are never rolled.
4. Run `pnpm check:data`. It tells you exactly what's wrong.

## Deploy (Vercel)

1. Sign in at https://vercel.com with GitHub → **Add New → Project** → pick this repo.
2. Framework preset: **Vite** (auto-detected). Leave the defaults. **Deploy.**
3. Every push to `main` updates the live site; every pull request gets its own preview link.

`vercel.json` already makes page links like `/dish/bakso` work on refresh.

## Team rules

See [CONTRIBUTING.md](./CONTRIBUTING.md). Short version: never push to `main` directly, use a branch + pull request, run `pnpm check` first.
