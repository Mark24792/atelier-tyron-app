// app/lib/analytics.server.ts
import { db } from "./db.server";

/** Called when a visitor clicks "Try On" on the storefront */
export async function trackTryOn(
  shop: string,
  shopifyProductId: string,
  sessionId: string
) {
  const product = await db.tryOnProduct.findUnique({
    where: { shop_shopifyProductId: { shop, shopifyProductId } },
  });
  if (!product) return;

  await db.tryOnAnalytic.create({
    data: { shop, productId: product.id, sessionId },
  });
}

/** Called when a visitor adds to cart after trying on */
export async function trackAddToCart(
  shop: string,
  shopifyProductId: string,
  sessionId: string
) {
  const product = await db.tryOnProduct.findUnique({
    where: { shop_shopifyProductId: { shop, shopifyProductId } },
  });
  if (!product) return;

  await db.tryOnAnalytic.updateMany({
    where: { productId: product.id, sessionId, addedToCart: false },
    data: { addedToCart: true },
  });
}

/** Dashboard stats for a shop */
export async function getShopStats(shop: string) {
  const [totalTryOns, totalAddedToCart, topProducts] = await Promise.all([
    db.tryOnAnalytic.count({ where: { shop } }),
    db.tryOnAnalytic.count({ where: { shop, addedToCart: true } }),
    db.tryOnProduct.findMany({
      where: { shop },
      include: { _count: { select: { analytics: true } } },
      orderBy: { analytics: { _count: "desc" } },
      take: 5,
    }),
  ]);

  const conversionRate =
    totalTryOns > 0 ? Math.round((totalAddedToCart / totalTryOns) * 100) : 0;

  return { totalTryOns, totalAddedToCart, conversionRate, topProducts };
}
