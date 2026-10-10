import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// NOTE: `site` is a placeholder. Replace with the real production domain
// when the site is deployed (see src/data/site.ts).
export default defineConfig({
  site: 'https://ajwamart.vercel.app',
  integrations: [tailwind()],
});
