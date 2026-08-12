'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ShoppingBag, Heart, LogOut, Package, Store, ExternalLink, Tag, MessageSquare } from 'lucide-react';
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
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Context Badge */}
        <div className="flex items-center space-x-3">
          <Link href={isAdminPage ? '/admin/products' : '/'} className="text-2xl font-black tracking-tight text-gray-900 group hover:opacity-90 transition-opacity duration-200">
            ATTIRE<span className="text-indigo-600 inline-block transition-transform duration-300 group-hover:scale-125">.</span>
          </Link>
          {isAdminPage && (
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider border border-indigo-200 shadow-sm transition-all duration-300">
              Admin Panel
            </span>
          )}
        </div>

        {/* Dynamic Navigation Links with Smooth Active Indicators */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600 h-full">
          {isAdminPage ? (
            /* Admin Specific Links */
            <>
              <Link
                href="/admin/products"
                className={`relative flex items-center space-x-1.5 h-full transition-colors duration-200 ease-out ${
                  isActive('/admin/products') ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'
                }`}
              >
                <Package className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                <span>Products</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 rounded-t-full transition-all duration-300 ease-out ${
                    isActive('/admin/products') ? 'w-full opacity-100 scale-x-100' : 'w-full opacity-0 scale-x-0'
                  }`}
                />
              </Link>

              <Link
                href="/admin/orders"
                className={`relative flex items-center space-x-1.5 h-full transition-colors duration-200 ease-out ${
                  isActive('/admin/orders') ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'
                }`}
              >
                <Store className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                <span>Orders</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 rounded-t-full transition-all duration-300 ease-out ${
                    isActive('/admin/orders') ? 'w-full opacity-100 scale-x-100' : 'w-full opacity-0 scale-x-0'
                  }`}
                />
              </Link>

              <Link
                href="/admin/coupons"
                className={`relative flex items-center space-x-1.5 h-full transition-colors duration-200 ease-out ${
                  isActive('/admin/coupons') ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'
                }`}
              >
                <Tag className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                <span>Coupons</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 rounded-t-full transition-all duration-300 ease-out ${
                    isActive('/admin/coupons') ? 'w-full opacity-100 scale-x-100' : 'w-full opacity-0 scale-x-0'
                  }`}
                />
              </Link>

              <Link
                href="/admin/messages"
                className={`relative flex items-center space-x-1.5 h-full transition-colors duration-200 ease-out ${
                  isActive('/admin/messages') ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'
                }`}
              >
                <MessageSquare className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                <span>Messages</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 rounded-t-full transition-all duration-300 ease-out ${
                    isActive('/admin/messages') ? 'w-full opacity-100 scale-x-100' : 'w-full opacity-0 scale-x-0'
                  }`}
                />
              </Link>

              <Link
                href="/catalog"
                target="_blank"
                className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-all duration-200 text-xs font-bold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 my-auto shadow-sm hover:shadow"
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
                className={`relative flex items-center h-full transition-colors duration-200 ease-out ${
                  isActive('/') ? 'text-indigo-600 font-extrabold' : 'hover:text-indigo-600'
                }`}
              >
                <span>Home</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 rounded-t-full transition-all duration-300 ease-out ${
                    isActive('/') ? 'w-full opacity-100 scale-x-100' : 'w-full opacity-0 scale-x-0'
                  }`}
                />
              </Link>

              <Link
                href="/catalog"
                className={`relative flex items-center h-full transition-colors duration-200 ease-out ${
                  isActive('/catalog') ? 'text-indigo-600 font-extrabold' : 'hover:text-indigo-600'
                }`}
              >
                <span>Catalog</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 rounded-t-full transition-all duration-300 ease-out ${
                    isActive('/catalog') ? 'w-full opacity-100 scale-x-100' : 'w-full opacity-0 scale-x-0'
                  }`}
                />
              </Link>

              <Link
                href="/catalog?category=Shirts"
                className={`relative flex items-center h-full transition-colors duration-200 ease-out ${
                  isActive('/catalog', 'Shirts') ? 'text-indigo-600 font-extrabold' : 'hover:text-indigo-600'
                }`}
              >
                <span>Shirts</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 rounded-t-full transition-all duration-300 ease-out ${
                    isActive('/catalog', 'Shirts') ? 'w-full opacity-100 scale-x-100' : 'w-full opacity-0 scale-x-0'
                  }`}
                />
              </Link>

              <Link
                href="/catalog?category=Dresses"
                className={`relative flex items-center h-full transition-colors duration-200 ease-out ${
                  isActive('/catalog', 'Dresses') ? 'text-indigo-600 font-extrabold' : 'hover:text-indigo-600'
                }`}
              >
                <span>Dresses</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 rounded-t-full transition-all duration-300 ease-out ${
                    isActive('/catalog', 'Dresses') ? 'w-full opacity-100 scale-x-100' : 'w-full opacity-0 scale-x-0'
                  }`}
                />
              </Link>

              <Link
                href="/catalog?category=Jackets"
                className={`relative flex items-center h-full transition-colors duration-200 ease-out ${
                  isActive('/catalog', 'Jackets') ? 'text-indigo-600 font-extrabold' : 'hover:text-indigo-600'
                }`}
              >
                <span>Jackets</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 rounded-t-full transition-all duration-300 ease-out ${
                    isActive('/catalog', 'Jackets') ? 'w-full opacity-100 scale-x-100' : 'w-full opacity-0 scale-x-0'
                  }`}
                />
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
                className={`relative p-2 rounded-xl transition-all duration-200 ease-out hover:bg-gray-100/80 active:scale-95 ${
                  pathname === '/wishlist' ? 'text-red-500 font-bold' : 'text-gray-700 hover:text-red-500'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 transition-transform duration-200 ${pathname === '/wishlist' ? 'fill-current scale-110' : ''}`} />
                {wishlist.length > 0 && hasUnread && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl text-gray-700 hover:text-indigo-600 hover:bg-gray-100/80 active:scale-95 transition-all duration-200 ease-out"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>
            </>
          )}

          {/* User Profile Avatar with Smooth Dropdown Animation */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-sm font-bold text-gray-800 p-1 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200 focus:outline-none"
              >
                {session.user?.image && !imgError ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User Avatar'}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover shadow-sm transition-transform duration-200 hover:scale-105"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm transition-transform duration-200 hover:scale-105">
                    {session.user?.name?.[0] || 'U'}
                  </div>
                )}
              </button>

              {/* Animated Profile Dropdown */}
              <div
                onMouseLeave={() => setDropdownOpen(false)}
                className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 text-sm z-50 transition-all duration-200 ease-out origin-top-right ${
                  dropdownOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-gray-900 truncate">{session.user?.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{session.user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/account"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-150 font-medium ${
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
                    className={`flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors duration-150 font-medium ${
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
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150 font-medium"
                      >
                        <Store className="w-4 h-4 text-indigo-600" />
                        <span>Go to Storefront</span>
                      </Link>
                    ) : (
                      <Link
                        href="/admin/products"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150 font-medium"
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
                    className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-150 font-medium text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all duration-200 shadow-sm hover:shadow"
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