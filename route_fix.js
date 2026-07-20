const fs = require('fs');

let cartCode = fs.readFileSync('src/context/CartContext.tsx', 'utf8');
cartCode = cartCode.replace('quantity: number;', 'quantity: number;\n  isPremium?: boolean;');
fs.writeFileSync('src/context/CartContext.tsx', cartCode);

let checkoutCode = fs.readFileSync('src/app/checkout/page.tsx', 'utf8');

const oldRouter = `export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', color: 'var(--color-text)', textAlign: 'center' }}>Loading Secure Gateway...</div>}>
      <CheckoutEngine />
    </Suspense>
  );
}`;

const newRouter = `
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', color: 'var(--color-text)', textAlign: 'center' }}>Loading Secure Gateway...</div>}>
      <CheckoutRouter />
    </Suspense>
  );
}

function CheckoutRouter() {
  const { cart } = useCart();
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get('buyNow') || searchParams.get('id');
  const productSlug = searchParams.get('product'); 
  
  const [buyNowItem, setBuyNowItem] = useState<any>(null);
  const [loadingBuyNow, setLoadingBuyNow] = useState(!!buyNowId);
  
  useEffect(() => {
    if (buyNowId) {
      getProduct(buyNowId).then(prod => {
        if (prod) {
          setBuyNowItem(prod); 
        }
        setLoadingBuyNow(false);
      });
    }
  }, [buyNowId]);

  if (loadingBuyNow) {
     return <div style={{ padding: '100px', color: 'var(--color-text)', textAlign: 'center' }}>Establishing Secure Uplink...</div>
  }

  const activeItems = buyNowId ? (buyNowItem ? [buyNowItem] : []) : cart;
  
  const isPremiumCheckout = searchParams.get('premium') === 'true' || 
                            activeItems.some((item: any) => item?.isPremium || item?.slug === 'lux-deer' || item?.slug === 'titan-weave');

  if (isPremiumCheckout) {
     return <PremiumCheckout />;
  }
  return <CheckoutEngine />;
}
`;

checkoutCode = checkoutCode.replace(oldRouter, newRouter);

if (!checkoutCode.includes('import PremiumCheckout')) {
  checkoutCode = checkoutCode.replace("import { reserveInventory } from '@/lib/firebaseUtils';", 
    "import { reserveInventory } from '@/lib/firebaseUtils';\nimport PremiumCheckout from '@/components/checkout/PremiumCheckout';");
}

fs.writeFileSync('src/app/checkout/page.tsx', checkoutCode);
console.log('Fixed page.tsx routing!');
