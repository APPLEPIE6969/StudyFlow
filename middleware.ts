import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const nonce = crypto.randomUUID();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);

    // CSP (Content Security Policy)
    const isDev = process.env.NODE_ENV === "development";

    const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""} https://www.google-analytics.com;
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

    const cspFormatted = csp.replace(/\s{2,}/g, " ").trim();
    requestHeaders.set("Content-Security-Policy", cspFormatted);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Security Headers
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("Content-Security-Policy", cspFormatted);

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
