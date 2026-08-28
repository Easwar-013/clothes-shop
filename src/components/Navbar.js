'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { 
  ShoppingBag, 
  Heart, 
  LogOut, 
  Package, 
  Store, 
  ExternalLink, 
  Tag, 
  MessageSquare,
  Flame,
  Menu,
  X
} from 'lucide-react';
import { useState, Suspense, useEffect } from 'react';

function NavbarContent() {
  const { data: session } = useSession();
  const { cart = [], setIsCartOpen } = useCart();
  const { wishlist = [], hasUnread, markAsRead } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminUser = session?.user?.role === 'admin';

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Close mobile drawer on route/category change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, searchParams]);

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

  const navLinks = isAdminPage
    ? [
        { label: 'Products', href: '/admin/products', icon: Package, active: isActive('/admin/products') },
        { label: 'Trending', href: '/admin/trending', icon: Flame, active: isActive('/admin/trending') },
        { label: 'Orders', href: '/admin/orders', icon: Store, active: isActive('/admin/orders') },
        { label: 'Coupons', href: '/admin/coupons', icon: Tag, active: isActive('/admin/coupons') },
        { label: 'Messages', href: '/admin/messages', icon: MessageSquare, active: isActive('/admin/messages') },
      ]
    : [
        { label: 'Home', href: '/', active: isActive('/') },
        { label: 'Catalog', href: '/catalog', active: isActive('/catalog') },
        { label: 'Shirts', href: '/catalog?category=Shirts', active: isActive('/catalog', 'Shirts') },
        { label: 'Dresses', href: '/catalog?category=Dresses', active: isActive('/catalog', 'Dresses') },
        { label: 'Jackets', href: '/catalog?category=Jackets', active: isActive('/catalog', 'Jackets') },
      ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo, Mobile Menu Button & Context Badge */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-xl md:hidden focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href={isAdminPage ? '/admin/products' : '/'} className="text-2xl font-black tracking-tight text-gray-900 group hover:opacity-90 transition-opacity duration-200">
            ATTIRE<span className="text-indigo-600 inline-block transition-transform duration-300 group-hover:scale-125">.</span>
          </Link>
          {isAdminPage && (
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md tracking-wider border border-indigo-200 shadow-sm transition-all duration-300">
              Admin Panel
            </span>
          )}
        </div>

        {/* Dynamic Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-7 text-sm font-semibold text-gray-600 h-full">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative flex items-center space-x-1.5 h-full transition-colors duration-200 ease-out ${
                  link.active ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 transition-transform duration-200 hover:scale-110" />}
                <span>{link.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 rounded-t-full transition-all duration-300 ease-out ${
                    link.active ? 'w-full opacity-100 scale-x-100' : 'w-full opacity-0 scale-x-0'
                  }`}
                />
              </Link>
            );
          })}

          {isAdminPage && (
            <Link
              href="/catalog"
              target="_blank"
              className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-all duration-200 text-xs font-bold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 my-auto shadow-sm hover:shadow"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Right Actions Area */}
        <div className="flex items-center space-x-2 sm:space-x-4">
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

          {/* User Profile Avatar with Dropdown */}
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

              {/* Profile Dropdown */}
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
                      <>
                        <Link
                          href="/admin/trending"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-150 font-medium"
                        >
                          <Flame className="w-4 h-4 text-indigo-600" />
                          <span>Trending Products</span>
                        </Link>
                        <Link
                          href="/catalog"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150 font-medium"
                        >
                          <Store className="w-4 h-4 text-indigo-600" />
                          <span>Go to Storefront</span>
                        </Link>
                      </>
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

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/98 backdrop-blur-md px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top duration-200 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                  link.active
                    ? 'bg-indigo-50 text-indigo-600 font-extrabold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isAdminPage && (
            <Link
              href="/catalog"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 mt-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition border border-gray-200"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
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