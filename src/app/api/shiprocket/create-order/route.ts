import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { orderId, orderData } = data;

    if (!orderId || !orderData) {
      return NextResponse.json({ success: false, error: 'Missing order information' }, { status: 400 });
    }

    // ==========================================
    // Shiprocket API Integration Placeholder
    // ==========================================
    // In production, you would authenticate with Shiprocket API here:
    // 1. POST https://apiv2.shiprocket.in/v1/external/auth to get token
    // 2. POST https://apiv2.shiprocket.in/v1/external/orders/create/adhoc with token
    
    // Example Shiprocket Payload Construction:
    const shiprocketPayload = {
      order_id: orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: "Primary",
      billing_customer_name: orderData.shippingDetails.name,
      billing_last_name: "",
      billing_address: orderData.shippingDetails.address,
      billing_city: orderData.shippingDetails.city,
      billing_pincode: orderData.shippingDetails.zip,
      billing_state: "State", // Needs state
      billing_country: "India",
      billing_email: orderData.shippingDetails.email,
      billing_phone: orderData.shippingDetails.phone,
      shipping_is_billing: true,
      order_items: orderData.items.map((item: any) => ({
        name: item.name,
        sku: item.productId,
        units: item.quantity,
        selling_price: item.pricePaid,
        discount: "",
        tax: "",
        hsn: ""
      })),
      payment_method: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: 15,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: orderData.discountAmount || 0,
      sub_total: orderData.total,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1
    };

    console.log("Simulating Shiprocket Order Creation with Payload:", shiprocketPayload);
    
    // Mocking successful Shiprocket connection
    const shiprocketOrderId = "SR-" + Math.floor(Math.random() * 1000000);
    
    // Update Firebase Order document with Shiprocket status
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        shiprocketSyncStatus: 'synced',
        shiprocketOrderId: shiprocketOrderId
      });
    } catch (dbError) {
      console.error("Failed to update Firestore with Shiprocket tag:", dbError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order synced with Shiprocket successfully',
      shiprocketOrderId 
    });
    
  } catch (error: any) {
    console.error('Shiprocket Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
