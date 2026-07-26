"use client";

import Link from "next/link";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export default function RecentlyViewed() {
  const { recentProducts } = useRecentlyViewed();

  if (!recentProducts || recentProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100">
      <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6">
        Recently Viewed
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {recentProducts.map((product) => {
          const rawPrice = Number(product.price) || 0;
          const rawOffer = Number(product.offer) || 0;
          const finalPrice =
            rawOffer > 0 ? rawPrice - (rawPrice * rawOffer) / 100 : rawPrice;

          return (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition block"
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-gray-900 text-xs line-clamp-1 group-hover:text-indigo-600 transition">
                  {product.title}
                </h3>
                <p className="text-sm font-black text-gray-900 mt-1">
                  ₹{finalPrice.toLocaleString("en-IN")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
