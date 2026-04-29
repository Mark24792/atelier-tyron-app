import { type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const exitIframe = url.searchParams.get("exitIframe");
  if (exitIframe) {
    return new Response(null, {
      status: 302,
      headers: { Location: exitIframe },
    });
  }
  await authenticate.admin(request);
  return null;
};