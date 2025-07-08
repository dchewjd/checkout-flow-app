import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount, currency = 'USD' } = await request.json();
    
    if (!process.env.CHECKOUT_SECRET_KEY) {
      return NextResponse.json({ error: 'CHECKOUT_SECRET_KEY is not configured' }, { status: 500 });
    }

    console.log('Creating payment session with amount:', amount, 'currency:', currency);
    
    const response = await fetch('https://api.sandbox.checkout.com/payment-sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CHECKOUT_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        reference: `order-${Date.now()}`,
        billing: {
          address: {
            country: 'US'
          }
        },
        customer: {
          email: 'customer@example.com'
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        failure_url: `${process.env.NEXT_PUBLIC_BASE_URL}/failure`,
        processing_channel_id: process.env.PROCESSING_CHANNEL_ID
      })
    });

    const data = await response.json();
    
    console.log('Checkout.com API response status:', response.status);
    console.log('Checkout.com API response data:', data);
    
    if (!response.ok) {
      console.error('Payment session creation failed:', data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment session creation error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}