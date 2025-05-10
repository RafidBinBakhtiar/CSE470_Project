// This file implements the discounts and promotions page for users.
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { products } from '@/app/utils/productUtils';
import { ChevronRight, Star, Search, Mail, Bell, User, Menu, Settings, LogOut, Package } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import Footer from '@/components/ui/Footer';
import CartIcon from '@/app/components/CartIcon';

// Filter products for each section
const summerProducts = products.filter(product => 
  product.category === 'clothing' || product.category === 'shoes'
).slice(0, 2);

const featuredProducts = products.filter(product => 
  product.category === 'clothing' || product.category === 'shoes'
).slice(2, 4);

const limitedProducts = products.filter(product => 
  product.category === 'shoes'
).slice(0, 1);

export default function PromotionsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useUser();
  const { items } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
            <div className="hidden md:flex items-center gap-8">
              <Link href="/browse" className="font-medium text-gray-700 hover:text-teal-600">
                Browse
              </Link>
              <Link href="/contact" className="font-medium text-gray-700 hover:text-teal-600">
                Contact
              </Link>
              {!user && (
                <Link href="/sign-up" className="font-medium text-gray-700 hover:text-teal-600">
                  Sign Up
                </Link>
              )}
              <Link href="/about" className="font-medium text-gray-700 hover:text-teal-600">
                About Us
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search Product"
                  className="bg-transparent outline-none w-64 text-base"
                />
              </div>
            </div>
            <div>
              <CartIcon className="text-gray-600 hover:text-teal-600 transition-colors" />
            </div>
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {user?.profileImage ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={user.profileImage}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    <Link 
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      Manage Profile
                    </Link>
                    
                    <Link 
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Package className="w-4 h-4" />
                      Order History
                    </Link>
                    
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <User className="w-6 h-6 text-gray-600 hover:text-teal-600" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow pt-24">
        {/* Summer Collection Section */}
        <section id="summer" className="relative py-20 overflow-hidden bg-gradient-to-b from-[#e8fcff] to-white">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            {/* Existing blur effects */}
            <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#00e0c6] opacity-10 blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-[#00e0c6] opacity-10 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#00e0c6] opacity-5 blur-3xl"></div>
            
            {/* Fire effect */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="absolute top-40 right-40"
            >
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500 to-red-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-400 to-red-600 rounded-full blur-md opacity-40 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </motion.div>

            {/* Abstract shapes */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute bottom-40 left-40 w-24 h-24"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path
                  d="M50 0 L100 50 L50 100 L0 50 Z"
                  className="fill-none stroke-[#00e0c6] stroke-[4] opacity-20"
                />
                <path
                  d="M25 25 L75 25 L75 75 L25 75 Z"
                  className="fill-none stroke-[#00e0c6] stroke-[4] opacity-20"
                />
              </svg>
            </motion.div>

            {/* Floating particles */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, x: Math.random() * 100 - 50 }}
                  animate={{
                    y: [0, -100, 0],
                    x: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50]
                  }}
                  transition={{
                    duration: 5 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  className="absolute w-2 h-2 rounded-full bg-[#00e0c6] opacity-20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                />
              ))}
            </motion.div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-teal-800 mb-4">Summer Collection</h2>
              <p className="text-lg text-gray-600">Discover our latest summer styles</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {summerProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative group"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                      <Image
                        src={product.images[1] || product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                    <p className="text-lg mb-4">৳{product.price.toFixed(2)}</p>
                    <Link
                      href={`/product/${product.id}`}
                      className="inline-flex items-center gap-2 bg-white text-teal-800 px-6 py-2 rounded-full hover:bg-teal-800 hover:text-white transition-colors duration-300"
                    >
                      Shop Now <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* New & Featured Section */}
        <section id="featured" className="relative py-20 overflow-hidden bg-gradient-to-b from-[#a1ffa1] to-white">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            {/* Existing blur effects */}
            <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-[#00e0c6] opacity-10 blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-[#00e0c6] opacity-10 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#00e0c6] opacity-5 blur-3xl"></div>
            
            {/* Energy burst effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute top-40 left-40"
            >
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-500 rounded-full blur-md opacity-40 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </motion.div>

            {/* Dynamic lines */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -100, y: Math.random() * 100 }}
                  animate={{
                    x: [0, 100, 0],
                    y: [Math.random() * 100, Math.random() * 100, Math.random() * 100]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  className="absolute w-24 h-1 bg-[#00e0c6] opacity-20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}
            </motion.div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-teal-800 mb-4">New & Featured</h2>
              <p className="text-lg text-gray-600">Explore our latest arrivals</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative group"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                      <Image
                        src={product.images[1] || product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                    <p className="text-lg mb-4">৳{product.price.toFixed(2)}</p>
                    <Link
                      href={`/product/${product.id}`}
                      className="inline-flex items-center gap-2 bg-white text-teal-800 px-6 py-2 rounded-full hover:bg-teal-800 hover:text-white transition-colors duration-300"
                    >
                      Shop Now <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Limited Edition Section */}
        <section id="limited" className="relative py-20 overflow-hidden bg-gradient-to-b from-[#e8d8ff] to-white">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            {/* Existing blur effects */}
            <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#9a7aff] opacity-10 blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-[#9a7aff] opacity-10 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#9a7aff] opacity-5 blur-3xl"></div>
            
            {/* Cosmic effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute top-40 right-40"
            >
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full blur-md opacity-40 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute inset-0 border-4 border-purple-300 rounded-full opacity-20 animate-spin" style={{ animationDuration: '20s' }}></div>
              </div>
            </motion.div>

            {/* Floating stars */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1, 0] }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    boxShadow: '0 0 10px 2px rgba(154, 122, 255, 0.5)'
                  }}
                />
              ))}
            </motion.div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-purple-800 mb-4">Limited Edition</h2>
              <p className="text-lg text-gray-600">Exclusive designs for a limited time</p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {limitedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative group"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 col-span-2">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                      <Image
                        src={product.images[1] || product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-bold mb-2">{product.name}</h3>
                    <p className="text-xl mb-4">৳{product.price.toFixed(2)}</p>
                    <Link
                      href={`/product/${product.id}`}
                      className="inline-flex items-center gap-2 bg-white text-purple-800 px-8 py-3 rounded-full hover:bg-purple-800 hover:text-white transition-colors duration-300"
                    >
                      Shop Now <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
} 