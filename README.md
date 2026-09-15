# Velocity Roofing PDF Pricer

An internal web app that places six prices into the supplied Velocity Roofing package-options PDF and downloads a completed, static PDF.

## Pricing fields

- Standard project price and monthly payment
- Silver project price and monthly payment
- Gold project price and monthly payment

## Run locally

```bash
pnpm install
pnpm dev
```

Open the local URL shown in the terminal. Pricing is processed entirely in the browser; no customer or pricing data is sent to a server.

## Build

```bash
npm run build
```

## Deploy to Cloudflare Pages

Connect this GitHub repository to Cloudflare Pages and use:

- Framework preset: React (Vite)
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank

No environment variables are required.
