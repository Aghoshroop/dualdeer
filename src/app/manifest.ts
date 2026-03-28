import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DualDeer | Premium Activewear',
    short_name: 'DualDeer',
    description: 'Luxury athleisure and high-performance activewear designed to elevate your lifestyle.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#8b5cf6', // Violet Energy matching
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
