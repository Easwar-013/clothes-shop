'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Package, 
  Calendar, 
  Tag, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle, 
  Truck, 
  PackageCheck,
  XCircle
} from 'lucide-react';

// Visual Stepper Tracker Component
function OrderTimeline({ status = 'Pending' }) {
  const steps = [
    { label: 'Order Placed', icon: Clock, key: 'Pending' },
    { label: 'Processing', icon: CheckCircle, key: 'Processing' },
    { label: 'Shipped', icon: Truck, key: 'Shipped' },
    { label: 'Delivered', icon: PackageCheck, key: 'Delivered' },
  ];

  const getStepIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const isCancelled = status === 'Cancelled';
  const currentIndex = getStepIndex(status);

  if (isCancelled) {
    return (
      <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center space-x-3 text-red-700 my-4">
        <XCircle className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-bold text-sm">Order Cancelled</p>
          <p className="text-xs text-red-600">This order was cancelled. Please contact support if you need help.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 px-2 my-2 bg-gray-50/70 rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        {/* Background Track Line */}
        <div className="absolute top-[18px] left-6 right-6 h-1 bg-gray-200 -translate-y-1/2 z-0" />

        {/* Active Progress Line */}
        <div
          className="absolute top-[18px] left-6 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{ width: `calc(${(currentIndex / (steps.length - 1)) * 100}% - 24px)` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-4 ring-indigo-50'
                    : 'bg-white text-gray-400 border border-gray-300'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span
                className={`text-[11px] font-bold mt-2 text-center ${
                  isCompleted ? 'text-indigo-600 font-black' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [productImages, setProductImages] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrderHistory() {
      if (status === 'loading') return;

      if (!session) {
        setLoading(false);
        setError('Please sign in to view your order history.');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userEmail = session.user?.email || '';
        const userId = session.user?.id || session.user?._id || '';

        const res = await fetch('/api/user/orders', {
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userEmail,
            'x-user-id': userId,
          },
        });

        const data = await res.json();

        if (res.ok && data.success) {
          const fetchedOrders = data.orders || [];
          setOrders(fetchedOrders);

          // Auto-expand current active orders (Pending, Processing, Shipped)
          const autoExpandState = {};
          fetchedOrders.forEach((o) => {
            if (['Pending', 'Processing', 'Shipped'].includes(o.status)) {
              autoExpandState[o._id] = true;
            }
          });
          setExpandedOrders(autoExpandState);

          fetchMissingImages(fetchedOrders);
        } else {
          setError(data.error || 'Failed to fetch order history.');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Network error loading orders.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrderHistory();
  }, [session, status]);

  // Fallback function to fetch product images from catalog
  const fetchMissingImages = async () => {
    try {
      const allProductsRes = await fetch('/api/products');
      const allProductsData = await allProductsRes.json();

      if (allProductsData.success && allProductsData.products) {
        const imageMap = {};
        allProductsData.products.forEach((p) => {
          const img = p.images?.[0] || p.image || p.img;
          if (img) {
            imageMap[p._id] = img;
            if (p.title) {
              imageMap[p.title.trim().toLowerCase()] = img;
            }
          }
        });
        setProductImages(imageMap);
      }
    } catch (e) {
      console.error('Error fetching fallback images:', e);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getItemImage = (item) => {
    if (!item) return null;
    if (typeof item.image === 'string' && item.image.trim() !== '') return item.image;
    if (Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string') return item.images[0];
    if (typeof item.img === 'string' && item.img.trim() !== '') return item.img;
    if (typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '') return item.imageUrl;

    const prodId = item.productId || item._id;
    if (prodId && productImages[prodId]) return productImages[prodId];
    if (item.title && productImages[item.title.trim().toLowerCase()]) {
      return productImages[item.title.trim().toLowerCase()];
    }
    return null;
  };

  const getStatusBadge = (orderStatus = 'Pending') => {
    const statusStyles = {
      Delivered: 'bg-green-100 text-green-700 border-green-200',
      Processing: 'bg-blue-100 text-blue-700 border-blue-200',
      Shipped: 'bg-purple-100 text-purple-700 border-purple-200',
      Cancelled: 'bg-red-100 text-red-700 border-red-200',
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-bold rounded-full border ${
          statusStyles[orderStatus] || statusStyles.Pending
        }`}
      >
        {orderStatus}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white text-gray-900 min-h-screen">
      {/* Dashboard Header */}
      <div className="pb-6 mb-8 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review your past purchases, current active orders, and live delivery status.
          </p>
        </div>
      </div>

      {/* Main Order Section */}
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <Package className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-extrabold text-gray-900">Order History</h2>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500 text-sm">Fetching your orders...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm text-center font-semibold space-y-3">
            <p>{error}</p>
            {!session && (
              <Link
                href="/api/auth/signin"
                className="inline-block bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition"
              >
                Sign In Now
              </Link>
            )}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No orders placed yet</h3>
            <p className="text-gray-500 text-sm mt-1">
              Looks like you haven't bought anything yet.
            </p>
            <Link
              href="/catalog"
              className="mt-5 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = !!expandedOrders[order._id];
              const orderDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A';

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  {/* Order Header / Toggle Trigger */}
                  <div
                    onClick={() => toggleOrderExpand(order._id)}
                    className="bg-gray-50 p-4 sm:p-6 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-gray-100/80 transition"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                        Order ID
                      </p>
                      <p className="text-sm font-black text-gray-900">#{order._id}</p>
                    </div>

                    <div className="flex items-center space-x-4 sm:space-x-6">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Date
                        </p>
                        <p className="text-sm font-bold text-gray-800">{orderDate}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> Total
                        </p>
                        <p className="text-sm font-black text-indigo-600">
                          ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div>{getStatusBadge(order.status)}</div>

                      {/* Expand / Collapse Icon */}
                      <button className="p-1 rounded-lg text-gray-500 hover:bg-gray-200 transition">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content: Timeline & Product Items */}
                  <div className="p-4 sm:p-6 space-y-6">
                    {/* Live Tracker (Rendered when expanded) */}
                    {isExpanded && (
                      <div className="pb-4 border-b border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase text-gray-500 tracking-wider">
                            Live Order Tracking
                          </span>
                        </div>
                        <OrderTimeline status={order.status} />
                      </div>
                    )}

                    {/* Order Items List */}
                    <div className="divide-y divide-gray-100">
                      {order.items?.map((item, idx) => {
                        const itemImg = getItemImage(item);

                        return (
                          <div
                            key={idx}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200 relative">
                                {itemImg ? (
                                  <img
                                    src={itemImg}
                                    alt={item.title || 'Product Image'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-gray-400 bg-gray-50">
                                    No Image
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Qty: {item.quantity} | Size: {item.size || 'M'} | Color: {item.color || 'Default'}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="font-extrabold text-sm text-gray-900">
                                ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
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