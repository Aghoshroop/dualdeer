import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';
import { getNotifyLaunchTemplate, LaunchEmailData } from '@/lib/email/templates/notifyLaunch';

export async function POST(request: Request) {
  try {
    const { productId, productName, productImage, subscribers } = await request.json();

    if (!productId || !productName || !subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields or subscribers' }, { status: 400 });
    }

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    const emailData: LaunchEmailData = {
      productName,
      productImage,
      baseUrl
    };

    const htmlContent = getNotifyLaunchTemplate(emailData);
    const subject = `It's Here! The ${productName} is now Live.`;

    let successCount = 0;
    let failureCount = 0;
    const successfulIds: string[] = [];
    const errorMessages: string[] = [];

    console.log(`[Email Pipeline] Processing launch emails for ${productName} (${subscribers.length} subscribers)`);

    // Send emails sequentially (or in small batches) to avoid rate limits
    for (const sub of subscribers) {
      if (!sub.email) continue;
      
      const result = await sendEmail({
        to: sub.email,
        subject,
        html: htmlContent
      });
      
      if (result.success) {
        if (sub.id) successfulIds.push(sub.id);
        successCount++;
      } else {
        failureCount++;
        errorMessages.push(result.error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Launched successfully. Sent: ${successCount}, Failed: ${failureCount}${failureCount > 0 ? ` (Errors: ${errorMessages.join(', ')})` : ''}`,
      successfulIds
    });

  } catch (error: any) {
    console.error('[Email Pipeline] Launch Email API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
