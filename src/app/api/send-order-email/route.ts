import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { orderId, orderData } = await request.json();

    if (!orderId || !orderData) {
      return NextResponse.json({ success: false, error: 'Missing orderId or orderData' }, { status: 400 });
    }

    // Configure Nodemailer transporter
    // Note: The user needs to set SMTP_EMAIL and SMTP_PASSWORD in their environment variables.
    // For Gmail, an App Password should be used.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL || 'aviroopghosh283@gmail.com',
        pass: process.env.SMTP_PASSWORD || '', // User needs to provide this
      },
    });

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const { shippingDetails, items, total, paymentMethod, utrNumber, appliedCoupon, discountAmount } = orderData;

    // Create the email content
    let itemsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Item</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">Size</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">Qty</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
    `;

    items.forEach((item: any) => {
      itemsHtml += `
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.name}</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">${item.size || 'N/A'}</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">₹${item.pricePaid || item.price}</td>
          </tr>
      `;
    });

    itemsHtml += `
        </tbody>
      </table>
    `;

    const adminMailOptions = {
      from: '"DualDeer" <hello@dualdeer.com>',
      to: 'hello@dualdeer.com, aviroopghosh283@gmail.com',
      subject: `New Order Placed - ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #4f46e5;">New Order Received! 🎉</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
          ${discountAmount > 0 ? `<p><strong>Discount Applied:</strong> ₹${discountAmount.toFixed(2)}</p>` : ''}
          ${appliedCoupon ? `<p><strong>Promo Code Used:</strong> <span style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${appliedCoupon}</span></p>` : ''}
          <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
          ${paymentMethod === 'upi' ? `<p><strong>UTR Number:</strong> ${utrNumber}</p>` : ''}
          
          <h3 style="margin-top: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Customer Details</h3>
          <p><strong>Name:</strong> ${shippingDetails?.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${shippingDetails?.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${shippingDetails?.phone || 'N/A'}</p>
          <p><strong>Address:</strong> ${shippingDetails?.address || 'N/A'}, ${shippingDetails?.city || 'N/A'} - ${shippingDetails?.zip || 'N/A'}</p>

          <h3 style="margin-top: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Order Items</h3>
          ${itemsHtml}
          
          <h3 style="margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Admin Actions: Fast Status Update</h3>
          <p style="font-size: 14px; color: #555; margin-bottom: 15px;">Click a button below to instantly update this order's status in the database:</p>
          <div style="margin-bottom: 20px;">
            <a href="${baseUrl}/api/update-order-status?orderId=${orderId}&status=processing" style="background-color: #f59e0b; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-block; text-align: center; margin-right: 5px; margin-bottom: 5px;">Mark Processing</a>
            <a href="${baseUrl}/api/update-order-status?orderId=${orderId}&status=shipped" style="background-color: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-block; text-align: center; margin-right: 5px; margin-bottom: 5px;">Mark Shipped</a>
            <a href="${baseUrl}/api/update-order-status?orderId=${orderId}&status=delivered" style="background-color: #10b981; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-block; text-align: center; margin-bottom: 5px;">Mark Delivered</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
            This is an automated notification from your DualDeer application.
          </p>
        </div>
      `,
    };

    const customerMailOptions = {
      from: '"DualDeer" <hello@dualdeer.com>',
      to: shippingDetails?.email || 'hello@dualdeer.com',
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #4f46e5;">Thank you for your order, ${shippingDetails?.name || 'Customer'}! 🎉</h2>
          <p>Your order <strong>#${orderId}</strong> has been successfully placed and is now being processed.</p>
          <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
          ${discountAmount > 0 ? `<p><strong>Discount Applied:</strong> ₹${discountAmount.toFixed(2)}</p>` : ''}
          
          <h3 style="margin-top: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Order Items</h3>
          ${itemsHtml}
          
          <p style="margin-top: 30px;">We will notify you once your order has been shipped. You can track your order status in your profile dashboard.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
            DualDeer Activewear
          </p>
        </div>
      `,
    };

    // Send emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      shippingDetails?.email ? transporter.sendMail(customerMailOptions) : Promise.resolve()
    ]);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error sending order email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
