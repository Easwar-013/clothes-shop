'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Search, Filter, ShoppingBag, Check, SlidersHorizontal, Heart, RotateCcw } from 'lucide-react';

function CatalogContent() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedId, setAddedId] = useState(null);

  // Dynamic categories collected from database items
  const [dynamicCategories, setDynamicCategories] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [maxPrice, setMaxPrice] = useState(50000);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Sync category state whenever URL query params change (e.g. Navbar links)
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    setCategory(urlCategory);
  }, [searchParams]);

  // Fetch API function
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (category) query.set('category', category);

      const url = `/api/products?${query.toString()}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP Error Status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        const fetchedProducts = data.products || [];
        setProducts(fetchedProducts);

        const extractedCats = Array.from(
          new Set(fetchedProducts.map((p) => p.category).filter(Boolean))
        );
        if (extractedCats.length > 0) {
          setDynamicCategories((prev) => Array.from(new Set([...prev, ...extractedCats])));
        }
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Catalog Fetch Failure:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Robust Client-Side Filtering (Fallback for size, price slider, & search)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Filter
      if (search) {
        const query = search.toLowerCase();
        const matchTitle = product.title?.toLowerCase().includes(query);
        const matchCat = product.category?.toLowerCase().includes(query);
        if (!matchTitle && !matchCat) return false;
      }

      // 2. Category Filter (Case-insensitive matching)
      if (category && product.category?.toLowerCase() !== category.toLowerCase()) {
        return false;
      }

      // 3. Size Filter
      if (selectedSize && !product.sizes?.includes(selectedSize)) {
        return false;
      }

      // 4. Max Price Filter (Compares against final discounted price)
      const rawPrice = Number(product.price) || 0;
      const rawOffer = Number(product.offer) || 0;
      const finalPrice = rawOffer > 0 ? rawPrice - (rawPrice * rawOffer) / 100 : rawPrice;

      if (finalPrice > maxPrice) {
        return false;
      }

      return true;
    });
  }, [products, search, category, selectedSize, maxPrice]);

  const handleCategorySelect = (selectedCat) => {
    setCategory(selectedCat);
    if (selectedCat === '') {
      router.push('/catalog');
    } else {
      router.push(`/catalog?category=${encodeURIComponent(selectedCat)}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleQuickAdd = (product, finalPrice, e) => {
    e.preventDefault();
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

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSelectedSize('');
    setMaxPrice(50000);
    router.push('/catalog');
  };

  const allCategories = Array.from(
    new Set(['Shirts', 'Pants', 'Jackets', 'Dresses', 'Hoodies', 'Accessories', ...dynamicCategories])
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white text-gray-900 min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shop Collection</h1>
          <p className="text-gray-600 text-sm mt-1">Discover modern apparel tailored for everyday comfort.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search clothes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        {/* Left Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-200 h-fit sticky top-20 self-start">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 font-bold text-gray-900 text-base">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filters</span>
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Category</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => handleCategorySelect('')}
                className={`block w-full text-left text-xs font-bold px-3 py-2 rounded-xl transition ${
                  category === ''
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-gray-700 hover:bg-gray-200/60'
                }`}
              >
                All Categories
              </button>
              {allCategories.map((cat) => {
                const isSelected = category.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`block w-full text-left text-xs font-bold px-3 py-2 rounded-xl transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-gray-700 hover:bg-gray-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(isSelected ? '' : sz)}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-gray-900">Max Price</h3>
              <span className="text-xs font-black text-indigo-600">
                ₹{Number(maxPrice).toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="300"
              max="50000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {error && (
            <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">
              Error: {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium text-xs">Loading collection...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300 space-y-3">
              <Filter className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">No products match your filter</h3>
              <p className="text-gray-500 text-xs max-w-xs mx-auto">
                Try raising the price slider or resetting size and category selections.
              </p>
              <button
                onClick={clearFilters}
                className="mt-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const rawPrice = Number(product.price) || 0;
                const rawOffer = Number(product.offer) || 0;
                const hasOffer = rawOffer > 0;

                const finalPrice = hasOffer
                  ? rawPrice - (rawPrice * rawOffer) / 100
                  : rawPrice;

                const isSaved = isInWishlist(product._id);

                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between relative"
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

                        {/* Category Tag */}
                        {product.category && (
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[10px] font-bold text-gray-900 px-2 py-0.5 rounded-md border border-gray-200 uppercase">
                            {product.category}
                          </span>
                        )}

                        {/* Offer Badge Overlay */}
                        {hasOffer && (
                          <span className="absolute bottom-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-md">
                            {rawOffer}% OFF
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Wishlist Heart Icon Button */}
                    <button
                      onClick={(e) => toggleWishlist(product, e)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 hover:scale-110 transition z-10"
                      aria-label="Save to Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 transition ${
                          isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
                        }`}
                      />
                    </button>

                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <Link href={`/product/${product._id}`}>
                          <h2 className="font-bold text-gray-900 text-sm line-clamp-1 hover:text-indigo-600 transition">
                            {product.title}
                          </h2>
                        </Link>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                          {product.description || 'No description available.'}
                        </p>
                      </div>

                      {/* Price Container */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-base font-black text-gray-900">
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
                          className={`p-2.5 rounded-xl transition flex items-center justify-center ${
                            addedId === product._id
                              ? 'bg-green-600 text-white'
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                          }`}
                          aria-label="Quick Add to Cart"
                        >
                          {addedId === product._id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <ShoppingBag className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-semibold">Loading collection...</div>}>
      <CatalogContent />
    </Suspense>
  );
}