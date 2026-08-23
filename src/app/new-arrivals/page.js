'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Sparkles, ShoppingBag, Check, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import ClothesLoader from '@/components/ClothesLoader';

const ITEMS_PER_PAGE = 12;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

function NewArrivalsContent() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.products) {
          const sorted = [...data.products].sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
          setProducts(sorted);
        }
      } catch (err) {
        console.error('Failed to load new arrivals:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNewArrivals();
  }, []);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (product, finalPrice, e) => {
    e.preventDefault();
    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0] || 'Default';

    addToCart({ ...product, price: finalPrice }, defaultSize, defaultColor, 1);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  if (loading) {
    return <ClothesLoader text="Curating the latest arrivals..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white text-gray-900 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 sm:p-12 text-white mb-10 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-4 border border-white/20 text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Fresh Off The Rack</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Latest Arrivals
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base mt-3 leading-relaxed">
            Be the first to explore newly added pieces, seasonal essentials, and limited-edition styles.
          </p>
        </div>

        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100 text-xs font-bold text-gray-500">
        <span>Showing {paginatedProducts.length} of {products.length} Products</span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300 space-y-3">
          <Sparkles className="w-10 h-10 text-gray-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-gray-900">No New Products Yet</h3>
          <p className="text-gray-500 text-xs">Stay tuned! We are restocking fresh catalog items regularly.</p>
          <Link
            href="/catalog"
            className="inline-block mt-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-md"
          >
            Explore Full Catalog
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {paginatedProducts.map((product) => {
              const rawPrice = Number(product.price) || 0;
              const rawOffer = Number(product.offer) || 0;
              const hasOffer = rawOffer > 0;
              const finalPrice = hasOffer ? rawPrice - (rawPrice * rawOffer) / 100 : rawPrice;
              const isSaved = isInWishlist(product._id);
              const hasSecondaryImage = Array.isArray(product.images) && product.images.length > 1;

              // Only show "NEW" badge if product is less than 30 days old
              const isProductNew = product.createdAt
                ? (Date.now() - new Date(product.createdAt).getTime()) < THIRTY_DAYS_MS
                : false;

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-out flex flex-col justify-between relative hover:-translate-y-1"
                >
                  <Link href={`/product/${product._id}`} className="block relative">
                    <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                      {product.images?.[0] ? (
                        <>
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className={`w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 ${
                              hasSecondaryImage ? 'group-hover:opacity-0' : ''
                            }`}
                          />
                          {hasSecondaryImage && (
                            <img
                              src={product.images[1]}
                              alt={`${product.title} Alternate View`}
                              className="w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}

                      {/* 30-Day Conditional NEW Badge */}
                      {isProductNew && (
                        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-indigo-600 text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-md z-10">
                          New
                        </span>
                      )}

                      {hasOffer && (
                        <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-red-600 text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-md z-10">
                          {rawOffer}% OFF
                        </span>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={(e) => toggleWishlist(product, e)}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 hover:scale-110 active:scale-90 transition-all duration-200 z-10"
                    aria-label="Save to Wishlist"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-200 ${
                        isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
                      }`}
                    />
                  </button>

                  <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <Link href={`/product/${product._id}`}>
                        <h2 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 hover:text-indigo-600 transition-colors duration-150 mt-0.5">
                          {product.title}
                        </h2>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-1.5">
                        <span className="text-sm sm:text-base font-black text-gray-900">
                          ₹{finalPrice.toLocaleString('en-IN')}
                        </span>
                        {hasOffer && (
                          <span className="text-[10px] sm:text-xs font-bold text-gray-400 line-through">
                            ₹{rawPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(product, finalPrice, e)}
                        className={`p-2 sm:p-2.5 rounded-xl active:scale-90 transition-all duration-200 flex items-center justify-center ${
                          addedId === product._id
                            ? 'bg-emerald-600 text-white scale-105'
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                        }`}
                        aria-label="Quick Add"
                      >
                        {addedId === product._id ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-12 pt-8 border-t border-gray-100">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function NewArrivalsPage() {
  return (
    <Suspense fallback={<ClothesLoader text="Loading new arrivals..." />}>
      <NewArrivalsContent />
    </Suspense>
  );
}