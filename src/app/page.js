'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ClothesLoader from '@/components/ClothesLoader';

const TRENDING_ORDER_STORAGE_KEY = 'attire_trending_selection_order';

export default function HomePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollRef = useRef(null);
  const animFrameId = useRef(null);
  const accumulatedScroll = useRef(0);

  const categories = [
    { name: 'Shirts', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop', count: '12+ Items' },
    { name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop', count: '8+ Items' },
    { name: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop', count: '15+ Items' },
    { name: 'Pants', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop', count: '10+ Items' },
  ];

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.products?.length > 0) {
          const rawProducts = data.products;

          let savedOrder = [];
          try {
            const stored = localStorage.getItem(TRENDING_ORDER_STORAGE_KEY);
            if (stored) savedOrder = JSON.parse(stored);
          } catch (e) {
            console.error('Failed to read trending order', e);
          }

          const featuredProducts = rawProducts.filter((p) => p.isFeatured === true);

          let orderedFeatured = [];
          if (savedOrder.length > 0) {
            orderedFeatured = savedOrder
              .map((id) => featuredProducts.find((p) => p._id === id))
              .filter(Boolean);

            const missing = featuredProducts.filter((p) => !savedOrder.includes(p._id));
            orderedFeatured = [...orderedFeatured, ...missing];
          } else {
            orderedFeatured = featuredProducts;
          }

          const nonFeatured = rawProducts
            .filter((p) => !p.isFeatured)
            .sort((a, b) => Number(b.offer || 0) - Number(a.offer || 0));

          const combined = orderedFeatured.length > 0 ? orderedFeatured.slice(0, 7) : nonFeatured;
          setProducts(combined);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const displayProducts = products.length > 0 ? [...products, ...products, ...products, ...products] : [];

  useEffect(() => {
    const container = scrollRef.current;
    if (loading || displayProducts.length === 0 || !container) return;

    accumulatedScroll.current = container.scrollLeft;

    const step = () => {
      if (!isPaused && container) {
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 5) {
          accumulatedScroll.current = 1;
          container.scrollLeft = 1;
        } else {
          accumulatedScroll.current += 1;
          container.scrollLeft = Math.floor(accumulatedScroll.current);
        }
      } else if (container) {
        accumulatedScroll.current = container.scrollLeft;
      }
      animFrameId.current = requestAnimationFrame(step);
    };

    animFrameId.current = requestAnimationFrame(step);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [loading, displayProducts, isPaused]);

  const handleQuickAdd = (product, finalPrice, e) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0] || 'Default';

    addToCart({ ...product, price: finalPrice }, defaultSize, defaultColor, 1);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="space-y-10 sm:space-y-16 pb-16 bg-white text-gray-900 overflow-x-hidden">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 1. Immersive HangOver Hero Banner Section */}
      <section className="relative w-full bg-black text-white overflow-hidden">
        <div className="relative w-full min-h-[52vh] sm:min-h-[60vh] md:aspect-[2.4/1] flex items-end">
          <img
            src="/hero-banner.png"
            alt="HangOver Streetwear Collection"
            className="absolute inset-0 w-full h-full object-cover object-center"
            onError={(e) => {
              if (!e.currentTarget.dataset.retried) {
                e.currentTarget.dataset.retried = 'true';
                e.currentTarget.src = '/hero-banner.jpg';
              }
            }}
          />

          {/* Bottom vignette for text/button readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

          {/* Action Buttons overlay */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 pb-6 sm:pb-10">
            <div className="flex items-center justify-start gap-3 max-w-md sm:max-w-none">
              <Link
                href="/catalog"
                className="flex-1 sm:flex-initial text-center px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-black/95 hover:bg-black rounded-xl border border-orange-500/80 shadow-[0_0_20px_rgba(249,115,22,0.45)] transition-all duration-200 active:scale-95 hover:border-orange-400"
              >
                Shop Now
              </Link>

              <Link
                href="/new-arrivals"
                className="flex-1 sm:flex-initial text-center px-6 py-3 text-xs sm:text-sm font-bold tracking-wide text-gray-200 hover:text-white bg-black/75 hover:bg-black/95 backdrop-blur-md rounded-xl border border-white/20 transition-all duration-200 active:scale-95 shadow-md"
              >
                View New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trending Section (Above Category Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Collection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Trending Now</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Discover what our community is loving right now.</p>
          </div>

          <Link href="/catalog" className="text-orange-500 font-bold text-xs sm:text-sm hover:underline flex items-center space-x-1 shrink-0">
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ClothesLoader text="Loading trending items..." />
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed text-gray-500 text-sm">
            No items available right now.
          </div>
        ) : (
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex space-x-4 sm:space-x-6 overflow-x-auto py-2 px-1 no-scrollbar cursor-grab active:cursor-grabbing"
          >
            {displayProducts.map((product, idx) => {
              const originalPrice = Number(product.price) || 0;
              const offerPercent = Number(product.offer) || 0;
              const hasOffer = offerPercent > 0;

              const finalPrice = hasOffer
                ? Number((originalPrice - (originalPrice * offerPercent) / 100).toFixed(2))
                : originalPrice;

              return (
                <div
                  key={`${product._id}-${idx}`}
                  className="w-[240px] sm:w-[280px] shrink-0 group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <Link href={`/product/${product._id}`} className="block relative">
                    <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}

                      {product.category && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-xs font-bold text-gray-900 px-2.5 py-1 rounded-md border border-gray-200">
                          {product.category}
                        </span>
                      )}

                      {hasOffer && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-md">
                          {offerPercent}% OFF
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <Link href={`/product/${product._id}`}>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1 hover:text-orange-500 transition">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-1">{product.description || 'No description provided.'}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-base sm:text-lg font-black text-gray-900">
                          ₹{finalPrice.toLocaleString('en-IN')}
                        </span>
                        {hasOffer && (
                          <span className="text-xs font-bold text-gray-400 line-through">
                            ₹{originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(product, finalPrice, e)}
                        className={`p-2 sm:p-2.5 rounded-xl transition flex items-center justify-center ${
                          addedId === product._id
                            ? 'bg-green-600 text-white'
                            : 'bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white'
                        }`}
                        aria-label="Quick Add to Cart"
                      >
                        {addedId === product._id ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Shop by Category</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Explore collections crafted for every occasion.</p>
          </div>
          <Link href="/catalog" className="text-orange-500 font-bold text-xs sm:text-sm hover:underline flex items-center space-x-1 shrink-0">
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/catalog?category=${cat.name}`}
              className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-extrabold text-base sm:text-lg">{cat.name}</h3>
                <p className="text-xs text-gray-300 font-medium">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}