import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { updateOrder } from '@/lib/firebaseUtils';

export async function POST(req: Request) {
  try {
    const { orderId, amount, customer, items, notes } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Order ID and amount are required' }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    const expireBy = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes from now

    // Construct the payload for Razorpay standard payment link
    const paymentLinkRequest = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      accept_partial: false,
      first_min_partial_amount: 0,
      expire_by: expireBy,
      reference_id: orderId,
      description: 'Payment for DualDeer Order',
      customer: {
        name: customer?.name || '',
        contact: customer?.phone || '',
        email: customer?.email || ''
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      notes: {
        order_id: orderId,
        ...notes
      },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host') || 'localhost:3000'}`}/checkout/success?orderId=${orderId}`,
      callback_method: 'get'
    };

    const paymentLink = await instance.paymentLink.create(paymentLinkRequest);

    // Save initial razorpay details to the order in Firestore
    if (paymentLink && paymentLink.id) {
       await updateOrder(orderId, {
          razorpay: {
             paymentLinkId: paymentLink.id,
             status: paymentLink.status,
             amount: amount,
             currency: 'INR',
             method: 'payment_link',
             expiresAt: expireBy * 1000,
             createdAt: Date.now()
          }
       });
    }

    return NextResponse.json({
      success: true,
      paymentLinkId: paymentLink.id,
      shortUrl: paymentLink.short_url,
      status: paymentLink.status
    });

  } catch (error: any) {
    console.error('Error generating payment link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate payment link' },
      { status: 500 }
    );
  }
}
