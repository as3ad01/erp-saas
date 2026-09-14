import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { syncUserAndConsumeAuthorization } from "@/lib/user-sync";
import type { NextRequest } from "next/server";

// Fast path for syncing new Clerk users + consuming their AuthorizedSignup
// allowlist entry. getSessionContext() has a lazy fallback that does the same
// sync on-demand, so this endpoint is an optimization, not a hard dependency --
// the app stays correct even if this webhook is never configured (e.g. local
// dev, where Clerk can't reach localhost) or delivery lags.
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch {
    return new Response("Webhook verification failed", { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, primary_email_address_id, first_name, last_name } =
      evt.data;

    const primaryEmail =
      email_addresses.find((e) => e.id === primary_email_address_id)?.email_address ??
      email_addresses[0]?.email_address;

    if (!primaryEmail) {
      return new Response("User has no email address", { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;
    await syncUserAndConsumeAuthorization(id, primaryEmail, name);
  }

  return new Response("OK", { status: 200 });
}
