# Deployment and QR checklist

## Static hosting

This project can be deployed without a build step to GitHub Pages, Netlify, Vercel, Cloudflare Pages, shared hosting, or an institutional web server.

Publish the entire `ispera-map` directory while preserving this structure:

```text
index.html
styles.css
app.js
data/artworks.geojson
```

Serve over HTTPS so browser geolocation can work. (`localhost` is also allowed during development.)

## Stable URL

Preferred public architecture:

```text
Printed QR → https://your-domain.example/ispera → this static site
```

Use a URL controlled by the organizer. If hosting or mapping providers change later, the QR remains valid.

## Before generating the final QR

1. Replace all draft artwork content.
2. Confirm each marker on site.
3. Add final identity assets and check font web licences.
4. Review the hosted vector-tile provider’s current production terms.
5. Test the map and list on at least one iPhone and one Android device.
6. Test keyboard navigation and reduced motion.
7. Test with throttled/weak connectivity.
8. Confirm OpenStreetMap and tile-provider attribution remains visible.
9. Add privacy information if analytics or additional third-party services are introduced.
10. Print a short URL below the QR and physically test it outdoors.

## Updating content

Edit `data/artworks.geojson`, validate the JSON, then upload/redeploy the changed file. Keep versioned backups in Git or another controlled storage location.
