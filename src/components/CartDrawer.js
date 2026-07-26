'use client';

import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const { cart = [], isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  if (!isCartOpen) return null;

  // Calculate cart total safely
  const calculatedTotal = cart.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCheckout = () => {
    setIsCartOpen(false); // Close drawer

    if (status === 'authenticated' || session?.user) {
      // User is logged in -> Go straight to checkout page
      router.push('/checkout');
    } else {
      // User is NOT logged in -> Go to login with return redirect
      router.push('/login?callbackUrl=/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between text-gray-900">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Shopping Cart ({cart.reduce((acc, item) => acc + (item.quantity || 1), 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 font-semibold text-sm">Your cart is currently empty</p>
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
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-14 h-14 object-cover rounded-xl bg-white"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-xs text-gray-900 line-clamp-1">{item.title}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Size: <span className="font-semibold text-gray-700">{item.size || 'M'}</span> | Color:{' '}
                        <span className="font-semibold text-gray-700">{item.color || 'Default'}</span>
                      </p>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)}
                          className="w-5 h-5 bg-white border rounded-md text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)}
                          className="w-5 h-5 bg-white border rounded-md text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className="font-black text-sm text-gray-900">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeFromCart(item._id, item.size, item.color)}
                      className="text-gray-400 hover:text-red-500 transition"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">
              <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                <span>Subtotal</span>
                <span className="text-lg font-black">₹{calculatedTotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-gray-400">Shipping and taxes calculated at checkout.</p>

              <button
                onClick={handleCheckout}
                disabled={status === 'loading'}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 text-sm disabled:opacity-50"
              >
                <span>{status === 'loading' ? 'Checking session...' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}