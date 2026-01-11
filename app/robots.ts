import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sweetlook.net';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',           // API routes
                    '/admin/',         // Admin pages
                    '/sl-panel-9x7k/', // Secret Admin pages
                    '/dashboard/',     // User dashboard
                    '/deposer/',       // Ad posting form
                    '/banned/',        // Banned user page
                    '/_next/',         // Next.js internal
                    '/support/',       // Support ticket pages
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/sl-panel-9x7k/',
                    '/dashboard/',
                    '/deposer/',
                    '/banned/',
                    '/support/',
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    };
}
