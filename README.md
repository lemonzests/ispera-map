# ISPERA exhibition map

A portable, mobile-first map for the distributed exhibition **ISPERA 2026** in Laconi, Sardegna.

## Current state

The map is deployed on Vercel and available for mobile testing:

https://ispera-map.vercel.app

The artwork dataset currently contains 13 works. Public-facing artwork information is complete: every work has a title, artist, artwork type, address, and map coordinate. Artwork descriptions and visitor-facing numbering are intentionally not used.

The remaining launch work is operational rather than content entry: test the deployed site on physical mobile devices, confirm final pin placement on site, review production dependencies, and prepare the final domain/QR destination.

## Architecture

- Static HTML, CSS, and JavaScript; no build step is required.
- A locally stored copy of MapLibre GL JS 5.6.1 renders the interactive map in the browser.
- OpenFreeMap supplies the hosted vector basemap.
- `data/artworks.geojson` is the editable source of artwork information and coordinates.
- No backend, database, account, or API key is required.
- The accessible artwork list remains available if the map cannot load.
- Vercel hosts the current production preview.

MapLibre GL JS, MapLibre CSS, DM Sans, and Fraunces are stored in this repository and served by the same host as the application. The OpenFreeMap basemap remains an external service. Before final launch, review OpenFreeMap’s current terms, capacity, attribution requirements, and support model.

## Project structure

```text
index.html                 Page structure and public information
styles.css                 Visual identity and responsive layout
app.js                     Map, markers, list, sharing, and interactions
assets/logo.png            ISPERA logo
assets/fonts/              Local DM Sans and Fraunces webfonts
data/artworks.geojson      Artwork information and coordinates
vendor/maplibre-gl/        Local MapLibre GL JS 5.6.1 JavaScript and CSS
DEPLOYMENT.md              Hosting and QR checklist
```

## Preview locally

From WSL:

```bash
cd /home/sloom/ispera-map
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Do not open `index.html` directly with `file://`; browsers block the GeoJSON request in that mode.

## Edit artworks

Edit `data/artworks.geojson`. Coordinates must use GeoJSON order:

```text
[longitude, latitude]
```

Each feature has this structure:

```json
{
  "type": "Feature",
  "id": "artwork-6",
  "geometry": {
    "type": "Point",
    "coordinates": [9.05339, 39.852867]
  },
  "properties": {
    "number": "6",
    "title": "Senza Titolo",
    "artist": "Sara Pisci",
    "artworkType": "Tessuto",
    "address": "Via Giuseppe Mazzini 8",
    "detailsUrl": "",
    "sourceLocation": "39.852867, 9.05339",
    "verified": true
  }
}
```

### Fields used

| Field | Purpose |
|---|---|
| `id` | Stable unique identifier used by markers, list items, and deep links such as `#artwork-6`. |
| `geometry.coordinates` | Authoritative map position in `[longitude, latitude]` order. |
| `number` | Internal organizer reference. It is not displayed to visitors. |
| `title` | Public artwork title. |
| `artist` | Public artist name. |
| `artworkType` | Public artwork category shown in the list and popup. |
| `address` | Public location label shown to visitors. Pin placement is coordinate-based, not derived from this text. |
| `detailsUrl` | Optional external artwork page. Leave as an empty string when no page is available. |
| `sourceLocation` | Organizer/source reference used to trace or verify the location. It is not displayed publicly. |
| `verified` | Internal editorial flag indicating that the location has been checked. It is not displayed publicly. |

Every feature needs a unique `id` and valid point geometry. Visual marker offsets are configured separately in `app.js`; these keep close or shared pins distinguishable and within building footprints without changing the stored coordinates.

After changing the GeoJSON or JavaScript, update the corresponding cache-busting query string near the top of `app.js` or in `index.html`, validate the files, and redeploy.

## Change the visual identity

The main colors and typography are centralized at the start of `styles.css`:

```css
--paper:
--paper-strong:
--ink:
--muted:
--line:
--accent:
--accent-dark:
--font-display:
--font-body:
```

The current logo is stored at `assets/logo.png` and referenced in `index.html`.

## Current features

- Hosted vector basemap rendered with MapLibre GL JS
- Responsive desktop and mobile layouts
- Free-path visitor experience without route numbering or artwork count
- Unified red location pins
- Smooth marker offsets for nearby or shared locations
- Artwork title, artist, type, and address in the accessible list
- Synchronized list, markers, and popups
- Deep links such as `#artwork-6`
- Native share action with copy-link fallback
- Optional browser geolocation
- Links to positions on OpenStreetMap
- Desktop control to hide or restore the artwork list
- Mobile map/list tabs
- Keyboard focus states and reduced-motion support
- Textual fallback and map error state
- Visible MapLibre, OpenFreeMap, OpenMapTiles, and OpenStreetMap attribution

## Deployment

The current Vercel project serves:

https://ispera-map.vercel.app

The site can also be deployed without a build step to GitHub Pages, Netlify, Cloudflare Pages, shared hosting, or an institutional server. See `DEPLOYMENT.md` for the production and QR checklist.

The final printed QR should point to a stable URL controlled by the exhibition organizer, not to localhost, a temporary preview URL, or a tile provider.
