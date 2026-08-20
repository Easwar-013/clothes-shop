"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X, Send } from "lucide-react";
import { useSession } from "next-auth/react";

export default function StockAlert({ stock, productId, productName }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-fill email only once if empty and user is logged in
  useEffect(() => {
    if (session?.user?.email && !email) {
      setEmail(session.user.email);
    }
  }, [session?.user?.email]);

  if (Number(stock) > 0) return null;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/stock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productId?.toString(),
          productName,
          email: cleanEmail,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to register alert request.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("An error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Prominent Notify Button */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => {
            if (session?.user?.email && !email) {
              setEmail(session.user.email);
            }
            setIsOpen(true);
          }}
          className="inline-flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-all duration-200 border border-indigo-200 shadow-sm active:scale-95 group"
        >
          <Bell className="w-4 h-4 text-indigo-600 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          <span>Notify Me When Back in Stock</span>
        </button>
      ) : (
        /* Expandable Interactive Input Card */
        <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>Get Stock Notifications</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setStatus("idle");
                setErrorMsg("");
              }}
              className="text-gray-400 hover:text-gray-600 p-1 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {status === "success" ? (
            <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-100/70 p-3 rounded-xl text-xs font-bold border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                We'll email you at {email} as soon as this item is back in
                stock!
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <p className="text-gray-600 text-[11px]">
                Leave your email and we’ll notify you instantly when inventory
                is replenished.
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-indigo-600 transition"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {status === "loading" ? "Saving..." : "Notify Me"}
                  </span>
                </button>
              </div>
              {status === "error" && (
                <p className="text-red-600 text-[10px] font-semibold">
                  {errorMsg}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
