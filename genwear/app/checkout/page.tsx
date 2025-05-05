'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaSearch, FaHeart, FaChevronDown, FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { Menu, Mail, Bell, User, Settings, LogOut, CheckCircle } from 'lucide-react';
import Footer from '@/components/ui/Footer';
import PaymentSimulator from '../components/PaymentSimulator';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, discountCode, discountAmount, clearCart } = useCart();
  const { user, isAuthenticated, isLoading, token, updateUser } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh',
    paymentMethod: 'bkash',
    additionalNotes: ''
  });
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Wait for authentication state to be loaded
    if (isLoading) return;

    // Check if cart exists in localStorage
    const savedCart = localStorage.getItem('cart');
    if (!savedCart || JSON.parse(savedCart).length === 0) {
      router.push('/cart');
    }
  }, [isLoading, router]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Update form data when useSavedAddress changes
  useEffect(() => {
    if (useSavedAddress && user?.shippingAddress) {
      setFormData(prev => ({
        ...prev,
        fullName: user.shippingAddress?.fullName || '',
        phone: user.shippingAddress?.phone || '',
        address: user.shippingAddress?.address || '',
        city: user.shippingAddress?.city || '',
        state: user.shippingAddress?.state || '',
        zipCode: user.shippingAddress?.zipCode || '',
        country: user.shippingAddress?.country || 'Bangladesh',
      }));
    } else if (!useSavedAddress) {
      setFormData(prev => ({
        ...prev,
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Bangladesh',
      }));
    }
  }, [useSavedAddress, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentForm(false);
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Create order
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token,
          items: items,
          totalAmount: totalPrice,
          shippingAddress: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
          paymentMethod: 'card',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create order');
      }

      // Show success modal
      setShowSuccessModal(true);

      // Clear cart and redirect after 2 seconds
      setTimeout(() => {
        clearCart();
        router.push('/');
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentFailure = (error: string) => {
    setPaymentError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If card payment is selected but payment form is not shown yet
    if (formData.paymentMethod === 'card' && !showPaymentForm) {
      setShowPaymentForm(true);
      return;
    }

    // For cash on delivery, proceed with order creation
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Create order
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token,
          items: items,
          totalAmount: totalPrice,
          shippingAddress: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
          paymentMethod: formData.paymentMethod === 'cod' ? 'cod' : 'card',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create order');
      }

      // Show success modal
      setShowSuccessModal(true);

      // Clear cart and redirect after 2 seconds
      setTimeout(() => {
        clearCart();
        router.push('/');
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Implement logout functionality
    console.log('Logging out');
  };

  if (items.length === 0 && !showSuccessModal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <button
          onClick={() => router.push('/browse')}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-12 h-12 text-teal-600" />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Order Placed Successfully!
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-6"
              >
                Thank you for your purchase. Redirecting to home page...
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-16 h-1 bg-teal-600 rounded-full mx-auto"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, delay: 0.5 }}
                  className="h-full bg-teal-600 rounded-full"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/Adobe Express - file.png" alt="GenWear Logo" width={40} height={40} />
              <span className="text-xl font-bold text-teal-600">GenWear</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <FaShoppingCart className="text-2xl text-gray-600 hover:text-teal-600 transition-colors" />
              <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            </Link>
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <FaChevronDown className="w-4 h-4" />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Manage Profile</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow pt-24">
        <div className="container mx-auto px-4">
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-100 text-red-700 rounded-md flex items-center justify-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{submitError}</span>
            </motion.div>
          )}

          {paymentError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-100 text-red-700 rounded-md flex items-center justify-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{paymentError}</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Shipping Information</h2>
                
                {user?.shippingAddress && (
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="useSavedAddress"
                        checked={useSavedAddress}
                        onChange={(e) => setUseSavedAddress(e.target.checked)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="useSavedAddress" className="ml-2 block text-sm text-gray-700">
                        Use my saved shipping address
                      </label>
                    </div>
                    
                    {useSavedAddress && (
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Address:</h3>
                        <p className="text-sm text-gray-600">
                          {user.shippingAddress.fullName}<br />
                          {user.shippingAddress.address}<br />
                          {user.shippingAddress.city}, {user.shippingAddress.state} {user.shippingAddress.zipCode}<br />
                          {user.shippingAddress.country}<br />
                          Phone: {user.shippingAddress.phone}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-teal-500">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === 'card'}
                          onChange={handleChange}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                        />
                        <div className="flex items-center space-x-3">
                          <FaCreditCard className="text-2xl text-gray-600" />
                          <span className="text-gray-700">Credit/Debit Card</span>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-teal-500">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleChange}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                        />
                        <div className="flex items-center space-x-3">
                          <FaMoneyBillWave className="text-2xl text-gray-600" />
                          <span className="text-gray-700">Cash on Delivery</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Payment Simulator - Outside the main form */}
                  {showPaymentForm && (
                    <div className="mt-6">
                      <PaymentSimulator
                        amount={totalPrice}
                        onSuccess={handlePaymentSuccess}
                        onFailure={handlePaymentFailure}
                      />
                    </div>
                  )}

                  {/* Submit Button - Only for Cash on Delivery */}
                  {formData.paymentMethod === 'cod' && (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full ${
                        isSubmitting ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                      } text-white py-3 px-6 rounded-md transition-colors mt-6 flex items-center justify-center`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  )}

                  {/* Show Payment Form Button - Only for Card Payment */}
                  {formData.paymentMethod === 'card' && !showPaymentForm && (
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(true)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-md transition-colors mt-6"
                    >
                      Enter Card Details
                    </button>
                  )}
                </form>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 h-fit">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Summary</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="relative w-20 h-20">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.size && `Size: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ৳{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>৳{(totalPrice + discountAmount).toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({discountCode})</span>
                        <span>-৳{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-gray-800 pt-3 border-t">
                      <span>Total</span>
                      <span>৳{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 