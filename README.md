# Ajwa Mart — Official Website

Official single-page website for **Ajwa Mart, Chichawatni, Punjab, Pakistan**.

- Stack: Astro 4 + TypeScript + Tailwind CSS. No database, no auth, no cart, no payments, no backend.
- Output: fully static site in `dist/` — host it anywhere (Netlify, Vercel, Cloudflare Pages, cPanel, any static host).

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Deploy

Upload the contents of `dist/` to any static host. That's it.

**Domain:** the production domain is `https://ajwamart.vercel.app`, set in
`src/data/site.ts`, `astro.config.mjs`, `public/sitemap.xml`, and `public/robots.txt`.
If it ever changes, update those four files and rebuild.

## Updating business information

All business content lives in **`src/data/site.ts`** — phone, hours, address,
Google rating, categories, map links. Edit that one file and rebuild.

- **Phone:** stored once as `+923001827927`; display format `0300 1827927`.
- **Hours:** the open/closed badge in `src/scripts/main.ts` computes status in the
  `Asia/Karachi` timezone, including the Friday 1:15 PM – 2:15 PM prayer break.
  Keep `site.ts` hours text and the script's windows in sync if hours change.
- **Rating:** only the public Google figure (4.0/5 from 46 ratings) is shown.
  Update `ratingValue` / `reviewCount` if the public listing changes. Review quotes
  are intentionally absent — add them only with the customer's permission.
- **Photos:** `src/components/Gallery.astro` currently shows six labelled
  placeholders. Replace them with real Ajwa Mart photos (storefront, shelves,
  bakery counter, sweets, fast food) when available. WebP, ~1600px wide is ideal.
- **Logo:** `public/logo.webp` (primary), `public/logo.png` (fallback),
  `public/favicon.png`. If the logo ever changes, regenerate these three
  (plus `public/og-image.jpg` for social sharing) and rebuild.

## What was deliberately not invented

No product lists, prices, menu items, awards, founding story, social accounts,
branches, coordinates, or delivery zones. Maps links use a text search
("Ajwa Mart Chichawatni") rather than invented coordinates.
