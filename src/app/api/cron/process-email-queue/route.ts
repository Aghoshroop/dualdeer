import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';
import { getPendingEmails, updateQueuedEmailStatus } from '@/lib/firebaseUtils';

export async function GET(request: Request) {
  // Optional: add a secret token check to prevent unauthorized trigger
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log('[Email Queue] Fetching pending emails...');
    const pendingEmails = await getPendingEmails(10); // Process 10 at a time to avoid timeouts

    if (pendingEmails.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending emails to process.' });
    }

    console.log(`[Email Queue] Found ${pendingEmails.length} emails to process.`);
    const results = [];

    for (const email of pendingEmails) {
      if (!email.id) continue;
      
      console.log(`[Email Queue] Attempting retry ${email.retryCount + 1} for ${email.to}`);
      
      const result = await sendEmail({
        to: email.to,
        subject: email.subject,
        html: email.html,
      });

      if (result.success) {
        await updateQueuedEmailStatus(email.id, 'sent', email.retryCount + 1);
        results.push({ id: email.id, status: 'sent' });
      } else {
        const newRetryCount = email.retryCount + 1;
        const maxRetries = 5;
        const newStatus = newRetryCount >= maxRetries ? 'failed' : 'pending';
        
        await updateQueuedEmailStatus(email.id, newStatus, newRetryCount, result.error);
        results.push({ id: email.id, status: newStatus, error: result.error });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error: any) {
    console.error('[Email Queue] Processing failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
