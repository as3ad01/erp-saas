import { clerkMiddleware } from "@clerk/nextjs/server";

// Only wires up Clerk's auth context for the app (required for auth() to
// work in Server Components). Actual protection happens per-page/layout via
// requireCompanyContext() / requirePlatformAdmin() in src/lib/auth.ts --
// Clerk's current guidance is resource-level checks over middleware path
// matching, since the latter can drift out of sync with real routes.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|demo(?:/|$)|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
