'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);

  const userIdentifier = session?.user?.email || session?.user?.id || 'guest';
  const WISHLIST_KEY = `attire_wishlist_${userIdentifier}`;
  const UNREAD_KEY = `attire_wishlist_unread_${userIdentifier}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      const storedUnread = localStorage.getItem(UNREAD_KEY);

      if (stored) {
        setWishlist(JSON.parse(stored));
      } else {
        setWishlist([]);
      }

      setHasUnread(storedUnread ? JSON.parse(storedUnread) : false);
    } catch (e) {
      console.error('Error loading wishlist:', e);
      setWishlist([]);
      setHasUnread(false);
    }
  }, [WISHLIST_KEY, UNREAD_KEY]);

  const toggleWishlist = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!product || !product._id) return;

    try {
      let updatedWishlist = [...wishlist];
      const index = updatedWishlist.findIndex((item) => item._id === product._id);

      if (index > -1) {
        // Remove item
        updatedWishlist.splice(index, 1);
      } else {
        // Add item & mark unread notification as true
        updatedWishlist.push({
          _id: product._id,
          title: product.title,
          price: product.price,
          offer: product.offer,
          images: product.images || [],
          category: product.category,
          description: product.description,
        });

        setHasUnread(true);
        localStorage.setItem(UNREAD_KEY, JSON.stringify(true));
      }

      setWishlist(updatedWishlist);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));

      if (updatedWishlist.length === 0) {
        setHasUnread(false);
        localStorage.setItem(UNREAD_KEY, JSON.stringify(false));
      }
    } catch (e) {
      console.error('Error updating wishlist:', e);
    }
  };

  const markAsRead = () => {
    setHasUnread(false);
    localStorage.setItem(UNREAD_KEY, JSON.stringify(false));
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, hasUnread, toggleWishlist, isInWishlist, markAsRead }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    return {
      wishlist: [],
      hasUnread: false,
      toggleWishlist: () => {},
      isInWishlist: () => false,
      markAsRead: () => {},
    };
  }
  return context;
};