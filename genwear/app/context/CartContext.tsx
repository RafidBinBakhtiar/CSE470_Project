'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { CartItem } from '@/types';

// Define the context type
interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  discountCode: string;
  discountAmount: number;
  applyDiscount: (code: string) => boolean;
  removeDiscount: () => void;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user, token, isAuthenticated } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  
  // Watch for authentication changes and clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
    }
  }, [isAuthenticated]);
  
  // Load cart from localStorage or database on initial render
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      
      if (isAuthenticated && token) {
        try {
          // Fetch cart from database
          const response = await fetch('/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setItems(data.cart || []);
          } else {
            console.error('Failed to fetch cart from database');
            // Fallback to localStorage
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
              try {
                setItems(JSON.parse(savedCart));
              } catch (error) {
                console.error('Error parsing cart from localStorage:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
          // Fallback to localStorage
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              setItems(JSON.parse(savedCart));
            } catch (error) {
              console.error('Error parsing cart from localStorage:', error);
            }
          }
        }
      } else {
        // Not authenticated, use localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (error) {
            console.error('Error parsing cart from localStorage:', error);
          }
        }
      }
      
      setIsLoading(false);
    };
    
    loadCart();
  }, [isAuthenticated, token]);
  
  // Save cart to localStorage and database whenever it changes
  useEffect(() => {
    // Skip the first render to avoid unnecessary API calls
    if (isLoading) return;
    
    // Always save to localStorage with proper serialization
    try {
      const serializedCart = JSON.stringify(items, (key, value) => {
        // Handle undefined values
        if (value === undefined) return null;
        return value;
      });
      localStorage.setItem('cart', serializedCart);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
    
    // If authenticated, also save to database
    if (isAuthenticated && token) {
      const syncCartWithDatabase = async () => {
        try {
          // Update cart in database
          await fetch('/api/cart', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cart: items })
          });
        } catch (error) {
          console.error('Error syncing cart with database:', error);
        }
      };
      
      syncCartWithDatabase();
    }
  }, [items, isAuthenticated, token, isLoading]);
  
  // Calculate total items
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total price with 2 decimal places
  const subtotal = Number(items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2));
  
  // Apply discount to total price
  const totalPrice = Number((subtotal - discountAmount).toFixed(2));
  
  // Apply discount code
  const applyDiscount = (code: string): boolean => {
    const upperCode = code.toUpperCase();
    
    if (upperCode === 'GEN101') {
      setDiscountCode(upperCode);
      setDiscountAmount(Number((subtotal * 0.1).toFixed(2))); // 10% discount
      return true;
    } else if (upperCode === 'GW2025') {
      setDiscountCode(upperCode);
      setDiscountAmount(Number((subtotal * 0.25).toFixed(2))); // 25% discount
      return true;
    } else {
      return false;
    }
  };
  
  // Remove discount
  const removeDiscount = () => {
    setDiscountCode('');
    setDiscountAmount(0);
  };
  
  // Add item to cart
  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if item exists with same ID, size, and customizations
      const existingItem = prevItems.find((item) => 
        item.id === newItem.id && 
        item.size === newItem.size &&
        JSON.stringify(item.customizations) === JSON.stringify(newItem.customizations)
      );
      
      if (existingItem) {
        // If item exists with same properties, increase quantity
        return prevItems.map((item) =>
          item.id === newItem.id && 
          item.size === newItem.size &&
          JSON.stringify(item.customizations) === JSON.stringify(newItem.customizations)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item doesn't exist or has different properties, add as new item
        return [...prevItems, { ...newItem, quantity: 1 }];
      }
    });
  };
  
  // Remove item from cart
  const removeItem = (id: string) => {
    setItems((prevItems) => {
      // Find the item to get its size and customizations
      const itemToRemove = prevItems.find(item => item.id === id);
      if (!itemToRemove) return prevItems;

      // Remove the item with matching id, size, and customizations
      return prevItems.filter(item => 
        !(item.id === id && 
          item.size === itemToRemove.size &&
          JSON.stringify(item.customizations) === JSON.stringify(itemToRemove.customizations))
      );
    });
  };
  
  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  // Clear cart
  const clearCart = () => {
    setItems([]);
  };
  
  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    discountCode,
    discountAmount,
    applyDiscount,
    removeDiscount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 