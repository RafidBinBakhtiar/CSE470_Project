'use client';

import Image from "next/image"
import Link from "next/link"
import { Search, Mail, Bell, User, Menu, ChevronRight, ChevronLeft, Star, Plus, LogOut, Settings, Package } from "lucide-react"
import { useState } from "react"
import { useUser } from './context/UserContext'
import Footer from '../components/ui/Footer'
import { cn } from '../lib/utils'
import CartIcon from './components/CartIcon'
import { products, getProductWithReviews, calculateAverageRating } from '@/app/utils/productUtils'

// Helper function to get all products
const getAllProducts = (shoesProducts: any[], clothingProducts: any[], accessoriesProducts: any[]) => {
  const allProducts = [
    ...shoesProducts.flat().map(product => ({ ...product, category: 'Shoes' })),
    ...clothingProducts.flat().map(product => ({ ...product, category: 'Clothing' })),
    ...accessoriesProducts.flat().map(product => ({ ...product, category: 'Accessories' }))
  ];
  return allProducts;
};

function SearchBar({ products }: { products: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5); // Limit to 5 suggestions

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search Product"
          className="bg-transparent outline-none w-64 text-base"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      
      {/* Search Results Dropdown */}
      {isOpen && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto z-50">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <Link
                key={index}
                href={`/product/${product.id}`}
                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                onClick={() => {
                  setSearchQuery('');
                  setIsOpen(false);
                }}
              >
                <div className="relative w-12 h-12">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium">{product.name}</div>
                  <div className="text-xs text-gray-500">৳{product.price.toFixed(2)}</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500">No products found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [currentShoesPage, setCurrentShoesPage] = useState(0);
  const [currentClothingPage, setCurrentClothingPage] = useState(0);
  const [currentAccessoriesPage, setCurrentAccessoriesPage] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useUser();

  // Filter products by category
  const shoesProducts = products.filter(product => product.category === 'shoes');
  const clothingProducts = products.filter(product => product.category === 'clothing');
  const accessoriesProducts = products.filter(product => product.category === 'accessories');

  // Split products into pages of 5 items each
  const shoesPages = [];
  const clothingPages = [];
  const accessoriesPages = [];

  for (let i = 0; i < shoesProducts.length; i += 5) {
    shoesPages.push(shoesProducts.slice(i, i + 5));
  }

  for (let i = 0; i < clothingProducts.length; i += 5) {
    clothingPages.push(clothingProducts.slice(i, i + 5));
  }

  for (let i = 0; i < accessoriesProducts.length; i += 5) {
    accessoriesPages.push(accessoriesProducts.slice(i, i + 5));
  }

  // Get all products for search
  const allProducts = products;

  const handleNextPage = (section: 'shoes' | 'clothing' | 'accessories') => {
    switch(section) {
      case 'shoes':
        if (currentShoesPage < shoesPages.length - 1) setCurrentShoesPage(prev => prev + 1);
        break;
      case 'clothing':
        if (currentClothingPage < clothingPages.length - 1) setCurrentClothingPage(prev => prev + 1);
        break;
      case 'accessories':
        if (currentAccessoriesPage < accessoriesPages.length - 1) setCurrentAccessoriesPage(prev => prev + 1);
        break;
    }
  };

  const handlePrevPage = (section: 'shoes' | 'clothing' | 'accessories') => {
    switch(section) {
      case 'shoes':
        setCurrentShoesPage(prev => Math.max(0, prev - 1));
        break;
      case 'clothing':
        setCurrentClothingPage(prev => Math.max(0, prev - 1));
        break;
      case 'accessories':
        setCurrentAccessoriesPage(prev => Math.max(0, prev - 1));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Combined Video and Banner Container */}
      <div className="relative">
        {/* Video Background - Fixed aspect ratio container */}
        <div className="w-full relative" style={{ paddingTop: '56.25%' }}> {/* 16:9 aspect ratio */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/AIRFLUX 20.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Header - Positioned absolutely over the video */}
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 md:px-8 z-20 bg-transparent border-b-0">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              <Image
                src="/Adobe Express - file.png?height=32&width=32"
                alt="GenWear Logo"
                width={32}
                height={32}
                className="text-teal-500"
              />
              <span className="text-xl font-bold text-teal-800">GenWear</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/browse" className="font-medium text-white">
                Browse
              </Link>
              <Link href="/contact" className="font-medium text-white">
                Contact
              </Link>
              {!user && (
                <Link href="/sign-up" className="font-medium text-white">
                  Sign Up
                </Link>
              )}
              <Link href="/about" className="font-medium text-white">
                About Us
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <SearchBar products={allProducts} />
            </div>
            <div>
              <CartIcon className="text-white hover:text-teal-200 transition-colors" />
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
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
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
                <User className="w-6 h-6 text-white" />
              </Link>
            )}
          </div>
        </header>

        {/* Banner with Decorative Elements - Directly below video with no gap */}
        <div className="w-full py-4 flex justify-center overflow-hidden bg-[#00e0c6] relative">
          {/* Left GIF */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 z-10">
            <Image 
              src="/gif-1-unscreen.gif" 
              alt="Left animation" 
              width={250} 
              height={250}
              className="object-contain"
            />
          </div>

          {/* Right GIF */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 z-10">
            <Image 
              src="/gif-2-unscreen.gif" 
              alt="Right animation" 
              width={250} 
              height={250}
              className="object-contain"
            />
          </div>

          {/* Decorative Circles - Properly contained within the banner */}
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full bg-[#00f2d8] opacity-30"></div>
          <div className="absolute top-1/2 left-1/4 w-10 h-10 rounded-full bg-[#00f2d8] opacity-20"></div>
          <div className="absolute bottom-0 right-1/4 w-12 h-12 rounded-full bg-[#00f2d8] opacity-30"></div>
          <div className="absolute top-1/3 right-10 w-14 h-14 rounded-full bg-[#00f2d8] opacity-20"></div>

          {/* Wavy Lines - Properly contained within the banner */}
          <svg
            className="absolute left-0 top-0 h-full w-1/5 opacity-10"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0,50 Q25,30 50,50 T100,50 T150,50" stroke="white" strokeWidth="5" fill="none" />
            <path d="M0,70 Q25,50 50,70 T100,70 T150,70" stroke="white" strokeWidth="5" fill="none" />
          </svg>

          <svg
            className="absolute right-0 bottom-0 h-full w-1/5 opacity-10"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0,50 Q25,30 50,50 T100,50 T150,50" stroke="white" strokeWidth="5" fill="none" />
            <path d="M0,70 Q25,50 50,70 T100,70 T150,70" stroke="white" strokeWidth="5" fill="none" />
          </svg>

          <div className="flex gap-4 md:gap-8 px-4 max-w-7xl relative z-10">
            <Image
              src="/JORDAN+6+RINGS-Photoroom.png?height=150&width=150"
              alt="Basketball shoes"
              width={150}
              height={150}
              className="object-contain"
            />
            <Image
              src="/NIKE+VOMERO+18 (1)-Photoroom.png?height=150&width=150"
              alt="White sneakers"
              width={150}
              height={150}
              className="object-contain"
            />
            <Image
              src="/Samba_OG_Shoes_White_JH5633_04_standard-Photoroom.png?height=150&width=150"
              alt="Colorful sneakers"
              width={150}
              height={150}
              className="object-contain"
            />
            <Image
              src="/ALL_SZN_Fleece_Hoodie_Pink_JI6395_01_laydown-Photoroom.png?height=150&width=150"
              alt="T-shirts"
              width={150}
              height={150}
              className="object-contain"
            />
            <Image
              src="/Boston_Marathonr_2025_Own_the_Run_Celebration_Jacket_Blue_JN3002_HM30-Photoroom.png?height=150&width=150"
              alt="Sports jacket"
              width={150}
              height={150}
              className="object-contain hidden md:block"
            />
            <Image
              src="/FENTY-x-PUMA-Avanti-LS-Stitched-Men's-Sneakers-Photoroom.png?height=150&width=150"
              alt="Yellow shoes"
              width={150}
              height={150}
              className="object-contain hidden md:block"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 pb-12 relative">
        {/* Main Content */}
        <div className="pl-8 pr-96 mt-8">
          {/* Shoes Section */}
          <section>
            <h2 className="text-xl font-bold text-teal-800 mb-4">Shoes</h2>
            
            <div className="flex">
              <div className="relative w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {shoesPages[currentShoesPage].map((product, index) => (
                    <ProductCard
                      key={index}
                      id={product.id}
                      images={product.images}
                      name={product.name}
                      price={product.price}
                    />
                  ))}
                </div>

                {currentShoesPage > 0 && (
                  <button
                    onClick={() => handlePrevPage('shoes')}
                    className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 z-20 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {currentShoesPage < shoesPages.length - 1 && (
                  <button
                    onClick={() => handleNextPage('shoes')}
                    className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 z-20 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Link href="/browse" className="flex items-center text-sm font-medium">
                See all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </section>

          {/* Clothing Section */}
          <section className="mt-12">
            <h2 className="text-xl font-bold text-teal-800 mb-4">Clothing</h2>
            
            <div className="flex">
              <div className="relative w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {clothingPages[currentClothingPage].map((product, index) => (
                    <ProductCard
                      key={index}
                      id={product.id}
                      images={product.images}
                      name={product.name}
                      price={product.price}
                    />
                  ))}
                </div>

                {currentClothingPage > 0 && (
                  <button
                    onClick={() => handlePrevPage('clothing')}
                    className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 z-10 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {currentClothingPage < clothingPages.length - 1 && (
                  <button
                    onClick={() => handleNextPage('clothing')}
                    className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 z-10 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Link href="/browse" className="flex items-center text-sm font-medium">
                See all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </section>

          {/* Accessories Section */}
          <section className="mt-12">
            <h2 className="text-xl font-bold text-teal-800 mb-4">Accessories</h2>
            
            <div className="flex">
              <div className="relative w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {accessoriesPages[currentAccessoriesPage].map((product, index) => (
                    <ProductCard
                      key={index}
                      id={product.id}
                      images={product.images}
                      name={product.name}
                      price={product.price}
                    />
                  ))}
                </div>

                {currentAccessoriesPage > 0 && (
                  <button
                    onClick={() => handlePrevPage('accessories')}
                    className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 z-10 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {currentAccessoriesPage < accessoriesPages.length - 1 && (
                  <button
                    onClick={() => handleNextPage('accessories')}
                    className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 z-10 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Link href="/browse" className="flex items-center text-sm font-medium">
                See all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </section>
        </div>

        {/* Promo Cards */}
        <div className="absolute top-[10rem] right-16 w-72">
          <Link href="/promotions#summer">
            <div className="bg-[#e8fcff] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-[#d0f7ff] relative">
              {/* Decorative circles */}
              <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-[#00e0c6] opacity-20"></div>
              <div className="absolute bottom-20 right-4 w-12 h-12 rounded-full bg-[#00e0c6] opacity-20"></div>
              
              {/* Decorative lines */}
              <div className="absolute top-12 left-8 w-24 h-1 bg-[#00e0c6] opacity-30 transform -rotate-12"></div>
              <div className="absolute bottom-16 right-8 w-16 h-1 bg-[#00e0c6] opacity-30 transform rotate-12"></div>
              
              <div className="p-6 relative z-10">
                <h3 className="text-xl font-bold text-teal-800">Check out the new summer collections</h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="font-medium">Check it out</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              <div className="flex justify-end relative z-10">
                <Image 
                  src="/U+NK+SB+TEE+M90+OC+TOW-Photoroom.png" 
                  alt="Summer collection" 
                  width={200} 
                  height={200}
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
            </div>
          </Link>

          <Link href="/promotions#featured">
            <div className="bg-[#a1ffa1] rounded-xl overflow-hidden mt-16 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-[#8eff8e] relative">
              {/* Decorative circles */}
              <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-[#00e0c6] opacity-20"></div>
              <div className="absolute bottom-20 left-4 w-12 h-12 rounded-full bg-[#00e0c6] opacity-20"></div>
              
              {/* Decorative lines */}
              <div className="absolute top-12 right-8 w-24 h-1 bg-[#00e0c6] opacity-30 transform rotate-12"></div>
              <div className="absolute bottom-16 left-8 w-16 h-1 bg-[#00e0c6] opacity-30 transform -rotate-12"></div>
              
              <div className="p-6 relative z-10">
                <h3 className="text-xl font-bold text-teal-800">New and Featured</h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="font-medium">Buy it now</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              <div className="flex justify-end relative z-10">
                <Image 
                  src="/PUMA-x-LAMELO-BALL-Golden-Child-Men's-Basketball-Tee-Photoroom.png" 
                  alt="Featured collection" 
                  width={200} 
                  height={200}
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
            </div>
          </Link>

          <Link href="/promotions#limited">
            <div className="bg-[#e8d8ff] rounded-xl overflow-hidden mt-16 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-[#d8c8ff] relative">
              {/* Decorative circles */}
              <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-[#9a7aff] opacity-20"></div>
              <div className="absolute bottom-20 right-4 w-12 h-12 rounded-full bg-[#9a7aff] opacity-20"></div>
              
              {/* Decorative lines */}
              <div className="absolute top-12 left-8 w-24 h-1 bg-[#9a7aff] opacity-30 transform -rotate-12"></div>
              <div className="absolute bottom-16 right-8 w-16 h-1 bg-[#9a7aff] opacity-30 transform rotate-12"></div>
              
              <div className="p-6 relative z-10">
                <h3 className="text-xl font-bold text-purple-800">Limited Edition Collection</h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="font-medium">Explore now</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              <div className="flex justify-end relative z-10">
                <Image 
                  src="/JORDAN+6+RINGS-Photoroom.png" 
                  alt="Limited edition collection" 
                  width={200} 
                  height={200}
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
            </div>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

interface ProductCardProps {
  id: string;
  images: string[];
  name: string;
  price: number;
  className?: string;
}

const ProductCard = ({ id, images, name, price, className }: ProductCardProps) => {
  const { isAuthenticated } = useUser();
  const product = getProductWithReviews(id);
  const averageRating = product ? calculateAverageRating(id) : 0;
  const reviewCount = product?.reviews?.length || 0;

  return (
    <Link href={`/product/${id}`} className={cn("group", className)}>
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
        <Image
          src={images[0]}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-gray-900">৳{price.toFixed(2)}</p>
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-400">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
            </div>
            <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
