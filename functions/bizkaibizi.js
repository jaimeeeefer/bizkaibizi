// ═══════════════════════════════════════════════════════
// Cloudflare Pages Function: /bizkaibizi
// Proxy hacia la API pública de Nextbike (Bizkaibizi) para
// evitar problemas de CORS y añadir una pequeña caché.
// ═══════════════════════════════════════════════════════

const NEXTBIKE_URL =
  "https://maps.nextbike.net/maps/nextbike-live.json?city=873,903,904,905,906,907,908,909,910";

export async function onRequestGet(context) {
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, context.request);

  // Sirve desde caché si tenemos una respuesta reciente (10 s)
  let cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const upstream = await fetch(NEXTBIKE_URL, {
      headers: { "User-Agent": "Bizkaibizi-App/1.0" },
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: "No se pudo contactar con Nextbike", status: upstream.status }),
        { status: 502, headers: corsHeaders("application/json") }
      );
    }

    const body = await upstream.text();
    const response = new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders("application/json"),
        "Cache-Control": "public, max-age=10",
      },
    });

    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error de red al consultar Nextbike", detail: String(err) }),
      { status: 500, headers: corsHeaders("application/json") }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

function corsHeaders(contentType) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}
