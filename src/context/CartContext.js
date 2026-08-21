'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
      setCart([]);
    }
  }, [status, storageKey]);

  // 2. Automatically save cart to user-specific localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && status === 'authenticated' && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    }
  }, [cart, storageKey, status]);

  const addToCart = (product, size = 'M', color = 'Default', quantity = 1, openDrawer = true) => {
    const parsedQty = Math.max(1, Number(quantity) || 1);
    const prodId = String(product._id || product.id);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => String(item._id) === prodId && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentQty = Number(updated[existingIndex].quantity) || 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + parsedQty,
        };
        return updated;
      }

      return [...prevCart, { ...product, _id: prodId, size, color, quantity: parsedQty }];
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (productId, size, color) => {
    const prodId = String(productId);
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(String(item._id) === prodId && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (productId, size, color, newQty) => {
    const parsedQty = Number(newQty);
    const prodId = String(productId);

    if (parsedQty <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        String(item._id) === prodId && item.size === size && item.color === color
          ? { ...item, quantity: parsedQty }
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

  const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const cartTotal = cart.reduce(
    (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
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