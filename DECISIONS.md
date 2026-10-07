# Decisions

The settled answers, so nobody (human or AI) re-argues them by accident.
Change a decision by editing this file in a pull request, with the reason.

## Product

- **What OneBite is:** a quick food randomizer. You roll → it picks a **dish** → shows **restaurants that serve it**
  and **their other menu items** → and gives concrete reasons to accept the pick.
- **"Convincing" is the core feature, not decoration.** Every reason shown must be true to the data
  (real distance, real price, real opening hours). No fake claims.
- **Audience/area:** students around **Universitas Indonesia, Depok**. Distances default to the UI campus centre;
  users can switch to their own location (browser permission, only when they tap "Use my location").
- **Goal right now:** an MVP / complete prototype that shows the full capability, built so it can grow into a real product.
- **Devices:** phone portrait, phone landscape, tablet landscape, desktop. All must be usable.
  Phones get the roll button pinned at the bottom (thumb reach).
- **Language:** English UI for now, Indonesian dish names. (Open question: Bahasa Indonesia UI.)

## Data

- **Now (option B):** hand-made **sample data** (`src/data/*.json`, `meta.sample = true`). The app labels it as sample.
  Fictional places with plausible prices; **not real businesses**.
- **Later (option A):** the team collects **real** restaurants + menus for the UI Depok area, probably in a shared
  Google Sheet that gets converted to the same JSON format. Set `meta.sample` to `false` only when every entry is real.
- **Why not an API:** Google Places has real places but **no menus**; GoFood/GrabFood have menus but no public API and
  scraping breaks their terms; OpenStreetMap has patchy coverage and no menus. Attempt #1 stalled here.
  Keep the area **small** (one neighbourhood) so real data stays collectable.
- All data access goes through `src/data/repo.ts`. A backend later replaces that file only.

## Roll logic

- Filters: budget (price of the dish at a place), distance, spice, open now (default on).
- A dish can be rolled only if at least one place serving it passes the filters.
- Dishes that suit the current time of day (breakfast / lunch / dinner / late) are **2.5× more likely**.
- The last 3 rolled dishes are skipped when there's enough choice (no immediate repeats).
- Opening hours are evaluated in **Asia/Jakarta** time regardless of the device's timezone.

## Tech

- React 19 + Vite 8 + TypeScript (strict) + Tailwind CSS v4, pnpm, Node 22.
- Routing: react-router (real URLs, so the back button and shared links work).
- Map: Leaflet + react-leaflet with OpenStreetMap tiles. The 3 classic Leaflet-in-React bugs are handled in
  `components/MapView.tsx` (CSS import, explicit height, CSS-only markers).
  OSM's free tiles are fine for an MVP. Heavy public traffic would need a tile provider (to check before launch).
- No backend, no login, no paid APIs in the MVP.
- Dish images are emoji art for now (no hotlinked photos that can break or have licensing issues).
- Hosting: Vercel, connected to GitHub. CI (`.github/workflows/check.yml`) runs `pnpm check` on every PR.
- Visual identity carried over from the Figma Make prototype: cream/terracotta palette, Fraunces + Nunito.

## Lessons from attempt #1

1. **"Ghost" build** (edits not showing up): git from day one, one dev server on a fixed port (`strictPort`),
   build stamp in the footer.
2. **Data dead end:** sample data first, small area, real data later (see Data).
3. **Leaflet didn't work:** isolated in one component with the known fixes; the app works even if the map fails.

## Open questions

- Bahasa Indonesia UI, English, or both?
- Real data collection: who, which streets, by when?
- Name check: Figma prototype was called "Crave"; we're using **OneBite**.
