import { site } from 'astro:config/server';

if (!site) {
  throw new Error('astro.config.mjs must define a site origin');
}

export const SITE_ORIGIN = new URL(site).origin;

export function absoluteUrl(pathname = '/'): string {
  return new URL(pathname, SITE_ORIGIN).href;
}
