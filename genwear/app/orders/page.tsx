'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaChevronDown } from 'react-icons/fa';
import { Menu, Mail, Bell, User, Settings, LogOut, Package } from 'lucide-react';
import Footer from '@/components/ui/Footer';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'PAID';
  createdAt: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function OrderHistory() {
  const router = useRouter();
  const { user, isAuthenticated, token, logout, isLoading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Wait for authentication state to be loaded
    if (isLoading) {
      return;
    }

    // Only redirect if we're sure the user is not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/orders/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch orders');
        }

        const data = await response.json();
        if (!data.orders) {
          throw new Error('No orders data received');
        }

        setOrders(data.orders);
        setError('');
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token, router, isLoading]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-teal-600 transition-colors">
                Home
              </Link>
              <Link href="/browse" className="text-gray-700 hover:text-teal-600 transition-colors">
                Browse
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-teal-600 transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-teal-600 transition-colors">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <FaShoppingCart className="text-2xl text-gray-600 hover:text-teal-600 transition-colors" />
              <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
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
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order History</h1>
            <p className="text-gray-600">View and track your orders</p>
          </motion.div>

          {isLoadingOrders ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
              <Link 
                href="/browse"
                className="inline-block bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500">
                              Size: {item.size} • Color: {item.color}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × ৳{item.price}
                            </p>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ৳{item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Shipping Address:</p>
                          <p className="text-sm text-gray-900">
                            {order.shippingAddress.fullName}<br />
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                            {order.shippingAddress.country}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Amount:</p>
                          <p className="text-lg font-semibold text-gray-900">৳{order.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
} 