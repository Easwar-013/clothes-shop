'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function Footer() {
  const { status } = useSession();
  const router = useRouter();

  // Helper to safely navigate authenticated or unauthenticated users
  const handleProtectedNavigation = (e, targetPath) => {
    e.preventDefault();
    if (status === 'authenticated') {
      router.push(targetPath);
    } else {
      router.push(`/login?callbackUrl=${encodeURIComponent(targetPath)}`);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-black text-white tracking-tight">
              ATTIRE<span className="text-indigo-500">.</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Modern apparel for everyday wear. Elevate your wardrobe with high-quality fashion designed for comfort and style.
            </p>
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>100% Authentic Apparel</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-4 text-indigo-400">Shop</h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors duration-150">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Shirts" className="hover:text-white transition-colors duration-150">
                  Shirts
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Dresses" className="hover:text-white transition-colors duration-150">
                  Dresses
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Jackets" className="hover:text-white transition-colors duration-150">
                  Jackets
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support (With Smart Authentication Routing) */}
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-4 text-indigo-400">Customer Support</h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <a
                  href="/account"
                  onClick={(e) => handleProtectedNavigation(e, '/account')}
                  className="hover:text-white transition-colors duration-150 cursor-pointer flex items-center space-x-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  <span>Order Tracking</span>
                </a>
              </li>
              <li>
                <a
                  href="/account"
                  onClick={(e) => handleProtectedNavigation(e, '/account')}
                  className="hover:text-white transition-colors duration-150 cursor-pointer flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                  <span>Returns & Exchanges</span>
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleProtectedNavigation(e, '/contact')}
                  className="hover:text-white transition-colors duration-150 cursor-pointer flex items-center space-x-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>Contact Us & Email</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} ATTIRE Clothing Store. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/catalog" className="hover:text-gray-300 transition">Terms</Link>
            <Link href="/catalog" className="hover:text-gray-300 transition">Privacy</Link>
            <a
              href="/contact"
              onClick={(e) => handleProtectedNavigation(e, '/contact')}
              className="hover:text-gray-300 transition cursor-pointer"
            >
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}