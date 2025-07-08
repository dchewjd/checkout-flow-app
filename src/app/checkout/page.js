'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export default function CheckoutPage() {
  const flowContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(10000); // $100.00 SGD in cents
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState('billing'); // 'billing' or 'payment'
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: 'SG'
  });

  const initializeCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting checkout initialization...');
      console.log('Script loaded:', scriptLoaded);
      console.log('Window.CheckoutWebComponents:', !!window.CheckoutWebComponents);
      console.log('Billing info:', billingInfo);

      // Wait for script to load
      if (!scriptLoaded || !window.CheckoutWebComponents) {
        console.log('Waiting for Checkout.com script to load...');
        setIsLoading(false);
        return;
      }

      // Create payment session
      console.log('Creating payment session...');
      const response = await fetch('/api/payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentAmount,
          currency: 'SGD',
          billingInfo: billingInfo
        })
      });

      const paymentSession = await response.json();

      if (!response.ok) {
        console.error('Payment session creation failed:', paymentSession);
        const errorMessage = typeof paymentSession.error === 'string' 
          ? paymentSession.error 
          : paymentSession.error?.message || JSON.stringify(paymentSession.error) || 'Failed to create payment session';
        throw new Error(errorMessage);
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

      console.log('Checkout components initialized, creating flow...');
      
      // Create and mount Flow component
      const flowComponent = checkout.create('flow');
      console.log('Flow component created, mounting...');
      flowComponent.mount(flowContainerRef.current);
      console.log('Flow component mounted successfully');

    } catch (error) {
      console.error('Checkout initialization error:', error);
      setError(error.message || 'Failed to initialize checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBillingChange = (e) => {
    setBillingInfo({
      ...billingInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateBillingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'addressLine1', 'city', 'zip'];
    return required.every(field => billingInfo[field] && billingInfo[field].trim() !== '');
  };

  const handleProceedToPayment = async () => {
    if (!validateBillingInfo()) {
      setError('Please fill in all required billing information fields');
      return;
    }
    
    setCurrentStep('payment');
  };

  // Initialize checkout when payment step is reached and script is loaded
  useEffect(() => {
    if (currentStep === 'payment' && scriptLoaded && flowContainerRef.current) {
      initializeCheckout();
    }
  }, [currentStep, scriptLoaded]);

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
          
          {/* Product Details */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c1.657 0 3-1.343 3-3s-1.343-3-3-3m0 6c-1.657 0-3-1.343-3-3s1.343-3 3-3m-3 3H9m12 0v9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Premium Running Shoes</h3>
                  <p className="text-sm text-gray-600">Color: Black | Size: US 10</p>
                  <p className="text-sm text-gray-600">SKU: SHOES-001</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">S$100.00</p>
                <p className="text-sm text-gray-600">SGD</p>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={billingInfo.firstName}
                  onChange={handleBillingChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={billingInfo.lastName}
                  onChange={handleBillingChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={billingInfo.email}
                  onChange={handleBillingChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={billingInfo.phone}
                  onChange={handleBillingChange}
                  placeholder="e.g., +65 1234 5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={billingInfo.addressLine1}
                  onChange={handleBillingChange}
                  placeholder="e.g., 123 Marina Bay Street"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={billingInfo.addressLine2}
                  onChange={handleBillingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={billingInfo.city}
                  onChange={handleBillingChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Region
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={billingInfo.state}
                  onChange={handleBillingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={billingInfo.zip}
                  onChange={handleBillingChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={billingInfo.country}
                  onChange={handleBillingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                >
                  <option value="SG">Singapore</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="CA">Canada</option>
                  <option value="MY">Malaysia</option>
                  <option value="TH">Thailand</option>
                  <option value="ID">Indonesia</option>
                </select>
              </div>
            </div>
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

          {/* Billing Step */}
          {currentStep === 'billing' && (
            <div className="mb-6">
              <div className="flex justify-end">
                <button
                  onClick={handleProceedToPayment}
                  disabled={!validateBillingInfo()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <>
              {/* Back button */}
              <div className="mb-4">
                <button
                  onClick={() => setCurrentStep('billing')}
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Billing Information
                </button>
              </div>

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
            </>
          )}

          {/* Security notice */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🔒 Your payment is secured by Checkout.com</p>
            <p>This is a sandbox environment for testing purposes</p>
            <p>Payment processed in Singapore Dollars (SGD)</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}