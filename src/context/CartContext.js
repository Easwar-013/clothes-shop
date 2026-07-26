'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Get unique key for the current user (e.g. attire_cart_user@email.com)
  const userId = session?.user?.email || session?.user?.id;
  const storageKey = userId ? `attire_cart_${userId}` : null;

  // 1. Sync cart state when session or user changes
  useEffect(() => {
    if (status === 'authenticated' && storageKey) {
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse saved cart', e);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } else if (status === 'unauthenticated') {
      // Clear memory state on sign-out without deleting user's saved cart in localStorage
      setCart([]);
    }
  }, [status, storageKey]);

  // 2. Automatically save cart to user-specific localStorage whenever cart updates
  useEffect(() => {
    if (typeof window !== 'undefined' && status === 'authenticated' && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    }
  }, [cart, storageKey, status]);

  const addToCart = (product, size = 'M', color = 'Default', quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item._id === product._id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prevCart, { ...product, size, color, quantity }];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId, size, color) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item._id === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (productId, size, color, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId && item.size === size && item.color === color
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cart.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}