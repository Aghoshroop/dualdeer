import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { updateOrder, getOrder, getProduct, updateProduct, releaseInventory } from '@/lib/firebaseUtils';

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Razorpay signature' }, { status: 400 });
    }

    // Verify Signature using Razorpay SDK
    const isValid = Razorpay.validateWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    
    // We expect the order_id in notes or entity reference
    let orderId = '';
    let paymentData = null;

    if (eventType === 'payment_link.paid') {
       paymentData = event.payload.payment_link.entity;
       orderId = paymentData.reference_id || paymentData.notes?.order_id;
    } else if (eventType === 'payment.captured' || eventType === 'payment.authorized' || eventType === 'payment.failed') {
       paymentData = event.payload.payment.entity;
       orderId = paymentData.notes?.order_id;
    } else if (eventType === 'refund.processed') {
       paymentData = event.payload.refund.entity;
       orderId = paymentData.notes?.order_id;
    } else if (eventType === 'qr_code.credited') {
       // In case specific QR code events are enabled
       paymentData = event.payload.qr_code.entity;
       orderId = paymentData.notes?.order_id;
    }

    if (!orderId) {
       console.warn('Razorpay Webhook received but no order_id found in notes/reference_id:', eventType);
       return NextResponse.json({ received: true });
    }

    const order = await getOrder(orderId);
    if (!order) {
       console.warn('Razorpay Webhook: Order not found in database:', orderId);
       return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotency check: if order is already processed and this is a payment event, ignore
    if (order.status === 'paid' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
       if (eventType === 'payment.captured' || eventType === 'payment_link.paid' || eventType === 'payment.authorized' || eventType === 'qr_code.credited') {
          console.log('Razorpay Webhook: Order already processed, ignoring duplicate event.', orderId);
          return NextResponse.json({ received: true });
       }
    }

    if (eventType === 'payment.captured' || eventType === 'payment_link.paid' || eventType === 'qr_code.credited') {
        console.log(`Razorpay Payment confirmed for order: ${orderId}`);
        
        await updateOrder(orderId, {
           status: 'paid',
           'razorpay.status': 'paid',
           'razorpay.paymentId': eventType === 'payment_link.paid' ? paymentData.payment_id : paymentData.id,
           'razorpay.paidAt': Date.now(),
           'razorpay.webhookEvent': eventType
        });

        // Trigger confirmation email
        // We do not need to reduce inventory again if it was reserved during payment_pending state.
        // If not reserved, we would reduce it here. But since we implement reserveInventory before generating link/QR, stock is already reserved.
        
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host') || 'localhost:3000';
        const baseUrl = `${protocol}://${host}`;

        try {
           await fetch(`${baseUrl}/api/send-order-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, orderData: order })
           });
        } catch (e) {
           console.error('Failed to send order email', e);
        }

    } else if (eventType === 'payment.failed') {
        console.log(`Razorpay Payment failed for order: ${orderId}`);
        await updateOrder(orderId, {
           status: 'cancelled',
           'razorpay.status': 'failed',
           'razorpay.webhookEvent': eventType
        });

        // Release inventory since payment failed
        if (order.items && order.items.length > 0) {
           await releaseInventory(order.items);
        }
    } else if (eventType === 'refund.processed') {
        console.log(`Razorpay Refund processed for order: ${orderId}`);
        await updateOrder(orderId, {
           status: 'returned', // or 'refunded' if you add it to your union type
           'razorpay.status': 'refunded',
           'razorpay.webhookEvent': eventType
        });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Razorpay Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
