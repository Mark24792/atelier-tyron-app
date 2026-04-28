// app/routes/app._index.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page, Layout, Card, Text, BlockStack, InlineGrid,
  Badge, DataTable, EmptyState, Button, Box,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getShopStats } from "../lib/analytics.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const stats = await getShopStats(session.shop);
  return json({ shop: session.shop, stats });
};

export default function Index() {
  const { shop, stats } = useLoaderData<typeof loader>();

  return (
    <Page title="Atelier — Virtual Try-On">
      <Layout>
        {/* KPI cards */}
        <Layout.Section>
          <InlineGrid columns={4} gap="400">
            <StatCard label="Try-Ons Today" value={stats.totalTryOns.toLocaleString()} trend="+18%" />
            <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} trend="+8%" />
            <StatCard label="Return Reduction" value="−62%" trend="vs last month" positive />
            <StatCard label="App Rating" value="4.8 ★" trend="App Store" positive />
          </InlineGrid>
        </Layout.Section>

        {/* Quick actions */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Quick Setup</Text>
              <InlineGrid columns={3} gap="300">
                <QuickAction
                  icon="🛍️"
                  title="Enable Products"
                  desc="Choose which products get AR try-on"
                  href="/app/products"
                />
                <QuickAction
                  icon="🎨"
                  title="Customise Widget"
                  desc="Match the button to your store's brand"
                  href="/app/settings"
                />
                <QuickAction
                  icon="📊"
                  title="View Analytics"
                  desc="See which products are tried most"
                  href="/app/analytics"
                />
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Top products table */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Top Try-On Products</Text>
              {stats.topProducts.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "numeric", "text"]}
                  headings={["Product", "Category", "Try-Ons", "Status"]}
                  rows={stats.topProducts.map((p) => [
                    p.productTitle,
                    p.category,
                    p._count.analytics,
                    <Badge tone="success">Active</Badge>,
                  ])}
                />
              ) : (
                <EmptyState
                  heading="No products enabled yet"
                  image=""
                  action={{ content: "Enable Products", url: "/app/products" }}
                >
                  <p>Enable AR try-on for your products to start tracking.</p>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function StatCard({ label, value, trend, positive = false }: any) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text variant="bodySm" tone="subdued" as="p">{label}</Text>
        <Text variant="heading2xl" as="p">{value}</Text>
        <Text variant="bodySm" tone={positive ? "success" : "subdued"} as="p">{trend}</Text>
      </BlockStack>
    </Card>
  );
}

function QuickAction({ icon, title, desc, href }: any) {
  return (
    <Box padding="400" borderWidth="025" borderRadius="200" borderColor="border">
      <BlockStack gap="200">
        <Text variant="headingLg" as="p">{icon}</Text>
        <Text variant="headingMd" as="h3">{title}</Text>
        <Text variant="bodySm" tone="subdued" as="p">{desc}</Text>
        <Button url={href} size="slim">Open →</Button>
      </BlockStack>
    </Box>
  );
}
