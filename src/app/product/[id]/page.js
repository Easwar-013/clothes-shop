'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import StockAlert from '@/components/StockAlert';
import { 
  ShoppingBag, 
  Check, 
  Star, 
  Truck, 
  RefreshCw, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Camera,
  X,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;

  const { data: session } = useSession();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic Reviews State
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Recommendations & Recently Viewed States
  const [recommendations, setRecommendations] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const userIdentifier = session?.user?.email || session?.user?.id || 'guest';
  const RECENT_KEY = `recently_viewed_${userIdentifier}`;

  // Form Selections
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      } else {
        setRecentlyViewed([]);
      }
    } catch (e) {
      console.error('Failed to parse recently viewed products:', e);
      setRecentlyViewed([]);
    }
  }, [RECENT_KEY]);

  const trackRecentlyViewed = (prod) => {
    if (!prod || !prod._id) return;
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      let list = stored ? JSON.parse(stored) : [];

      list = list.filter((item) => item._id !== prod._id);
      list.unshift({
        _id: prod._id,
        title: prod.title,
        price: prod.price,
        offer: prod.offer,
        images: prod.images || [],
        category: prod.category,
      });

      const trimmedList = list.slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(trimmedList));
      setRecentlyViewed(trimmedList);
    } catch (e) {
      console.error('Failed to save recently viewed item:', e);
    }
  };

  // Fetch Reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${id}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setTotalReviews(data.totalReviews || 0);
        setAverageRating(data.averageRating || 0);
      }
    } catch (e) {
      console.error('Failed to fetch product reviews:', e);
    }
  };

  // Fetch Product
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?id=${id}`);
        const data = await res.json();

        if (data.success && data.products?.length > 0) {
          const prod = data.products[0];
          setProduct(prod);
          setSelectedSize(prod.sizes?.[0] || 'M');
          setSelectedColor(prod.colors?.[0] || 'Default');
          setSelectedImage(prod.images?.[0] || '');

          trackRecentlyViewed(prod);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id, RECENT_KEY]);

  // Calculations
  const originalPrice = Number(product?.price) || 0;
  const numOffer = Number(product?.offer) || 0;
  const hasOffer = numOffer > 0;

  const finalPrice = hasOffer
    ? Number((originalPrice - (originalPrice * numOffer) / 100).toFixed(2))
    : originalPrice;

  // Fetch Recommendations
  useEffect(() => {
    async function fetchRecommendations() {
      if (!product?._id) return;

      try {
        const res = await fetch('/api/products');
        const data = await res.json();

        if (data.success && data.products?.length > 0) {
          const filtered = data.products
            .filter((p) => p._id !== product._id)
            .sort((a, b) => {
              const aSameCat = a.category === product.category ? -1 : 1;
              const bSameCat = b.category === product.category ? -1 : 1;
              return aSameCat - bSameCat;
            })
            .slice(0, 6);

          setRecommendations(filtered);
        }
      } catch (e) {
        console.error('Failed to load recommended items', e);
      }
    }

    fetchRecommendations();
  }, [product, finalPrice]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addToCart({ ...product, price: finalPrice }, selectedSize, selectedColor, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Image Upload with Browser Canvas Compression (~50KB)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setReviewImages((prev) => [...prev, compressedBase64]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReviewImage = (index) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      alert('Please sign in to leave a review.');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          userEmail: session.user.email,
          userName: session.user.name,
          rating: newRating,
          comment: newComment,
          images: reviewImages,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setNewComment('');
        setNewRating(5);
        setReviewImages([]);
        fetchReviews();
      } else {
        setReviewError(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      setReviewError('An error occurred submitting your review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete Review Handler
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert(data.error || 'Failed to delete review.');
      }
    } catch (e) {
      console.error('Error deleting review:', e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center text-gray-900">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-500 font-medium text-sm">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center text-gray-900">
        <h2 className="text-3xl font-black text-gray-900">Oops! Product Not Found</h2>
        <p className="text-gray-500 mt-2 text-sm">{error || "The item you're looking for doesn't exist."}</p>
        <Link
          href="/catalog"
          className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl text-sm transition shadow-lg shadow-indigo-600/20"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const filteredRecentlyViewed = recentlyViewed.filter((item) => item._id !== product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white text-gray-900 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs font-semibold text-gray-400 mb-8 space-x-2">
        <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-indigo-600 transition">Catalog</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold truncate">{product.title}</span>
      </nav>

      {/* Main Product Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/5] sm:aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-200 relative group shadow-sm">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No Image Available
              </div>
            )}

            {hasOffer && (
              <span className="absolute top-5 left-5 bg-red-600 text-white font-black text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                {numOffer}% OFF
              </span>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImage === img
                      ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                {product.category}
              </span>

              <div className="flex items-center space-x-1 text-amber-500 text-xs font-extrabold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>
                  {totalReviews > 0 ? `${averageRating} (${totalReviews})` : 'New Item'}
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 tracking-tight leading-tight">
              {product.title}
            </h1>

            <div className="flex items-baseline space-x-3 mt-4">
              <span className="text-3xl font-black text-gray-900">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
              {hasOffer && (
                <span className="text-lg font-bold text-gray-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Integrated StockAlert Component with required props */}
            <div className="mt-4">
              <StockAlert 
                stock={product.stock ?? 0} 
                productId={product._id || id} 
                productName={product.title} 
              />
            </div>

            <p className="text-gray-600 mt-5 leading-relaxed text-sm">
              {product.description || 'No description provided.'}
            </p>

            <hr className="my-6 border-gray-100" />

            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                        selectedSize === size
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                        selectedColor === color
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-extrabold'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.stock > 0 && (
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50/50 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:bg-white rounded-lg transition"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-black text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                    className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:bg-white rounded-lg transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add To Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition flex items-center justify-center space-x-2 shadow-lg ${
                product.stock === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : added
                  ? 'bg-green-600 text-white shadow-green-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              <span>{product.stock === 0 ? 'Out of Stock' : added ? 'Added to Cart!' : 'Add to Cart'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-100 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-4 h-4 text-indigo-600 mb-1" />
              <span className="text-[11px] font-bold text-gray-800">Free Express Delivery</span>
            </div>
            <div className="flex flex-col items-center">
              <RefreshCw className="w-4 h-4 text-indigo-600 mb-1" />
              <span className="text-[11px] font-bold text-gray-800">30-Day Easy Returns</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-indigo-600 mb-1" />
              <span className="text-[11px] font-bold text-gray-800">100% Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products Module */}
      {recommendations.length > 0 && (
        <section className="mt-20 pt-10 border-t border-gray-100">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>You Might Also Like</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recommended For You</h2>
            </div>
            <Link href="/catalog" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((item) => {
              const rawPrice = Number(item.price) || 0;
              const itemOffer = Number(item.offer) || 0;
              const itemFinalPrice = itemOffer > 0 ? rawPrice - (rawPrice * itemOffer) / 100 : rawPrice;
              const itemImg = item.images?.[0] || item.image || item.img;

              return (
                <Link
                  key={item._id}
                  href={`/product/${item._id}`}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                    {itemImg ? (
                      <img
                        src={itemImg}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                    {itemOffer > 0 && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow">
                        {itemOffer}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-xs line-clamp-1 mt-1 group-hover:text-indigo-600 transition">
                      {item.title}
                    </h3>
                    <div className="flex items-baseline space-x-1 mt-1">
                      <span className="text-sm font-black text-gray-900">
                        ₹{itemFinalPrice.toLocaleString('en-IN')}
                      </span>
                      {itemOffer > 0 && (
                        <span className="text-[10px] font-bold text-gray-400 line-through">
                          ₹{rawPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently Viewed Products Module */}
      {filteredRecentlyViewed.length > 0 && (
        <section className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6">
            Recently Viewed Products
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredRecentlyViewed.map((item) => {
              const rawPrice = Number(item.price) || 0;
              const itemOffer = Number(item.offer) || 0;
              const itemFinalPrice = itemOffer > 0 ? rawPrice - (rawPrice * itemOffer) / 100 : rawPrice;

              return (
                <Link
                  key={item._id}
                  href={`/product/${item._id}`}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                    {itemOffer > 0 && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow">
                        {itemOffer}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-xs line-clamp-1 group-hover:text-indigo-600 transition">
                      {item.title}
                    </h3>
                    <div className="flex items-baseline space-x-1 mt-1">
                      <span className="text-sm font-black text-gray-900">
                        ₹{itemFinalPrice.toLocaleString('en-IN')}
                      </span>
                      {itemOffer > 0 && (
                        <span className="text-[10px] font-bold text-gray-400 line-through">
                          ₹{rawPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Customer Reviews & Ratings Section */}
      <section className="mt-20 pt-10 border-t border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
              <span>Customer Reviews</span>
            </h2>
            <p className="text-gray-500 text-xs mt-1">Real feedback from verified store shoppers.</p>
          </div>

          <div className="flex items-center space-x-4 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-200">
            <div className="text-3xl font-black text-gray-900">{averageRating}</div>
            <div>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 font-bold mt-0.5">
                Based on {totalReviews} review{totalReviews === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-900 text-base">Write a Review</h3>

              {reviewError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                  {reviewError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Your Rating</label>
                <div className="flex space-x-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 focus:outline-none hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? 'fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Your Feedback</label>
                <textarea
                  rows="4"
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="How was the fit, comfort, and fabric quality?"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                ></textarea>
              </div>

              {/* Photo Upload Input */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Upload Product Photos (Optional)
                </label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {reviewImages.map((img, index) => (
                    <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img src={img} alt="Upload Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeReviewImage(index)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {reviewImages.length < 3 && (
                    <label className="w-16 h-16 border-2 border-dashed border-gray-300 hover:border-indigo-600 rounded-lg flex flex-col items-center justify-center cursor-pointer transition bg-white text-gray-400 hover:text-indigo-600">
                      <Camera className="w-5 h-5" />
                      <span className="text-[9px] font-bold mt-1">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>

          {/* Reviews List Display */}
          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed text-gray-400 text-sm">
                No reviews yet. Be the first to review this product!
              </div>
            ) : (
              reviews.map((rev) => {
                const canDelete =
                  session?.user?.email === rev.userEmail ||
                  session?.user?.role === 'admin' ||
                  !rev.userEmail;

                return (
                  <div key={rev._id} className="p-5 bg-white rounded-2xl border border-gray-200 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-sm">{rev.userName}</span>
                        {rev.isVerifiedBuyer && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Buyer
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>

                        {canDelete && (
                          <button
                            onClick={() => handleDeleteReview(rev._id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs leading-relaxed">{rev.comment}</p>

                    {rev.images && rev.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {rev.images.map((img, imgIdx) => (
                          <a 
                            key={imgIdx} 
                            href={img} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="block w-16 h-16 rounded-xl overflow-hidden border border-gray-200 hover:scale-105 transition shadow-sm"
                          >
                            <img src={img} alt="User Review Attachment" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}