import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasSecretKey = !!process.env.CHECKOUT_SECRET_KEY;
    const hasPublicKey = !!process.env.NEXT_PUBLIC_CHECKOUT_PUBLIC_KEY;
    
    return NextResponse.json({
      secretKey: hasSecretKey ? 'Present' : 'Missing',
      publicKey: hasPublicKey ? 'Present' : 'Missing',
      secretKeyPrefix: hasSecretKey ? process.env.CHECKOUT_SECRET_KEY.substring(0, 10) + '...' : 'N/A',
      publicKeyPrefix: hasPublicKey ? process.env.NEXT_PUBLIC_CHECKOUT_PUBLIC_KEY.substring(0, 10) + '...' : 'N/A'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Test failed', details: error.message }, { status: 500 });
  }
}