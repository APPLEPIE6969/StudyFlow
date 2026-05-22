import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(_request: NextRequest) {
    const response = NextResponse.next();

    // Security Headers
    const headers = response.headers;

    headers.set("X-DNS-Prefetch-Control", "on");
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    // CSP (Content Security Policy) - Allow Google Fonts, Analytics, etc.
    // Note: Adjust 'self' and domains as needed for your specific external resources
    const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.googleusercontent.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com; 
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://generativelanguage.googleapis.com https://api.groq.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `;

    headers.set("Content-Security-Policy", csp.replace(/\s{2,}/g, " ").trim());

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
