import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      return NextResponse.json({ error: 'Missing Cloudinary API Secret' }, { status: 500 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Parse any additional parameters that need signing (e.g. folder, public_id)
    const body = await request.json().catch(() => ({}));
    const paramsToSign = body.paramsToSign || {};
    
    // Always include timestamp
    paramsToSign.timestamp = timestamp;
    
    // Cloudinary signature generation:
    // 1. Sort keys alphabetically
    // 2. Join as key=value separated by &
    // 3. Append API secret
    // 4. SHA-1 hash
    const sortedKeys = Object.keys(paramsToSign).sort();
    const signString = sortedKeys.map((key) => `${key}=${paramsToSign[key]}`).join('&');
    const stringToSign = signString + apiSecret;
    
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    return NextResponse.json({ timestamp, signature });
  } catch (error) {
    console.error('Signature generation error:', error);
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
