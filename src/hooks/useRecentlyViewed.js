// src/hooks/useRecentlyViewed.js
'use client';
import { useState, useEffect } from 'react';

const RECENT_KEY = 'recently_viewed_products';

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentProducts(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse recently viewed items', e);
    }
  }, []);

  const addRecentlyViewed = (product) => {
    if (!product || !product._id) return;

    try {
      const stored = localStorage.getItem(RECENT_KEY);
      let list = stored ? JSON.parse(stored) : [];

      // Remove duplicates
      list = list.filter((item) => item._id !== product._id);

      // Add new product to the front
      list.unshift(product);

      // Keep only top 8
      const trimmedList = list.slice(0, 8);

      localStorage.setItem(RECENT_KEY, JSON.stringify(trimmedList));
      setRecentProducts(trimmedList);
    } catch (e) {
      console.error('Failed to save recently viewed product', e);
    }
  };

  return { recentProducts, addRecentlyViewed };
}