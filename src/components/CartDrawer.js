'use client';

import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
  const { cart = [], isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Local state to handle unmounting delay for exit animations
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setShouldRender(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  if (!shouldRender) return null;

  // Calculate totals
  const totalItemsCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const calculatedTotal = cart.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (status === 'authenticated' || session?.user) {
      router.push('/checkout');
    } else {
      router.push('/login?callbackUrl=/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end items-start p-3 sm:p-6">
      {/* Backdrop with Frosted Blur */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 ease-out ${
          animateIn ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Glassmorphic Floating Cart Modal */}
      <div
        className={`relative w-full sm:w-[440px] max-h-[90vh] bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/60 flex flex-col justify-between text-gray-900 z-10 transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) origin-top-right ${
          animateIn
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-3'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100/80 flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-t-3xl">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 leading-tight">Your Cart</h2>
              <p className="text-[10px] font-bold text-gray-400">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all duration-150 active:scale-90"
            aria-label="Close Cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[52vh] pr-2.5">
          {cart.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-500">
                <ShoppingBag className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Your cart is empty</h3>
              <p className="text-gray-500 font-medium text-xs max-w-[200px] mx-auto">
                Explore our catalog to find comfortable everyday wear.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/catalog');
                }}
                className="mt-2 inline-flex items-center space-x-1.5 text-xs text-indigo-600 font-extrabold hover:underline"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item._id}-${item.size}-${item.color}-${idx}`}
                className="flex items-center justify-between p-3 bg-white/70 hover:bg-white rounded-2xl border border-gray-200/70 hover:border-indigo-200/80 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {item.images?.[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-13 h-13 object-cover rounded-xl bg-gray-50 border border-gray-200/70 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded font-semibold text-gray-700">
                        {item.size || 'M'}
                      </span>
                      <span>•</span>
                      <span className="text-gray-600 font-medium truncate">{item.color || 'Default'}</span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)}
                        className="w-5 h-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-black transition flex items-center justify-center active:scale-90"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)}
                        className="w-5 h-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-black transition flex items-center justify-center active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch pl-2 shrink-0">
                  <span className="font-black text-xs text-gray-900">
                    ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => removeFromCart(item._id, item.size, item.color)}
                    className="text-gray-400 hover:text-red-500 active:scale-90 transition p-1 rounded-lg hover:bg-red-50"
                    title="Remove Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Subtotal & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-3 bg-white/70 backdrop-blur-md rounded-b-3xl">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-black text-gray-900 uppercase tracking-wider">Subtotal</span>
              <span className="text-lg font-black text-indigo-600">
                ₹{calculatedTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Taxes and shipping calculated at checkout.</p>

            <button
              onClick={handleCheckout}
              disabled={status === 'loading'}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 text-xs disabled:opacity-50"
            >
              <span>{status === 'loading' ? 'Checking session...' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}