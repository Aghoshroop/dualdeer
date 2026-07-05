import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DualDeer | Premium Activewear',
    short_name: 'DualDeer',
    description: 'Luxury athleisure and high-performance activewear designed to elevate your lifestyle.',
    start_url: '/',
    display: 'browser',
    background_color: '#030008',
    theme_color: '#030008',
  }
}
