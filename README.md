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
pnpm build
```
