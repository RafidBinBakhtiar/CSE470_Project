'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star, Truck, RotateCcw, Shield, Heart, Plus, Menu, Mail, Bell, User, Settings, LogOut, Check, Palette, Image as ImageIcon, Download, Undo, ArrowLeft, Save, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Footer from '@/components/ui/Footer';
import { getProductById, getProductByName } from '@/app/utils/productUtils';
import { useUser } from '@/app/context/UserContext';
import { useCart } from '@/app/context/CartContext';
import CartIcon from '../../components/CartIcon';
import IframeModelViewer from '@/app/components/IframeModelViewer';
import { useToast } from '@/hooks/use-toast';
import { Product, CartItem } from '@/types';
import AIChatbox from '@/app/components/AIChatbox';

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

interface CustomizationOptions {
  color: string;
  size: string;
  text: string;
  logo: string;
  pattern: string;
  material: string;
}

interface HistoryEntry {
  color?: string;
  image?: string;
  timestamp: string;
}

export default function CustomizePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useUser();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isFullTexture, setIsFullTexture] = useState(false);
  const [customizationHistory, setCustomizationHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [size, setSize] = useState<string>('M');
  const [customization, setCustomization] = useState<CustomizationOptions>({
    color: '',
    size: 'M',
    text: '',
    logo: '',
    pattern: 'solid',
    material: 'cotton'
  });
  const modelViewerRef = useRef<any>(null);

  // Predefined colors for the color picker
  const colorOptions = [
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Purple', value: '#800080' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
  ];

  useEffect(() => {
    const productIdOrName = params.id as string;
    let productData = getProductById(productIdOrName);
    
    // If not found by ID, try finding by name
    if (!productData) {
      productData = getProductByName(productIdOrName);
    }

    if (productData) {
      setProduct(productData);
      setModelUrl(productData.modelUrl || null);
    } else {
      // If product not found, redirect to browse page
      router.push('/browse');
    }
    
    setLoading(false);
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size before adding to cart",
        variant: "destructive"
      });
      return;
    }

    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      return;
    }

    // Create a unique ID for this specific customization
    const customizedId = `${product.id}-${selectedSize}-${customColor || 'default'}-${customImage ? 'custom' : 'default'}`;

    // Only include customizations if they exist
    const cartItem: CartItem = {
      id: customizedId,
      name: `${product.name}${customColor || customImage ? ' (Customized)' : ''}`,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      size: selectedSize
    };

    // Add customizations only if they exist
    if (customColor || customImage) {
      cartItem.customizations = {};
      if (customColor) cartItem.customizations.color = customColor;
      if (customImage) cartItem.customizations.image = customImage;
    }

    // Add the item to cart
    addItem(cartItem);

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart${customColor || customImage ? ' with customizations' : ''}`,
    });
  };

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    setSelectedColor(color);
    addToHistory({ color });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setCustomImage(imageUrl);
        addToHistory({ image: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const addToHistory = (entry: Omit<HistoryEntry, 'timestamp'>) => {
    const historyEntry: HistoryEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    const newHistory = [...customizationHistory.slice(0, historyIndex + 1), historyEntry];
    setCustomizationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousState = customizationHistory[newIndex];
      
      if (previousState.color) {
        setCustomColor(previousState.color);
      }
      
      if (previousState.image) {
        setCustomImage(previousState.image);
      }
    }
  };

  const redo = () => {
    if (historyIndex < customizationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = customizationHistory[newIndex];
      
      if (nextState.color) {
        setCustomColor(nextState.color);
      }
      
      if (nextState.image) {
        setCustomImage(nextState.image);
      }
    }
  };

  const handleCustomizationApplied = (type: 'color' | 'texture', value: string) => {
    toast({
      title: 'Customization Applied',
      description: `Successfully applied ${type} to the model.`,
    });
  };

  const handleCustomizationChange = (key: keyof CustomizationOptions, value: string) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveDesign = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save your design',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product?.id,
          customization,
          userId: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to save design');

      toast({
        title: 'Success',
        description: 'Your design has been saved'
      });
    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your design',
        variant: 'destructive'
      });
    }
  };

  const handleImageGenerated = (imageUrl: string) => {
    setCustomImage(imageUrl);
    addToHistory({ image: imageUrl });
    
    // Show a toast notification
    toast({
      title: 'Image Generated',
      description: 'The AI has generated an image and applied it to your model.',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <style>{styles}</style>
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-teal-600">
                GenWear
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-gray-600 hover:text-teal-600 font-medium">
                  Home
                </Link>
                <Link href="/browse" className="text-gray-600 hover:text-teal-600 font-medium">
                  Browse
                </Link>
                <Link href="/about" className="text-gray-600 hover:text-teal-600 font-medium">
                  About Us
                </Link>
                <Link href="/contact" className="text-gray-600 hover:text-teal-600 font-medium">
                  Contact
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <CartIcon />
              {isAuthenticated ? (
                <div className="relative">
                  <button 
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    {user?.profileImage ? (
                      <Image 
                        src={user.profileImage} 
                        alt={user.name || 'User'} 
                        width={32} 
                        height={32} 
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button 
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-teal-600">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/browse" className="hover:text-teal-600">Browse</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/product/${product.id}`} className="hover:text-teal-600">{product.name}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Customize</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* 3D Model Viewer - Full Width */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="h-[70vh] min-h-[500px]">
              {modelUrl ? (
                <IframeModelViewer
                  modelUrl={modelUrl}
                  customColor={customColor || undefined}
                  customImage={customImage || undefined}
                  isFullTexture={isFullTexture}
                  onColorChange={(color) => {
                    setCustomColor(color);
                    addToHistory({
                      color: color
                    });
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">3D model not available for this product</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Customization Options */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {/* AI Image Generation Section */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-2">AI Design Assistant</h2>
              <AIChatbox onImageGenerated={handleImageGenerated} />
            </div>
          </div>
          
          {/* Compact Product Info and Add to Cart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-yellow-400">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-teal-600">
                ৳{product.price.toFixed(2)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={handleAddToCart}
            >
              {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 