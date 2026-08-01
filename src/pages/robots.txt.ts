import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL}\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
