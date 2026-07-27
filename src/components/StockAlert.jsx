"use client";

import { useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, XCircle } from "lucide-react";

export default function StockAlert({
  stock = 0,
  productId = "",
  productName = "",
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showNotifyForm, setShowNotifyForm] = useState(false);

  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/stock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productId, productName }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubscribed(true);
      } else {
        alert(data.error || "Failed to register stock alert.");
      }
    } catch (err) {
      alert("Error sending request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Badge Display */}
      {isOutOfStock ? (
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          <XCircle className="w-4 h-4 text-red-600 animate-pulse" />
          <span>Out of Stock</span>
        </div>
      ) : isLowStock ? (
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Hurry! Only {stock} left in stock</span>
        </div>
      ) : (
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>In Stock ({stock} available)</span>
        </div>
      )}

      {/* Notify Form */}
      {isOutOfStock && (
        <div className="mt-2">
          {!showNotifyForm ? (
            <button
              onClick={() => setShowNotifyForm(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center space-x-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notify me when back in stock</span>
            </button>
          ) : isSubscribed ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Confirmation email sent! We'll notify you when restocked.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleNotifySubmit}
              className="flex gap-2 max-w-sm mt-1"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shrink-0 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Notify Me"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
