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
      // Trigger enter animation on next frame
      const timer = setTimeout(() => setAnimateIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      // Wait for exit animation transition to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  if (!shouldRender) return null;

  // Calculate cart total safely
  const calculatedTotal = cart.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCheckout = () => {
    setIsCartOpen(false); // Close drawer

    if (status === 'authenticated' || session?.user) {
      router.push('/checkout');
    } else {
      router.push('/login?callbackUrl=/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end items-start p-3 sm:p-6">
      {/* Smooth Backdrop Blur */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          animateIn ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Floating Cart Popover Modal */}
      <div
        className={`relative w-full sm:w-[420px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col justify-between text-gray-900 z-10 transition-all duration-200 ease-out origin-top-right ${
          animateIn
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-gray-900">
              Shopping Cart ({cart.reduce((acc, item) => acc + (item.quantity || 1), 0)})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-150 active:scale-90"
            aria-label="Close Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[50vh] pr-2">
          {cart.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto animate-bounce" />
              <p className="text-gray-500 font-semibold text-xs">Your cart is currently empty</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item._id}-${item.size}-${item.color}-${idx}`}
                className="flex items-center justify-between p-3 bg-gray-50/80 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-all duration-150"
              >
                <div className="flex items-center space-x-3">
                  {item.images?.[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-xl bg-white border border-gray-200 shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-xs text-gray-900 line-clamp-1">{item.title}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Size: <span className="font-semibold text-gray-700">{item.size || 'M'}</span> | Color:{' '}
                      <span className="font-semibold text-gray-700">{item.color || 'Default'}</span>
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2 mt-1.5">
                      <button
                        onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)}
                        className="w-5 h-5 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600 hover:bg-gray-100 active:scale-90 transition flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)}
                        className="w-5 h-5 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600 hover:bg-gray-100 active:scale-90 transition flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className="font-black text-xs text-gray-900">
                    ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => removeFromCart(item._id, item.size, item.color)}
                    className="text-gray-400 hover:text-red-500 active:scale-90 transition p-1"
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
          <div className="p-5 border-t border-gray-100 space-y-3 bg-gray-50/50 rounded-b-3xl">
            <div className="flex justify-between items-center text-xs font-bold text-gray-900">
              <span>Subtotal</span>
              <span className="text-base font-black text-indigo-600">
                ₹{calculatedTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Taxes and shipping calculated at checkout.</p>

            <button
              onClick={handleCheckout}
              disabled={status === 'loading'}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 text-xs disabled:opacity-50"
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