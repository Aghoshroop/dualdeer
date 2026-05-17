import { NextResponse } from 'next/server';
import { updateOrder } from '@/lib/firebaseUtils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');

  if (!orderId || !status) {
    return new NextResponse('Missing orderId or status', { status: 400 });
  }

  const validStatuses = ['processing', 'shipped', 'delivered'];
  if (!validStatuses.includes(status)) {
    return new NextResponse('Invalid status', { status: 400 });
  }

  try {
    await updateOrder(orderId, { status: status as any });
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Status Updated</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6; margin: 0;">
          <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 500px; width: 90%;">
            <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
            <h1 style="color: #4f46e5; margin-top: 0;">Status Updated!</h1>
            <p style="font-size: 18px; color: #333;">Order <strong>${orderId}</strong> has been successfully changed to:</p>
            <div style="background-color: #f3f4f6; display: inline-block; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin: 15px 0; color: #111; border: 1px solid #e5e7eb; text-transform: uppercase;">
              ${status}
            </div>
            <p style="color: #666; margin-top: 20px;">You can now close this window or return to the admin dashboard.</p>
          </div>
        </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (error: any) {
    console.error('Error updating status via email link:', error);
    return new NextResponse('Internal Server Error: ' + error.message, { status: 500 });
  }
}
