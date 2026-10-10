/**
 * Central business content for the Ajwa Mart website.
 *
 * Owner-provided information always takes precedence over third-party
 * directory data. Update the values here — every section of the site
 * reads from this file, so nothing needs to change in the components.
 */

export const site = {
  name: 'Ajwa Mart',
  city: 'Chichawatni',
  region: 'Punjab',
  country: 'Pakistan',
  postalCode: '57200',
  addressLine: 'Chichawatni, Punjab 57200, Pakistan',

  /** Display format used across the site. */
  phoneDisplay: '0300 1827927',
  /** International format for tel: links. */
  phoneHref: 'tel:+923001827927',

  /**
   * Production domain. Used for canonical URL, Open Graph tags and structured data.
   */
  url: 'https://ajwamart.vercel.app',

  /** Query-based Google Maps links (no invented coordinates). */
  mapsSearchUrl:
    'https://www.google.com/maps/search/?api=1&query=Ajwa+Mart+Chichawatni+Punjab+Pakistan',
  mapsEmbedUrl:
    'https://www.google.com/maps?q=Ajwa%20Mart%2C%20Chichawatni%2C%20Punjab%2C%20Pakistan&output=embed',

  /** Public directory rating — shown with source attribution only. */
  rating: {
    value: '4.0',
    count: 46,
    source: 'Google',
    note: 'Public rating as listed on Google',
  },
} as const;

export interface DayHours {
  days: string;
  time: string;
  note?: string;
}

/** Verified public-directory hours. Easy for the owner to update. */
export const hours: DayHours[] = [
  { days: 'Monday – Thursday', time: '6:00 AM – 11:00 PM' },
  {
    days: 'Friday',
    time: '6:00 AM – 1:15 PM, 2:15 PM – 11:00 PM',
    note: 'Prayer break 1:15 – 2:15 PM',
  },
  { days: 'Saturday – Sunday', time: '6:00 AM – 11:00 PM' },
];

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'What We Offer', href: '#offer' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Visit Us', href: '#visit' },
] as const;

export const meta = {
  title: 'Ajwa Mart Chichawatni | Grocery, Bakery & Fast Food',
  description:
    'Ajwa Mart in Chichawatni, Punjab — your local general store for everyday groceries, bakery & sweets, and fast food. Open daily 6:00 AM – 11:00 PM. Call 0300 1827927.',
} as const;
