'use client';
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight, ChevronLeft, User, ShoppingCart, Star, Menu, Package, LogOut } from "lucide-react";
import { useState } from "react";
import { products } from '@/app/utils/productUtils';
import { useUser } from '../context/UserContext';

function MobileNav({ user, logout }: { user?: any, logout?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  return (
    <nav className="w-full bg-teal-700 text-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <Image src="/Adobe Express - file.png?height=32&width=32" alt="GenWear Logo" width={32} height={32} />
          <span className="text-lg font-bold">GenWear</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(o => !o)} className="md:hidden">
            <Menu className="w-7 h-7" />
          </button>
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
      {open && (
        <div className="flex flex-col gap-2 px-4 pb-3 bg-teal-800">
          <Link href="/browse" className="py-2 border-b border-teal-600">Browse</Link>
          <Link href="/contact" className="py-2 border-b border-teal-600">Contact</Link>
          {!user && <Link href="/sign-up" className="py-2 border-b border-teal-600">Sign Up</Link>}
          <Link href="/about" className="py-2">About Us</Link>
        </div>
      )}
    </nav>
  );
}

function MobileSearchBar({ products }: { products: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);
  return (
    <div className="relative w-full px-2 py-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search Product"
          className="bg-transparent outline-none w-full text-base"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      {isOpen && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[200px] overflow-y-auto z-50">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <Link
                key={index}
                href={`/product/${product.id}`}
                className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                onClick={() => {
                  setSearchQuery('');
                  setIsOpen(false);
                }}
              >
                <div className="relative w-8 h-8">
                  <Image src={product.images[0]} alt={product.name} fill className="object-contain" />
                </div>
                <div>
                  <div className="text-xs font-medium">{product.name}</div>
                  <div className="text-xs text-gray-500">৳{product.price.toFixed(2)}</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-2 text-center text-gray-500 text-xs">No products found</div>
          )}
        </div>
      )}
    </div>
  );
}

const MobileProductCard = ({ id, images, name, price, rating }: any) => (
  <Link href={`/product/${id}`} className="block bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm mb-3">
    <div className="relative w-full aspect-square">
      <Image src={images[0]} alt={name} fill className="object-cover" />
    </div>
    <div className="p-2">
      <h3 className="font-semibold text-gray-800 text-sm truncate">{name}</h3>
      <p className="font-bold text-teal-600 text-sm mt-1">৳{price.toFixed(2)}</p>
      <div className="flex items-center mt-1">
        <div className="flex text-yellow-400 text-xs">
          {Array(5).fill(0).map((_, i) => (
            <span key={i}>{i < Math.floor(rating) ? "★" : "☆"}</span>
          ))}
        </div>
        <span className="ml-1 text-xs text-gray-600">{rating}</span>
      </div>
    </div>
  </Link>
);

