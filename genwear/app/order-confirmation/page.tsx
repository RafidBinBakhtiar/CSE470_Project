'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaCheckCircle, FaShoppingBag, FaHome } from 'react-icons/fa';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    // Get order number from URL
    const path = window.location.pathname;
    const orderNum = path.split('/').pop();
    if (orderNum) {
      setOrderNumber(orderNum);
    } else {
      router.push('/');
    }
  }, [router]);

  if (!orderNumber) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <FaCheckCircle className="text-6xl text-teal-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order #{orderNumber} has been successfully placed.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaShoppingBag className="text-2xl text-teal-500 mt-1" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Order Processing</h3>
                  <p className="text-gray-600">
                    We'll start processing your order right away. You'll receive an email with your order details and tracking information once your package ships.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaHome className="text-2xl text-teal-500 mt-1" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Delivery</h3>
                  <p className="text-gray-600">
                    Your order will be delivered within 3-5 business days. You can track your order status using the tracking number provided in the confirmation email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 