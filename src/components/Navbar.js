'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ShoppingBag, Heart, LogOut, Package, Store, ExternalLink, Tag } from 'lucide-react';
import { useState, Suspense } from 'react';

function NavbarContent() {
  const { data: session } = useSession();
  const { cart = [], setIsCartOpen } = useCart();
  const { wishlist = [], hasUnread, markAsRead } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminUser = session?.user?.role === 'admin';

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Helper to check if a navigation link is currently active
  const isActive = (path, category = null) => {
    if (category) {
      return pathname === '/catalog' && currentCategory?.toLowerCase() === category.toLowerCase();
    }
    if (path === '/') {
      return pathname === '/';
    }
    if (path === '/catalog') {
      return pathname === '/catalog' && !currentCategory;
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Context Badge */}
        <div className="flex items-center space-x-3">
          <Link href={isAdminPage ? '/admin/products' : '/'} className="text-2xl font-black tracking-tight text-gray-900">
            ATTIRE<span className="text-indigo-600">.</span>
          </Link>
          {isAdminPage && (
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider border border-indigo-200">
              Admin Panel
            </span>
          )}
        </div>

        {/* Dynamic Navigation Links with Active State Styles */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600 h-full">
          {isAdminPage ? (
            /* Admin Specific Links */
            <>
              <Link
                href="/admin/products"
                className={`relative flex items-center space-x-1.5 h-full transition ${
                  isActive('/admin/products') ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Products</span>
                {isActive('/admin/products') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </Link>

              <Link
                href="/admin/orders"
                className={`relative flex items-center space-x-1.5 h-full transition ${
                  isActive('/admin/orders') ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Orders</span>
                {isActive('/admin/orders') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </Link>

              <Link
                href="/admin/coupons"
                className={`relative flex items-center space-x-1.5 h-full transition ${
                  isActive('/admin/coupons') ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Coupons</span>
                {isActive('/admin/coupons') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </Link>

              <Link
                href="/catalog"
                target="_blank"
                className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 my-auto"
              >
                <span>View Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            /* Storefront Customer Links with Active Indicators */
            <>
              <Link
                href="/"
                className={`relative flex items-center h-full transition ${
                  isActive('/') ? 'text-indigo-600 font-extrabold' : 'hover:text-indigo-600'
                }`}
              >
                <span>Home</span>
                {isActive('/') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </Link>

              <Link
                href="/catalog"
                className={`relative flex items-center h-full transition ${
                  isActive('/catalog') ? 'text-indigo-600 font-extrabold' : 'hover:text-indigo-600'
                }`}
              >
                <span>Catalog</span>
                {isActive('/catalog') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </Link>

              <Link
                href="/catalog?category=Shirts"
                className={`relative flex items-center h-full transition ${
                  isActive('/catalog', 'Shirts') ? 'text-indigo-600 font-extrabold' : 'hover:text-indigo-600'
                }`}
              >
                <span>Shirts</span>
                {isActive('/catalog', 'Shirts') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </Link>

              <Link
                href="/catalog?category=Dresses"
                className={`relative flex items-center h-full transition ${
                  isActive('/catalog', 'Dresses') ? 'text-indigo-600 font-extrabold' : 'hover:text-indigo-600'
                }`}
              >
                <span>Dresses</span>
                {isActive('/catalog', 'Dresses') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </Link>

              <Link
                href="/catalog?category=Jackets"
                className={`relative flex items-center h-full transition ${
                  isActive('/catalog', 'Jackets') ? 'text-indigo-600 font-extrabold' : 'hover:text-indigo-600'
                }`}
              >
                <span>Jackets</span>
                {isActive('/catalog', 'Jackets') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </Link>
            </>
          )}
        </div>

        {/* Right Actions Area */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {!isAdminPage && (
            <>
              <Link
                href="/wishlist"
                onClick={() => markAsRead()}
                className={`relative p-2 transition ${
                  pathname === '/wishlist' ? 'text-red-500 font-bold' : 'text-gray-700 hover:text-red-500'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${pathname === '/wishlist' ? 'fill-current' : ''}`} />
                {wishlist.length > 0 && hasUnread && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-indigo-600 transition"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </>
          )}

          {/* User Profile Avatar */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-sm font-bold text-gray-800 p-1 rounded-full hover:bg-gray-100 transition focus:outline-none"
              >
                {session.user?.image && !imgError ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User Avatar'}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm">
                    {session.user?.name?.[0] || 'U'}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 text-sm z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-bold text-gray-900 truncate">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{session.user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition font-medium ${
                        pathname === '/account' ? 'bg-indigo-50/50 text-indigo-600 font-bold' : ''
                      }`}
                    >
                      <Package className="w-4 h-4 text-indigo-600" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={() => {
                        markAsRead();
                        setDropdownOpen(false);
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-500 transition font-medium ${
                        pathname === '/wishlist' ? 'bg-red-50/50 text-red-500 font-bold' : ''
                      }`}
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>My Wishlist</span>
                    </Link>

                    {isAdminUser && (
                      isAdminPage ? (
                        <Link
                          href="/catalog"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition font-medium"
                        >
                          <Store className="w-4 h-4 text-indigo-600" />
                          <span>Go to Storefront</span>
                        </Link>
                      ) : (
                        <Link
                          href="/admin/products"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition font-medium"
                        >
                          <Package className="w-4 h-4 text-indigo-600" />
                          <span>Admin Panel</span>
                        </Link>
                      )
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition font-medium text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<nav className="h-16 border-b border-gray-100 bg-white" />}>
      <NavbarContent />
    </Suspense>
  );
}