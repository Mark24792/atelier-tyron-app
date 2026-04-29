// app/routes/api.tryon.tsx
// Public API — called by the Shopify storefront extension (no auth needed)
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { db } from "../lib/db.server";
import { trackTryOn, trackAddToCart } from "../lib/analytics.server";

// CORS helper so the storefront iframe can call this
function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

/** GET /api/tryon?shop=xxx&productId=yyy
 *  Returns AR config for a product (is it enabled? what category? what emoji?) */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const productId = url.searchParams.get("productId") || "";
  const origin = request.headers.get("origin") || "*";

  if (!shop || !productId) {
    return json({ error: "Missing shop or productId" }, { status: 400, headers: corsHeaders(origin) });
  }

  const product = await db.tryOnProduct.findUnique({
    where: { shop_shopifyProductId: { shop, shopifyProductId: productId } },
  });

  const settings = await db.shopSettings.findUnique({ where: { shop } });

  return json(
    {
      enabled: !!product?.enabled,
      category: product?.category ?? null,
      arEmoji: product?.arEmoji ?? null,
      arModelUrl: product?.arModelUrl ?? null,
      buttonText: settings?.buttonText ?? "Try On",
      buttonColor: settings?.buttonColor ?? "#1e5c40",
      theme: settings?.theme ?? "light",
    },
    { headers: corsHeaders(origin) }
  );
};

/** POST /api/tryon  — track events from storefront */
export const action = async ({ request }: ActionFunctionArgs) => {
  const origin = request.headers.get("origin") || "*";

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const { event, shop, productId, sessionId } = await request.json();

  if (event === "tryon_start") {
    await trackTryOn(shop, productId, sessionId);
  } else if (event === "add_to_cart") {
    await trackAddToCart(shop, productId, sessionId);
  }

  return json({ ok: true }, { headers: corsHeaders(origin) });
};
