import { type LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  const host = searchParams.get("host");
  const exitIframe = searchParams.get("exitIframe");

  if (exitIframe) {
    const destination = new URL(exitIframe, `https://${shop}`);
    if (host) destination.searchParams.set("host", host);
    return new Response(null, {
      status: 302,
      headers: { Location: destination.toString() },
    });
  }

  return new Response(null, { status: 200 });
};