# Rainbow Code

A tiny personal app for showing loyalty / membership barcodes and QR codes on
your phone. Each card can be installed as its own PWA on the Android home
screen, with a custom icon and color.

## Stack

- Vite + React + TypeScript
- TanStack Router (file-based routes)
- IndexedDB via `idb-keyval`
- `qrcode` + `jsbarcode` for code rendering
- Native `BarcodeDetector` API for scanning (Chromium / Android Chrome only)
- Hand-written service worker that serves per-card `manifest.webmanifest` +
  icons from IndexedDB, so each card gets a unique PWA identity

## Routes

- `/` — list of cards, add/edit/delete
- `/add` — scan a code with the camera or enter manually
- `/m/:id` — card view (the PWA `start_url` for that card)
- `/m/:id/edit` — edit a card

## Develop

Requires Node 24 (see `.nvmrc`) and pnpm.

```sh
pnpm install
pnpm dev
```

## Deploy

```sh
pnpm build
pnpm deploy
```

Deploys the `dist/` folder to the `gh-pages` branch.
The site lives at <https://clentfort.github.io/rainbow-code/>.
