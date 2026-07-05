import { OrderEmailData } from './orderConfirmation';

const generateItemsHtml = (items: OrderEmailData['items']) => {
  let html = `
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

  items.forEach(item => {
    html += `
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">${item.size || 'N/A'}</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">₹${item.pricePaid || item.price}</td>
        </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
};

export const getAdminOrderNotificationTemplate = (data: OrderEmailData, baseUrl: string) => {
  const { orderId, total, discountAmount, appliedCoupon, paymentMethod, utrNumber, shippingDetails, items } = data;
  const itemsHtml = generateItemsHtml(items);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4f46e5;">New Order Received! 🎉</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Total Amount:</strong> ₹${(total || 0).toFixed(2)}</p>
      ${(discountAmount || 0) > 0 ? `<p><strong>Discount Applied:</strong> ₹${Number(discountAmount).toFixed(2)}</p>` : ''}
      ${appliedCoupon ? `<p><strong>Promo Code Used:</strong> <span style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${appliedCoupon}</span></p>` : ''}
      <p><strong>Payment Method:</strong> ${(paymentMethod || 'N/A').toUpperCase()}</p>
      ${paymentMethod === 'upi' ? `<p><strong>UTR Number:</strong> ${utrNumber || 'N/A'}</p>` : ''}
      
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
  `;
};