export default function MobileHome() {
  // Use real user context if available
  const { user, logout } = useUser ? useUser() : { user: undefined, logout: undefined };

  const shoesProducts = products.filter(product => product.category === 'shoes');
  const clothingProducts = products.filter(product => product.category === 'clothing');
  const accessoriesProducts = products.filter(product => product.category === 'accessories');

  return (
    <div className="min-h-screen bg-white flex flex-col w-full max-w-md mx-auto">
      {/* Video Background */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
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
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between">
          <MobileNav user={user} logout={logout} />
        </div>
      </div>
      {/* Blue Banner */}
      <div className="w-full py-4 flex justify-center overflow-hidden bg-[#00e0c6] relative">
        {/* Left GIF */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
          <Image src="/gif-1-unscreen.gif" alt="Left animation" width={80} height={80} className="object-contain" />
        </div>
        {/* Right GIF */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
          <Image src="/gif-2-unscreen.gif" alt="Right animation" width={80} height={80} className="object-contain" />
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-[#00f2d8] opacity-30"></div>
        <div className="absolute top-1/2 left-1/4 w-6 h-6 rounded-full bg-[#00f2d8] opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-8 h-8 rounded-full bg-[#00f2d8] opacity-30"></div>
        <div className="absolute top-1/3 right-4 w-8 h-8 rounded-full bg-[#00f2d8] opacity-20"></div>
        {/* Wavy Lines */}
        <svg className="absolute left-0 top-0 h-full w-1/5 opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,30 50,50 T100,50 T150,50" stroke="white" strokeWidth="5" fill="none" />
          <path d="M0,70 Q25,50 50,70 T100,70 T150,70" stroke="white" strokeWidth="5" fill="none" />
        </svg>
        <svg className="absolute right-0 bottom-0 h-full w-1/5 opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,30 50,50 T100,50 T150,50" stroke="white" strokeWidth="5" fill="none" />
          <path d="M0,70 Q25,50 50,70 T100,70 T150,70" stroke="white" strokeWidth="5" fill="none" />
        </svg>
        <div className="flex gap-2 px-2 max-w-full relative z-10">
          <Image src="/JORDAN+6+RINGS-Photoroom.png?height=60&width=60" alt="Basketball shoes" width={60} height={60} className="object-contain" />
          <Image src="/NIKE+VOMERO+18 (1)-Photoroom.png?height=60&width=60" alt="White sneakers" width={60} height={60} className="object-contain" />
          <Image src="/Samba_OG_Shoes_White_JH5633_04_standard-Photoroom.png?height=60&width=60" alt="Colorful sneakers" width={60} height={60} className="object-contain" />
          <Image src="/ALL_SZN_Fleece_Hoodie_Pink_JI6395_01_laydown-Photoroom.png?height=60&width=60" alt="T-shirts" width={60} height={60} className="object-contain" />
          <Image src="/Boston_Marathonr_2025_Own_the_Run_Celebration_Jacket_Blue_JN3002_HM30-Photoroom.png?height=60&width=60" alt="Sports jacket" width={60} height={60} className="object-contain hidden md:block" />
          <Image src="/FENTY-x-PUMA-Avanti-LS-Stitched-Men's-Sneakers-Photoroom.png?height=60&width=60" alt="Yellow shoes" width={60} height={60} className="object-contain hidden md:block" />
        </div>
      </div>
      {/* Search Bar */}
      <MobileSearchBar products={products} />

      {/* Shoes Section */}
      <section className="mt-2 px-2">
        <h2 className="text-base font-bold text-teal-800 mb-2">Shoes</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300" style={{ WebkitOverflowScrolling: 'touch' }}>
          {shoesProducts.map((product: any, index: number) => (
            <div key={index} className="min-w-[48%] max-w-[48%] snap-center">
              <MobileProductCard {...product} />
            </div>
          ))}
        </div>
      </section>

      {/* Clothing Section */}
      <section className="mt-4 px-2">
        <h2 className="text-base font-bold text-teal-800 mb-2">Clothing</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300" style={{ WebkitOverflowScrolling: 'touch' }}>
          {clothingProducts.map((product: any, index: number) => (
            <div key={index} className="min-w-[48%] max-w-[48%] snap-center">
              <MobileProductCard {...product} />
            </div>
          ))}
        </div>
      </section>

      {/* Accessories Section */}
      <section className="mt-4 px-2 mb-4">
        <h2 className="text-base font-bold text-teal-800 mb-2">Accessories</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300" style={{ WebkitOverflowScrolling: 'touch' }}>
          {accessoriesProducts.map((product: any, index: number) => (
            <div key={index} className="min-w-[48%] max-w-[48%] snap-center">
              <MobileProductCard {...product} />
            </div>
          ))}
        </div>
      </section>

      {/* Promo Cards */}
      <div className="px-2 mt-2 flex flex-col gap-4 mb-4">
        <Link href="/promotions#summer">
          <div className="bg-[#e8fcff] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-[#d0f7ff] relative flex flex-col">
            <div className="p-4">
              <h3 className="text-base font-bold text-teal-800">Check out the new summer collections</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-medium text-sm">Check it out</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex justify-end">
              <Image src="/U+NK+SB+TEE+M90+OC+TOW-Photoroom.png" alt="Summer collection" width={100} height={100} className="object-cover" />
            </div>
          </div>
        </Link>
        <Link href="/promotions#featured">
          <div className="bg-[#a1ffa1] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-[#8eff8e] relative flex flex-col">
            <div className="p-4">
              <h3 className="text-base font-bold text-teal-800">New and Featured</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-medium text-sm">Buy it now</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex justify-end">
              <Image src="/PUMA-x-LAMELO-BALL-Golden-Child-Men's-Basketball-Tee-Photoroom.png" alt="Featured collection" width={100} height={100} className="object-cover" />
            </div>
          </div>
        </Link>
        <Link href="/promotions#limited">
          <div className="bg-[#e8d8ff] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-[#d8c8ff] relative flex flex-col">
            <div className="p-4">
              <h3 className="text-base font-bold text-purple-800">Limited Edition Collection</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-medium text-sm">Explore now</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex justify-end">
              <Image src="/JORDAN+6+RINGS-Photoroom.png" alt="Limited edition collection" width={100} height={100} className="object-cover" />
            </div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-black text-center text-xs text-white py-6 mt-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Image src="/Adobe Express - file.png?height=24&width=24" alt="GenWear Logo" width={24} height={24} />
            <span className="font-bold text-white">GenWear</span>
          </div>
          <div className="flex gap-4">
            <Link href="/browse" className="text-white hover:underline">Browse</Link>
            <Link href="/contact" className="text-white hover:underline">Contact</Link>
            <Link href="/about" className="text-white hover:underline">About</Link>
          </div>
          <div className="text-gray-400">&copy; {new Date().getFullYear()} GenWear. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
} 