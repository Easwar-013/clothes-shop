'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, CheckCircle2, Package, Tag, X } from 'lucide-react';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart = [], clearCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State with Phone Number
  const [formData, setFormData] = useState({
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Calculate Subtotal and Shipping
  const subtotal = cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 999 ? 0 : 99;

  // Calculate Discount and Final Total
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  // Protect route
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Helper to extract clean image URL for items
  const getItemImage = (item) => {
    if (!item) return '';
    if (typeof item.image === 'string' && item.image.trim() !== '') return item.image;
    if (Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string') return item.images[0];
    if (typeof item.img === 'string' && item.img.trim() !== '') return item.img;
    return '';
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });

      const data = await res.json();

      if (data.success) {
        setAppliedCoupon(data);
        setCouponInput('');
      } else {
        setCouponError(data.error || 'Failed to apply coupon.');
      }
    } catch (err) {
      setCouponError('Error validating promo code.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderPayload = {
        user: session?.user?.id || session?.user?._id || session?.user?.email,
        userName: session?.user?.name || 'Guest Customer',
        userEmail: session?.user?.email || '',
        items: cart.map((item) => ({
          product: item._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          size: item.size || 'M',
          color: item.color || 'Default',
          image: getItemImage(item),
        })),
        shippingAddress: formData,
        totalAmount: grandTotal,
        discountApplied: discountAmount,
        couponCode: appliedCoupon?.code || null,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        clearCart();
        setIsSuccess(true);
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('An error occurred during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white text-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <p className="text-gray-500 font-medium text-sm">Verifying session...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-200 shadow-sm text-center text-gray-900">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
        <h1 className="text-3xl font-black mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 text-sm mb-6">
          Thank you for your purchase. We have received your order and are preparing it for shipment.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/account"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow-md"
          >
            <Package className="w-4 h-4" />
            <span>View My Orders</span>
          </Link>
          <Link
            href="/catalog"
            className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl transition text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-20 text-center p-8 bg-white rounded-3xl border border-gray-200 text-gray-900">
        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-6">Add items to your cart before proceeding to checkout.</p>
        <Link
          href="/catalog"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white text-gray-900 min-h-screen">
      <Link
        href="/catalog"
        className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-indigo-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Catalog
      </Link>

      <h1 className="text-3xl font-black mb-8 tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleSubmitOrder} id="checkout-form" className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h2 className="text-lg font-bold mb-4">Shipping Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="123 Main St, Flat / Door No."
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Chennai"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">State / Province</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Tamil Nadu"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">ZIP / Postal Code</label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="600001"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h2 className="text-lg font-bold mb-2">Payment Method</h2>
              <p className="text-xs text-gray-500 mb-4">Demo Payment Mode (Cash on Delivery / Test Card)</p>

              <div className="p-4 bg-white rounded-xl border border-indigo-600 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Standard Test Payment</span>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-md font-bold">Enabled</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary & Coupon Code */}
        <div className="lg:col-span-5">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-24 space-y-6">
            <h2 className="text-lg font-bold border-b border-gray-200 pb-3">Order Summary</h2>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, idx) => {
                const itemImg = getItemImage(item);

                return (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0">
                        {itemImg ? (
                          <img src={itemImg} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">
                            No Img
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} | Size: {item.size}</p>
                      </div>
                    </div>
                    <span className="font-black">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>

            {/* Promo / Coupon Code Section */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <label className="block text-xs font-bold uppercase text-gray-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-600" /> Have a Promo Code?
              </label>

              {appliedCoupon ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-green-700 text-xs bg-green-100 px-2 py-0.5 rounded-md">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-xs font-semibold text-green-800">
                      ({appliedCoupon.discountPercent}% OFF)
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-gray-400 hover:text-red-600 p-1 transition"
                    title="Remove Promo Code"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold uppercase focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50 shrink-0"
                  >
                    {validatingCoupon ? 'Validating...' : 'Apply'}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-xs font-semibold text-red-600 mt-1">{couponError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount ({appliedCoupon.discountPercent}%)</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-bold text-gray-900">
                  {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-3">
                <span>Total Due</span>
                <span className="text-xl text-indigo-600">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing Order...' : `Pay ₹${grandTotal.toLocaleString('en-IN')} & Place Order`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}