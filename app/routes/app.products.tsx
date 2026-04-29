// app/routes/app.products.tsx
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page, Layout, Card, ResourceList, ResourceItem,
  Text, Badge, Button, Select, BlockStack,
  InlineStack, Thumbnail, EmptyState, Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { db } from "../lib/db.server";

const CATEGORIES = [
  { label: "Eyewear", value: "glasses" },
  { label: "Sunglasses", value: "sunglasses" },
  { label: "Headwear", value: "hat" },
  { label: "Jewellery", value: "jewelry" },
  { label: "Timepieces", value: "watch" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  glasses: "👓", sunglasses: "🕶️", hat: "🎩",
  jewelry: "💍", watch: "⌚",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Fetch first 20 products from Shopify
  const response = await admin.graphql(`
    query {
      products(first: 20) {
        edges {
          node {
            id
            title
            status
            featuredImage { url altText }
            priceRangeV2 {
              minVariantPrice { amount currencyCode }
            }
          }
        }
      }
    }
  `);
  const { data } = await response.json();
  const shopifyProducts = data.products.edges.map((e: any) => e.node);

  // Fetch enabled try-on products from our DB
  const enabledProducts = await db.tryOnProduct.findMany({
    where: { shop: session.shop },
  });
  const enabledMap = Object.fromEntries(
    enabledProducts.map((p) => [p.shopifyProductId, p])
  );

  return json({ shopifyProducts, enabledMap, shop: session.shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const productId = formData.get("productId") as string;
  const productTitle = formData.get("productTitle") as string;
  const category = formData.get("category") as string;

  if (intent === "enable") {
    await db.tryOnProduct.upsert({
      where: { shop_shopifyProductId: { shop: session.shop, shopifyProductId: productId } },
      create: {
        shop: session.shop,
        shopifyProductId: productId,
        productTitle,
        category,
        arEmoji: CATEGORY_EMOJI[category] || "👓",
        enabled: true,
      },
      update: { category, arEmoji: CATEGORY_EMOJI[category] || "👓", enabled: true },
    });
  } else if (intent === "disable") {
    await db.tryOnProduct.updateMany({
      where: { shop: session.shop, shopifyProductId: productId },
      data: { enabled: false },
    });
  }

  return json({ ok: true });
};

export default function Products() {
  const { shopifyProducts, enabledMap } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <Page
      title="Products"
      subtitle="Enable AR try-on for your Shopify products"
    >
      <Layout>
        <Layout.Section>
          <Banner tone="info">
            Enable AR try-on on individual products. A "Try On" button will
            automatically appear on those product pages in your storefront.
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            {shopifyProducts.length === 0 ? (
              <EmptyState heading="No products found" image="">
                <p>Add products to your Shopify store first.</p>
              </EmptyState>
            ) : (
              <ResourceList
                resourceName={{ singular: "product", plural: "products" }}
                items={shopifyProducts}
                renderItem={(product: any) => {
                  const enabled = enabledMap[product.id];
                  const price = product.priceRangeV2?.minVariantPrice;
                  return (
                    <ResourceItem id={product.id} url="">
                      <InlineStack gap="400" align="space-between" blockAlign="center">
                        <InlineStack gap="300" blockAlign="center">
                          <Thumbnail
                            source={product.featuredImage?.url || ""}
                            alt={product.title}
                            size="medium"
                          />
                          <BlockStack gap="100">
                            <Text variant="bodyMd" fontWeight="semibold" as="p">
                              {product.title}
                            </Text>
                            <Text variant="bodySm" tone="subdued" as="p">
                              {price ? `${price.currencyCode} ${parseFloat(price.amount).toFixed(2)}` : "—"}
                            </Text>
                          </BlockStack>
                        </InlineStack>

                        <InlineStack gap="300" blockAlign="center">
                          {enabled ? (
                            <>
                              <Badge tone="success">AR Active</Badge>
                              <Text variant="bodySm" tone="subdued" as="span">
                                {enabled.category}
                              </Text>
                              <fetcher.Form method="post">
                                <input type="hidden" name="intent" value="disable" />
                                <input type="hidden" name="productId" value={product.id} />
                                <Button tone="critical" size="slim" submit>Disable</Button>
                              </fetcher.Form>
                            </>
                          ) : (
                            <fetcher.Form method="post">
                              <input type="hidden" name="intent" value="enable" />
                              <input type="hidden" name="productId" value={product.id} />
                              <input type="hidden" name="productTitle" value={product.title} />
                              <InlineStack gap="200" blockAlign="center">
                                <Select
                                  label=""
                                  options={CATEGORIES}
                                  name="category"
                                  labelHidden
                                />
                                <Button variant="primary" size="slim" submit>
                                  Enable AR
                                </Button>
                              </InlineStack>
                            </fetcher.Form>
                          )}
                        </InlineStack>
                      </InlineStack>
                    </ResourceItem>
                  );
                }}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
