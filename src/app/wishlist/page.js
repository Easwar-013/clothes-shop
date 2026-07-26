'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, markAsRead } = useWishlist();
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);

  // Automatically mark wishlist as read when the user views this page
  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  const handleQuickAdd = (product, finalPrice, e) => {
    e.preventDefault();
    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0] || 'Default';

    addToCart({ ...product, price: finalPrice }, defaultSize, defaultColor, 1);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white text-gray-900 min-h-screen">
      <Link
        href="/catalog"
        className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-indigo-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Catalog
      </Link>

      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>My Wishlist</span>
            <Heart className="w-6 h-6 fill-red-500 text-red-500" />
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {wishlist.length} saved item{wishlist.length === 1 ? '' : 's'} to review or add to cart.
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300 max-w-xl mx-auto">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900">Your wishlist is empty</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Explore items in our catalog and click the heart icon to save your favorites.
          </p>
          <Link
            href="/catalog"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow-md"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const rawPrice = Number(product.price) || 0;
            const rawOffer = Number(product.offer) || 0;
            const hasOffer = rawOffer > 0;
            const finalPrice = hasOffer
              ? rawPrice - (rawPrice * rawOffer) / 100
              : rawPrice;

            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <Link href={`/product/${product._id}`} className="block relative">
                  <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}

                    <button
                      onClick={(e) => toggleWishlist(product, e)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-red-500 hover:bg-red-50 transition shadow-sm border border-gray-100"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Link>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <Link href={`/product/${product._id}`}>
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1 hover:text-indigo-600 transition">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-1">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-lg font-black text-gray-900">
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </span>
                      {hasOffer && (
                        <span className="text-xs font-bold text-gray-400 line-through">
                          ₹{rawPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(product, finalPrice, e)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                        addedId === product._id
                          ? 'bg-green-600 text-white'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{addedId === product._id ? 'Added' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}