'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, Filter, X, ChevronDown, User, ShoppingCart, Star, Menu, Package, LogOut, SlidersHorizontal } from "lucide-react";
import { products } from '@/app/utils/productUtils';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  category?: string;
  images: string[];
}

interface FilterState {
  categories: {
    shoes: boolean;
    clothing: boolean;
    accessories: boolean;
  };
  brands: {
    nike: boolean;
    adidas: boolean;
    puma: boolean;
    fenty: boolean;
  };
  ratings: {
    rating5: boolean;
    rating4: boolean;
    rating3Below: boolean;
  };
  priceRange: number[];
}

// Mobile Nav Component
function MobileNav({ user, logout }: { user?: any, logout?: () => void }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  return (
    <nav className="w-full bg-teal-700 text-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-3 py-2">
        <Link href="/mobile-home" className="flex items-center gap-2">
          <Image src="/Adobe Express - file.png?height=32&width=32" alt="GenWear Logo" width={32} height={32} />
          <span className="text-lg font-bold">GenWear</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/cart" className="p-2">
            <ShoppingCart className="w-6 h-6" />
          </Link>
          <div className="relative">
            <button onClick={() => setIsProfileOpen(p => !p)} className="flex items-center">
              {user?.profileImage ? (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image src={user.profileImage} alt="Profile" width={32} height={32} className="rounded-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
              )}
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100 text-gray-800">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4" /> Manage Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Package className="w-4 h-4" /> Order History
                    </Link>
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="w-4 h-4" /> Login / Sign Up
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Search Bar Component
function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  return (
    <div className="px-3 py-2 bg-white sticky top-14 z-40">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search products..."
          className="bg-transparent outline-none w-full text-base"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
        />
      </div>
    </div>
  );
}

// Filter Sheet Component
function FilterSheet({ isOpen, onClose, filters, setFilters }: {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 p-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={onClose} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters.categories).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setFilters({
                      ...filters,
                      categories: { ...filters.categories, [key]: !value }
                    })}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      value ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Brands</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters.brands).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setFilters({
                      ...filters,
                      brands: { ...filters.brands, [key]: !value }
                    })}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      value ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>৳{filters.priceRange[0]}</span>
                  <span>৳{filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Rating</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters.ratings).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setFilters({
                      ...filters,
                      ratings: { ...filters.ratings, [key]: !value }
                    })}
                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                      value ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-yellow-400">
                      {key === 'rating5' ? '★★★★★' : key === 'rating4' ? '★★★★' : '★★★'}
                    </span>
                    {key === 'rating3Below' ? '& below' : '& up'}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={onClose}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium"
            >
              Apply Filters
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <div className="relative aspect-square">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h3>
          <p className="font-bold text-teal-600 text-sm mt-1">৳{product.price.toFixed(2)}</p>
          <div className="flex items-center mt-1">
            <div className="flex text-yellow-400 text-xs">
              {Array(5).fill(0).map((_, i) => (
                <span key={i}>{i < Math.floor(product.rating) ? "★" : "☆"}</span>
              ))}
            </div>
            <span className="ml-1 text-xs text-gray-600">{product.rating}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Main Component
export default function MobileBrowse() {
  const { user, logout } = useUser ? useUser() : { user: undefined, logout: undefined };
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState<FilterState>({
    categories: {
      shoes: false,
      clothing: false,
      accessories: false
    },
    brands: {
      nike: false,
      adidas: false,
      puma: false,
      fenty: false
    },
    ratings: {
      rating5: false,
      rating4: false,
      rating3Below: false
    },
    priceRange: [0, 5000]
  });

  // Filter products based on search, category, and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    
    const matchesFilters = (
      (!filters.categories.shoes && !filters.categories.clothing && !filters.categories.accessories) ||
      (filters.categories.shoes && product.category === 'shoes') ||
      (filters.categories.clothing && product.category === 'clothing') ||
      (filters.categories.accessories && product.category === 'accessories')
    ) && (
      (!filters.brands.nike && !filters.brands.adidas && !filters.brands.puma && !filters.brands.fenty) ||
      (filters.brands.nike && product.name.toLowerCase().includes('nike')) ||
      (filters.brands.adidas && product.name.toLowerCase().includes('adidas')) ||
      (filters.brands.puma && product.name.toLowerCase().includes('puma')) ||
      (filters.brands.fenty && product.name.toLowerCase().includes('fenty'))
    ) && (
      (!filters.ratings.rating5 && !filters.ratings.rating4 && !filters.ratings.rating3Below) ||
      (filters.ratings.rating5 && product.rating >= 5) ||
      (filters.ratings.rating4 && product.rating >= 4 && product.rating < 5) ||
      (filters.ratings.rating3Below && product.rating < 4)
    ) && (
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    return matchesSearch && matchesCategory && matchesFilters;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav user={user} logout={logout} />
      <SearchBar onSearch={setSearchQuery} />
      
      {/* Category Tabs */}
      <div className="px-3 py-2 bg-white sticky top-28 z-30">
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
          {['all', 'shoes', 'clothing', 'accessories'].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-center ${
                activeCategory === category
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Button */}
      <div className="px-3 py-2 bg-white sticky top-40 z-30">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Product Grid */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Filter Sheet */}
      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
}
