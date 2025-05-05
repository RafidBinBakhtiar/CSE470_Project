'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Package } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface FormData {
  bio: string;
  phone: string;
  address: string;
  birthdate: Date | null;
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

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

export default function Profile() {
  const { user, updateUser, token, fetchUserData } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({
    bio: user?.bio || '',
    phone: user?.phone || '',
    address: user?.address || '',
    birthdate: user?.birthdate ? new Date(user.birthdate) : null,
    shippingAddress: user?.shippingAddress || {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Bangladesh'
    }
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState('');
  const [points, setPoints] = useState<number>(0);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch latest user data when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch('/api/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const data = await response.json();
          if (data.user) {
            setPoints(data.user.points || 0);
            setIsLoadingPoints(false);
            updateUser(data.user);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsLoadingPoints(false);
        }
      }
    };

    fetchUser();
    // Add a refresh interval to update user data periodically
    const interval = setInterval(fetchUser, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [token, updateUser]);

  // Update form data when user data changes
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        bio: user.bio || '',
        phone: user.phone || '',
        address: user.address || '',
        birthdate: user.birthdate ? new Date(user.birthdate) : null,
        shippingAddress: user.shippingAddress || {
          fullName: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Bangladesh'
        }
      });
    }
  }, [user, isEditing]);

  // Fetch orders when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/orders/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        setOrderError('Failed to load orders');
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      if (!token) {
        setError('Please log in to save changes');
        return;
      }

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          ...formData,
          birthdate: formData.birthdate?.toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update the user context with the new data
      if (user) {
        updateUser({
          ...user,
          bio: formData.bio,
          phone: formData.phone,
          address: formData.address,
          birthdate: formData.birthdate ? formData.birthdate.toISOString() : undefined,
          shippingAddress: formData.shippingAddress
        });
      }

      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError('');

      if (!token) {
        setError('Please log in to upload image');
        return;
      }

      const formData = new FormData();
      formData.append('token', token);
      formData.append('file', file);

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      // Update the user context with the new image URL
      if (user) {
        updateUser({ ...user, profileImage: data.imageUrl });
      }

      setSuccess('Profile image updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/Adobe Express - file.png"
                  alt="GenWear Logo"
                  width={32}
                  height={32}
                  className="text-teal-500"
                />
                <span className="text-xl font-bold text-teal-800">GenWear</span>
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-gray-600 hover:text-teal-600 font-bold">
                  Home
                </Link>
                <Link href="/browse" className="text-gray-600 hover:text-teal-600 font-bold">
                  Browse
                </Link>
                <Link href="/contact" className="text-gray-600 hover:text-teal-600 font-bold">
                  Contact
                </Link>
                <Link href="/about" className="text-gray-600 hover:text-teal-600 font-bold">
                  About Us
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Profile Header/Banner */}
          <div className="h-48 bg-gradient-to-r from-teal-400 to-teal-600 relative">
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white p-1 overflow-hidden">
                  {user?.profileImage ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={user.profileImage}
                        alt="Profile"
                        fill
                        className="rounded-full object-cover"
                        sizes="(max-width: 128px) 100vw, 128px"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-teal-100 flex items-center justify-center text-4xl font-bold text-teal-600">
                      {user?.name?.charAt(0).toUpperCase() || ''}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {user?.name}
                </h1>
                <p className="text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="border-b border-gray-300 focus:border-teal-500 outline-none"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="border-b border-gray-300 focus:border-teal-500 outline-none w-full"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.address || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Birth Date</p>
                      {isEditing ? (
                        <DatePicker
                          selected={formData.birthdate}
                          onChange={(date) => handleInputChange('birthdate', date)}
                          dateFormat="MMMM d, yyyy"
                          maxDate={new Date()}
                          className="border-b border-gray-300 focus:border-teal-500 outline-none bg-transparent"
                          placeholderText="Select your birth date"
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={100}
                          customInput={
                            <input
                              className="border-b border-gray-300 focus:border-teal-500 outline-none bg-transparent w-full"
                              placeholder="Select your birth date"
                            />
                          }
                        />
                      ) : (
                        <p className="text-gray-900">
                          {formData.birthdate ? formData.birthdate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* About Me Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">About Me</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-teal-600 hover:text-teal-700"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            bio: user?.bio || '',
                            phone: user?.phone || '',
                            address: user?.address || '',
                            birthdate: user?.birthdate ? new Date(user.birthdate) : null,
                            shippingAddress: user?.shippingAddress || {
                              fullName: '',
                              phone: '',
                              address: '',
                              city: '',
                              state: '',
                              zipCode: '',
                              country: 'Bangladesh'
                            }
                          });
                        }}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                {success && <p className="text-green-500 mb-2">{success}</p>}
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600">{formData.bio || 'No bio added yet.'}</p>
                )}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-sm text-teal-600 mb-1">Orders</p>
                  <p className="text-2xl font-bold text-teal-700">{orders.length}</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-sm text-teal-600 mb-1">Points</p>
                  {isLoadingPoints ? (
                    <div className="animate-pulse h-8 bg-teal-200 rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-teal-700">{points}</p>
                  )}
                  <p className="text-xs text-teal-600 mt-1">1 point per 10 taka spent</p>
                </div>
              </div>
            </div>

            {/* Order History Section */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
                <Link 
                  href="/orders" 
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                >
                  View All Orders
                </Link>
              </div>

              {isLoadingOrders ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
                </div>
              ) : orderError ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                  {orderError}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                  <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                  <Link 
                    href="/browse"
                    className="inline-block bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex flex-wrap justify-between items-start mb-4">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="relative w-16 h-16 flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover rounded-md"
                                />
                              </div>
                              <div className="flex-grow">
                                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                <p className="text-xs text-gray-500">
                                  Size: {item.size} • Color: {item.color}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Quantity: {item.quantity} × ৳{item.price}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-gray-500 text-center">
                              +{order.items.length - 2} more items
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-600">Total Amount:</p>
                            <p className="text-sm font-semibold text-gray-900">৳{order.totalAmount}</p>
                          </div>
                          <Link 
                            href={`/orders?order=${order._id}`}
                            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Address</h2>
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        value={formData.shippingAddress?.fullName || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingAddress: {
                            ...formData.shippingAddress!,
                            fullName: e.target.value
                          }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={formData.shippingAddress?.phone || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingAddress: {
                            ...formData.shippingAddress!,
                            phone: e.target.value
                          }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        value={formData.shippingAddress?.address || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          shippingAddress: {
                            ...formData.shippingAddress!,
                            address: e.target.value
                          }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          value={formData.shippingAddress?.city || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            shippingAddress: {
                              ...formData.shippingAddress!,
                              city: e.target.value
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          value={formData.shippingAddress?.state || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            shippingAddress: {
                              ...formData.shippingAddress!,
                              state: e.target.value
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <input
                          type="text"
                          value={formData.shippingAddress?.zipCode || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            shippingAddress: {
                              ...formData.shippingAddress!,
                              zipCode: e.target.value
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          value={formData.shippingAddress?.country || 'Bangladesh'}
                          onChange={(e) => setFormData({
                            ...formData,
                            shippingAddress: {
                              ...formData.shippingAddress!,
                              country: e.target.value
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-900">
                      <span className="font-medium">Full Name:</span> {formData.shippingAddress?.fullName || 'Not provided'}
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">Phone:</span> {formData.shippingAddress?.phone || 'Not provided'}
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">Address:</span> {formData.shippingAddress?.address || 'Not provided'}
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">City:</span> {formData.shippingAddress?.city || 'Not provided'}
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">State:</span> {formData.shippingAddress?.state || 'Not provided'}
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">ZIP Code:</span> {formData.shippingAddress?.zipCode || 'Not provided'}
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">Country:</span> {formData.shippingAddress?.country || 'Bangladesh'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 