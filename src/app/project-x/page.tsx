import { Metadata } from 'next';
import ProjectXClient from './ProjectXClient';

export const metadata: Metadata = {
  title: 'Project X: DUALDEER GREYNINJA ELITE | Restricted Access',
  description: 'The anomaly has arrived. The DUALDEER GREYNINJA ELITE T-Shirt is an experimental, highly classified garment. Only 20 units exist. Unlock the mystery and request early access protocol.',
  keywords: 'DUALDEER, GREYNINJA ELITE, mystery product, exclusive t-shirt, limited edition, classified apparel',
  openGraph: {
    title: 'DUALDEER GREYNINJA ELITE | Awaiting Declassification',
    description: 'Something crazy is coming. The DUALDEER GREYNINJA ELITE is completely stealth. It absorbs distractions and amplifies pure focus. Only 20 available.',
    type: 'website',
    images: ['/speedsuit.png'], // Using an existing premium asset as fallback social image
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DUALDEER GREYNINJA ELITE | Project X',
    description: 'Forged in the shadows. Engineered for the apex. Unlock the anomaly.',
  }
};

export default function ProjectXPage() {
  return <ProjectXClient />;
}
