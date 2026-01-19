import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhooks/clerk(.*)',
  '/api/profile(.*)',
  '/products(.*)',
  '/collections(.*)',
  '/api/storefront/(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const { userId, sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata || sessionClaims?.publicMetadata || sessionClaims?.public_metadata;
    const role = (metadata as { role?: string })?.role;

    // If not logged in, redirect to sign-in
    if (!userId) {
      await auth.protect();
    }

    // Role check is now handled in /admin/layout.tsx to avoid sync issues
    // We allow the request to proceed if authenticated
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
