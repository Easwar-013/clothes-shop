'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div>
            <Link href="/" className="text-2xl font-black text-white tracking-tight">
              ATTIRE<span className="text-indigo-500">.</span>
            </Link>
            <p className="mt-3 text-sm text-gray-400">
              Modern apparel for everyday wear. Elevate your wardrobe with high-quality fashion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalog" className="hover:text-white transition">All Products</Link></li>
              <li><Link href="/catalog?category=Shirts" className="hover:text-white transition">Shirts</Link></li>
              <li><Link href="/catalog?category=Dresses" className="hover:text-white transition">Dresses</Link></li>
              <li><Link href="/catalog?category=Jackets" className="hover:text-white transition">Jackets</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-400">Order Tracking</span></li>
              <li><span className="text-gray-400">Returns & Exchanges</span></li>
              <li><span className="text-gray-400">Shipping Policy</span></li>
              <li><span className="text-gray-400">Contact Us</span></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Stay Connected</h3>
            <p className="text-sm text-gray-400 mb-3">Subscribe to get special offers and collection updates.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-100 rounded-l-md focus:outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-r-md transition"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ATTIRE Clothing Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}