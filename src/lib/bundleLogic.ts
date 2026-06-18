import { CartItem } from '@/context/CartContext';

export interface BundleRule {
  id: string;
  name: string;
  type: 'pair_multiplier';
  bundlePrice: number;
  originalCombinedPrice: number;
}

export const activeBundles: BundleRule[] = [
  {
    id: 'duo-pack',
    name: 'DualDeer Duo Pack',
    type: 'pair_multiplier',
    bundlePrice: 1549,
    originalCombinedPrice: 1764,
  }
];

export function calculateBundleSavings(items: { name: string; quantity: number }[]) {
  let bundleSavings = 0;
  let appliedBundles: string[] = [];

  for (const bundle of activeBundles) {
    if (bundle.id === 'duo-pack') {
      const greninjaItems = items.filter(item => item.name.toLowerCase().includes('greninja'));
      const blueHorizonItems = items.filter(item => item.name.toLowerCase().includes('blue horizon'));
      
      const greninjaQty = greninjaItems.reduce((acc, item) => acc + item.quantity, 0);
      const blueHorizonQty = blueHorizonItems.reduce((acc, item) => acc + item.quantity, 0);
      
      const pairs = Math.min(greninjaQty, blueHorizonQty);
      if (pairs > 0) {
        const savingsPerPair = bundle.originalCombinedPrice - bundle.bundlePrice; // 215
        bundleSavings += pairs * savingsPerPair;
        appliedBundles.push(bundle.name);
      }
    }
  }

  return { bundleSavings, appliedBundles };
}
