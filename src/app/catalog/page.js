'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Search, Filter, ShoppingBag, Check, SlidersHorizontal, Heart } from 'lucide-react';

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
  const [maxPrice, setMaxPrice] = useState('50000');

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Sync state whenever URL query params change
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
      if (selectedSize) query.set('size', selectedSize);
      
      if (maxPrice && Number(maxPrice) < 50000) {
        query.set('maxPrice', maxPrice);
      }

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
  }, [search, category, selectedSize, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategorySelect = (selectedCat) => {
    setCategory(selectedCat);
    if (selectedCat === '') {
      router.push('/catalog');
    } else {
      router.push(`/catalog?category=${selectedCat}`);
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
    setMaxPrice('50000');
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
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Category</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategorySelect('')}
                className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition ${
                  category === '' ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition ${
                    category === cat ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                    selectedSize === sz
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-gray-900">Max Price</h3>
              <span className="text-sm font-bold text-indigo-600">₹{Number(maxPrice).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
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
              <p className="mt-4 text-gray-600 font-medium">Loading collection...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <Filter className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">No products found</h3>
              <p className="text-gray-500 text-sm mt-1">Try resetting or broadening your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
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
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-xs font-bold text-gray-900 px-2.5 py-1 rounded-md border border-gray-200">
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
                          <h2 className="font-bold text-gray-900 text-base line-clamp-1 hover:text-indigo-600 transition">
                            {product.title}
                          </h2>
                        </Link>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{product.description}</p>
                      </div>

                      {/* Price Container */}
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
    <Suspense fallback={<div className="py-20 text-center text-xs">Loading collection...</div>}>
      <CatalogContent />
    </Suspense>
  );
}