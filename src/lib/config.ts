// Site configuration, set in .env.local (see .env.example). Everything here is public.
const env = import.meta.env;

/** Where the demo form posts, as JSON: Formspree, Web3Forms, a Zapier/Make webhook or your own API. */
export const LEAD_ENDPOINT: string = env.VITE_LEAD_ENDPOINT ?? '';
/** Only for services that authenticate the form in its body (Web3Forms calls it `access_key`). */
export const LEAD_ACCESS_KEY: string = env.VITE_LEAD_ACCESS_KEY ?? '';
/** A Calendly or Cal.com link, offered once the form is sent so the lead can pick a time. */
export const BOOKING_URL: string = env.VITE_BOOKING_URL ?? '';
/** Shown in the footer and the legal pages, and used when the form cannot be sent. */
export const CONTACT_EMAIL: string = env.VITE_CONTACT_EMAIL ?? '';

/** The details the Privacy Policy and Terms are written against. Fill these in before launch. */
export const LEGAL = {
  company: env.VITE_LEGAL_COMPANY || 'Rinxora Technologies',
  address: env.VITE_LEGAL_ADDRESS || '[registered business address]',
  governingLaw: env.VITE_LEGAL_JURISDICTION || '[state of incorporation]',
  email: CONTACT_EMAIL || '[contact email]',
  effective: 'October 1, 2026',
};

/** The booking flow can reach a person by at least one route. */
export const canBook = Boolean(LEAD_ENDPOINT || BOOKING_URL || CONTACT_EMAIL);
