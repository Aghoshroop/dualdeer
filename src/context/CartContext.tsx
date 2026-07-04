"use client";
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { calculateBundleSavings } from '@/lib/bundleLogic';
import * as metaPixel from '@/lib/metaPixel';

export interface CartItem {
  id: string; // Product Firebase ID
  name: string;
  price: number;
  mrp?: number; // Captured to calculate profit/savings metrics
  image: string;
  size: string;
  color?: string; // Optional for now
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  bundleSavings: number;
  appliedBundles: string[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dualdeer_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch (e) {
      console.error("Cart hydration failed", e);
    }
    setIsLoaded(true);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('dualdeer_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (item: CartItem) => {
    // If offer price is 0 but MRP exists, charge the MRP
    const processedItem = { ...item };
    if (processedItem.price === 0 && processedItem.mrp) {
      processedItem.price = processedItem.mrp;
      processedItem.mrp = undefined;
    }

    // Fire Meta Pixel Event
    metaPixel.event('AddToCart', {
      content_name: processedItem.name,
      content_ids: [processedItem.id],
      content_type: 'product',
      value: processedItem.price * processedItem.quantity,
      currency: 'INR',
      num_items: processedItem.quantity
    });

    setCart(prev => {
      // Check if product with exact same ID and Size exists
      const existing = prev.find(p => p.id === processedItem.id && p.size === processedItem.size);
      if (existing) {
        return prev.map(p => 
          (p.id === processedItem.id && p.size === processedItem.size)
            ? { ...p, quantity: p.quantity + processedItem.quantity }
            : p
        );
      }
      return [...prev, processedItem];
    });
  };

  const removeFromCart = (id: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id: string, size: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.size === size) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Calculate bundle savings dynamically
  const { bundleSavings, appliedBundles } = useMemo(() => {
    return calculateBundleSavings(cart);
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, bundleSavings, appliedBundles }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
