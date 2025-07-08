'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export default function CheckoutPage() {
  const flowContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(2000); // $20.00 in cents
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Wait for script to load
        if (!scriptLoaded || !window.CheckoutWebComponents) {
          console.log('Waiting for Checkout.com script to load...');
          return;
        }

        // Create payment session
        const response = await fetch('/api/payment-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: paymentAmount,
            currency: 'USD'
          })
        });

        const paymentSession = await response.json();

        if (!response.ok) {
          console.error('Payment session creation failed:', paymentSession);
          throw new Error(paymentSession.error?.message || paymentSession.error || 'Failed to create payment session');
        }

        console.log('Payment session created successfully:', paymentSession);

        // Initialize Checkout.com Web Components
        if (!process.env.NEXT_PUBLIC_CHECKOUT_PUBLIC_KEY) {
          throw new Error('NEXT_PUBLIC_CHECKOUT_PUBLIC_KEY is not configured');
        }

        console.log('Initializing Checkout.com Web Components...');
        const checkout = await window.CheckoutWebComponents({
          publicKey: process.env.NEXT_PUBLIC_CHECKOUT_PUBLIC_KEY,
          environment: 'sandbox',
          paymentSession,
          onPaymentCompleted: (_, paymentResponse) => {
            console.log('Payment completed:', paymentResponse);
            window.location.href = `/success?paymentId=${paymentResponse.id}`;
          },
          onPaymentFailed: (_, error) => {
            console.error('Payment failed:', error);
            setError(error.message || 'Payment failed');
          }
        });

        // Create and mount Flow component
        const flowComponent = checkout.create('flow');
        flowComponent.mount(flowContainerRef.current);

      } catch (error) {
        console.error('Checkout initialization error:', error);
        setError(error.message || 'Failed to initialize checkout');
      } finally {
        setIsLoading(false);
      }
    };

    if (flowContainerRef.current && scriptLoaded) {
      initializeCheckout();
    }
  }, [paymentAmount, scriptLoaded]);

  const handleAmountChange = (e) => {
    const newAmount = parseInt(e.target.value) * 100; // Convert to cents
    setPaymentAmount(newAmount);
  };

  return (
    <>
      <Script 
        src="https://checkout-web-components.checkout.com/index.js"
        onLoad={() => {
          console.log('Checkout.com script loaded');
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error('Failed to load Checkout.com script:', e);
          setError('Failed to load checkout script');
        }}
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Secure Checkout
            </h1>
          
          {/* Amount selector */}
          <div className="mb-8">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount
            </label>
            <select
              id="amount"
              value={paymentAmount / 100}
              onChange={handleAmountChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">$10.00</option>
              <option value="20">$20.00</option>
              <option value="50">$50.00</option>
              <option value="100">$100.00</option>
            </select>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="mb-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading checkout...</p>
            </div>
          )}

          {/* Checkout Flow container */}
          <div className="border border-gray-200 rounded-lg p-4 min-h-[400px]">
            <div ref={flowContainerRef} id="flow-container"></div>
          </div>

          {/* Security notice */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🔒 Your payment is secured by Checkout.com</p>
            <p>This is a sandbox environment for testing purposes</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}