import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/', 
          '/profile/', 
          '/checkout/', 
          '/cart/',
          '/auth/', 
          '/api/',
          '/orders/',
          '/login/',
          '/signup/'
        ],
      },
      {
        userAgent: ['ChatGPT-User', 'Google-Extended', 'Anthropic-ai', 'PerplexityBot'],
        allow: ['/learn', '/learn/'],
      }
    ],
    sitemap: 'https://dualdeer.com/sitemap.xml',
  };
}
