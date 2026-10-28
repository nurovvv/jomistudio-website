import type { APIRoute } from 'astro';
import { locales, localePath, defaultLocale } from '../i18n/ui';

// Sitemap for search engines: one entry per language version of the home page, each
// naming the others as its translations. Built into dist/sitemap.xml.
export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const today = new Date().toISOString().slice(0, 10);
  const alternates = [
    ...locales.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${url(localePath(l))}"/>`),
    `<xhtml:link rel="alternate" hreflang="x-default" href="${url(localePath(defaultLocale))}"/>`,
  ].join('\n    ');
  const entries = locales.map((l) => `  <url>
    <loc>${url(localePath(l))}</loc>
    <lastmod>${today}</lastmod>
    ${alternates}
  </url>`);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
