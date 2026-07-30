# ISPERA exhibition map — POC

A portable, mobile-first static map for the distributed exhibition **ISPERA** in Laconi, Sardegna.

## Architecture

- MapLibre GL JS renders the map in the browser.
- OpenFreeMap supplies the hosted vector basemap (Liberty style).
- `data/artworks.geojson` is the editable source of artwork content (workflow option A).
- No backend, database, account, or API key is required for the POC.
- The accessible artwork list remains available if the map cannot load.

The basemap service is external. Before production, review the provider’s current terms, capacity, attribution requirements, and support model. The project can be switched to another MapLibre-compatible style URL in `app.js`.

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

Do not open `index.html` directly with `file://`; browsers block the GeoJSON fetch in that mode.

## Edit artworks

Open `data/artworks.geojson`. Coordinates must be in GeoJSON order:

```text
[longitude, latitude]
```

Each feature needs a unique `id`. The internal `number` remains available for organizer reference but is not displayed to visitors:

```json
{
  "number": "1",
  "title": "Artwork title",
  "artist": "Artist name",
  "artworkType": "Pittura",
  "address": "Visitor-facing location",
  "detailsUrl": "https://example.org/artwork-page",
  "verified": true
}
```

The supplied Google Maps links are preserved in `sourceLocation`. Their resolved coordinates are stored in GeoJSON longitude/latitude order. Visitor-facing location labels were reverse-geocoded from OpenStreetMap or taken from the linked place name and remain provisional until confirmed by the organizer. Records with unresolved locations use `geometry: null` and remain available in the textual list without a map-position link.

## Change the visual identity

The current warm paper, dark green, and terracotta identity is explicitly provisional. Replace the CSS variables at the start of `styles.css`:

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

Replace the typographic wordmark in `index.html` with the final SVG logo when available.

## Current POC features

- Hosted vector tiles
- Responsive MapLibre map
- Unified red location pins without route numbers, with shared-coordinate markers fanned apart
- Artwork-type labels in the list and marker popup
- Synchronized artwork list and markers
- Expandable artwork actions
- Deep links such as `#artwork-2`
- Optional browser geolocation
- External OpenStreetMap position links
- Native share / copy-link fallback
- Keyboard focus states and reduced-motion support
- Mobile map/list tabs
- Textual fallback and map error state

## Content still needed

- Final artwork titles and artist names
- Access notes, dates/hours, and images
- Final exhibition logo, colors, fonts, or visual references
- Required languages
- Final hosting/domain and stable QR destination

## Production note

Point the printed QR code to a stable URL controlled by the exhibition, not directly to a tile provider or temporary preview URL. See `DEPLOYMENT.md`.
