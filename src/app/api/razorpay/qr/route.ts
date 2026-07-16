import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { updateOrder } from '@/lib/firebaseUtils';

export async function POST(req: Request) {
  try {
    const { orderId, amount, customer, notes } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Order ID and amount are required' }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    const expireBy = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minutes from now

    // Construct the payload for Razorpay dynamic QR code
    const qrRequest = {
      type: 'upi_qr' as const,
      name: `Order ${orderId}`,
      usage: 'single_use' as const,
      fixed_amount: true,
      payment_amount: Math.round(amount * 100), // Amount in paise
      description: 'Payment for DualDeer Order',
      close_by: expireBy,
      notes: {
        order_id: orderId,
        ...notes
      }
    };

    const qrCode: any = await instance.qrCode.create(qrRequest);

    // Save initial razorpay details to the order in Firestore
    if (qrCode && qrCode.id) {
       await updateOrder(orderId, {
          razorpay: {
             qrId: qrCode.id,
             status: qrCode.status || 'created',
             amount: amount,
             currency: 'INR',
             method: 'qr',
             expiresAt: expireBy * 1000,
             createdAt: Date.now()
          }
       });
    }

    return NextResponse.json({
      success: true,
      qrId: qrCode.id,
      imageUrl: qrCode.image_url,
      qrData: qrCode.short_url,
      status: qrCode.status
    });

  } catch (error: any) {
    console.error('Error generating QR Code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
