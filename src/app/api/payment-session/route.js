import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount, currency = 'SGD', billingInfo } = await request.json();
    
    if (!process.env.CHECKOUT_SECRET_KEY) {
      return NextResponse.json({ error: 'CHECKOUT_SECRET_KEY is not configured' }, { status: 500 });
    }

    console.log('Creating payment session with amount:', amount, 'currency:', currency);
    console.log('Billing info received:', JSON.stringify(billingInfo, null, 2));
    
    const requestBody = {
      amount: amount,
      currency: currency,
      reference: `order-${Date.now()}`,
      billing: {
        address: {
          address_line1: billingInfo?.addressLine1 && billingInfo.addressLine1.trim() !== '' 
            ? billingInfo.addressLine1.length < 5 
              ? `${billingInfo.addressLine1} Street` 
              : billingInfo.addressLine1
            : '123 Main Street',
          ...(billingInfo?.addressLine2 && billingInfo.addressLine2.trim() !== '' && { address_line2: billingInfo.addressLine2 }),
          city: billingInfo?.city || 'Singapore',
          state: billingInfo?.state || '',
          zip: billingInfo?.zip || '123456',
          country: billingInfo?.country || 'SG'
        }
      },
      customer: {
        email: billingInfo?.email || 'customer@example.com',
        name: billingInfo?.firstName && billingInfo?.lastName 
          ? `${billingInfo.firstName} ${billingInfo.lastName}` 
          : 'Customer',
        ...(billingInfo?.phone && billingInfo.phone.trim() !== '' && { phone: billingInfo.phone })
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      failure_url: `${process.env.NEXT_PUBLIC_BASE_URL}/failure`,
      processing_channel_id: process.env.PROCESSING_CHANNEL_ID
    };

    console.log('=====================================');
    console.log('REQUEST BEING SENT TO CHECKOUT.COM:');
    console.log('=====================================');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('=====================================');

    const response = await fetch('https://api.sandbox.checkout.com/payment-sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CHECKOUT_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    console.log('Checkout.com API response status:', response.status);
    console.log('Checkout.com API response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Payment session creation failed:', JSON.stringify(data, null, 2));
      const errorMessage = data.error_description || data.error || data.message || JSON.stringify(data) || 'Payment session creation failed';
      return NextResponse.json({ error: errorMessage, details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment session creation error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}