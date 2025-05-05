'use client';

import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

interface CartIconProps {
  className?: string;
}

export default function CartIcon({ className }: CartIconProps) {
  const { items } = useCart();

  return (
    <Link href="/cart" className="relative">
      <FaShoppingCart className={`text-2xl ${className}`} />
      {items.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {items.length}
        </span>
      )}
    </Link>
  );
} 