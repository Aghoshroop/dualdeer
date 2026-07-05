export interface OrderEmailData {
  orderId: string;
  total: number;
  discountAmount?: number;
  appliedCoupon?: string;
  paymentMethod?: string;
  utrNumber?: string;
  shippingDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
  };
  items: Array<{
    name: string;
    size?: string;
    quantity: number;
    pricePaid?: number;
    price: number;
  }>;
}

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

export const getOrderConfirmationTemplate = (data: OrderEmailData) => {
  const { orderId, total, discountAmount, shippingDetails, items } = data;
  const itemsHtml = generateItemsHtml(items);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4f46e5;">Thank you for your order, ${shippingDetails.name || 'Customer'}! 🎉</h2>
      <p>Your order <strong>#${orderId}</strong> has been successfully placed and is now being processed.</p>
      <p><strong>Total Amount:</strong> ₹${(total || 0).toFixed(2)}</p>
      ${(discountAmount || 0) > 0 ? `<p><strong>Discount Applied:</strong> ₹${Number(discountAmount).toFixed(2)}</p>` : ''}
      
      <h3 style="margin-top: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Order Items</h3>
      ${itemsHtml}
      
      <p style="margin-top: 30px;">We will notify you once your order has been shipped. You can track your order status in your profile dashboard.</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
        DualDeer Activewear
      </p>
    </div>
  `;
};
