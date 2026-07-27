'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Truck, RefreshCw, ShieldCheck, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  // Scroll Reference for Left/Right Navigation Buttons
  const scrollRef = useRef(null);

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

          // 1. Filter and sort products with offers (high discount to low)
          const offerProducts = rawProducts
            .filter((p) => Number(p.offer) > 0)
            .sort((a, b) => Number(b.offer) - Number(a.offer));

          // 2. Filter and sort non-offer products by latest deployment
          const nonOfferProducts = rawProducts
            .filter((p) => !p.offer || Number(p.offer) === 0)
            .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));

          // 3. Combine items for trending now list
          const combined = [...offerProducts, ...nonOfferProducts];

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

  // Smooth Horizontal Scroll Handler for Left / Right Buttons
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (product, finalPrice, e) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0] || 'Default';

    const itemToAdd = {
      ...product,
      price: finalPrice,
    };

    addToCart(itemToAdd, defaultSize, defaultColor, 1);
    
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="space-y-16 pb-16 bg-white text-gray-900 overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop"
            alt="Hero Fashion Background"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start space-y-6">
          <div className="inline-flex items-center space-x-2 bg-indigo-600/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Season Collection</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none max-w-2xl">
            Redefine Your <span className="text-indigo-400">Everyday Style.</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
            Discover curated, premium apparel designed for modern comfort and timeless aesthetics. Explore our latest arrivals today.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/catalog"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-600/30 text-sm"
            >
              <span>Explore Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/catalog?category=Shirts"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold px-6 py-3.5 rounded-xl border border-white/20 transition text-sm"
            >
              View New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Brand Perks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/70 p-8 rounded-2xl border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Free Express Shipping</h3>
              <p className="text-xs text-gray-500 mt-0.5">On all orders over ₹999</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Hassle-Free Returns</h3>
              <p className="text-xs text-gray-500 mt-0.5">30-day money back guarantee</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">100% Guaranteed Quality</h3>
              <p className="text-xs text-gray-500 mt-0.5">Sourced from top manufacturers</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-1">Explore collections crafted for every occasion.</p>
          </div>
          <Link href="/catalog" className="text-indigo-600 font-bold text-sm hover:underline flex items-center space-x-1">
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/catalog?category=${cat.name}`}
              className="group relative h-64 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-extrabold text-lg">{cat.name}</h3>
                <p className="text-xs text-gray-300 font-medium">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Bidirectionally Scrollable Trending Now Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Trending Now</h2>
            <p className="text-gray-500 text-sm mt-1">Handpicked favorites from our latest catalog.</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/catalog" className="text-indigo-600 font-bold text-sm hover:underline hidden sm:flex items-center space-x-1 mr-2">
              <span>View Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Left Scroll Navigation Button */}
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-indigo-600 hover:text-white text-gray-700 transition shadow-sm"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Scroll Navigation Button */}
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-indigo-600 hover:text-white text-gray-700 transition shadow-sm"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed text-gray-500 text-sm">
            No items available right now.
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto scroll-smooth py-2 px-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => {
              const originalPrice = Number(product.price) || 0;
              const offerPercent = Number(product.offer) || 0;
              const hasOffer = offerPercent > 0;

              const finalPrice = hasOffer
                ? Number((originalPrice - (originalPrice * offerPercent) / 100).toFixed(2))
                : originalPrice;

              return (
                <div
                  key={product._id}
                  className="w-[280px] shrink-0 snap-start group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
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

                      {/* Offer Badge Overlay */}
                      {hasOffer && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-md">
                          {offerPercent}% OFF
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <Link href={`/product/${product._id}`}>
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1 hover:text-indigo-600 transition">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-1">{product.description || 'No description provided.'}</p>
                    </div>

                    {/* Price Row */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-lg font-black text-gray-900">
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
                        className={`p-2.5 rounded-xl transition flex items-center justify-center ${
                          addedId === product._id
                            ? 'bg-green-600 text-white'
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
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
    </div>
  );
}