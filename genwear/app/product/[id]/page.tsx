// This file implements the product detail view, including images, descriptions, and specifications.
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, Star, Truck, RotateCcw, Shield, Heart, Plus, Menu, Mail, Bell, User, Settings, LogOut, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Footer from '@/components/ui/Footer';
import { getProductById, getProductByName, getSimilarProducts } from '@/app/utils/productUtils';
import { useUser } from '@/app/context/UserContext';
import { useCart } from '@/app/context/CartContext';
import CartIcon from '../../components/CartIcon';
import IframeModelViewer from '@/app/components/IframeModelViewer';

// CSS for hiding scrollbar
const styles = `
  @layer utilities {
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  }
`;

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useUser();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [show3DModel, setShow3DModel] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const productIdOrName = params.id as string;
    let productData = getProductById(productIdOrName);
    
    // If not found by ID, try finding by name
    if (!productData) {
      productData = getProductByName(productIdOrName);
    }

    if (productData) {
      setProduct(productData);
      // Get similar products based on the product name
      const similarProducts = getSimilarProducts(productData.name);
      setSimilarProducts(similarProducts);
    } else {
      // If product not found, redirect to browse page
      router.push('/browse');
    }
    
    setLoading(false);
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    if (!selectedColor) {
      alert('Please select a color');
      return;
    }
    
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity,
        size: selectedSize,
        color: selectedColor // Use the direct color property for regular product colors
      });
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  // Add this function to get the 3D model URL based on product name
  const get3DModelUrl = (productName: string) => {
    // For now, only return the URL for Nike Air Jordan Luka 3
    if (productName.toLowerCase().includes('jordan luka 3')) {
      return '/Jordan Luka 3.glb';
    }
    if (productName.toLowerCase().includes('jordan 6 rings')) {
      return '/Jordan 6 Rings.glb';
    }
    // Add support for PUMA x LAMELO BALL Golden Child
    if (productName.toLowerCase().includes('puma') && productName.toLowerCase().includes('lamelo') && productName.toLowerCase().includes('golden')) {
      return '/PUMA x Lamelo Golden.glb';
    }
    if (productName.toLowerCase().includes('puma') && productName.toLowerCase().includes('fenty')) {
      return '/Fenty x PUMA Avanti LS Stitched.glb';
    }
    if (productName.toLowerCase().includes('nike') && productName.toLowerCase().includes('vomero')) {
      return '/Nike Vomero 18.glb';
    }
    if (productName.toLowerCase().includes('f1')) {
      return '/F1 Japan Tee.glb';
    }
    if (productName.toLowerCase().includes('jordan') && productName.toLowerCase().includes('1 mid')) {
      return '/Jordan 1 Mid.glb';
    }
    if (productName.toLowerCase().includes('adidas') && productName.toLowerCase().includes('camo')) {
      return '/adidas Essentials Camo Pants.glb';
    }
    // Add support for PUMA Blue Tee
    if (productName.toLowerCase().includes('puma') && productName.toLowerCase().includes('blue tee')) {
      return '/Blue PUMA Tee.glb';
    }
    if (productName.toLowerCase().includes('adidas') && productName.toLowerCase().includes('hoodie')) {
      return '/adidas NY Bulls Red Hoodie.glb';
    }
    // Add support for adidas Samba OG Shoes
    if (productName.toLowerCase().includes('adidas') && productName.toLowerCase().includes('samba')) {
      return '/adidas Samba OG Shoes.glb';
    }
    // Add support for adidas Black Shorts Sports
    if (productName.toLowerCase().includes('adidas') && productName.toLowerCase().includes('shorts')) {
      return '/adidas Black Shorts Sports.glb';
    }
    if (productName.toLowerCase().includes('nike') && productName.toLowerCase().includes('dri-fit')) {
      return '/Nike Dri-FIT Legacy91 Cap.glb';
    }
    if (productName.toLowerCase().includes('adidas') && productName.toLowerCase().includes('backpack')) {
      return '/adidas Classic Backpack.glb';
    }
    if (productName.toLowerCase().includes('puma') && productName.toLowerCase().includes('pioneer')) {
      return '/PUMA Pioneer Wallet.glb';
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{styles}</style>
      
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/Adobe Express - file.png"
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

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-teal-600">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/browse" className="hover:text-teal-600">Browse</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {show3DModel ? (
              get3DModelUrl(product.name) ? (
                <IframeModelViewer modelUrl={get3DModelUrl(product.name) as string} />
              ) : (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">3D model not available for this product</p>
                </div>
              )
            ) : (
              <>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-teal-600 transition-colors"
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {/* Add 3D Model Toggle Button */}
            <button
              onClick={() => setShow3DModel(!show3DModel)}
              className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {show3DModel ? 'Show Product Images' : 'Show 3D Model'}
            </button>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-2xl font-bold text-teal-600">
              ৳{product.price.toFixed(2)}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size: string) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color: string) => {
                    // Check if it's a dual color (contains a slash)
                    const isDualColor = color.includes('/');
                    
                    if (isDualColor) {
                      // Split the color into two parts
                      const [color1, color2] = color.split('/');
                      const color1Value = getColorValue(color1);
                      const color2Value = getColorValue(color2);
                      
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden relative ${
                            selectedColor === color 
                              ? 'border-teal-600' 
                              : 'border-gray-300'
                          }`}
                          title={color}
                        >
                          {/* First half of the circle */}
                          <div 
                            className="absolute top-0 left-0 w-1/2 h-full"
                            style={{ backgroundColor: color1Value }}
                          ></div>
                          
                          {/* Second half of the circle */}
                          <div 
                            className="absolute top-0 right-0 w-1/2 h-full"
                            style={{ backgroundColor: color2Value }}
                          ></div>
                          
                          {/* Checkmark for selected color */}
                          {selectedColor === color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      );
                    } else {
                      // Single color
                      const colorValue = getColorValue(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                            selectedColor === color 
                              ? 'border-teal-600' 
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: colorValue }}
                          title={color}
                        >
                          {selectedColor === color && (
                            <Check className="w-5 h-5 text-white" />
                          )}
                        </button>
                      );
                    }
                  })}
                </div>
                {selectedColor && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: <span className="font-medium">{selectedColor}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-20"
                  />
                  <div className="flex-1 flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={handleAddToCart}
                    >
                      {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                    </Button>
                    <Link href={`/customize/${product.id}`}>
                      <Button 
                        variant="outline"
                        className="flex-1"
                      >
                        Customize
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-5 h-5" />
                <span>Free shipping on orders over ৳1000</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="w-5 h-5" />
                <span>30-day return policy</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-5 h-5" />
                <span>2-year warranty</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Features</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {product.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Similar Products</h2>
        </div>
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {similarProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.id}`}
                className="flex-shrink-0 w-[250px] group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900">৳{item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{item.rating}</span>
                      <button className="ml-2 p-1 rounded-full hover:bg-gray-100">
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
            onClick={() => {
              const container = document.querySelector('.overflow-x-auto');
              if (container) {
                container.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
          >
            <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
          </button>
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
            onClick={() => {
              const container = document.querySelector('.overflow-x-auto');
              if (container) {
                container.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Helper function to convert color names to actual color values
function getColorValue(colorName: string): string {
  // Map common color names to actual color values
  const colorMap: Record<string, string> = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Red': '#FF0000',
    'Blue': '#0000FF',
    'Green': '#008000',
    'Yellow': '#FFFF00',
    'Purple': '#800080',
    'Orange': '#FFA500',
    'Pink': '#FFC0CB',
    'Brown': '#A52A2A',
    'Grey': '#808080',
    'Navy': '#000080',
    'Gold': '#FFD700',
    'Silver': '#C0C0C0',
    'Dark Cyan': '#0095d4',
    'Navy Blue': '#000080',
    'Black/Red': '#000000',
    'White/Black': '#FFFFFF',
    'Grey/Blue': '#808080',
    'Black/White': '#000000',
    'Navy/White': '#000080',
    'Black/Gold': '#000000',
    'White/Gold': '#FFFFFF',
    'Blue/Gold': '#0000FF',
    'Red/Black': '#FF0000',
    'White/Blue': '#FFFFFF',
    'Grey/Orange': '#808080',
    'Midnight Blue': '#3c4d6d',
  };
  
  return colorMap[colorName] || '#CCCCCC'; // Default to light gray if color not found
} 