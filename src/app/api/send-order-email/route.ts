import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';
import { getOrderConfirmationTemplate, OrderEmailData } from '@/lib/email/templates/orderConfirmation';
import { getAdminOrderNotificationTemplate } from '@/lib/email/templates/adminOrderNotification';
import { queueEmail } from '@/lib/firebaseUtils';

export async function POST(request: Request) {
  try {
    const { orderId, orderData } = await request.json();

    if (!orderId || !orderData) {
      return NextResponse.json({ success: false, error: 'Missing orderId or orderData' }, { status: 400 });
    }

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Ensure orderData matches the expected interface for the templates
    const emailData: OrderEmailData = {
      orderId,
      ...orderData
    };

    let adminEmailSent = false;
    let customerEmailSent = false;
    const errors: string[] = [];

    console.log(`[Email Pipeline] Processing emails for order ${orderId}`);

    // Send admin email independently
    const adminEmailAddress = process.env.ADMIN_EMAIL || 'hello@dualdeer.com';
    const adminHtml = getAdminOrderNotificationTemplate(emailData, baseUrl);
    
    console.log(`[Email Pipeline] Sending admin notification to ${adminEmailAddress}`);
    const adminResult = await sendEmail({
      to: adminEmailAddress,
      subject: `New Order Placed - ${orderId}`,
      html: adminHtml,
    });

    if (adminResult.success) {
      adminEmailSent = true;
    } else {
      errors.push(`Admin email failed: ${adminResult.error}`);
      console.log(`[Email Pipeline] Queueing admin email for background retry`);
      try {
        await queueEmail({
          to: adminEmailAddress,
          subject: `New Order Placed - ${orderId}`,
          html: adminHtml,
        });
      } catch (qErr) {
        console.error(`[Email Pipeline] Failed to queue admin email:`, qErr);
      }
    }

    // Send customer email independently
    if (orderData.shippingDetails?.email) {
      const customerHtml = getOrderConfirmationTemplate(emailData);
      
      console.log(`[Email Pipeline] Sending customer confirmation to ${orderData.shippingDetails.email}`);
      const customerResult = await sendEmail({
        to: orderData.shippingDetails.email,
        subject: `Order Confirmation - ${orderId}`,
        html: customerHtml,
      });

      if (customerResult.success) {
        customerEmailSent = true;
      } else {
        errors.push(`Customer email failed: ${customerResult.error}`);
        console.log(`[Email Pipeline] Queueing customer email for background retry`);
        try {
          await queueEmail({
            to: orderData.shippingDetails.email,
            subject: `Order Confirmation - ${orderId}`,
            html: customerHtml,
          });
        } catch (qErr) {
          console.error(`[Email Pipeline] Failed to queue customer email:`, qErr);
        }
      }
    } else {
      console.log(`[Email Pipeline] No customer email provided for order ${orderId}`);
    }

    // Always return 200 OK to prevent breaking the checkout flow.
    // The failed emails are now safely queued for background retries.
    return NextResponse.json({ 
      success: true, 
      message: errors.length > 0 ? 'Emails queued for retry' : 'Email processed',
      adminEmailSent,
      customerEmailSent,
      queued: errors.length > 0,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('[Email Pipeline] Unhandled exception:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
