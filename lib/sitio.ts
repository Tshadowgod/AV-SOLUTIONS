/* Dirección pública del sitio. Solo se usa en el servidor (metadatos, robots,
   sitemap y datos estructurados), nunca en el navegador. */

function limpiar(url: string): string {
  return url.replace(/\/+$/, "");
}

export const URL_SITIO: string = limpiar(
  process.env.NEXT_PUBLIC_URL_SITIO ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
);
