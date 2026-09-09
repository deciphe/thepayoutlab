# The Payout Lab — GitHub Pages edition

A clean, Base44-independent React/Vite build of The Payout Lab.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The deployable static site is generated in `dist/`.

## GitHub Pages

Use the included GitHub Actions workflow. In your repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

For a custom domain, add your domain in **Settings → Pages → Custom domain**. GitHub will create/update the CNAME configuration for the deployment.

## Content updates

Payout certificates, firm rankings and ticker copy live in:

`src/components/payoutlab/data.js`

The rest of the page is split into small components under:

`src/components/payoutlab/`

No Base44 SDK, authentication, database, or Base44 build plugin is required.
