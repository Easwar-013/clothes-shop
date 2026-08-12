'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Send, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fill user information when signed in
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Block submission if unauthenticated
    if (status !== 'authenticated' || !session) {
      router.push('/login?callbackUrl=/contact');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
        setForm((prev) => ({ ...prev, subject: '', message: '' }));
      } else {
        setError(data.error || 'Failed to submit message.');
      }
    } catch (err) {
      setError('An error occurred while sending your message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white text-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Get In Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Contact Customer Care</h1>
        <p className="text-gray-600 text-sm">
          Have questions about your order, sizing, or shipping? Send us a message and our team will get back to you within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Channels */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 space-y-6">
            <h2 className="text-lg font-bold">Contact Channels</h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Email Us</p>
                  <a href="mailto:support@attire.com" className="text-indigo-600 font-semibold hover:underline">
                    support@attire.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Phone Support</p>
                  <p className="text-gray-600 font-medium">+91 98765 43210</p>
                  <p className="text-[11px] text-gray-400">Mon - Sat: 9:00 AM - 7:00 PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Store Address</p>
                  <p className="text-gray-600 font-medium">ATTIRE Apparel HQ, Chennai, Tamil Nadu, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="lg:col-span-8 bg-gray-50 p-6 sm:p-8 rounded-3xl border border-gray-200">
          {status === 'unauthenticated' ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Sign In Required</h2>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                To send a message to customer support, please sign in to your ATTIRE account first.
              </p>
              <Link
                href="/login?callbackUrl=/contact"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl text-xs transition shadow-md"
              >
                Sign In to Contact Us
              </Link>
            </div>
          ) : submitted ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
              <h2 className="text-2xl font-black text-gray-900">Message Sent Successfully!</h2>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Your message has been sent to the ATTIRE support team. You can check for replies in your email inbox or Admin dashboard.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="inline-block bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-indigo-700 transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-bold mb-4">Send Us a Message</h2>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setForm({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setForm({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setForm({ ...formData, subject: e.target.value })}
                  placeholder="Order Inquiry / Sizing Help"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Message</label>
                <textarea
                  rows="5"
                  required
                  value={formData.message}
                  onChange={(e) => setForm({ ...formData, message: e.target.value })}
                  placeholder="How can we help you today?"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition text-xs shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}