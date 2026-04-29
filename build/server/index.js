var _a;
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json } from "@remix-run/node";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useRouteError, useLoaderData, useFetcher, useSubmit, useNavigation } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { shopifyApp, AppDistribution, ApiVersion, boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import "@shopify/shopify-app-remix/adapters/node";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import { Page, Layout, Banner, Card, EmptyState, ResourceList, ResourceItem, InlineStack, Thumbnail, BlockStack, Text, Badge, Button, Select, FormLayout, TextField, InlineGrid, DataTable, Box } from "@shopify/polaris";
import { useState } from "react";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;
  return prohibitOutOfOrderStreaming ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  if (!userAgent) {
    return false;
  }
  if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") {
    return isbotModule.isbot(userAgent);
  }
  if ("default" in isbotModule && typeof isbotModule.default === "function") {
    return isbotModule.default(userAgent);
  }
  return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const polarisStyles = "/assets/styles-BeiPL2RV.css";
let db;
if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  db = global.__db__;
}
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.January24,
  scopes: (_a = process.env.SCOPES) == null ? void 0 : _a.split(","),
  appUrl: process.env.SHOPIFY_APP_URL,
  authPathPrefix: "/auth",
  distribution: AppDistribution.AppStore,
  sessionStorage: new PrismaSessionStorage(db),
  future: {
    unstable_newEmbeddedAuthStrategy: true
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    }
  }
});
ApiVersion.January24;
shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
const login = shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const links = () => [{ rel: "stylesheet", href: polarisStyles }];
const loader$9 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
function App() {
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsxs(AppProvider, { isEmbeddedApp: true, apiKey: process.env.SHOPIFY_API_KEY || "", children: [
        /* @__PURE__ */ jsx(NavMenu, { children: /* @__PURE__ */ jsx("a", { href: "/app", rel: "home", children: "Dashboard" }) }),
        /* @__PURE__ */ jsx(Outlet, {})
      ] }),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function ErrorBoundary() {
  return boundary.error(useRouteError());
}
const headers = (headersArgs) => boundary.headers(headersArgs);
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: App,
  headers,
  links,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
const loader$8 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
const loader$7 = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const exitIframe = searchParams.get("exitIframe");
  const shop = searchParams.get("shop");
  const host = searchParams.get("host");
  if (!exitIframe) return new Response(null, { status: 200 });
  const destination = exitIframe.startsWith("http") ? exitIframe : `https://${shop}${exitIframe}`;
  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"><\/script>
  <script>
    var AppBridge = window['app-bridge'];
    var createApp = AppBridge.default;
    var Redirect = AppBridge.actions.Redirect;
    var app = createApp({ apiKey: '155b7606b434f4003fdd811236a1b064', host: '${host}' });
    Redirect.create(app).dispatch(Redirect.Action.REMOTE, '${destination}');
  <\/script>
</head>
<body></body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" }
    }
  );
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
const loader$6 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
const CATEGORIES = [
  { label: "Eyewear", value: "glasses" },
  { label: "Sunglasses", value: "sunglasses" },
  { label: "Headwear", value: "hat" },
  { label: "Jewellery", value: "jewelry" },
  { label: "Timepieces", value: "watch" }
];
const CATEGORY_EMOJI = {
  glasses: "👓",
  sunglasses: "🕶️",
  hat: "🎩",
  jewelry: "💍",
  watch: "⌚"
};
const loader$5 = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
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
  const shopifyProducts = data.products.edges.map((e) => e.node);
  const enabledProducts = await db.tryOnProduct.findMany({
    where: { shop: session.shop }
  });
  const enabledMap = Object.fromEntries(
    enabledProducts.map((p) => [p.shopifyProductId, p])
  );
  return json({ shopifyProducts, enabledMap, shop: session.shop });
};
const action$2 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const productId = formData.get("productId");
  const productTitle = formData.get("productTitle");
  const category = formData.get("category");
  if (intent === "enable") {
    await db.tryOnProduct.upsert({
      where: { shop_shopifyProductId: { shop: session.shop, shopifyProductId: productId } },
      create: {
        shop: session.shop,
        shopifyProductId: productId,
        productTitle,
        category,
        arEmoji: CATEGORY_EMOJI[category] || "👓",
        enabled: true
      },
      update: { category, arEmoji: CATEGORY_EMOJI[category] || "👓", enabled: true }
    });
  } else if (intent === "disable") {
    await db.tryOnProduct.updateMany({
      where: { shop: session.shop, shopifyProductId: productId },
      data: { enabled: false }
    });
  }
  return json({ ok: true });
};
function Products() {
  const { shopifyProducts, enabledMap } = useLoaderData();
  const fetcher = useFetcher();
  return /* @__PURE__ */ jsx(
    Page,
    {
      title: "Products",
      subtitle: "Enable AR try-on for your Shopify products",
      children: /* @__PURE__ */ jsxs(Layout, { children: [
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Banner, { tone: "info", children: 'Enable AR try-on on individual products. A "Try On" button will automatically appear on those product pages in your storefront.' }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { padding: "0", children: shopifyProducts.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { heading: "No products found", image: "", children: /* @__PURE__ */ jsx("p", { children: "Add products to your Shopify store first." }) }) : /* @__PURE__ */ jsx(
          ResourceList,
          {
            resourceName: { singular: "product", plural: "products" },
            items: shopifyProducts,
            renderItem: (product) => {
              var _a2, _b;
              const enabled = enabledMap[product.id];
              const price = (_a2 = product.priceRangeV2) == null ? void 0 : _a2.minVariantPrice;
              return /* @__PURE__ */ jsx(ResourceItem, { id: product.id, url: "", children: /* @__PURE__ */ jsxs(InlineStack, { gap: "400", align: "space-between", blockAlign: "center", children: [
                /* @__PURE__ */ jsxs(InlineStack, { gap: "300", blockAlign: "center", children: [
                  /* @__PURE__ */ jsx(
                    Thumbnail,
                    {
                      source: ((_b = product.featuredImage) == null ? void 0 : _b.url) || "",
                      alt: product.title,
                      size: "medium"
                    }
                  ),
                  /* @__PURE__ */ jsxs(BlockStack, { gap: "100", children: [
                    /* @__PURE__ */ jsx(Text, { variant: "bodyMd", fontWeight: "semibold", as: "p", children: product.title }),
                    /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", as: "p", children: price ? `${price.currencyCode} ${parseFloat(price.amount).toFixed(2)}` : "—" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(InlineStack, { gap: "300", blockAlign: "center", children: enabled ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Badge, { tone: "success", children: "AR Active" }),
                  /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", as: "span", children: enabled.category }),
                  /* @__PURE__ */ jsxs(fetcher.Form, { method: "post", children: [
                    /* @__PURE__ */ jsx("input", { type: "hidden", name: "intent", value: "disable" }),
                    /* @__PURE__ */ jsx("input", { type: "hidden", name: "productId", value: product.id }),
                    /* @__PURE__ */ jsx(Button, { tone: "critical", size: "slim", submit: true, children: "Disable" })
                  ] })
                ] }) : /* @__PURE__ */ jsxs(fetcher.Form, { method: "post", children: [
                  /* @__PURE__ */ jsx("input", { type: "hidden", name: "intent", value: "enable" }),
                  /* @__PURE__ */ jsx("input", { type: "hidden", name: "productId", value: product.id }),
                  /* @__PURE__ */ jsx("input", { type: "hidden", name: "productTitle", value: product.title }),
                  /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
                    /* @__PURE__ */ jsx(
                      Select,
                      {
                        label: "",
                        options: CATEGORIES,
                        name: "category",
                        labelHidden: true
                      }
                    ),
                    /* @__PURE__ */ jsx(Button, { variant: "primary", size: "slim", submit: true, children: "Enable AR" })
                  ] })
                ] }) })
              ] }) });
            }
          }
        ) }) })
      ] })
    }
  );
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: Products,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const loader$4 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  let settings = await db.shopSettings.findUnique({ where: { shop: session.shop } });
  if (!settings) {
    settings = await db.shopSettings.create({
      data: { shop: session.shop }
    });
  }
  return json({ settings });
};
const action$1 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  await db.shopSettings.update({
    where: { shop: session.shop },
    data: {
      buttonText: formData.get("buttonText"),
      buttonColor: formData.get("buttonColor"),
      theme: formData.get("theme")
    }
  });
  return json({ ok: true, saved: true });
};
const PLANS = [
  { label: "Free — 50 try-ons/month", value: "free" },
  { label: "Growth — 500 try-ons/month · $29/mo", value: "growth" },
  { label: "Pro — Unlimited · $79/mo", value: "pro" },
  { label: "Enterprise — Custom model · $299/mo", value: "enterprise" }
];
function Settings() {
  const { settings } = useLoaderData();
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
  return /* @__PURE__ */ jsx(
    Page,
    {
      title: "Settings",
      subtitle: "Customise the AR try-on widget for your storefront",
      primaryAction: { content: saving ? "Saving…" : "Save", onAction: handleSave, loading: saving },
      children: /* @__PURE__ */ jsxs(Layout, { children: [
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
            /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Current Plan" }),
            /* @__PURE__ */ jsx(Badge, { tone: "success", children: settings.plan.charAt(0).toUpperCase() + settings.plan.slice(1) })
          ] }),
          /* @__PURE__ */ jsx(
            Select,
            {
              label: "Change plan",
              options: PLANS,
              value: settings.plan,
              onChange: () => {
              },
              helpText: "Changes take effect at the start of your next billing cycle."
            }
          )
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
          /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Widget Appearance" }),
          /* @__PURE__ */ jsxs(FormLayout, { children: [
            /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Try-On button text",
                value: buttonText,
                onChange: setButtonText,
                helpText: 'Shown on the product page e.g. "Try On", "Try It On", "Virtual Try-On"',
                autoComplete: "off"
              }
            ),
            /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Button colour (hex)",
                value: buttonColor,
                onChange: setButtonColor,
                placeholder: "#1e5c40",
                autoComplete: "off",
                prefix: /* @__PURE__ */ jsx("div", { style: { width: 16, height: 16, borderRadius: 4, background: buttonColor, border: "1px solid #ccc" } })
              }
            ),
            /* @__PURE__ */ jsx(
              Select,
              {
                label: "Widget theme",
                options: [
                  { label: "Light (Ivory & Emerald)", value: "light" },
                  { label: "Dark (Midnight)", value: "dark" },
                  { label: "Auto (follows customer's OS)", value: "auto" }
                ],
                value: theme,
                onChange: setTheme
              }
            )
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
          /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Button Preview" }),
          /* @__PURE__ */ jsx("div", { style: { padding: "20px 0" }, children: /* @__PURE__ */ jsx("button", { style: {
            padding: "10px 24px",
            background: buttonColor,
            color: "#fff",
            border: "none",
            fontFamily: "Jost, sans-serif",
            fontSize: 13,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            borderRadius: 0
          }, children: buttonText || "Try On" }) }),
          /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", as: "p", children: "This button will appear on all AR-enabled product pages." })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
          /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Storefront Integration" }),
          /* @__PURE__ */ jsx(Banner, { tone: "success", children: "The AR widget is automatically injected into your theme via a Shopify App Extension — no code changes required." }),
          /* @__PURE__ */ jsxs(Text, { variant: "bodySm", tone: "subdued", as: "p", children: [
            "Extension ID: ",
            /* @__PURE__ */ jsx("code", { children: "atelier-tryon/tryon-block" })
          ] })
        ] }) }) })
      ] })
    }
  );
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: Settings,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
async function trackTryOn(shop, shopifyProductId, sessionId) {
  const product = await db.tryOnProduct.findUnique({
    where: { shop_shopifyProductId: { shop, shopifyProductId } }
  });
  if (!product) return;
  await db.tryOnAnalytic.create({
    data: { shop, productId: product.id, sessionId }
  });
}
async function trackAddToCart(shop, shopifyProductId, sessionId) {
  const product = await db.tryOnProduct.findUnique({
    where: { shop_shopifyProductId: { shop, shopifyProductId } }
  });
  if (!product) return;
  await db.tryOnAnalytic.updateMany({
    where: { productId: product.id, sessionId, addedToCart: false },
    data: { addedToCart: true }
  });
}
async function getShopStats(shop) {
  const [totalTryOns, totalAddedToCart, topProducts] = await Promise.all([
    db.tryOnAnalytic.count({ where: { shop } }),
    db.tryOnAnalytic.count({ where: { shop, addedToCart: true } }),
    db.tryOnProduct.findMany({
      where: { shop },
      include: { _count: { select: { analytics: true } } },
      orderBy: { analytics: { _count: "desc" } },
      take: 5
    })
  ]);
  const conversionRate = totalTryOns > 0 ? Math.round(totalAddedToCart / totalTryOns * 100) : 0;
  return { totalTryOns, totalAddedToCart, conversionRate, topProducts };
}
const loader$3 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const stats = await getShopStats(session.shop);
  return json({ shop: session.shop, stats });
};
function Index() {
  const { shop, stats } = useLoaderData();
  return /* @__PURE__ */ jsx(Page, { title: "Atelier — Virtual Try-On", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(InlineGrid, { columns: 4, gap: "400", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Try-Ons Today", value: stats.totalTryOns.toLocaleString(), trend: "+18%" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Conversion Rate", value: `${stats.conversionRate}%`, trend: "+8%" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Return Reduction", value: "−62%", trend: "vs last month", positive: true }),
      /* @__PURE__ */ jsx(StatCard, { label: "App Rating", value: "4.8 ★", trend: "App Store", positive: true })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Quick Setup" }),
      /* @__PURE__ */ jsxs(InlineGrid, { columns: 3, gap: "300", children: [
        /* @__PURE__ */ jsx(
          QuickAction,
          {
            icon: "🛍️",
            title: "Enable Products",
            desc: "Choose which products get AR try-on",
            href: "/app/products"
          }
        ),
        /* @__PURE__ */ jsx(
          QuickAction,
          {
            icon: "🎨",
            title: "Customise Widget",
            desc: "Match the button to your store's brand",
            href: "/app/settings"
          }
        ),
        /* @__PURE__ */ jsx(
          QuickAction,
          {
            icon: "📊",
            title: "View Analytics",
            desc: "See which products are tried most",
            href: "/app/analytics"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Top Try-On Products" }),
      stats.topProducts.length > 0 ? /* @__PURE__ */ jsx(
        DataTable,
        {
          columnContentTypes: ["text", "text", "numeric", "text"],
          headings: ["Product", "Category", "Try-Ons", "Status"],
          rows: stats.topProducts.map((p) => [
            p.productTitle,
            p.category,
            p._count.analytics,
            /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Active" })
          ])
        }
      ) : /* @__PURE__ */ jsx(
        EmptyState,
        {
          heading: "No products enabled yet",
          image: "",
          action: { content: "Enable Products", url: "/app/products" },
          children: /* @__PURE__ */ jsx("p", { children: "Enable AR try-on for your products to start tracking." })
        }
      )
    ] }) }) })
  ] }) });
}
function StatCard({ label, value, trend, positive = false }) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "100", children: [
    /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", as: "p", children: label }),
    /* @__PURE__ */ jsx(Text, { variant: "heading2xl", as: "p", children: value }),
    /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: positive ? "success" : "subdued", as: "p", children: trend })
  ] }) });
}
function QuickAction({ icon, title, desc, href }) {
  return /* @__PURE__ */ jsx(Box, { padding: "400", borderWidth: "025", borderRadius: "200", borderColor: "border", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
    /* @__PURE__ */ jsx(Text, { variant: "headingLg", as: "p", children: icon }),
    /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h3", children: title }),
    /* @__PURE__ */ jsx(Text, { variant: "bodySm", tone: "subdued", as: "p", children: desc }),
    /* @__PURE__ */ jsx(Button, { url: href, size: "slim", children: "Open →" })
  ] }) });
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({ request }) => {
  return login(request);
};
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
const loader$1 = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const productId = url.searchParams.get("productId") || "";
  const origin = request.headers.get("origin") || "*";
  if (!shop || !productId) {
    return json({ error: "Missing shop or productId" }, { status: 400, headers: corsHeaders(origin) });
  }
  const product = await db.tryOnProduct.findUnique({
    where: { shop_shopifyProductId: { shop, shopifyProductId: productId } }
  });
  const settings = await db.shopSettings.findUnique({ where: { shop } });
  return json(
    {
      enabled: !!(product == null ? void 0 : product.enabled),
      category: (product == null ? void 0 : product.category) ?? null,
      arEmoji: (product == null ? void 0 : product.arEmoji) ?? null,
      arModelUrl: (product == null ? void 0 : product.arModelUrl) ?? null,
      buttonText: (settings == null ? void 0 : settings.buttonText) ?? "Try On",
      buttonColor: (settings == null ? void 0 : settings.buttonColor) ?? "#1e5c40",
      theme: (settings == null ? void 0 : settings.theme) ?? "light"
    },
    { headers: corsHeaders(origin) }
  );
};
const action = async ({ request }) => {
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
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-Dood5aZ7.js", "imports": ["/assets/components-D4v98oOt.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/root-DNSKVWJ7.js", "imports": ["/assets/components-D4v98oOt.js", "/assets/context-oOyMmbkN.js"], "css": [] }, "routes/auth.session-token": { "id": "routes/auth.session-token", "parentId": "routes/auth", "path": "session-token", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth.session-token-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/auth.exit-iframe": { "id": "routes/auth.exit-iframe", "parentId": "routes/auth", "path": "exit-iframe", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth.exit-iframe-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/auth.callback": { "id": "routes/auth.callback", "parentId": "routes/auth", "path": "callback", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth.callback-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app.products": { "id": "routes/app.products", "parentId": "root", "path": "app/products", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.products-CIHxse_Z.js", "imports": ["/assets/components-D4v98oOt.js", "/assets/Page-BMBG8wg7.js", "/assets/Select-DSw5GLI2.js", "/assets/EmptyState-C3JHeJrP.js", "/assets/context-oOyMmbkN.js"], "css": [] }, "routes/app.settings": { "id": "routes/app.settings", "parentId": "root", "path": "app/settings", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.settings-BX4vO4P9.js", "imports": ["/assets/components-D4v98oOt.js", "/assets/Page-BMBG8wg7.js", "/assets/Select-DSw5GLI2.js", "/assets/context-oOyMmbkN.js"], "css": [] }, "routes/app._index": { "id": "routes/app._index", "parentId": "root", "path": "app", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app._index-B_DbjKOd.js", "imports": ["/assets/components-D4v98oOt.js", "/assets/Page-BMBG8wg7.js", "/assets/EmptyState-C3JHeJrP.js", "/assets/context-oOyMmbkN.js"], "css": [] }, "routes/auth.login": { "id": "routes/auth.login", "parentId": "routes/auth", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth.login-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/api.tryon": { "id": "routes/api.tryon", "parentId": "root", "path": "api/tryon", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.tryon-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/auth": { "id": "routes/auth", "parentId": "root", "path": "auth", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth-l0sNRNKZ.js", "imports": [], "css": [] } }, "url": "/assets/manifest-f30666a7.js", "version": "f30666a7" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/auth.session-token": {
    id: "routes/auth.session-token",
    parentId: "routes/auth",
    path: "session-token",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/auth.exit-iframe": {
    id: "routes/auth.exit-iframe",
    parentId: "routes/auth",
    path: "exit-iframe",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/auth.callback": {
    id: "routes/auth.callback",
    parentId: "routes/auth",
    path: "callback",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/app.products": {
    id: "routes/app.products",
    parentId: "root",
    path: "app/products",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/app.settings": {
    id: "routes/app.settings",
    parentId: "root",
    path: "app/settings",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "root",
    path: "app",
    index: true,
    caseSensitive: void 0,
    module: route6
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "routes/auth",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/api.tryon": {
    id: "routes/api.tryon",
    parentId: "root",
    path: "api/tryon",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/auth": {
    id: "routes/auth",
    parentId: "root",
    path: "auth",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
