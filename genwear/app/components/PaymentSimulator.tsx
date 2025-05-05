'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PaymentSimulatorProps {
  amount: number;
  onSuccess: () => void;
  onFailure: (error: string) => void;
}

export default function PaymentSimulator({ amount, onSuccess, onFailure }: PaymentSimulatorProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    return v;
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate 90% success rate
      const isSuccess = Math.random() < 0.9;

      if (isSuccess) {
        onSuccess();
      } else {
        onFailure('Payment failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during payment processing');
      onFailure('An error occurred during payment processing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Enter Card Details</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="123"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className={`w-full ${
              isProcessing ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
            } text-white py-3 px-6 rounded-md transition-colors flex items-center justify-center`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </>
            ) : (
              `Pay ৳${amount.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
} 