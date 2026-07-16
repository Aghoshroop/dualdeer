import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrder, getOrder, getProduct, updateProduct } from '@/lib/firebaseUtils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fallback', {
  apiVersion: '2025-01-27.acacia' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'invoice.paid' || event.type === 'checkout.session.completed') {
    const dataObject = event.data.object as any;
    const orderId = dataObject.metadata?.orderId || dataObject.client_reference_id;

    if (orderId) {
      console.log(`Payment confirmed for order: ${orderId}`);
      try {
        await updateOrder(orderId, {
          status: 'paid',
          stripeStatus: 'paid'
        });
        
        const orderData = await getOrder(orderId);
        if (orderData) {
            // Adjust Inventory
            for (const item of orderData.items) {
               const product = await getProduct(item.productId);
               if (product) {
                  let newStock = (product.stock || 0) - item.quantity;
                  let newSizeUnits = { ...product.sizeUnits };
                  if (item.size && newSizeUnits[item.size] !== undefined) {
                      newSizeUnits[item.size] = Math.max(0, newSizeUnits[item.size] - item.quantity);
                  }
                  await updateProduct(item.productId, { 
                    stock: Math.max(0, newStock), 
                    sizeUnits: newSizeUnits 
                  });
               }
            }

            // Trigger confirmation email
            const protocol = request.headers.get('x-forwarded-proto') || 'http';
            const host = request.headers.get('host') || 'localhost:3000';
            const baseUrl = `${protocol}://${host}`;

            await fetch(`${baseUrl}/api/send-order-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, orderData })
            });
        }

      } catch (err) {
        console.error('Error updating order on webhook:', err);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
    } else {
      console.warn('Webhook received but no orderId found in metadata');
    }
  }

  return NextResponse.json({ received: true });
}
