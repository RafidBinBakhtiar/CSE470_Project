"use client";

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Search, Menu, Mail, Bell, User, Settings, LogOut, Heart, Package } from "lucide-react"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import Footer from '@/components/ui/Footer';
import CartIcon from '../components/CartIcon';
import { products } from '@/app/utils/productUtils';

// Add type definitions for filter state
type FilterState = {
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
};

type FilterType = keyof FilterState;

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  category?: string;
  description: string;
  features: string[];
  sizes: string[];
  colors: string[];
  images: string[];
  modelUrl?: string;
  createdAt?: string;
}

export default function Page() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [showFirstBanner] = useState(Math.random() < 0.5);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const productsPerPage = 12;
  const [activeTab, setActiveTab] = useState("all");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Add useEffect to handle initial loading state
  useEffect(() => {
    if (!isLoading) {
      setIsPageLoading(false);
    }
  }, [isLoading]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update the filter state with proper typing
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
    priceRange: [0, 20000]
  });

  // Add useEffect for debouncing search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Update the filtering logic to use the new filter state
  const filteredProducts = products.filter((product) => {
    const productPrice = parseFloat(product.price.toString());

    // Filter by active tab
    const matchesTab = activeTab === "all" || product.category === activeTab;
    const matchesSearch = product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

    // Filter by sidebar categories
    const matchesCategory =
      (!filters.categories.shoes && !filters.categories.clothing && !filters.categories.accessories) ||
      (filters.categories.shoes && product.category === "shoes") ||
      (filters.categories.clothing && product.category === "clothing") ||
      (filters.categories.accessories && product.category === "accessories");

    // Filter by brands
    const matchesBrand =
      (!filters.brands.nike && !filters.brands.adidas && !filters.brands.puma && !filters.brands.fenty) ||
      (filters.brands.nike && product.name.toLowerCase().includes("nike")) ||
      (filters.brands.adidas && product.name.toLowerCase().includes("adidas")) ||
      (filters.brands.puma && product.name.toLowerCase().includes("puma")) ||
      (filters.brands.fenty && product.name.toLowerCase().includes("fenty"));

    // Filter by price range
    const matchesPrice = productPrice >= filters.priceRange[0] && productPrice <= filters.priceRange[1];

    // Filter by rating
    const matchesRating =
      (!filters.ratings.rating5 && !filters.ratings.rating4 && !filters.ratings.rating3Below) ||
      (filters.ratings.rating5 && product.rating >= 5) ||
      (filters.ratings.rating4 && product.rating >= 4 && product.rating < 5) ||
      (filters.ratings.rating3Below && product.rating < 4);

    return matchesTab && matchesCategory && matchesBrand && matchesPrice && matchesRating && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getSortedProducts = (products: Product[]) => {
    switch (sortBy) {
      case "price-low":
        return [...products].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...products].sort((a, b) => b.price - a.price);
      case "rating":
        return [...products].sort((a, b) => b.rating - a.rating);
      case "newest":
        return [...products].sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      default:
        return products;
    }
  };

  // Apply sorting to filtered products
  const sortedProducts = getSortedProducts(filteredProducts);
  const displayedProducts = sortedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Update the filter handler with proper typing
  const handleFilterChange = (filterType: FilterType, filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: {
        ...prev[filterType],
        [filterName]: value
      }
    }));
    setCurrentPage(1);
  };

  // Update the clear all filters function
  const clearAllFilters = () => {
    setFilters({
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
      priceRange: [0, 20000]
    });
    setCurrentPage(1);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white py-4'
      }`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/placeholder.jpg?height=40&width=40"
                alt="GenWear Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-xl font-bold text-teal-600">GenWear</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-600 hover:text-teal-600 font-bold">
                Home
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-teal-600 font-bold">
                Contact
              </Link>
              {!isAuthenticated && (
                <Link href="/sign-up" className="text-gray-600 hover:text-teal-600 font-bold">
                  Sign Up
                </Link>
              )}
              <Link href="/about" className="text-gray-600 hover:text-teal-600 font-bold">
                About Us
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <CartIcon />
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="search"
                placeholder="Search Product"
                className="pl-10 w-64 bg-gray-50 border border-gray-300 rounded-md py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setActiveSearchQuery(searchQuery);
                    setCurrentPage(1);
                  }
                }}
              />
            </div>
            {isAuthenticated ? (
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
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
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
              <Link href="/login" className="p-2">
                <User className="w-6 h-6 text-gray-600 hover:text-teal-600" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-teal-400 py-8">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Browse Products</h1>
          <div className="flex items-center gap-2 text-white">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>Browse Products</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-teal-600 hover:text-teal-700"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="space-y-2">
                    {/* Shoes */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleFilterChange("categories", "shoes", !filters.categories.shoes)}
                        className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer ${
                          filters.categories.shoes ? "bg-teal-600 border-teal-600" : "bg-white"
                        }`}
                      >
                        {filters.categories.shoes && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <label
                        onClick={() => handleFilterChange("categories", "shoes", !filters.categories.shoes)}
                        className="cursor-pointer text-sm"
                      >
                        Shoes
                      </label>
                    </div>
                    
                    {/* Clothing */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleFilterChange("categories", "clothing", !filters.categories.clothing)}
                        className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer ${
                          filters.categories.clothing ? "bg-teal-600 border-teal-600" : "bg-white"
                        }`}
                      >
                        {filters.categories.clothing && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <label
                        onClick={() => handleFilterChange("categories", "clothing", !filters.categories.clothing)}
                        className="cursor-pointer text-sm"
                      >
                        Clothing
                      </label>
                    </div>

                    {/* Accessories */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleFilterChange("categories", "accessories", !filters.categories.accessories)}
                        className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer ${
                          filters.categories.accessories ? "bg-teal-600 border-teal-600" : "bg-white"
                        }`}
                      >
                        {filters.categories.accessories && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <label
                        onClick={() => handleFilterChange("categories", "accessories", !filters.categories.accessories)}
                        className="cursor-pointer text-sm"
                      >
                        Accessories
                      </label>
                    </div>
                  </div>
                </div>
                {/* Brands */}
                <div>
                  <h3 className="font-medium mb-2">Brands</h3>
                  <div className="space-y-2">
                    {/* Nike */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleFilterChange("brands", "nike", !filters.brands.nike)}
                        className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer ${
                          filters.brands.nike ? "bg-teal-600 border-teal-600" : "bg-white"
                        }`}
                      >
                        {filters.brands.nike && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <label
                        onClick={() => handleFilterChange("brands", "nike", !filters.brands.nike)}
                        className="cursor-pointer text-sm"
                      >
                        Nike
                      </label>
                    </div>
                    {/* Adidas */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleFilterChange("brands", "adidas", !filters.brands.adidas)}
                        className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer ${
                          filters.brands.adidas ? "bg-teal-600 border-teal-600" : "bg-white"
                        }`}
                      >
                        {filters.brands.adidas && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <label
                        onClick={() => handleFilterChange("brands", "adidas", !filters.brands.adidas)}
                        className="cursor-pointer text-sm"
                      >
                        Adidas
                      </label>
                    </div>
                    {/* Puma */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleFilterChange("brands", "puma", !filters.brands.puma)}
                        className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer ${
                          filters.brands.puma ? "bg-teal-600 border-teal-600" : "bg-white"
                        }`}
                      >
                        {filters.brands.puma && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <label
                        onClick={() => handleFilterChange("brands", "puma", !filters.brands.puma)}
                        className="cursor-pointer text-sm"
                      >
                        Puma
                      </label>
                    </div>

                    {/* Fenty */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleFilterChange("brands", "fenty", !filters.brands.fenty)}
                        className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer ${
                          filters.brands.fenty ? "bg-teal-600 border-teal-600" : "bg-white"
                        }`}
                      >
                        {filters.brands.fenty && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <label
                        onClick={() => handleFilterChange("brands", "fenty", !filters.brands.fenty)}
                        className="cursor-pointer text-sm"
                      >
                        Fenty
                      </label>
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>৳{filters.priceRange[0]}</span>
                      <span>৳{filters.priceRange[1]}</span>
                    </div>
                    <Slider
                      min={0}
                      max={20000}
                      step={100}
                      value={filters.priceRange}
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, priceRange: value }));
                        setCurrentPage(1);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h3 className="font-medium mb-2">Rating</h3>
                  <div className="space-y-2">
                    {/* 5 Stars */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleFilterChange("ratings", "rating5", !filters.ratings.rating5)}
                        className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer ${
                          filters.ratings.rating5 ? "bg-teal-600 border-teal-600" : "bg-white"
                        }`}
                      >
                        {filters.ratings.rating5 && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <label
                        onClick={() => handleFilterChange("ratings", "rating5", !filters.ratings.rating5)}
                        className="cursor-pointer text-sm flex items-center"
                      >
                        <span className="flex text-yellow-400">★★★★★</span>
                        <span className="ml-1">& up</span>
                      </label>
                    </div>
                    {/* 4 Stars */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleFilterChange("ratings", "rating4", !filters.ratings.rating4)}
                        className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer ${
                          filters.ratings.rating4 ? "bg-teal-600 border-teal-600" : "bg-white"
                        }`}
                      >
                        {filters.ratings.rating4 && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <label
                        onClick={() => handleFilterChange("ratings", "rating4", !filters.ratings.rating4)}
                        className="cursor-pointer text-sm flex items-center"
                      >
                        <span className="flex text-yellow-400">★★★★</span>
                        <span className="ml-1">& up</span>
                      </label>
                    </div>
                    {/* 3 Stars & Below */}
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleFilterChange("ratings", "rating3Below", !filters.ratings.rating3Below)}
                        className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer ${
                          filters.ratings.rating3Below ? "bg-teal-600 border-teal-600" : "bg-white"
                        }`}
                      >
                        {filters.ratings.rating3Below && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <label
                        onClick={() => handleFilterChange("ratings", "rating3Below", !filters.ratings.rating3Below)}
                        className="cursor-pointer text-sm flex items-center"
                      >
                        <span className="flex text-yellow-400">★★★</span>
                        <span className="ml-1">& below</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 relative overflow-hidden bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl p-5 group">
              {/* Animated Circle 1 */}
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-blue-100 opacity-50 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-45"></div>
              
              {/* Animated Circle 2 */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-blue-100 opacity-50 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-45"></div>
              
              {/* Content */}
              <h3 className="text-3xl font-bold text-teal-800 mb-3 relative z-10 text-center">Need Help?</h3>
              <p className="text-teal-700 text-sm mb-4 text-center relative z-10">
                About Account Management
                <br />
                Ordering & Payment refund and
                <br />
                FAQ
              </p>
              <div className="flex justify-center relative z-10">
                <Link href="/contact" className="bg-white text-teal-700 font-medium py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-shadow">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing {displayedProducts.length} of {filteredProducts.length} products
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm whitespace-nowrap">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-gray-50 border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-teal-600 focus:outline-none">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg z-50">
                      <SelectItem value="featured" className="px-4 py-2 hover:bg-teal-50 hover:text-teal-600 cursor-pointer rounded-md">Featured</SelectItem>
                      <SelectItem value="price-low" className="px-4 py-2 hover:bg-teal-50 hover:text-teal-600 cursor-pointer rounded-md">Price: Low to High</SelectItem>
                      <SelectItem value="price-high" className="px-4 py-2 hover:bg-teal-50 hover:text-teal-600 cursor-pointer rounded-md">Price: High to Low</SelectItem>
                      <SelectItem value="rating" className="px-4 py-2 hover:bg-teal-50 hover:text-teal-600 cursor-pointer rounded-md">Top Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              defaultValue="all"
              className="mb-8"
              onValueChange={(value) => {
                setActiveTab(value); // Update activeTab state
                setCurrentPage(1);  // Reset pagination to the first page
              }}
            >
              <TabsList className="bg-gray-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  All Products
                </TabsTrigger>
                <TabsTrigger value="shoes" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Shoes
                </TabsTrigger>
                <TabsTrigger value="clothing" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Clothing
                </TabsTrigger>
                <TabsTrigger value="accessories" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Accessories
                </TabsTrigger>
              </TabsList>

              {/* TabsContent for All Products */}
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedProducts.map((product, index) => (
                    <ProductCard
                      key={index}
                      id={product.id}
                      images={product.images}
                      name={product.name}
                      price={product.price}
                      rating={product.rating}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* TabsContent for Shoes */}
              <TabsContent value="shoes" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedProducts.map((product, index) => (
                    <ProductCard
                      key={index}
                      id={product.id}
                      images={product.images}
                      name={product.name}
                      price={product.price}
                      rating={product.rating}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* TabsContent for Clothing */}
              <TabsContent value="clothing" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedProducts.map((product, index) => (
                    <ProductCard
                      key={index}
                      id={product.id}
                      images={product.images}
                      name={product.name}
                      price={product.price}
                      rating={product.rating}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* TabsContent for Accessories */}
              <TabsContent value="accessories" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedProducts.map((product, index) => (
                    <ProductCard
                      key={index}
                      id={product.id}
                      images={product.images}
                      name={product.name}
                      price={product.price}
                      rating={product.rating}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`h-8 w-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-teal-600 hover:text-white transition-colors ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={currentPage === 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-8 w-8 flex items-center justify-center rounded-md ${
                      page === currentPage
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 hover:bg-teal-600 hover:text-white transition-colors"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`h-8 w-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-teal-600 hover:text-white transition-colors ${
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={currentPage === totalPages}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFirstBanner ? (
        <div className="gradient-wave-hover py-12 mt-12 rounded-xl overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="max-w-md mb-8 md:mb-0">
                <h2 className="text-4xl font-bold text-teal-800 mb-6">New and Featured</h2>
                <p className="text-teal-700 mb-8">
                  Discover our latest arrivals and featured collections. Stay ahead of the curve with GenWear's cutting-edge designs and exclusive styles.
                </p>
                <button className="flex items-center text-teal-700 font-semibold text-lg transition-transform">
                  Buy it now
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 transform transition-transform"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </div>
              <div>
                <Image
                  src="/PUMA-x-LAMELO-BALL-Golden-Child-Men's-Basketball-Tee-Photoroom.png"
                  alt="New Collection - Person wearing stylish outfit"
                  width={500}
                  height={400}
                  className="rounded-lg transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="gradient-wave-hover py-12 mt-12 rounded-xl overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="max-w-md mb-8 md:mb-0">
                <h2 className="text-4xl font-bold text-teal-800 mb-6">New Summer Deals</h2>
                <p className="text-teal-700 mb-8">
                  Get ready for summer with our exclusive deals on sportswear and accessories. Embrace the sunshine in style!
                </p>
                <button className="flex items-center text-teal-700 font-semibold text-lg transition-transform">
                  Shop Now
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 transform transition-transform"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </div>
              <div>
                <Image
                  src="/U+NK+SB+TEE+M90+OC+TOW-Photoroom.png"
                  alt="Summer Deals - Person enjoying summer"
                  width={500}
                  height={400}
                  className="rounded-lg transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </main>
  )
}

// Product Card Component
interface ProductCardProps {
  id: string;
  images: string[];
  name: string;
  price: number;
  rating: number;
}

function ProductCard({ id, images, name, price, rating }: ProductCardProps) {
  return (
    <Link href={`/product/${id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-square">
          <Image
            src={images[0] || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 truncate">{name}</h3>
          <p className="font-bold text-teal-600 mt-1">৳{price.toFixed(2)}</p>
          <div className="flex items-center mt-2">
            <div className="flex text-yellow-400">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <span key={i}>{i < Math.floor(rating) ? "★" : "☆"}</span>
                ))}
            </div>
            <span className="ml-1 text-sm text-gray-600">{rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
