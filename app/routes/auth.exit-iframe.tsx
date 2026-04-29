import { type LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const exitIframe = searchParams.get("exitIframe");
  const shop = searchParams.get("shop");
  const host = searchParams.get("host");

  if (!exitIframe) return new Response(null, { status: 200 });

  const destination = exitIframe.startsWith("http")
    ? exitIframe
    : `https://${shop}${exitIframe}`;

  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
  <script>
    var AppBridge = window['app-bridge'];
    var createApp = AppBridge.default;
    var Redirect = AppBridge.actions.Redirect;
    var app = createApp({ apiKey: '155b7606b434f4003fdd811236a1b064', host: '${host}' });
    Redirect.create(app).dispatch(Redirect.Action.REMOTE, '${destination}');
  </script>
</head>
<body></body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    }
  );
};