/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary brand yellow — CTAs, highlights, selected states
          yellow: '#F6C82B',
          'yellow-deep': '#D9A91F',
          'yellow-soft': '#FDEFBF',
          // Maroon — secondary actions, footer, brand moments
          maroon: '#8A1C14',
          'maroon-deep': '#671309',
          // Palm green — sparing freshness / status accents
          green: '#4C8A3B',
          'green-soft': '#E3EFDD',
          // Dark brown — text, headings, nav (instead of pure black)
          brown: '#1C110C',
          // Surfaces & text
          cream: '#FCFBF9',
          muted: '#6F6259',
          border: '#E6DFD9',
        },
      },
      fontFamily: {
        display: ['Oswald', '"Arial Narrow"', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 17, 12, 0.06), 0 8px 24px -12px rgba(28, 17, 12, 0.18)',
        lift: '0 2px 4px rgba(28, 17, 12, 0.08), 0 16px 32px -16px rgba(28, 17, 12, 0.25)',
      },
    },
  },
  plugins: [],
};
