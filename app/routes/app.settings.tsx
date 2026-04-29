// app/routes/app.settings.tsx
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page, Layout, Card, FormLayout, TextField,
  Select, ColorPicker, BlockStack, Text, Button,
  Badge, InlineStack, Banner,
} from "@shopify/polaris";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { db } from "../lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  let settings = await db.shopSettings.findUnique({ where: { shop: session.shop } });
  if (!settings) {
    settings = await db.shopSettings.create({
      data: { shop: session.shop },
    });
  }
  return json({ settings });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  await db.shopSettings.update({
    where: { shop: session.shop },
    data: {
      buttonText: formData.get("buttonText") as string,
      buttonColor: formData.get("buttonColor") as string,
      theme: formData.get("theme") as string,
    },
  });
  return json({ ok: true, saved: true });
};

const PLANS = [
  { label: "Free — 50 try-ons/month", value: "free" },
  { label: "Growth — 500 try-ons/month · $29/mo", value: "growth" },
  { label: "Pro — Unlimited · $79/mo", value: "pro" },
  { label: "Enterprise — Custom model · $299/mo", value: "enterprise" },
];

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const nav = useNavigation();
  const saving = nav.state === "submitting";

  const [buttonText, setButtonText] = useState(settings.buttonText);
  const [buttonColor, setButtonColor] = useState(settings.buttonColor);
  const [theme, setTheme] = useState(settings.theme);

  const handleSave = () => {
    const fd = new FormData();
    fd.set("buttonText", buttonText);
    fd.set("buttonColor", buttonColor);
    fd.set("theme", theme);
    submit(fd, { method: "post" });
  };

  return (
    <Page
      title="Settings"
      subtitle="Customise the AR try-on widget for your storefront"
      primaryAction={{ content: saving ? "Saving…" : "Save", onAction: handleSave, loading: saving }}
    >
      <Layout>
        {/* Plan */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">Current Plan</Text>
                <Badge tone="success">
                  {settings.plan.charAt(0).toUpperCase() + settings.plan.slice(1)}
                </Badge>
              </InlineStack>
              <Select
                label="Change plan"
                options={PLANS}
                value={settings.plan}
                onChange={() => {}}
                helpText="Changes take effect at the start of your next billing cycle."
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Widget appearance */}
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text variant="headingMd" as="h2">Widget Appearance</Text>
              <FormLayout>
                <TextField
                  label="Try-On button text"
                  value={buttonText}
                  onChange={setButtonText}
                  helpText='Shown on the product page e.g. "Try On", "Try It On", "Virtual Try-On"'
                  autoComplete="off"
                />
                <TextField
                  label="Button colour (hex)"
                  value={buttonColor}
                  onChange={setButtonColor}
                  placeholder="#1e5c40"
                  autoComplete="off"
                  prefix={
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: buttonColor, border: "1px solid #ccc" }} />
                  }
                />
                <Select
                  label="Widget theme"
                  options={[
                    { label: "Light (Ivory & Emerald)", value: "light" },
                    { label: "Dark (Midnight)", value: "dark" },
                    { label: "Auto (follows customer's OS)", value: "auto" },
                  ]}
                  value={theme}
                  onChange={setTheme}
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Preview */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">Button Preview</Text>
              <div style={{ padding: "20px 0" }}>
                <button style={{
                  padding: "10px 24px",
                  background: buttonColor,
                  color: "#fff",
                  border: "none",
                  fontFamily: "Jost, sans-serif",
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderRadius: 0,
                }}>
                  {buttonText || "Try On"}
                </button>
              </div>
              <Text variant="bodySm" tone="subdued" as="p">
                This button will appear on all AR-enabled product pages.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Integration */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">Storefront Integration</Text>
              <Banner tone="success">
                The AR widget is automatically injected into your theme via a Shopify App
                Extension — no code changes required.
              </Banner>
              <Text variant="bodySm" tone="subdued" as="p">
                Extension ID: <code>atelier-tryon/tryon-block</code>
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
